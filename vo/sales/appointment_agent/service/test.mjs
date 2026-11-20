import http from 'node:http';
import assert from 'node:assert/strict';
import { makeApp } from './server.mjs';
import { makeGoogle } from './google.mjs';
import { parts } from './labels.mjs';

const env = { GOOGLE_MOCK: '1', API_KEY: 'k', SLOT_SECRET: 's' };
const google = makeGoogle(env);
const srv = http.createServer(makeApp(env, google));
await new Promise(r => srv.listen(0, r));
const base = `http://127.0.0.1:${srv.address().port}`;
const call = async (path, body, key = 'k') => { const r = await fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': key }, body: JSON.stringify(body) }); return { s: r.status, j: await r.json() }; };

assert.equal((await call('/slots', { timezone: 'Asia/Kolkata' }, 'bad')).s, 401);
assert.equal((await call('/slots', { timezone: 'Nope/Zone' })).s, 400);

for (const tz of ['Asia/Kolkata', 'America/New_York', 'Europe/London', 'Asia/Dubai', 'America/Los_Angeles']) {
  const { j } = await call('/slots', { timezone: tz });
  console.log(tz.padEnd(20), j.slots.length ? j.slots.map(s => s.spokenLabel).join('  |  ') : '(none)');
  for (const s of j.slots) {
    const p = parts(Date.parse(s.startUtc), tz), q = parts(Date.parse(s.startUtc), 'Asia/Kolkata');
    assert.ok(p.h >= 9 && p.h * 60 + p.mi + 15 <= 19 * 60, `${tz} prospect hours`);
    assert.ok(q.h >= 9 && q.h * 60 + q.mi + 15 <= 23 * 60, 'sales hours');
    assert.ok(p.wd >= 1 && p.wd <= 5 && q.wd >= 1 && q.wd <= 5, 'weekdays');
  }
}
const a = (await call('/slots', { timezone: 'Asia/Kolkata' })).j.slots;
assert.equal(a.length, 2);
assert.ok(Date.parse(a[1].startUtc) - Date.parse(a[0].startUtc) >= 3600000, 'two slots 1h apart');
assert.match(a[0].slotId, /^[0-9a-z]+-[0-9a-f]{6}$/, 'short slotId');
assert.ok(a[0].slotId.length <= 14, 'slotId at most 14 characters');
assert.match((await call('/slots', { timezone: 'Asia/Kolkata' })).j.toolResponse, /^Success: Two times are free: .+ Offer both/);
const morning = (await call('/slots', { timezone: 'Asia/Kolkata', preferredTime: 'afternoon' })).j.slots;
for (const s of morning) assert.ok(parts(Date.parse(s.startUtc), 'Asia/Kolkata').h >= 12 && parts(Date.parse(s.startUtc), 'Asia/Kolkata').h < 16);

const forged = (await call('/book', { timezone: 'Asia/Kolkata', slotId: 'forged', email: 'a@b.com' })).j;
assert.equal(forged.reason, 'error'); assert.match(forged.toolResponse, /^Failure: The booking did not go through/);
assert.equal((await call('/book', { timezone: 'Asia/Kolkata', slotId: a[0].slotId, email: 'not-an-email' })).j.reason, 'error');
const b1 = await call('/book', { timezone: 'Asia/Kolkata', slotId: a[0].slotId, email: 'priya@brightloans.com', fname: 'Priya', lname: 'Not Available', company: 'BrightLoans', appointmentNotes: 'weekend leads' });
assert.equal(b1.j.booked, true); assert.match(b1.j.toolResponse, /^Success: The demo is booked for .+ Do not push them/); assert.match(b1.j.prospectTime, /^\w+day, \d+ \w+ \d{4}, \d+:\d\d (AM|PM) \(Asia\/Kolkata\)$/); assert.ok(b1.j.meetLink.startsWith('https://meet.google.com/')); assert.equal(b1.j.spokenLabel, a[0].spokenLabel);
const retry = await call('/book', { timezone: 'Asia/Kolkata', slotId: a[0].slotId, email: 'priya@brightloans.com' });
assert.equal(retry.j.booked, true, 'retried booking answers booked');
const b2 = await call('/book', { timezone: 'Asia/Kolkata', slotId: a[0].slotId, email: 'other@x.com' });
assert.equal(b2.j.booked, false); assert.equal(b2.j.reason, 'slot_taken'); assert.match(b2.j.toolResponse, /^Failure: That time was just taken/);
const after = (await call('/slots', { timezone: 'Asia/Kolkata' })).j.slots;
assert.ok(!after.some(s => s.slotId === a[0].slotId), 'booked slot no longer offered');
assert.equal((await call('/email', { to: 'a@b.com', subject: 'x', body: 'y' }, 'bad')).s, 401);
const em = await call('/email', { to: 'priya@brightloans.com', subject: 'Your VoiceOwl demo is booked', body: 'Hi Priya,\n\nBooked.\n\nTanya, VoiceOwl' });
assert.equal(em.s, 200); assert.equal(em.j.sent, true); assert.match(em.j.toolResponse, /^Success: The email was sent/); assert.ok(em.j.messageId);
const mime = google.sent.at(-1).mime;
assert.match(mime, /^To: priya@brightloans\.com\r\n/);
assert.ok(Buffer.from(mime.split('\r\n\r\n')[1].replace(/\r\n/g, ''), 'base64').toString().includes('Hi Priya,\r\n\r\nBooked.'));
const escaped = await call('/email', { to: 'priya@brightloans.com', subject: 'Héllo', body: 'Line one\\n\\nLine two' });
assert.equal(escaped.j.sent, true);
assert.ok(Buffer.from(google.sent.at(-1).mime.split('\r\n\r\n')[1].replace(/\r\n/g, ''), 'base64').toString().includes('Line one\r\n\r\nLine two'), 'literal \\n becomes a line break');
const injected = await call('/email', { to: 'priya@brightloans.com', subject: 'Hi\r\nBcc: evil@x.com', body: 'y' });
assert.equal(injected.j.sent, true); assert.ok(!/^Bcc:/m.test(google.sent.at(-1).mime), 'no header injection');
const before = google.sent.length;
assert.equal((await call('/email', { to: 'priya@brightloans.com', subject: 'none', body: 'none' })).j.reason, 'nothing_to_send');
assert.equal((await call('/email', { to: 'Not Available', subject: 'x', body: 'y' })).j.reason, 'bad_address');
assert.equal(google.sent.length, before, 'nothing sent for none or a bad address');
const broken = http.createServer(makeApp(env, { ...google, sendMail: async () => { throw new Error('boom'); } }));
await new Promise(r => broken.listen(0, r));
const br = await fetch(`http://127.0.0.1:${broken.address().port}/email`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': 'k' }, body: JSON.stringify({ to: 'a@b.com', subject: 'x', body: 'y' }) });
assert.equal(br.status, 200); assert.deepEqual(await br.json(), { sent: false, reason: 'error', toolResponse: 'Failure: The email could not be sent.' });
broken.close();
console.log('email tests passed');

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
import { resolveDay, parseTime, signSlot, verifySlot } from './slots.mjs';
const mon3 = Date.parse('2026-11-23T09:30:00Z'); // Monday 3:00 PM IST, Monday 4:30 AM New York
assert.equal(resolveDay('today', 'Asia/Kolkata', mon3, cfgT), '2026-11-23');
assert.equal(resolveDay('tomorrow', 'Asia/Kolkata', mon3, cfgT), '2026-11-24');
assert.equal(resolveDay('Wednesday', 'America/New_York', mon3, cfgT), '2026-11-25');
assert.equal(resolveDay('monday', 'Asia/Kolkata', mon3, cfgT), '2026-11-30', 'a weekday name means its next date after today');
const lateIst = Date.parse('2026-11-23T19:00:00Z'); // Tuesday 12:30 AM IST, still Monday 2:00 PM in New York
assert.equal(resolveDay('today', 'America/New_York', lateIst, cfgT), '2026-11-23', "today is the prospect's today");
assert.equal(resolveDay('Not Available', 'Asia/Kolkata', mon3, cfgT), null);
assert.deepEqual(parseTime('16:00'), { minute: 960 }); assert.deepEqual(parseTime('evening'), { part: 'evening' }); assert.deepEqual(parseTime('4 PM'), {});
const id = signSlot(mon3, 's'); assert.equal(verifySlot(id, 's'), mon3); assert.equal(verifySlot(id.toUpperCase(), 's'), mon3); assert.equal(verifySlot(id.slice(0, -1) + '0', 's') === mon3 && id.slice(-1) !== '0', false);
const g2 = makeGoogle({ GOOGLE_MOCK: '1' });
const { getSlots } = await import('./slots.mjs');
const at4 = await getSlots({ google: g2, cfg: cfgT, body: { timezone: 'Asia/Kolkata', preferredDay: 'tomorrow', preferredTime: '16:00' }, now: mon3 });
assert.equal(at4.slots[0].spokenLabel, 'tomorrow, four in the evening', 'exact time offered when free');
assert.equal(at4.slots.length, 2);
const sat = await getSlots({ google: g2, cfg: cfgT, body: { timezone: 'Asia/Kolkata', preferredDay: 'saturday' }, now: mon3 });
assert.equal(sat.slots.length, 0); assert.match(sat.toolResponse, /^Failure: Demos are Monday to Friday/);
console.log('day and time tests passed');
