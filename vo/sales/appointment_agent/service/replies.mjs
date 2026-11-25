// Email replies: find new mail, decide whether Tanya may answer (the gate), queue it, send her answer in the thread.
// The state lives in Gmail labels, so the service keeps no database:
//   Tanya-checked      every incoming mail the service has looked at (never looked at twice)
//   Tanya-to-reply     passed the gate, waiting for Tanya's answer (/pendingReplies)
//   Tanya-replied      Tanya answered it
//   Tanya-needs-human  a person should look (someone else wrote, or a limit was reached)
//   Tanya-off          added by the team on a thread: Tanya never answers that thread again
import { AGENT_HEADER, header, addressOf, addressesIn, isNoise, isOurs, bodyText, newText, contextFrom } from './mail.mjs';

export const LABELS = { checked: 'Tanya-checked', toReply: 'Tanya-to-reply', replied: 'Tanya-replied', human: 'Tanya-needs-human', off: 'Tanya-off' };
const DAY = 864e5;
const at = (m) => Number(m.internalDate);
export const isTanya = (m) => isOurs(m) && /^tanya$/i.test(header(m, AGENT_HEADER).trim());

export function limitsFrom(env = {}) {
  return { perDay: Number(env.EMAIL_REPLIES_PER_DAY || 3), total: Number(env.EMAIL_REPLIES_TOTAL || 10), maxAgeDays: Number(env.EMAIL_REPLY_MAX_AGE_DAYS || 30) };
}

// May Tanya answer `msg` (an incoming mail) in `thread`? { ok } or { ok: false, reason, human }.
// inFunnel: the platform database check (contact exists, not doNotCall or noAICalls, not handed to a person).
export function gate(thread, msg, { offId, now = Date.now(), limits = limitsFrom(), inFunnel = () => true }) {
  const t = [...thread].sort((a, b) => at(a) - at(b));
  const tanya = t.filter(isTanya);
  if (!tanya.length) return { ok: false, reason: 'not_tanya_thread' };                          // 1. Tanya started it
  if (t.some(m => (m.labelIds || []).includes(offId))) return { ok: false, reason: 'tanya_off' };  // 4. team switched her off
  if (isNoise(msg)) return { ok: false, reason: 'not_a_person' };                                // 5. a person wrote it
  const prospects = new Set(tanya.flatMap(m => addressesIn(header(m, 'To'))));
  const from = addressOf(header(msg, 'From'));
  if (!prospects.has(from)) return { ok: false, reason: 'other_sender', human: true };         // 2. the prospect wrote it
  if (!inFunnel(from)) return { ok: false, reason: 'not_in_funnel' };                           // 3. still in the funnel
  const last = tanya.at(-1);
  if (t.some(m => isOurs(m) && !isTanya(m) && at(m) > at(last))) return { ok: false, reason: 'human_took_over' }; // 4.
  if (at(msg) - at(last) > limits.maxAgeDays * DAY) return { ok: false, reason: 'too_old', human: true };       // 6.
  if (tanya.filter(m => now - at(m) < DAY).length >= limits.perDay || tanya.length >= limits.total)
    return { ok: false, reason: 'limit', human: true };
  return { ok: true };
}

// Label name -> id, creating the five labels on first use.
async function labelIds(google) {
  const have = new Map((await google.listLabels()).map(l => [l.name, l.id]));
  const ids = {};
  for (const [k, name] of Object.entries(LABELS)) ids[k] = have.get(name) || (await google.createLabel(name)).id;
  return ids;
}
const search = (name) => `label:${name.toLowerCase()}`;

// Look at every new incoming mail once. Called by a timer (EMAIL_POLL_SECONDS) or POST /checkReplies.
export async function checkReplies({ google, env = {}, now = Date.now(), inFunnel }) {
  const L = await labelIds(google);
  const q = `in:inbox -from:me newer_than:${Number(env.EMAIL_LOOKBACK_DAYS || 7)}d -${search(LABELS.checked)}`;
  const ids = await google.listMessages(q, 50);
  const fresh = (await Promise.all(ids.map(id => google.getMessage(id))))
    .filter(m => m && !isOurs(m) && (m.labelIds || []).includes('INBOX') && !(m.labelIds || []).includes(L.checked));
  const byThread = new Map();
  for (const m of fresh) byThread.set(m.threadId, [...(byThread.get(m.threadId) || []), m]);
  const results = [];
  for (const [threadId, mails] of byThread) {
    const thread = await google.getThread(threadId) || mails;
    const latest = mails.sort((a, b) => at(a) - at(b)).at(-1);
    const g = gate(thread, latest, { offId: L.off, now, limits: limitsFrom(env), inFunnel });
    for (const m of mails) {
      const add = [L.checked];
      if (m === latest && g.ok) add.push(L.toReply);
      if (m === latest && g.human) add.push(L.human);
      await google.modifyMessage(m.id, add);
    }
    results.push({ threadId, messageId: latest.id, result: g.ok ? 'to_reply' : g.reason });
  }
  return { checked: fresh.length, toReply: results.filter(r => r.result === 'to_reply').length, results };
}

// Mails waiting for Tanya, each with the conversation so far, for the email agent.
export async function pendingReplies({ google, env = {} }) {
  const L = await labelIds(google);
  const ids = await google.listMessages(search(LABELS.toReply), 50);
  const out = [];
  for (const id of ids) {
    const m = await google.getMessage(id);
    if (!m || !(m.labelIds || []).includes(L.toReply)) continue;
    const email = addressOf(header(m, 'From'));
    const thread = await google.getThread(m.threadId) || [m];
    out.push({
      messageId: m.id, threadId: m.threadId, email, subject: header(m, 'Subject'),
      latestMessage: newText(bodyText(m)),
      conversation: contextFrom(thread, { email, keep: 20, tz: env.SALES_TZ || 'Asia/Kolkata' }).emailContext,
    });
  }
  return { count: out.length, pending: out };
}

// Send Tanya's answer to one pending mail, in its thread. The gate runs again first, in case a person
// replied or switched Tanya off while the answer was being written. body "none": no answer is sent.
export async function replyInThread({ google, env = {}, body, now = Date.now(), inFunnel }) {
  const L = await labelIds(google);
  const m = body.messageId ? await google.getMessage(String(body.messageId)) : null;
  if (!m || !(m.labelIds || []).includes(L.toReply)) return { sent: false, reason: 'not_pending' };
  const text = String(body.body ?? '').trim();
  if (!text || /^none$/i.test(text)) { await google.modifyMessage(m.id, [], [L.toReply]); return { sent: false, reason: 'nothing_to_send' }; }
  const thread = await google.getThread(m.threadId) || [m];
  const g = gate(thread, m, { offId: L.off, now, limits: limitsFrom(env), inFunnel });
  if (!g.ok) { await google.modifyMessage(m.id, g.human ? [L.human] : [], [L.toReply]); return { sent: false, reason: g.reason }; }
  const subject = header(m, 'Subject').trim();
  const messageIdHeader = header(m, 'Message-ID');
  const { messageId, threadId } = await google.sendMail({
    to: addressOf(header(m, 'From')), subject: /^re:/i.test(subject) ? subject : `Re: ${subject}`, body: text,
    threadId: m.threadId, inReplyTo: messageIdHeader, references: `${header(m, 'References')} ${messageIdHeader}`.trim(),
  });
  for (const x of thread.filter(x => (x.labelIds || []).includes(L.toReply))) await google.modifyMessage(x.id, [L.replied], [L.toReply]);
  return { sent: true, messageId, threadId };
}
