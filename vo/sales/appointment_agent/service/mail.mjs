// Reading Gmail for the prospect's earlier emails: /emailContext. Pure functions; Gmail calls are in google.mjs.

// Every email /sendGmail sends carries this header, so a later reply can be traced to Ruchika AI.
export const AGENT_HEADER = 'X-VoiceOwl-Agent';

export const header = (msg, name) => (msg.payload?.headers || []).find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';
const decode = (data) => Buffer.from(String(data || '').replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
export const addressOf = (v) => (String(v).match(/<([^>]+)>/)?.[1] || String(v)).trim().toLowerCase();
export const addressesIn = (v) => String(v).split(',').map(addressOf).filter(Boolean);

function walk(part, out = []) {
  if (!part) return out;
  out.push(part);
  for (const p of part.parts || []) walk(p, out);
  return out;
}
export function bodyText(msg) {
  const parts = walk(msg.payload);
  const plain = parts.find(p => p.mimeType === 'text/plain' && p.body?.data);
  if (plain) return decode(plain.body.data);
  const html = parts.find(p => p.mimeType === 'text/html' && p.body?.data);
  if (!html) return '';
  return decode(html.body.data).replace(/<(br|\/p|\/div)[^>]*>/gi, '\n').replace(/<blockquote[\s\S]*?<\/blockquote>/gi, '')
    .replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
}

// The new text only: everything from the first quoted-history marker on is dropped.
const QUOTE_MARKERS = [
  /^On .{0,300}wrote:\s*$/m,                       // Gmail, Apple Mail (may wrap: joined below)
  /^-{2,}\s*Original Message\s*-{2,}/mi,           // Outlook
  /^_{10,}\s*$/m,                                  // Outlook web separator
  /^From: .+\n(Sent|Date): /m,                     // Outlook header block
  /^-{2,}\s*Forwarded message\s*-{2,}/mi,
  /^>/m,                                           // quoted lines
];
export function newText(raw, max = 1500) {
  let t = String(raw).replace(/\r\n/g, '\n').replace(/^(On .{0,200})\n(.{0,200}wrote:\s*)$/m, '$1 $2');
  for (const re of QUOTE_MARKERS) { const m = t.match(re); if (m) t = t.slice(0, m.index); }
  t = t.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return t.length > max ? t.slice(0, max).replace(/\s+\S*$/, '') + ' ...' : t;
}

// Mail that is not a person writing: calendar notices, bounces, auto-replies, bulk mail.
export function isNoise(msg) {
  const from = addressOf(header(msg, 'From')), subject = header(msg, 'Subject');
  if (/^(mailer-daemon|postmaster|no-?reply|calendar-notification)@/i.test(from)) return true;
  if (/^(invitation|updated invitation|accepted|declined|tentatively accepted|cancel+ed event|invitation from google calendar)\b/i.test(subject)) return true;
  if (/^(automatic reply|auto(matic)?[- ]?reply|out of (the )?office|undeliverable|delivery status notification)\b/i.test(subject)) return true;
  const auto = header(msg, 'Auto-Submitted');
  if (auto && !/^no$/i.test(auto)) return true;
  if (header(msg, 'X-Autoreply') || header(msg, 'X-Autorespond') || header(msg, 'List-Id')) return true;
  if (/^(bulk|junk|list|auto_reply)$/i.test(header(msg, 'Precedence'))) return true;
  return walk(msg.payload).some(p => p.mimeType === 'text/calendar' || p.mimeType === 'multipart/report');
}

export const isOurs = (msg) => (msg.labelIds || []).includes('SENT');
export const involves = (msg, email) => ['From', 'To', 'Cc'].some(h => addressesIn(header(msg, h)).includes(email));

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function day(ms, tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric' })
    .formatToParts(new Date(Number(ms))).map(x => [x.type, x.value]));
  return `${+p.day} ${MONTHS[p.month - 1]} ${p.year}`;
}

// Messages (newest or oldest first, any order) -> the last `keep` real ones, oldest first, as dated lines.
export function contextFrom(messages, { email, keep = 5, tz = 'Asia/Kolkata' }) {
  const real = messages.filter(m => involves(m, email) && !isNoise(m))
    .sort((a, b) => Number(a.internalDate) - Number(b.internalDate)).slice(-keep);
  const lines = real.map(m => ({ m, text: newText(bodyText(m)) })).filter(x => x.text)
    .map(({ m, text }) => `${day(m.internalDate, tz)}, ${isOurs(m) ? 'we wrote' : 'they wrote'}, subject "${header(m, 'Subject').replace(/\s+/g, ' ').trim()}": ${text.replace(/\n+/g, ' / ')}`);
  return { found: lines.length, emailContext: lines.length ? lines.join('\n') : 'No earlier emails.', threadId: real.at(-1)?.threadId || 'Not Available' };
}

// The Gmail search for every mail to or from one address, newest first.
export const searchFor = (email) => `{from:${email} to:${email} cc:${email}} -in:chats`;
