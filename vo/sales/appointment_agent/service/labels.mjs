// Spoken labels and timezone helpers. English words only; the agent translates by meaning.
const ONES = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const TENS = ['','','twenty','thirty','forty','fifty'];
export function words(n) {
  if (n < 20) return ONES[n];
  const t = TENS[Math.floor(n / 10)], o = n % 10;
  return o ? `${t}-${ONES[o]}` : t;
}
const ORD = ['','first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth','eleventh','twelfth','thirteenth','fourteenth','fifteenth','sixteenth','seventeenth','eighteenth','nineteenth','twentieth','twenty-first','twenty-second','twenty-third','twenty-fourth','twenty-fifth','twenty-sixth','twenty-seventh','twenty-eighth','twenty-ninth','thirtieth','thirty-first'];
const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const fmtCache = new Map();
export function validTz(tz) {
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return typeof tz === 'string' && tz.length > 0; } catch { return false; }
}
export function parts(ms, tz) {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', weekday: 'short' });
    fmtCache.set(tz, f);
  }
  const o = {};
  for (const p of f.formatToParts(new Date(ms))) o[p.type] = p.value;
  const wd = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(o.weekday);
  return { y: +o.year, mo: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, wd };
}
const dayKey = (p) => p.y * 10000 + p.mo * 100 + p.d;
export function dateKey(ms, tz) { return dayKey(parts(ms, tz)); }
export function localDateString(ms, tz) {
  const p = parts(ms, tz);
  return `${p.y}-${String(p.mo).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;
}
function daysBetween(nowMs, startMs, tz) {
  const a = parts(nowMs, tz), b = parts(startMs, tz);
  return Math.round((Date.UTC(b.y, b.mo - 1, b.d) - Date.UTC(a.y, a.mo - 1, a.d)) / 86400000);
}
export function periodOf(h) { return h < 12 ? 'in the morning' : h < 16 ? 'in the afternoon' : h < 20 ? 'in the evening' : 'at night'; }
export function spokenLabel(startMs, tz, nowMs = Date.now()) {
  const p = parts(startMs, tz);
  const diff = daysBetween(nowMs, startMs, tz);
  let day;
  if (diff === 0) day = 'today';
  else if (diff === 1) day = 'tomorrow';
  else if (diff < 7) day = WEEKDAYS[p.wd];
  else day = `${WEEKDAYS[p.wd]} the ${ORD[p.d]} of ${MONTHS[p.mo - 1]}`;
  const h12 = p.h % 12 || 12;
  let time = words(h12);
  if (p.mi === 5 || p.mi < 10 && p.mi > 0) time += ` oh ${words(p.mi)}`;
  else if (p.mi > 0) time += ` ${words(p.mi)}`;
  if (p.h === 12 && p.mi === 0) return `${day}, twelve noon`;
  return `${day}, ${time} ${periodOf(p.h)}`;
}

// Written form for messages and the CRM, in the given timezone: "Monday, 23 November 2026, 3:00 PM".
export function writtenTime(ms, tz) {
  const p = parts(ms, tz);
  return `${WEEKDAYS[p.wd]}, ${p.d} ${MONTHS[p.mo - 1]} ${p.y}, ${p.h % 12 || 12}:${String(p.mi).padStart(2, '0')} ${p.h < 12 ? 'AM' : 'PM'}`;
}

// startTime: the prospect's local wall-clock time, "2026-11-25T11:00", the form the model copies.
export function localStartTime(ms, tz) {
  const p = parts(ms, tz);
  return `${localDateString(ms, tz)}T${String(p.h).padStart(2, '0')}:${String(p.mi).padStart(2, '0')}`;
}
// Back to a moment: null when the text is not that form or the time does not exist in tz.
export function parseStartTime(v, tz) {
  const m = String(v ?? '').trim().match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::00)?$/);
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const want = Date.UTC(y, mo - 1, d, h, mi);
  let t = want;
  for (let i = 0; i < 3; i++) { const p = parts(t, tz); t += want - Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi); }
  const p = parts(t, tz);
  return p.y === y && p.mo === mo && p.d === d && p.h === h && p.mi === mi ? t : null;
}
