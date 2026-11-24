// Slot maths: all date, time and timezone work lives here, never in the model.
import crypto from 'node:crypto';
import { parts, spokenLabel, localDateString, writtenTime, localStartTime, parseStartTime } from './labels.mjs';

const MIN = 60000;
export function config(env) {
  const n = (k, d) => (env[k] !== undefined && env[k] !== '' ? Number(env[k]) : d);
  return {
    salesTz: env.SALES_TZ || 'Asia/Kolkata',
    workStart: n('WORK_START_HOUR', 9) * 60, workEnd: n('WORK_END_HOUR', 23) * 60,
    workDays: (env.WORK_DAYS || '1,2,3,4,5').split(',').map(Number),
    prospectStart: n('PROSPECT_START_HOUR', 9) * 60, prospectEnd: n('PROSPECT_END_HOUR', 19) * 60,
    slotMin: n('SLOT_MINUTES', 15), gridMin: n('GRID_MINUTES', 15), bufferMin: n('BUFFER_MINUTES', 0),
    noticeMin: n('MIN_NOTICE_MINUTES', 10), windowDays: n('WINDOW_DAYS', 15),
    gapsMin: (env.SECOND_SLOT_GAPS_MINUTES || '60,30').split(',').map(Number),
    avoidFriday: env.AVOID_FRIDAY === '1',
  };
}
// Values the platform sends for unknown details count as absent.
export const clean = (v) => { const t = String(v ?? '').trim(); return /^(|null|undefined|not available|n\/a)$/i.test(t) ? '' : t; };
const within = (p, from, to, cfg, days) => {
  const m = p.h * 60 + p.mi;
  return days.includes(p.wd) && m >= from && m + cfg.slotMin <= to;
};
const partOf = (h) => (h < 12 ? 'morning' : h < 16 ? 'afternoon' : 'evening');
export function overlapsBusy(startMs, endMs, busy, bufferMin) {
  const b = bufferMin * MIN;
  return busy.some(x => startMs < x.end + b && endMs + b > x.start);
}
export function candidates({ busy, tz, now, cfg, partOfDay, preferredDate }) {
  const out = [];
  const first = Math.ceil((now + cfg.noticeMin * MIN) / (cfg.gridMin * MIN)) * cfg.gridMin * MIN;
  const last = now + cfg.windowDays * 86400000;
  for (let s = first; s < last; s += cfg.gridMin * MIN) {
    const e = s + cfg.slotMin * MIN;
    const sp = parts(s, cfg.salesTz), pp = parts(s, tz);
    if (!within(sp, cfg.workStart, cfg.workEnd, cfg, cfg.workDays)) continue;
    if (!within(pp, cfg.prospectStart, cfg.prospectEnd, cfg, [1, 2, 3, 4, 5])) continue;
    if (partOfDay && partOf(pp.h) !== partOfDay) continue;
    if (preferredDate && localDateString(s, tz) !== preferredDate) continue;
    if (overlapsBusy(s, e, busy, cfg.bufferMin)) continue;
    out.push({ startMs: s, wd: pp.wd });
  }
  return out;
}
// Earliest first; with AVOID_FRIDAY=1, skip the prospect's Fridays when other days exist. The
// second offer is the first free slot at least gapsMin[0] after the first (60 minutes), else at
// least gapsMin[1] (30 minutes), and so on; failing all, the next free slot.
export function pickTwo(list, cfg) {
  if (!list.length) return [];
  const noFri = cfg.avoidFriday ? list.filter(c => c.wd !== 5) : list;
  const pool = noFri.length ? noFri : list;
  const a = pool[0];
  let b;
  for (const g of cfg.gapsMin) if (!b) b = pool.find(c => c.startMs >= a.startMs + g * MIN);
  b ||= pool.find(c => c.startMs > a.startMs);
  return b ? [a, b] : [a];
}
// toolResponse: the only thing the model reads: "Success:" or "Failure:", then what to do. Each offered
// time carries its startTime (the prospect's local time), which the model copies into bookAppointment.
const opt = (o) => `${o.label}, startTime ${o.startTime}`;
const offer = (os) => os.length === 2
  ? `Option 1: ${opt(os[0])}. Option 2: ${opt(os[1])}. Offer both in words, never the startTime, and ask which works better. To book, pass the startTime of the option they choose.`
  : `The one free time is ${opt(os[0])}. Offer it in words, never the startTime, and ask if it works. To book, pass this startTime.`;
