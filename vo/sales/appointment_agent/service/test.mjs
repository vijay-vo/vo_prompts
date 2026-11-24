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
assert.equal((await call('/getAvailableSlots', { timezone: 'Asia/Kolkata' }, 'bad')).s, 401);
assert.equal((await call('/getAvailableSlots', { timezone: 'Nope/Zone' })).s, 400);

for (const tz of ['Asia/Kolkata', 'America/New_York', 'Europe/London', 'Asia/Dubai', 'America/Los_Angeles', 'Asia/Tokyo']) {
  const { j } = await call('/getAvailableSlots', { timezone: tz });
  assert.deepEqual(Object.keys(j), ['toolResponse'], 'the reply is the toolResponse only');
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
const b1 = await call('/bookAppointment', { ...lead, startTime: a[0] });
assert.equal(b1.j.booked, true); assert.match(b1.j.toolResponse, /^Success: The call is booked for .+ Do not push them/);
assert.match(b1.j.prospectTime, /^\w+day, \d+ \w+ \d{4}, \d+:\d\d (AM|PM) \(Asia\/Kolkata\)$/);
assert.match(b1.j.salesTime, /\(Asia\/Kolkata\)$/); assert.ok(b1.j.meetLink.startsWith('https://meet.google.com/')); assert.ok(b1.j.eventId);
assert.deepEqual(Object.keys(b1.j), ['booked', 'toolResponse', 'prospectTime', 'salesTime', 'meetLink', 'eventId']);
const retry = await call('/bookAppointment', { ...lead, startTime: a[0] });
assert.equal(retry.j.booked, true, 'retried booking answers booked');
const b2 = await call('/bookAppointment', { ...lead, startTime: a[0], email: 'other@x.com' });
assert.equal(b2.j.booked, false); assert.equal(b2.j.reason, 'slot_taken');
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
