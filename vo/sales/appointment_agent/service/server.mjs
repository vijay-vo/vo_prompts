// VoiceOwl demo-booking tools: POST /getAvailableSlots (getAvailableSlots), POST /bookAppointment (bookAppointment), POST /sendGmail (after-call email),
// POST /emailContext (earlier emails with a prospect, for priorContext), and email replies:
// POST /checkReplies (look at new mail, run the gate), POST /pendingReplies (mails waiting for Ruchika AI), POST /replyInThread (send her answer).
import http from 'node:http';
import fs from 'node:fs';
import net from 'node:net';
// Slow networks: Node 20 gives each address only 250 ms to connect, then fails with ETIMEDOUT. Give it 5 s.
net.setDefaultAutoSelectFamilyAttemptTimeout(5000);
import { makeGoogle } from './google.mjs';
import { config, getAvailableSlots, bookAppointment, bookReply, SAY, clean } from './slots.mjs';
import { validTz } from './labels.mjs';
import { contextFrom, involves, searchFor } from './mail.mjs';
import { checkReplies, pendingReplies, replyInThread } from './replies.mjs';

function loadEnv() {
  const env = { ...process.env };
  try {
    for (const line of fs.readFileSync(new URL('./.env', import.meta.url), 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {}
  return env;
}
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MAIL = {
  sent: { sent: true, toolResponse: 'Success: The email was sent.' },
  skipped: { sent: false, reason: 'nothing_to_send', toolResponse: 'Success: No email was needed for this call.' },
  badTo: { sent: false, reason: 'bad_address', toolResponse: 'Failure: The email address is not valid.' },
  error: { sent: false, reason: 'error', toolResponse: 'Failure: The email could not be sent.' },
};
async function sendGmail({ google, body }) {
  const to = clean(body.to), subject = clean(body.subject), text = clean(body.body);
  if (/^none$/i.test(subject) || /^none$/i.test(text) || !subject || !text) return MAIL.skipped;
  if (!EMAIL_RE.test(to)) return MAIL.badTo;
  const { messageId, threadId } = await google.sendMail({ to, subject, body: text });
  return { ...MAIL.sent, messageId, threadId };
}

// Earlier emails with one prospect, found by their address. threadId is optional: when it is given and
// the thread is theirs, that thread is read; otherwise (absent, wrong, deleted) the mailbox is searched.
async function emailContext({ google, body, env }) {
  const email = clean(body.email).toLowerCase(), threadId = clean(body.threadId);
  if (!EMAIL_RE.test(email)) return { found: 0, reason: 'bad_address', source: 'none', emailContext: 'Not Available', threadId: 'Not Available' };
  const opts = { email, tz: env.SALES_TZ || 'Asia/Kolkata', keep: Number(env.EMAIL_CONTEXT_MESSAGES || 5) };
  if (threadId && !/^none$/i.test(threadId)) {
    const msgs = await google.getThread(threadId);
    if (msgs?.some(m => involves(m, email))) return ctxReply(contextFrom(msgs, opts), 'thread');
  }
  const ids = await google.listMessages(searchFor(email), 20);
  const msgs = await Promise.all(ids.map(id => google.getMessage(id)));
  return ctxReply(contextFrom(msgs.filter(Boolean), opts), 'search');
}
const ctxReply = (c, source) => ({ found: c.found, reason: c.found ? 'found' : 'no_emails', source, emailContext: c.emailContext, threadId: c.threadId });

const REPLY_ROUTES = { '/checkReplies': checkReplies, '/pendingReplies': pendingReplies, '/replyInThread': replyInThread };
const ROUTES = ['/getAvailableSlots', '/bookAppointment', '/sendGmail', '/emailContext', ...Object.keys(REPLY_ROUTES)];

export function makeApp(env, google = makeGoogle(env)) {
  const cfg = config(env);
  return async (req, res) => {
    // The two booking tools lead every reply with returnCode, only ever 200 or 500: 200 when the API
    // worked and returned data (any Success or Failure answer), 500 for anything else (calendar not
    // checked, booking did not go through, or a rejected request).
    const tool = ['/getAvailableSlots', '/bookAppointment'].includes(req.url);
    const send = (code, obj) => {
      if (tool) obj = { returnCode: code === 200 && obj.reason !== 'error' ? 200 : 500, ...obj };
      res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj));
    };
    try {
      if (req.method === 'GET' && req.url === '/health') return send(200, { ok: true });
      if (!env.API_KEY || req.headers['x-api-key'] !== env.API_KEY) return send(401, { error: 'unauthorized' });
      if (req.method !== 'POST' || ![...ROUTES].includes(req.url)) return send(404, { error: 'not found' });
      let raw = ''; for await (const c of req) { raw += c; if (raw.length > 1e5) return send(413, { error: 'too large' }); }
      const body = raw ? JSON.parse(raw) : {};
      if (req.url === '/sendGmail') {
        console.log(new Date().toISOString(), req.url, JSON.stringify({ to: body.to ? '***' : undefined, subject: body.subject }));
        return send(200, await sendGmail({ google, body }));
      }
      if (req.url === '/emailContext') {
        console.log(new Date().toISOString(), req.url, JSON.stringify({ email: body.email ? '***' : undefined, threadId: body.threadId }));
        return send(200, await emailContext({ google, body, env }));
      }
      if (REPLY_ROUTES[req.url]) {
        console.log(new Date().toISOString(), req.url, JSON.stringify({ messageId: body.messageId }));
        return send(200, await REPLY_ROUTES[req.url]({ google, env, body }));
      }
      console.log(new Date().toISOString(), req.url, JSON.stringify({ ...body, email: body.email ? '***' : undefined }));
      if (!validTz(body.timezone)) return send(400, { error: 'timezone must be an IANA name such as Asia/Kolkata' });
      if (req.url === '/getAvailableSlots') return send(200, await getAvailableSlots({ google, cfg, body }));
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email || '')) return send(400, bookReply({}));
      const r = await bookAppointment({ google, cfg, body });
      return send(r.status, r.out);
    } catch (e) {
      console.error('ERROR', e.message);
      if (req.url === '/sendGmail') return send(200, MAIL.error);
      if (req.url === '/emailContext') return send(200, { found: 0, reason: 'error', source: 'none', emailContext: 'Not Available', threadId: 'Not Available' });
      if (REPLY_ROUTES[req.url]) return send(200, { ok: false, reason: 'error' });
      return send(req.url === '/bookAppointment' ? 200 : 500, req.url === '/bookAppointment'
        ? bookReply({})
        : { toolResponse: SAY.calendarDown });
    }
  };
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const env = loadEnv();
  const port = Number(env.PORT || 8787);
  http.createServer(makeApp(env))
    .on('error', e => { console.error(e.code === 'EADDRINUSE' ? `Port ${port} is busy: the service is already running (ss -ltnp 'sport = :${port}' shows the pid). Stop it first.` : e.message); process.exit(1); })
    .listen(port, () => console.log(`booking tools on :${port}${env.GOOGLE_MOCK === '1' ? ' (MOCK calendar)' : ''}`));
  // Look for new email replies every EMAIL_POLL_SECONDS (0 or unset: only when POST /checkReplies is called).
  const every = Number(env.EMAIL_POLL_SECONDS || 0);
  if (every > 0) {
    const google = makeGoogle(env);
    let busy = false;
    setInterval(async () => {
      if (busy) return; busy = true;
      try { const r = await checkReplies({ google, env }); if (r.checked) console.log(new Date().toISOString(), 'checkReplies', JSON.stringify(r)); }
      catch (e) { console.error('checkReplies ERROR', e.message); } finally { busy = false; }
    }, every * 1000);
  }
}