export const SAY = {
  offer: (os) => `Success: ${os.length === 2 ? 'Two times are free.' : 'One time is free.'} ${offer(os)}`,
  exact: (o) => `Success: That time is free: ${opt(o)}. Say it in words, never the startTime, and ask if they want it. On a yes, book this startTime.`,
  notAvailable: (os) => `Failure: That time is not available. ${offer(os)}`,
  booked: (a) => `Success: The call is booked for ${a}. Tell the prospect the invite is in their email and they can accept it whenever it suits them. Do not push them to accept it now.`,
  none: 'Failure: No time is free for that request. Ask which other day suits them.',
  weekend: 'Failure: Calls are Monday to Friday only. Ask which weekday suits them.',
  tooFar: (n) => `Failure: That day is more than ${n} days away. Ask for a day in the next ${n} days.`,
  passed: 'Failure: That day has passed. Ask which day suits them.',
  unknown: 'Failure: That day was not understood. Ask which day suits them.',
  calendarDown: 'Failure: The calendar could not be checked. Tell the prospect our team will send them the details on email and WhatsApp.',
  taken: (os) => `Failure: That time was just taken. ${os.length ? offer(os) : 'No other time is free nearby. Ask which other day suits them.'}`,
  noStart: (os) => `Failure: No startTime was passed, so nothing was booked. ${os.length ? offer(os) : 'Ask which other day suits them.'}`,
  notOffered: (os) => `Failure: That startTime is not a free time. ${os.length ? offer(os) : 'Ask which other day suits them.'}`,
  bookError: 'Failure: The booking did not go through. Tell the prospect our team will send them the details on email and WhatsApp. Do not try to book again.',
};
const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const NUM = {}, ORDW = {};
['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'].forEach((w, i) => { NUM[w] = i; });
['','first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth','eleventh','twelfth','thirteenth','fourteenth','fifteenth','sixteenth','seventeenth','eighteenth','nineteenth'].forEach((w, i) => { if (w) ORDW[w] = i; });
NUM.twenty = 20; NUM.thirty = 30; ORDW.twentieth = 20; ORDW.thirtieth = 30;
// A small number as digits ("30", "30th") or words ("thirty", "twenty-one", "thirtieth"); null otherwise.
function num(t) {
  const v = t.replace(/-/g, ' ').trim();
  const dig = v.match(/^(\d{1,3})(st|nd|rd|th)?$/);
  if (dig) return +dig[1];
  if (v in NUM) return NUM[v];
  if (v in ORDW) return ORDW[v];
  const two = v.match(/^(twenty|thirty) (\w+)$/);
  if (two) { const o = NUM[two[2]] ?? ORDW[two[2]]; if (o >= 1 && o <= 9) return NUM[two[1]] + o; }
  return null;
}
// preferredDay becomes a date in the PROSPECT's timezone, so the model never works out a date. Accepted:
// today, tomorrow, day after tomorrow, a weekday name, "in N days", or a day of the month ("30").
// A weekday that is today means today, with next week's date as the fallback when today has no slot left.
// A day of the month is the next date with that number, today included; a number already past this month
// that is not within the window next month has passed.
// Returns null (absent), { date, wd, alt? }, { tooFar }, { passed } or { unknown }.
export function resolveDay(day, tz, now, cfg) {
  const d = clean(day).toLowerCase().replace(/[.,!?]/g, '').replace(/\s+/g, ' ').trim();
  if (!d) return null;
  const on = (k) => ({ date: localDateString(now + k * 86400000, tz), wd: parts(now + k * 86400000, tz).wd });
  const at = (k) => k > cfg.windowDays ? { tooFar: true } : on(k);
  if (d === 'today') return at(0);
  if (d === 'tomorrow') return at(1);
  if (d === 'day after tomorrow' || d === 'the day after tomorrow') return at(2);
  if (d === 'yesterday') return { passed: true };
  const inN = d.match(/^in (.+?) days?$/);
  if (inN) { const n = num(inN[1]); return n === null ? { unknown: true } : at(n); }
  const wd = DAYS.indexOf(d);
  if (wd >= 0) {
    if (parts(now, tz).wd === wd) return { ...on(0), alt: at(7).date };
    for (let k = 1; k <= 6; k++) if (parts(now + k * 86400000, tz).wd === wd) return at(k);
  }
  const dom = num(d);
  if (dom !== null && dom >= 1 && dom <= 31) {
    for (let k = 0; k <= cfg.windowDays; k++) if (parts(now + k * 86400000, tz).d === dom) return at(k);
    return dom < parts(now, tz).d ? { passed: true } : { tooFar: true };
  }
  return { unknown: true };
}
// preferredTime: morning / afternoon / evening, or an exact time HH:MM (24-hour, prospect's time).
export function parseTime(t) {
  const v = clean(t).toLowerCase();
  if (['morning', 'afternoon', 'evening'].includes(v)) return { part: v };
  const m = v.match(/^(\d{1,2}):(\d{2})$/);
  if (m && +m[1] < 24 && +m[2] < 60) return { minute: +m[1] * 60 + +m[2] };
  return {};
}
const asOption = (ms, tz, now) => ({ startMs: ms, label: spokenLabel(ms, tz, now), startTime: localStartTime(ms, tz) });
// The free slots nearest a moment, nearest first.
const nearest = (list, ms, n = 2) => [...list].sort((a, b) => Math.abs(a.startMs - ms) - Math.abs(b.startMs - ms) || a.startMs - b.startMs).slice(0, n);

