import http from 'node:http';
import assert from 'node:assert/strict';
import { makeApp } from './server.mjs';
import { makeGoogle } from './google.mjs';
import { parts } from './labels.mjs';

const env = { GOOGLE_MOCK: '1', API_KEY: 'k' };
const google = makeGoogle(env);
const srv = http.createServer(makeApp(env, google));
await new Promise(r => srv.listen(0, r));
const base = `http://127.0.0.1:${srv.address().port}`;
const call = async (path, body, key = 'k') => { const r = await fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': key }, body: JSON.stringify(body) }); return { s: r.status, j: await r.json() }; };

const starts = (tr) => [...tr.matchAll(/startTime (\d{4}-\d\d-\d\dT\d\d:\d\d)/g)].map(m => m[1]);
const unauth = await call('/getAvailableSlots', { timezone: 'Asia/Kolkata' }, 'bad');
assert.equal(unauth.s, 401); assert.equal(unauth.j.returnCode, 500, 'returnCode is only 200 or 500');
const badTz = await call('/getAvailableSlots', { timezone: 'Nope/Zone' });
assert.equal(badTz.s, 400); assert.equal(badTz.j.returnCode, 500);

for (const tz of ['Asia/Kolkata', 'America/New_York', 'Europe/London', 'Asia/Dubai', 'America/Los_Angeles', 'Asia/Tokyo']) {
  const { j } = await call('/getAvailableSlots', { timezone: tz });
  assert.deepEqual(Object.keys(j), ['returnCode', 'toolResponse'], 'returnCode first, then the toolResponse');
  assert.equal(j.returnCode, 200);
  console.log(tz.padEnd(20), j.toolResponse);
  for (const st of starts(j.toolResponse)) {
    const ms = parseStartTime(st, tz);
    const p = parts(ms, tz), q = parts(ms, 'Asia/Kolkata');
    assert.equal(localStartTime(ms, tz), st, 'startTime is the prospect local time');
    assert.ok(p.h >= 9 && p.h * 60 + p.mi + 15 <= 19 * 60, `${tz} prospect hours`);
    assert.ok(q.h >= 9 && q.h * 60 + q.mi + 15 <= 23 * 60, 'sales hours');
    assert.ok(p.wd >= 1 && p.wd <= 5 && q.wd >= 1 && q.wd <= 5, 'weekdays');
  }
}
const first = (await call('/getAvailableSlots', { timezone: 'Asia/Kolkata' })).j.toolResponse;
assert.match(first, /^Success: Two times are free\. Option 1: .+, startTime \S+\. Option 2: .+, startTime \S+\. Offer both in words, never the startTime/);
const a = starts(first);
assert.equal(a.length, 2);
assert.ok(parseStartTime(a[1], 'Asia/Kolkata') - parseStartTime(a[0], 'Asia/Kolkata') >= 3600000, 'two slots 1h apart');
for (const st of starts((await call('/getAvailableSlots', { timezone: 'Asia/Kolkata', preferredTime: 'afternoon' })).j.toolResponse)) {
  const h = parts(parseStartTime(st, 'Asia/Kolkata'), 'Asia/Kolkata').h; assert.ok(h >= 12 && h < 16);
}

const lead = { timezone: 'Asia/Kolkata', email: 'priya@brightloans.com', fname: 'Priya', lname: 'Not Available', company: 'BrightLoans', appointmentNotes: 'weekend leads' };
assert.equal((await call('/bookAppointment', { ...lead, startTime: a[0], email: 'not-an-email' })).j.reason, 'error');
const odd = (await call('/bookAppointment', { ...lead, startTime: a[0].replace(/:\d\d$/, ':07') })).j;
assert.equal(odd.booked, false); assert.equal(odd.reason, 'not_offered'); assert.match(odd.toolResponse, /^Failure: That startTime is not a free time\. Option 1: /);
const garbled = (await call('/bookAppointment', { ...lead, startTime: 'tomorrow 4 PM' })).j;
assert.equal(garbled.reason, 'not_offered'); assert.equal(starts(garbled.toolResponse).length, 2, 'a garbled startTime gets two real options');
for (const st of [undefined, '', '-']) {
  const r = (await call('/bookAppointment', { ...lead, startTime: st })).j;
  assert.equal(r.reason, 'no_start_time'); assert.match(r.toolResponse, /^Failure: No startTime was passed, so nothing was booked\. Option 1: /);
}
const b1 = await call('/bookAppointment', { ...lead, startTime: a[0] });
assert.equal(b1.j.booked, true); assert.match(b1.j.toolResponse, /^Success: The call is booked for .+ Do not push them/);
assert.match(b1.j.prospectTime, /^\w+day, \d+ \w+ \d{4}, \d+:\d\d (AM|PM) \(Asia\/Kolkata\)$/);
assert.match(b1.j.salesTime, /\(Asia\/Kolkata\)$/); assert.ok(b1.j.meetLink.startsWith('https://meet.google.com/')); assert.ok(b1.j.eventId);
const KEYS = ['returnCode', 'booked', 'reason', 'toolResponse', 'prospectTime', 'salesTime', 'meetLink', 'eventId'];
assert.deepEqual(Object.keys(b1.j), KEYS); assert.equal(b1.j.reason, 'booked'); assert.equal(b1.j.returnCode, 200);
for (const r of [odd, garbled]) { assert.deepEqual(Object.keys(r), KEYS); assert.equal(r.returnCode, 200, 'a Failure answer is still 200'); assert.equal(r.prospectTime, 'Not Available'); assert.equal(r.eventId, 'Not Available'); }
const badMail = (await call('/bookAppointment', { ...lead, startTime: a[0], email: 'nope' }));
assert.equal(badMail.s, 400); assert.deepEqual(Object.keys(badMail.j), KEYS); assert.equal(badMail.j.reason, 'error'); assert.equal(badMail.j.returnCode, 500);
const retry = await call('/bookAppointment', { ...lead, startTime: a[0] });
assert.equal(retry.j.booked, true, 'retried booking answers booked');
const b2 = await call('/bookAppointment', { ...lead, startTime: a[0], email: 'other@x.com' });
assert.equal(b2.j.booked, false); assert.equal(b2.j.reason, 'slot_taken'); assert.deepEqual(Object.keys(b2.j), KEYS); assert.equal(b2.j.meetLink, 'Not Available');
assert.match(b2.j.toolResponse, /^Failure: That time was just taken\. Option 1: /); assert.ok(!starts(b2.j.toolResponse).includes(a[0]), 'taken time not re-offered');
assert.ok(!starts((await call('/getAvailableSlots', { timezone: 'Asia/Kolkata' })).j.toolResponse).includes(a[0]), 'booked slot no longer offered');

// New York: startTime and the read-back are New York time; salesTime is IST.
const ny = starts((await call('/getAvailableSlots', { timezone: 'America/New_York' })).j.toolResponse);
if (ny.length) {
  const bn = (await call('/bookAppointment', { ...lead, timezone: 'America/New_York', email: 'dan@harbor.com', startTime: ny[0] })).j;
  assert.equal(bn.booked, true); assert.match(bn.prospectTime, /\(America\/New_York\)$/); assert.match(bn.salesTime, /\(Asia\/Kolkata\)$/);
  assert.equal(bn.prospectTime.match(/\d+:\d\d (AM|PM)/)[0], (() => { const p = parts(parseStartTime(ny[0], 'America/New_York'), 'America/New_York'); return `${p.h % 12 || 12}:${String(p.mi).padStart(2, '0')} ${p.h < 12 ? 'AM' : 'PM'}`; })());
}
assert.equal((await call('/sendGmail', { to: 'a@b.com', subject: 'x', body: 'y' }, 'bad')).s, 401);
const em = await call('/sendGmail', { to: 'priya@brightloans.com', subject: 'Your VoiceOwl demo is booked', body: 'Hi Priya,\n\nBooked.\n\nTanya, VoiceOwl' });
assert.equal(em.s, 200); assert.equal(em.j.sent, true); assert.match(em.j.toolResponse, /^Success: The email was sent/); assert.ok(em.j.messageId);
const mime = google.sent.at(-1).mime;
assert.match(mime, /^To: priya@brightloans\.com\r\n/);
assert.ok(Buffer.from(mime.split('\r\n\r\n')[1].replace(/\r\n/g, ''), 'base64').toString().includes('Hi Priya,\r\n\r\nBooked.'));
const escaped = await call('/sendGmail', { to: 'priya@brightloans.com', subject: 'Héllo', body: 'Line one\\n\\nLine two' });
assert.equal(escaped.j.sent, true);
assert.ok(Buffer.from(google.sent.at(-1).mime.split('\r\n\r\n')[1].replace(/\r\n/g, ''), 'base64').toString().includes('Line one\r\n\r\nLine two'), 'literal \\n becomes a line break');
const injected = await call('/sendGmail', { to: 'priya@brightloans.com', subject: 'Hi\r\nBcc: evil@x.com', body: 'y' });
assert.equal(injected.j.sent, true); assert.ok(!/^Bcc:/m.test(google.sent.at(-1).mime), 'no header injection');
const before = google.sent.length;
assert.equal((await call('/sendGmail', { to: 'priya@brightloans.com', subject: 'none', body: 'none' })).j.reason, 'nothing_to_send');
assert.equal((await call('/sendGmail', { to: 'Not Available', subject: 'x', body: 'y' })).j.reason, 'bad_address');
assert.equal(google.sent.length, before, 'nothing sent for none or a bad address');
const broken = http.createServer(makeApp(env, { ...google, sendMail: async () => { throw new Error('boom'); } }));
await new Promise(r => broken.listen(0, r));
const br = await fetch(`http://127.0.0.1:${broken.address().port}/sendGmail`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': 'k' }, body: JSON.stringify({ to: 'a@b.com', subject: 'x', body: 'y' }) });
assert.equal(br.status, 200); assert.deepEqual(await br.json(), { sent: false, reason: 'error', toolResponse: 'Failure: The email could not be sent.' });
broken.close();
// Calendar down: both tools answer returnCode 500.
const down = http.createServer(makeApp(env, { ...google, busy: async () => { throw new Error('down'); } }));
await new Promise(r => down.listen(0, r));
const dcall = async (path, body) => (await fetch(`http://127.0.0.1:${down.address().port}${path}`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': 'k' }, body: JSON.stringify(body) })).json();
const ds = await dcall('/getAvailableSlots', { timezone: 'Asia/Kolkata' });
assert.deepEqual(ds, { returnCode: 500, toolResponse: SAY.calendarDown });
const db = await dcall('/bookAppointment', { ...lead, startTime: a[0] });
assert.deepEqual(Object.keys(db), KEYS); assert.equal(db.returnCode, 500); assert.equal(db.reason, 'error'); assert.equal(db.toolResponse, SAY.bookError);
down.close();
console.log('returnCode tests passed');

// /emailContext: earlier emails with one prospect, by address; threadId optional.
assert.ok(em.j.threadId, '/sendGmail returns the threadId'); assert.match(mime, /\r\nX-VoiceOwl-Agent: tanya\r\n/, 'every sent mail is marked as Tanya');
const b64u = (t) => Buffer.from(t).toString('base64url');
let mid = 0;
const mail = ({ thread, from, to, subject, text, html, at, sent = false, headers = [], mimeType }) => ({
  id: `m${++mid}`, threadId: thread, labelIds: sent ? ['SENT'] : ['INBOX'], internalDate: String(Date.parse(at)),
  payload: { mimeType: mimeType || 'multipart/alternative', headers: [{ name: 'From', value: from }, { name: 'To', value: to }, { name: 'Subject', value: subject }, ...headers],
    parts: [text != null && { mimeType: 'text/plain', body: { data: b64u(text) } }, html != null && { mimeType: 'text/html', body: { data: b64u(html) } }].filter(Boolean) },
});
const US = 'Tanya <sales@voiceowl.ai>', PRIYA = 'Priya Sharma <Priya@BrightLoans.com>';
google.mails.length = 0; // the mock keeps copies of the mails sent above; start this mailbox empty
google.mails.push(
  mail({ thread: 'T1', from: US, to: PRIYA, subject: 'Book your VoiceOwl call with Hussain', text: 'Hi Priya,\n\nSorry we could not book.\n\nTanya, VoiceOwl', at: '2026-11-12T05:00:00Z', sent: true }),
  mail({ thread: 'T1', from: PRIYA, to: US, subject: 'Re: Book your VoiceOwl call with Hussain', text: 'Can we do Thursday? We get 400 calls a day in Hindi.\n\nOn Thu, 12 Nov 2026 at 10:30, Tanya <sales@voiceowl.ai>\nwrote:\n> Hi Priya,\n> Sorry we could not book.', at: '2026-11-13T06:00:00Z' }),
  mail({ thread: 'T1', from: PRIYA, to: US, subject: 'Automatic reply: Book your VoiceOwl call', text: 'I am out of office.', at: '2026-11-13T06:01:00Z', headers: [{ name: 'Auto-Submitted', value: 'auto-replied' }] }),
  mail({ thread: 'T2', from: PRIYA, to: US, subject: 'Accepted: VoiceOwl demo', text: 'Priya has accepted.', at: '2026-11-14T06:00:00Z' }),
  mail({ thread: 'T3', from: 'Mail Delivery Subsystem <mailer-daemon@googlemail.com>', to: US, subject: 'Delivery Status Notification (Failure)', text: 'priya@brightloans.com not found', at: '2026-11-14T07:00:00Z' }),
  mail({ thread: 'T1', from: US, to: PRIYA, subject: 'Re: Book your VoiceOwl call with Hussain', html: '<p>Thursday works.</p><p>Tanya</p><blockquote>old text</blockquote>', at: '2026-11-15T06:00:00Z', sent: true }),
  mail({ thread: 'T9', from: 'dan@harbor.com', to: US, subject: 'Hello', text: 'Other prospect.', at: '2026-11-15T07:00:00Z' }),
);
const ctx = (await call('/emailContext', { email: ' priya@brightloans.com ' })).j;
assert.deepEqual(Object.keys(ctx), ['found', 'reason', 'source', 'emailContext', 'threadId']);
assert.equal(ctx.found, 3); assert.equal(ctx.reason, 'found'); assert.equal(ctx.source, 'search'); assert.equal(ctx.threadId, 'T1');
assert.equal(ctx.emailContext, [
  '12 Nov 2026, we wrote, subject "Book your VoiceOwl call with Hussain": Hi Priya, / Sorry we could not book. / Tanya, VoiceOwl',
  '13 Nov 2026, they wrote, subject "Re: Book your VoiceOwl call with Hussain": Can we do Thursday? We get 400 calls a day in Hindi.',
  '15 Nov 2026, we wrote, subject "Re: Book your VoiceOwl call with Hussain": Thursday works. / Tanya',
].join('\n'), 'oldest first; quotes, auto-replies, calendar notices, bounces and other prospects left out');
assert.equal((await call('/emailContext', { email: 'priya@brightloans.com', threadId: 'T1' })).j.source, 'thread');
assert.equal((await call('/emailContext', { email: 'priya@brightloans.com', threadId: 'T9' })).j.source, 'search', "someone else's thread falls back to search");
assert.equal((await call('/emailContext', { email: 'priya@brightloans.com', threadId: 'gone' })).j.found, 3, 'a wrong threadId falls back to search');
assert.equal((await call('/emailContext', { email: 'priya@brightloans.com', threadId: 'Not Available' })).j.source, 'search');
const none = (await call('/emailContext', { email: 'new@lead.com' })).j;
assert.deepEqual(none, { found: 0, reason: 'no_emails', source: 'search', emailContext: 'No earlier emails.', threadId: 'Not Available' });
assert.equal((await call('/emailContext', { email: 'Not Available' })).j.reason, 'bad_address');
const failing = http.createServer(makeApp(env, { ...google, listMessages: async () => { throw new Error('gmail down'); } }));
await new Promise(r => failing.listen(0, r));
const fr = await (await fetch(`http://127.0.0.1:${failing.address().port}/emailContext`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': 'k' }, body: JSON.stringify({ email: 'priya@brightloans.com' }) })).json();
assert.equal(fr.reason, 'error'); assert.equal(fr.emailContext, 'Not Available');
failing.close();
const { newText } = await import('./mail.mjs');
assert.equal(newText('Sounds good.\n\n-----Original Message-----\nFrom: x'), 'Sounds good.', 'Outlook quote removed');
assert.equal(newText('Yes.\n\nFrom: Tanya <a@b.c>\nSent: Monday\nSubject: x'), 'Yes.', 'Outlook header block removed');
assert.ok(newText('a '.repeat(2000)).length <= 1504, 'long mail capped');
console.log('email tests passed');

// Email replies: the gate, the queue and the answer in the thread.
{
  const { checkReplies, pendingReplies, replyInThread, LABELS } = await import('./replies.mjs');
  const g = makeGoogle({ GOOGLE_MOCK: '1' });
  const NOW = Date.parse('2026-11-25T10:00:00Z'), H = 36e5;
  let clock = NOW - 48 * H; g.now = () => clock;
  let n = 0;
  const inbound = (thread, from, subject, text, t, headers = []) => {
    const m = mail({ thread, from, to: 'sales@voiceowl.ai', subject, text, at: new Date(t).toISOString(), headers: [{ name: 'Message-ID', value: `<in${++n}@x.com>` }, ...headers] });
    g.mails.push(m); return m;
  };
  const tanyaMail = async (to, subject, t, threadId) => { clock = t; return g.sendMail({ to, subject, body: 'Hi,\n\nTanya, VoiceOwl', threadId }); };
  const labelId = (name) => g.labels.find(l => l.name === name)?.id;
  const has = (m, name) => (m.labelIds || []).includes(labelId(name));

  const t1 = (await tanyaMail('priya@brightloans.com', 'Book your VoiceOwl call with Hussain', NOW - 48 * H)).threadId;
  const reply = inbound(t1, 'Priya <priya@brightloans.com>', 'Re: Book your VoiceOwl call with Hussain', 'Is Thursday possible?\n\nOn Mon, Tanya wrote:\n> Hi', NOW - 2 * H);
  const stranger = inbound('S1', 'someone@random.com', 'Partnership', 'Hello there', NOW - H);
  g.mails.push(mail({ thread: 'H1', from: 'sales@voiceowl.ai', to: 'ravi@acme.com', subject: 'Hello Ravi', text: 'Written by hand.', at: new Date(NOW - 5 * H).toISOString(), sent: true }));
  const handReply = inbound('H1', 'ravi@acme.com', 'Re: Hello Ravi', 'Thanks', NOW - H);
  const t2 = (await tanyaMail('dan@harbor.com', 'Thanks for your time - VoiceOwl', NOW - 30 * H)).threadId;
  const boss = inbound(t2, 'Boss <boss@harbor.com>', 'Re: Thanks for your time - VoiceOwl', 'Send me details.', NOW - H);
  const t3 = (await tanyaMail('kim@jp.co', 'Book your VoiceOwl call with Hussain', NOW - 30 * H)).threadId;
  const ooo = inbound(t3, 'kim@jp.co', 'Automatic reply: Book your VoiceOwl call', 'Away.', NOW - H, [{ name: 'Auto-Submitted', value: 'auto-replied' }]);
  clock = NOW;

  const r1 = await checkReplies({ google: g, now: NOW });
  const by = Object.fromEntries(r1.results.map(r => [r.messageId, r.result]));
  assert.deepEqual([by[reply.id], by[stranger.id], by[handReply.id], by[boss.id], by[ooo.id]], ['to_reply', 'not_tanya_thread', 'not_tanya_thread', 'other_sender', 'not_a_person']);
  assert.equal(r1.toReply, 1);
  assert.ok(Object.values(LABELS).every(name => labelId(name)), 'the five labels are created');
  assert.ok(has(reply, LABELS.toReply) && has(reply, LABELS.checked)); assert.ok(has(boss, LABELS.human)); assert.ok(!has(stranger, LABELS.toReply) && has(stranger, LABELS.checked));
  assert.equal((await checkReplies({ google: g, now: NOW })).checked, 0, 'a mail is looked at only once');

  const pend = await pendingReplies({ google: g });
  assert.equal(pend.count, 1); const p0 = pend.pending[0];
  assert.equal(p0.email, 'priya@brightloans.com'); assert.equal(p0.latestMessage, 'Is Thursday possible?');
  assert.match(p0.conversation, /we wrote, subject "Book your VoiceOwl call with Hussain"[\s\S]*\nthey wrote|they wrote, subject "Re: Book your VoiceOwl call with Hussain": Is Thursday possible\?$/);

  const sentR = await replyInThread({ google: g, body: { messageId: reply.id, body: 'Hi Priya,\n\nThursday works.\n\nTanya, VoiceOwl' }, now: NOW });
  assert.equal(sentR.sent, true); assert.equal(sentR.threadId, t1, 'the answer stays in the same thread');
  const out = g.sent.at(-1);
  assert.equal(out.to, 'priya@brightloans.com'); assert.equal(out.subject, 'Re: Book your VoiceOwl call with Hussain');
  assert.match(out.mime, /\r\nIn-Reply-To: <in1@x\.com>\r\nReferences: <in1@x\.com>\r\n/); assert.match(out.mime, /\r\nX-VoiceOwl-Agent: tanya\r\n/);
  assert.ok(has(reply, LABELS.replied) && !has(reply, LABELS.toReply));
  assert.equal((await replyInThread({ google: g, body: { messageId: reply.id, body: 'again' }, now: NOW })).reason, 'not_pending', 'never answered twice');
  assert.equal((await replyInThread({ google: g, body: { messageId: stranger.id, body: 'hi' }, now: NOW })).reason, 'not_pending', 'a mail that failed the gate cannot be answered');

  // A person replies by hand: Tanya stops, even for a mail already queued.
  const r2 = inbound(t1, 'priya@brightloans.com', 'Re: Book your VoiceOwl call with Hussain', 'And who joins?', NOW + H);
  await checkReplies({ google: g, now: NOW + H });
  assert.ok(has(r2, LABELS.toReply));
  g.mails.push(mail({ thread: t1, from: 'hussain@voiceowl.ai', to: 'priya@brightloans.com', subject: 'Re: Book', text: 'I will join.', at: new Date(NOW + 2 * H).toISOString(), sent: true }));
  assert.equal((await replyInThread({ google: g, body: { messageId: r2.id, body: 'Hussain joins.' }, now: NOW + 2 * H })).reason, 'human_took_over');
  assert.ok(!has(r2, LABELS.toReply), 'taken off the queue');
  const r3 = inbound(t1, 'priya@brightloans.com', 'Re: Book', 'Thanks Hussain', NOW + 3 * H);
  assert.equal((await checkReplies({ google: g, now: NOW + 3 * H })).results.find(r => r.messageId === r3.id).result, 'human_took_over');

  // The team switches Tanya off on a thread.
  const t4 = (await tanyaMail('lee@k.co', 'Thanks for your time - VoiceOwl', NOW)).threadId;
  await g.modifyMessage(g.mails.find(m => m.threadId === t4).id, [labelId(LABELS.off)]);
  const r4 = inbound(t4, 'lee@k.co', 'Re: Thanks', 'Tell me more', NOW + H);
  assert.equal((await checkReplies({ google: g, now: NOW + H })).results.find(r => r.messageId === r4.id).result, 'tanya_off');

  // Limits: 3 Tanya mails in a day; a reply more than 30 days after her last mail.
  const t5 = (await tanyaMail('ann@z.co', 'Hi', NOW - 3 * H)).threadId;
  await tanyaMail('ann@z.co', 'Re: Hi', NOW - 2 * H, t5); await tanyaMail('ann@z.co', 'Re: Hi', NOW - H, t5);
  const r5 = inbound(t5, 'ann@z.co', 'Re: Hi', 'More?', NOW);
  const t6 = (await tanyaMail('old@z.co', 'Hi', NOW - 40 * 24 * H)).threadId;
  const r6 = inbound(t6, 'old@z.co', 'Re: Hi', 'Late reply', NOW);
  const t7 = (await tanyaMail('dnc@z.co', 'Hi', NOW - H)).threadId;
  const r7 = inbound(t7, 'dnc@z.co', 'Re: Hi', 'Hello', NOW);
  clock = NOW;
  const r8 = await checkReplies({ google: g, now: NOW, inFunnel: (e) => e !== 'dnc@z.co' });
  const res = (m) => r8.results.find(r => r.messageId === m.id).result;
  assert.deepEqual([res(r5), res(r6), res(r7)], ['limit', 'too_old', 'not_in_funnel']);
  assert.ok(has(r5, LABELS.human) && has(r6, LABELS.human) && !has(r7, LABELS.human));


  // The email agent's actions: human sends the handoff and switches Tanya off; stop and none send nothing.
  const queue = async (to, t) => { const th = (await tanyaMail(to, 'Hi', t)).threadId; const m = inbound(th, to, 'Re: Hi', 'Question', t + H); clock = t + H; await checkReplies({ google: g, now: t + H }); assert.ok(has(m, LABELS.toReply)); return { th, m }; };
  const qh = await queue('h@q.co', NOW + 10 * H);
  const before2 = g.sent.length;
  const hr = await replyInThread({ google: g, body: { messageId: qh.m.id, action: 'human', reply: 'Hi,\n\nPassed to our team.\n\nTanya, VoiceOwl' }, now: NOW + 11 * H });
  assert.equal(hr.reason, 'handed_to_human'); assert.equal(g.sent.length, before2 + 1, 'the handoff email is sent');
  assert.ok(has(qh.m, LABELS.human) && has(qh.m, LABELS.off) && !has(qh.m, LABELS.toReply));
  const qh2 = inbound(qh.th, 'h@q.co', 'Re: Hi', 'Hello?', NOW + 12 * H);
  assert.equal((await checkReplies({ google: g, now: NOW + 12 * H })).results.find(r => r.messageId === qh2.id).result, 'tanya_off', 'after a handoff Tanya stays out');
  const qs = await queue('s@q.co', NOW + 20 * H);
  const before3 = g.sent.length;
  assert.equal((await replyInThread({ google: g, body: { messageId: qs.m.id, action: 'stop', reply: 'none' }, now: NOW + 21 * H })).reason, 'stopped');
  assert.equal(g.sent.length, before3, 'stop sends nothing'); assert.ok(has(qs.m, LABELS.human) && has(qs.m, LABELS.off));
  const qn = await queue('n@q.co', NOW + 30 * H);
  assert.equal((await replyInThread({ google: g, body: { messageId: qn.m.id, action: 'none', reply: 'none' }, now: NOW + 31 * H })).reason, 'nothing_to_send');
  assert.ok(!has(qn.m, LABELS.toReply) && !has(qn.m, LABELS.off), 'none only clears the queue');
  const qr = await queue('r@q.co', NOW + 40 * H);
  assert.equal((await replyInThread({ google: g, body: { messageId: qr.m.id, action: 'reply', reply: 'Hi,\n\nSure.\n\nTanya, VoiceOwl' }, now: NOW + 41 * H })).sent, true, 'reply works with the agent JSON fields');

  // The routes answer through the server too.
  const cr = await call('/checkReplies', {}); assert.equal(cr.s, 200); assert.ok('checked' in cr.j);
  assert.equal((await call('/replyInThread', { messageId: 'nope', body: 'x' })).j.reason, 'not_pending');
  console.log('email reply tests passed');
}


console.log('\nall tests passed'); srv.close();

// Fallback: no slot 2h after the first, so the next free slot is offered instead of only one.
import { pickTwo, config } from './slots.mjs';
const cfgT = config({});
const near = pickTwo([{ startMs: 0, wd: 2 }, { startMs: 30 * 60000, wd: 2 }], cfgT);
assert.equal(near.length, 2, 'fallback offers a second, closer slot');
const q = (m) => ({ startMs: m * 60000, wd: 2 });
assert.equal(pickTwo([q(0), q(15), q(30), q(60)], cfgT)[1].startMs, 60 * 60000, '60 minutes apart preferred');
assert.equal(pickTwo([q(0), q(15), q(30), q(45)], cfgT)[1].startMs, 30 * 60000, 'then 30 minutes apart');
assert.equal(pickTwo([q(0), q(15)], cfgT)[1].startMs, 15 * 60000, 'then the next free slot');
// Calling at 3:00 PM IST on a free weekday offers 3:15 PM first, then 4:15 PM.
import { candidates } from './slots.mjs';
const now3 = Date.parse('2026-11-23T09:30:00Z'); // Monday 3:00 PM IST
const c3 = pickTwo(candidates({ busy: [], tz: 'Asia/Kolkata', now: now3, cfg: cfgT }), cfgT);
assert.equal(new Date(c3[0].startMs).toISOString(), '2026-11-23T09:45:00.000Z', '3:15 PM first');
assert.equal(new Date(c3[1].startMs).toISOString(), '2026-11-23T10:45:00.000Z', '4:15 PM second');
console.log('fallback tests passed');

// Day words resolve in the prospect's timezone; exact times give the nearest free slots.
import { resolveDay, parseTime, getAvailableSlots, bookAppointment, SAY } from './slots.mjs';
import { parseStartTime, localStartTime } from './labels.mjs';
const mon3 = Date.parse('2026-11-23T09:30:00Z'); // Monday 23 Nov 3:00 PM IST, Monday 4:30 AM New York
const D = (v, tz = 'Asia/Kolkata', now = mon3) => resolveDay(v, tz, now, cfgT);
assert.equal(D('today').date, '2026-11-23');
assert.equal(D('tomorrow').date, '2026-11-24');
assert.equal(D('Wednesday', 'America/New_York').date, '2026-11-25');
assert.equal(D('tuesday').date, '2026-11-24', 'another weekday means its coming date');
const lateIst = Date.parse('2026-11-23T19:00:00Z'); // Tuesday 12:30 AM IST, still Monday 2:00 PM in New York
assert.equal(D('today', 'America/New_York', lateIst).date, '2026-11-23', "today is the prospect's today");
assert.equal(D('in 3 days').date, '2026-11-26');
assert.equal(D('in 1 day').date, '2026-11-24');
assert.equal(D('27').date, '2026-11-27', 'a day of the month');
assert.equal(D('23').date, '2026-11-23', 'the day of the month that is today');
assert.equal(D('5').date, '2026-12-05', 'next month, within 15 days');
assert.equal(D('20').passed, true, 'the 20th of this month has passed');
assert.equal(D('31').tooFar, true, 'the next 31st is past the window');
assert.equal(D('yesterday').passed, true);
assert.equal(D('day after tomorrow').date, '2026-11-25');
assert.equal(D('in four days').date, '2026-11-27'); assert.equal(D('in 4 day').date, '2026-11-27');
assert.equal(D('30th').date, '2026-11-30'); assert.equal(D('thirtieth').date, '2026-11-30'); assert.equal(D('thirty').date, '2026-11-30');
assert.deepEqual(D('monday'), { date: '2026-11-23', wd: 1, alt: '2026-11-30' }, 'a weekday that is today means today, next week as fallback');
assert.equal(D('next week').unknown, true); assert.equal(D('in a while').unknown, true);
assert.equal(D('in 16 days').tooFar, true);
assert.equal(D('in 15 days').date, '2026-12-08');
assert.equal(D('Not Available'), null); assert.equal(D('someday').unknown, true);
assert.deepEqual(parseTime('16:00'), { minute: 960 }); assert.deepEqual(parseTime('evening'), { part: 'evening' }); assert.deepEqual(parseTime('4 PM'), {});
assert.equal(parseStartTime('2026-11-25T11:00', 'America/New_York'), Date.parse('2026-11-25T16:00:00Z'));
assert.equal(parseStartTime('2026-11-25T11:00:00', 'Asia/Kolkata'), Date.parse('2026-11-25T05:30:00Z'));
assert.equal(parseStartTime('2026-03-08T02:30', 'America/New_York'), null, 'a time skipped by daylight saving');
assert.equal(parseStartTime('2026-11-25T11:00Z', 'Asia/Kolkata'), null);
assert.equal(localStartTime(Date.parse('2026-11-25T16:00:00Z'), 'America/New_York'), '2026-11-25T11:00');

const g2 = makeGoogle({ GOOGLE_MOCK: '1' });
const ask = async (body, now = mon3) => (await getAvailableSlots({ google: g2, cfg: cfgT, body: { timezone: 'Asia/Kolkata', ...body }, now })).toolResponse;
const at4 = await ask({ preferredDay: 'tomorrow', preferredTime: '16:00' });
assert.equal(at4, 'Success: That time is free: tomorrow, four in the evening, startTime 2026-11-24T16:00. Say it in words, never the startTime, and ask if they want it. On a yes, book this startTime.', 'a free exact time is offered alone');
g2.seedBusy(Date.parse('2026-11-25T10:30:00Z'), Date.parse('2026-11-25T10:45:00Z'));
assert.match(await ask({ preferredDay: 'wednesday', preferredTime: '16:00' }), /^Failure: That time is not available\. Option 1: Wednesday the twenty-fifth of November, three forty-five in the afternoon, startTime 2026-11-25T15:45\. Option 2: .+startTime 2026-11-25T16:15\./, 'a taken exact time gets the two nearest');
assert.match(await ask({ preferredDay: 'wednesday', preferredTime: '21:00' }), /^Failure: That time is not available\. Option 1: .+T18:30\. Option 2: .+T18:45\./, 'outside hours gets the same reply');
assert.equal(await ask({ preferredDay: 'next week' }), 'Failure: That day was not understood. Ask which day suits them.');
assert.equal(await ask({ preferredDay: '20' }), 'Failure: That day has passed. Ask which day suits them.');
assert.match(await ask({ preferredDay: 'saturday' }), /^Failure: Calls are Monday to Friday/);
assert.match(await ask({ preferredDay: '28' }), /^Failure: Calls are Monday to Friday/, 'the 28th is a Saturday');
assert.equal(await ask({ preferredDay: '31' }), 'Failure: That day is more than 15 days away. Ask for a day in the next 15 days.');
assert.match(await ask({ preferredDay: '27' }), /Option 1: Friday the twenty-seventh of November, .+startTime 2026-11-27T/);
assert.match(await ask({ preferredDay: '4' }), /Option 1: Friday the fourth of December, nine in the morning, startTime 2026-12-04T09:00\./, 'beyond a week the label names the date');
assert.equal(SAY.none, 'Failure: No time is free for that request. Ask which other day suits them.');

// Japan: Hussain's 9 AM IST is 12:30 PM in Tokyo, so the earliest Tokyo slot is 12:30 PM.
const tokyo = await getAvailableSlots({ google: g2, cfg: cfgT, body: { timezone: 'Asia/Tokyo', preferredDay: 'tomorrow' }, now: mon3 });
assert.match(tokyo.toolResponse, /Option 1: tomorrow, twelve thirty in the afternoon, startTime 2026-11-24T12:30\./);
const bt = await bookAppointment({ google: g2, cfg: cfgT, body: { timezone: 'Asia/Tokyo', email: 'k@jp.co', startTime: '2026-11-24T12:30' }, now: mon3 });
assert.equal(bt.out.prospectTime, 'Tuesday, 24 November 2026, 12:30 PM (Asia/Tokyo)');
assert.equal(bt.out.salesTime, 'Tuesday, 24 November 2026, 9:00 AM (Asia/Kolkata)');
console.log('day and time tests passed');
