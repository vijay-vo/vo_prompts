// Slot maths: all date, time and timezone work lives here, never in the model.
import crypto from 'node:crypto';
import { parts, spokenLabel, localDateString, writtenTime } from './labels.mjs';

const MIN = 60000;
export function config(env) {
  const n = (k, d) => (env[k] !== undefined && env[k] !== '' ? Number(env[k]) : d);
  return {
    salesTz: env.SALES_TZ || 'Asia/Kolkata',
    workStart: n('WORK_START_HOUR', 9) * 60, workEnd: n('WORK_END_HOUR', 23) * 60,
    workDays: (env.WORK_DAYS || '1,2,3,4,5').split(',').map(Number),
    prospectStart: n('PROSPECT_START_HOUR', 9) * 60, prospectEnd: n('PROSPECT_END_HOUR', 19) * 60,
    slotMin: n('SLOT_MINUTES', 15), gridMin: n('GRID_MINUTES', 15), bufferMin: n('BUFFER_MINUTES', 0),
    noticeMin: n('MIN_NOTICE_MINUTES', 10), windowDays: n('WINDOW_DAYS', 7),
    gapsMin: (env.SECOND_SLOT_GAPS_MINUTES || '60,30').split(',').map(Number),
    avoidFriday: env.AVOID_FRIDAY === '1',
    secret: env.SLOT_SECRET || 'dev-secret-change-me',
  };
}
// A slotId is short so the model copies it reliably: the start minute in base 36, a dash, and
// 6 hex characters of an HMAC with SLOT_SECRET, e.g. "tqd3s0-1a2b3c". The model cannot invent one.
export function signSlot(startMs, secret) {
  const m = Math.round(startMs / MIN).toString(36);
  return `${m}-${crypto.createHmac('sha256', secret).update(m).digest('hex').slice(0, 6)}`;
}
export function verifySlot(slotId, secret) {
  const m = String(slotId || '').trim().toLowerCase().split('-')[0];
  if (!/^[0-9a-z]+$/.test(m)) return null;
  const startMs = parseInt(m, 36) * MIN;
  return Number.isFinite(startMs) && signSlot(startMs, secret) === String(slotId).trim().toLowerCase() ? startMs : null;
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
// toolResponse: the line every reply carries for the model: "Success:" or "Failure:", then what to do.
export const SAY = {
  two: (a, b) => `Success: Two times are free: ${a}, or ${b}. Offer both and ask which works better.`,
  one: (a) => `Success: One time is free: ${a}. Offer it and ask if it works.`,
  booked: (a) => `Success: The demo is booked for ${a}. Tell the prospect the invite is in their email and they can accept it whenever it suits them. Do not push them to accept it now.`,
  none: 'Failure: No time is free for that request. Ask which other day or time in the next seven days suits them.',
  weekend: 'Failure: Demos are Monday to Friday only. Ask which weekday suits them.',
  calendarDown: 'Failure: The calendar could not be checked. Tell the prospect our team will send them the details on email and WhatsApp.',
  taken: 'Failure: That time was just taken. Check the calendar again and offer the new times.',
  bookError: 'Failure: The booking did not go through. Tell the prospect our team will send them the details on email and WhatsApp. Do not try to book again.',
};
const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
// preferredDay (today, tomorrow or a weekday name) becomes a date in the PROSPECT's timezone, so the
// model never works out a date. A weekday name means its next date after today, within the window.
export function resolveDay(day, tz, now, cfg) {
  const d = clean(day).toLowerCase();
  if (!d) return null;
  if (d === 'today') return localDateString(now, tz);
  if (d === 'tomorrow') return localDateString(now + 86400000, tz);
  const wd = DAYS.indexOf(d);
  if (wd < 0) return null;
  for (let k = 1; k <= cfg.windowDays; k++) if (parts(now + k * 86400000, tz).wd === wd) return localDateString(now + k * 86400000, tz);
  return null;
}
// preferredTime: morning / afternoon / evening, or an exact time HH:MM (24-hour, prospect's time).
export function parseTime(t) {
  const v = clean(t).toLowerCase();
  if (['morning', 'afternoon', 'evening'].includes(v)) return { part: v };
  const m = v.match(/^(\d{1,2}):(\d{2})$/);
  if (m && +m[1] < 24 && +m[2] < 60) return { minute: +m[1] * 60 + +m[2] };
  return {};
}
export async function getAvailableSlots({ google, cfg, body, now = Date.now() }) {
  const tz = body.timezone;
  const day = clean(body.preferredDay).toLowerCase();
  const date = resolveDay(day, tz, now, cfg);
  const time = parseTime(body.preferredTime);
  const busy = await google.busy(now, now + (cfg.windowDays + 1) * 86400000);
  const list = candidates({ busy, tz, now, cfg, partOfDay: time.part, preferredDate: date || undefined });
  let picked;
  if (time.minute !== undefined) {
    // An exact time: the free slot nearest to it first (the time itself when free), then the next nearest.
    // With no day named, nearer days win: each day further away counts as a full day of distance.
    const dist = (c) => { const p = parts(c.startMs, tz); return Math.abs(p.h * 60 + p.mi - time.minute) + (date ? 0 : (c.startMs - now) / 86400000 * 1440); };
    picked = [...list].sort((a, b) => dist(a) - dist(b) || a.startMs - b.startMs).slice(0, 2);
  } else picked = pickTwo(list, cfg);
  const slots = picked.map(c => ({ slotId: signSlot(c.startMs, cfg.secret), startUtc: new Date(c.startMs).toISOString(), spokenLabel: spokenLabel(c.startMs, tz, now) }));
  const toolResponse = slots.length === 2 ? SAY.two(slots[0].spokenLabel, slots[1].spokenLabel)
    : slots.length === 1 ? SAY.one(slots[0].spokenLabel)
    : day === 'saturday' || day === 'sunday' ? SAY.weekend : SAY.none;
  return { slots, toolResponse };
}
export async function bookAppointment({ google, cfg, body, now = Date.now() }) {
  const fail = { booked: false, reason: 'error', toolResponse: SAY.bookError };
  const startMs = verifySlot(body.slotId, cfg.secret);
  if (startMs === null || startMs < now) return { status: 400, out: fail };
  const endMs = startMs + cfg.slotMin * MIN;
  const label = spokenLabel(startMs, body.timezone, now);
  const ok = (ev) => ({ booked: true, spokenLabel: label,
    toolResponse: SAY.booked(label),
    prospectTime: `${writtenTime(startMs, body.timezone)} (${body.timezone})`,
    salesTime: `${writtenTime(startMs, cfg.salesTz)} (${cfg.salesTz})`,
    startUtc: new Date(startMs).toISOString(), meetLink: ev.hangoutLink || '', eventId: ev.id });
  const slotKey = signSlot(startMs, cfg.secret);
  const id = crypto.createHash('sha256').update(`${slotKey}|${String(body.email).toLowerCase()}`).digest('hex').slice(0, 40);
  const busy = await google.busy(startMs - 1, endMs + 1);
  if (overlapsBusy(startMs, endMs, busy, 0)) {
    // A retry of a booking that already went through finds its own event: answer booked again.
    const own = await google.get(id);
    if (own && own.status !== 'cancelled') return { status: 200, out: ok(own) };
    return { status: 200, out: { booked: false, reason: 'slot_taken', toolResponse: SAY.taken } };
  }
  const company = clean(body.company), notes = clean(body.appointmentNotes);
  const name = [clean(body.fname), clean(body.lname)].filter(Boolean).join(' ');
  const who = name || String(body.email).split('@')[0];
  const res = await google.insert({
    id, startMs, endMs, email: body.email, displayName: name || undefined,
    summary: `VoiceOwl demo: ${who}${company ? `, ${company}` : ''}`,
    description: [company ? `Company: ${company}` : '', notes && notes.toLowerCase() !== 'none' ? `Notes: ${notes}` : ''].filter(Boolean).join('\n'),
    requestId: id,
  });
  let ev = res.event;
  for (let i = 0; i < 3 && !ev.hangoutLink; i++) { await new Promise(s => setTimeout(s, 1000)); ev = (await google.get(id)) || ev; }
  return { status: 200, out: ok({ ...ev, id: ev.id || id }) };
}