export async function getAvailableSlots({ google, cfg, body, now = Date.now() }) {
  const tz = body.timezone;
  const day = resolveDay(body.preferredDay, tz, now, cfg);
  if (day?.unknown) return { toolResponse: SAY.unknown };
  if (day?.passed) return { toolResponse: SAY.passed };
  if (day?.tooFar) return { toolResponse: SAY.tooFar(cfg.windowDays) };
  if (day && (day.wd === 0 || day.wd === 6)) return { toolResponse: SAY.weekend };
  const time = parseTime(body.preferredTime);
  const busy = await google.busy(now, now + (cfg.windowDays + 1) * 86400000);
  let date = day?.date;
  let list = candidates({ busy, tz, now, cfg, partOfDay: time.part, preferredDate: date });
  // A weekday that is today with nothing left today means that weekday next week.
  if (!list.length && day?.alt) { date = day.alt; list = candidates({ busy, tz, now, cfg, partOfDay: time.part, preferredDate: date }); }
  const opts = (cs) => cs.map(c => asOption(c.startMs, tz, now));
  if (time.minute !== undefined) {
    // An exact time: when it is free (on the day named, else the earliest day it is free), offer it alone.
    const minuteOf = (c) => { const p = parts(c.startMs, tz); return p.h * 60 + p.mi; };
    const hit = list.find(c => minuteOf(c) === time.minute);
    if (hit) return { toolResponse: SAY.exact(asOption(hit.startMs, tz, now)) };
    // Not free for any reason (taken, outside hours, passed): the two free slots nearest to it, in time order.
    // With no day named, nearer days win: each day further away counts as a full day of distance.
    const dist = (c) => Math.abs(minuteOf(c) - time.minute) + (date ? 0 : (c.startMs - now) / 86400000 * 1440);
    const near = [...list].sort((a, b) => dist(a) - dist(b) || a.startMs - b.startMs).slice(0, 2).sort((a, b) => a.startMs - b.startMs);
    return { toolResponse: near.length ? SAY.notAvailable(opts(near)) : SAY.none };
  }
  const picked = pickTwo(list, cfg);
  return { toolResponse: picked.length ? SAY.offer(opts(picked)) : SAY.none };
}

