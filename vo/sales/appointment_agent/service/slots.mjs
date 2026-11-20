// Slot maths: all date, time and timezone work lives here, never in the model.
import crypto from 'node:crypto';
import { parts, spokenLabel, localDateString } from './labels.mjs';

const MIN = 60000;
export function config(env) {
  const n = (k, d) => (env[k] !== undefined && env[k] !== '' ? Number(env[k]) : d);
  return {
    salesTz: env.SALES_TZ || 'Asia/Kolkata',
    workStart: n('WORK_START_HOUR', 9) * 60, workEnd: n('WORK_END_HOUR', 23) * 60,
    workDays: (env.WORK_DAYS || '1,2,3,4,5').split(',').map(Number),
    prospectStart: n('PROSPECT_START_HOUR', 9) * 60, prospectEnd: n('PROSPECT_END_HOUR', 19) * 60,
    slotMin: n('SLOT_MINUTES', 15), gridMin: n('GRID_MINUTES', 30), bufferMin: n('BUFFER_MINUTES', 0),
    noticeMin: n('MIN_NOTICE_MINUTES', 120), windowDays: n('WINDOW_DAYS', 15), gapHours: n('SECOND_SLOT_GAP_HOURS', 2),
    avoidFriday: env.AVOID_FRIDAY === '1',
    secret: env.SLOT_SECRET || 'dev-secret-change-me',
  };
}
export function signSlot(startMs, secret) {
  const sig = crypto.createHmac('sha256', secret).update(String(startMs)).digest('hex').slice(0, 16);
  return Buffer.from(`${startMs}.${sig}`).toString('base64url');
}
export function verifySlot(slotId, secret) {
  try {
    const [ms, sig] = Buffer.from(String(slotId), 'base64url').toString().split('.');
    const startMs = Number(ms);
    if (!Number.isFinite(startMs) || signSlot(startMs, secret) !== slotId) return null;
    return startMs;
  } catch { return null; }
}
const within = (p, from, to, cfg, days) => {
  const m = p.h * 60 + p.mi;
  return days.includes(p.wd) && m >= from && m + cfg.slotMin <= to;
};
const partOf = (h) => (h < 12 ? 'morning' : h < 16 ? 'afternoon' : 'evening');
export function overlapsBusy(startMs, endMs, busy, bufferMin) {
  const b = bufferMin * MIN;
  return busy.some(x => startMs < x.end + b && endMs + b > x.start);
}
export function candidates({ busy, tz, now, cfg, partOfDay, preferredDate, exclude = [] }) {
  const out = [];
  const first = Math.ceil((now + cfg.noticeMin * MIN) / (cfg.gridMin * MIN)) * cfg.gridMin * MIN;
  const last = now + cfg.windowDays * 86400000;
  for (let s = first; s < last; s += cfg.gridMin * MIN) {
    const e = s + cfg.slotMin * MIN;
    if (exclude.includes(s)) continue;
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
// second offer is at least gapHours after the first so the two choices are really different.
export function pickTwo(list, cfg) {
  if (!list.length) return [];
  const noFri = cfg.avoidFriday ? list.filter(c => c.wd !== 5) : list;
  const pool = noFri.length ? noFri : list;
  const a = pool[0];
  const b = pool.find(c => c.startMs >= a.startMs + cfg.gapHours * 60 * MIN);
  return b ? [a, b] : [a];
}
export async function getSlots({ google, cfg, body, now = Date.now() }) {
  const exclude = (body.excludeSlotIds || []).map(id => verifySlot(id, cfg.secret)).filter(x => x !== null);
  const busy = await google.busy(now, now + (cfg.windowDays + 1) * 86400000);
  const list = candidates({ busy, tz: body.timezone, now, cfg, partOfDay: body.partOfDay, preferredDate: body.preferredDate, exclude });
  const picked = pickTwo(list, cfg);
  return { slots: picked.map(c => ({ slotId: signSlot(c.startMs, cfg.secret), startUtc: new Date(c.startMs).toISOString(), spokenLabel: spokenLabel(c.startMs, body.timezone, now) })) };
}
export async function bookSlot({ google, cfg, body, now = Date.now() }) {
  const startMs = verifySlot(body.slotId, cfg.secret);
  if (startMs === null || startMs < now) return { status: 400, out: { booked: false, reason: 'error' } };
  const endMs = startMs + cfg.slotMin * MIN;
  const busy = await google.busy(startMs - 1, endMs + 1);
  const id = crypto.createHash('sha256').update(`${body.slotId}|${String(body.email).toLowerCase()}`).digest('hex').slice(0, 40);
  if (overlapsBusy(startMs, endMs, busy, 0)) {
    // A retry of a booking that already went through finds its own event: answer booked again.
    const own = await google.get(id);
    if (own && own.status !== 'cancelled') return { status: 200, out: { booked: true, spokenLabel: spokenLabel(startMs, body.timezone, now), meetLink: own.hangoutLink || '', eventId: own.id } };
    return { status: 200, out: { booked: false, reason: 'slot_taken' } };
  }
  const name = [body.firstName, body.lastName].filter(Boolean).join(' ').trim();
  const who = name || String(body.email).split('@')[0];
  const res = await google.insert({
    id, startMs, endMs, email: body.email, displayName: name || undefined,
    summary: `VoiceOwl demo: ${who}${body.company ? `, ${body.company}` : ''}`,
    description: [`Booked by the VoiceOwl phone agent.`, body.company ? `Company: ${body.company}` : '', body.notes ? `Notes: ${body.notes}` : ''].filter(Boolean).join('\n'),
    requestId: id,
  });
  let ev = res.event;
  for (let i = 0; i < 3 && !ev.hangoutLink; i++) { await new Promise(s => setTimeout(s, 1000)); ev = await google.get(id); }
  return { status: 200, out: { booked: true, spokenLabel: spokenLabel(startMs, body.timezone, now), meetLink: ev.hangoutLink || '', eventId: ev.id || id } };
}
