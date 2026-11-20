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
assert.ok(Date.parse(a[1].startUtc) - Date.parse(a[0].startUtc) >= 2 * 3600000, 'two slots 2h apart');
const ex = (await call('/slots', { timezone: 'Asia/Kolkata', excludeSlotIds: [a[0].slotId] })).j.slots;
assert.notEqual(ex[0].slotId, a[0].slotId);
const morning = (await call('/slots', { timezone: 'Asia/Kolkata', partOfDay: 'afternoon' })).j.slots;
for (const s of morning) assert.ok(parts(Date.parse(s.startUtc), 'Asia/Kolkata').h >= 12 && parts(Date.parse(s.startUtc), 'Asia/Kolkata').h < 16);

assert.equal((await call('/book', { timezone: 'Asia/Kolkata', slotId: 'forged', email: 'a@b.com' })).j.reason, 'error');
assert.equal((await call('/book', { timezone: 'Asia/Kolkata', slotId: a[0].slotId, email: 'not-an-email' })).j.reason, 'error');
const b1 = await call('/book', { timezone: 'Asia/Kolkata', slotId: a[0].slotId, email: 'priya@brightloans.com', firstName: 'Priya', company: 'BrightLoans', notes: 'weekend leads' });
assert.equal(b1.j.booked, true); assert.ok(b1.j.meetLink.startsWith('https://meet.google.com/')); assert.equal(b1.j.spokenLabel, a[0].spokenLabel);
const retry = await call('/book', { timezone: 'Asia/Kolkata', slotId: a[0].slotId, email: 'priya@brightloans.com' });
assert.equal(retry.j.booked, true, 'retried booking answers booked');
const b2 = await call('/book', { timezone: 'Asia/Kolkata', slotId: a[0].slotId, email: 'other@x.com' });
assert.deepEqual(b2.j, { booked: false, reason: 'slot_taken' });
const after = (await call('/slots', { timezone: 'Asia/Kolkata' })).j.slots;
assert.ok(!after.some(s => s.slotId === a[0].slotId), 'booked slot no longer offered');
console.log('\nall tests passed'); srv.close();