// Every bookAppointment reply has the same seven fields; the booking details are Not Available when not booked.
const NA = 'Not Available';
export const bookReply = (o) => ({ booked: false, reason: 'error', toolResponse: SAY.bookError, prospectTime: NA, salesTime: NA, meetLink: NA, eventId: NA, ...o });

// startTime is the prospect's local time as offered ("2026-11-25T11:00"). It is booked only when it is
// still one of the free slots; otherwise the reply offers the two free slots nearest to it.
export async function bookAppointment({ google, cfg, body, now = Date.now() }) {
  const tz = body.timezone;
  const startMs = parseStartTime(body.startTime, tz);
  const busy = await google.busy(now, now + (cfg.windowDays + 1) * 86400000);
  const free = candidates({ busy, tz, now, cfg });
  const around = (ms) => nearest(free, ms).sort((a, b) => a.startMs - b.startMs).map(c => asOption(c.startMs, tz, now));
  const ref = startMs ?? now;
  const id = startMs === null ? '' : crypto.createHash('sha256').update(`${Math.round(startMs / MIN)}|${String(body.email).toLowerCase()}`).digest('hex').slice(0, 40);
  const ok = (ev) => bookReply({ booked: true, reason: 'booked',
    toolResponse: SAY.booked(spokenLabel(startMs, tz, now)),
    prospectTime: `${writtenTime(startMs, tz)} (${tz})`,
    salesTime: `${writtenTime(startMs, cfg.salesTz)} (${cfg.salesTz})`,
    meetLink: ev.hangoutLink || NA, eventId: ev.id || NA });
  if (startMs === null || !free.some(c => c.startMs === startMs)) {
    if (startMs !== null && startMs > now) {
      // A retry of a booking that already went through finds its own event: answer booked again.
      const own = await google.get(id);
      if (own && own.status !== 'cancelled') return { status: 200, out: ok(own) };
      if (overlapsBusy(startMs, startMs + cfg.slotMin * MIN, busy, 0) && candidates({ busy: [], tz, now, cfg }).some(c => c.startMs === startMs))
        return { status: 200, out: bookReply({ reason: 'slot_taken', toolResponse: SAY.taken(around(ref)) }) };
    }
    const missing = !clean(body.startTime) || /^[-\s]*$/.test(String(body.startTime));
    return { status: 200, out: bookReply({ reason: missing ? 'no_start_time' : 'not_offered', toolResponse: (missing ? SAY.noStart : SAY.notOffered)(around(ref)) }) };
  }
  const endMs = startMs + cfg.slotMin * MIN;
  const company = clean(body.company), notes = clean(body.appointmentNotes);
  const name = [clean(body.fname), clean(body.lname)].filter(Boolean).join(' ');
  const who = name || String(body.email).split('@')[0];
  const res = await google.insert({
    id, startMs, endMs, email: body.email, displayName: name || undefined,
    summary: `VoiceOwl demo: ${who}${company ? `, ${company}` : ''}`,
    description: [company ? `Company: ${company}` : '', notes && notes.toLowerCase() !== 'none' ? `Notes: ${notes}` : ''].filter(Boolean).join('\n'),
    requestId: id,
  });
  if (res.duplicate) return { status: 200, out: ok({ ...res.event, id: res.event?.id || id }) };
  let ev = res.event;
  for (let i = 0; i < 3 && !ev.hangoutLink; i++) { await new Promise(s => setTimeout(s, 1000)); ev = (await google.get(id)) || ev; }
  return { status: 200, out: ok({ ...ev, id: ev.id || id }) };
}
