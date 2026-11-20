// Google Calendar and Gmail access: real (OAuth refresh token) or mock (GOOGLE_MOCK=1, in memory, for tests).
import crypto from 'node:crypto';

let tokenCache = { value: null, exp: 0 };
async function accessToken(env) {
  if (tokenCache.value && Date.now() < tokenCache.exp) return tokenCache.value;
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, refresh_token: env.GOOGLE_REFRESH_TOKEN, grant_type: 'refresh_token' }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`token refresh failed: ${j.error || r.status} ${j.error_description || ''}`);
  tokenCache = { value: j.access_token, exp: Date.now() + (j.expires_in - 120) * 1000 };
  return tokenCache.value;
}
async function gfetch(env, path, init = {}, tries = 3, base = 'https://www.googleapis.com/calendar/v3') {
  for (let i = 0; i < tries; i++) {
    const r = await fetch(`${base}${path}`, { ...init, headers: { ...(init.headers || {}), authorization: `Bearer ${await accessToken(env)}`, 'content-type': 'application/json' } });
    if ((r.status === 403 || r.status === 429 || r.status >= 500) && i < tries - 1) { await new Promise(s => setTimeout(s, 2 ** i * 1000 + Math.random() * 500)); continue; }
    const text = await r.text();
    return { status: r.status, body: text ? JSON.parse(text) : {} };
  }
}

const oneLine = (v) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim();
const b64 = (v) => Buffer.from(v, 'utf8').toString('base64');
export function mimeMessage({ to, subject, body }) {
  const text = String(body).replace(/\\n/g, '\n').replace(/\r?\n/g, '\r\n');
  return [`To: ${oneLine(to)}`, `Subject: =?UTF-8?B?${b64(oneLine(subject))}?=`, 'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', b64(text).replace(/.{76}/g, '$&\r\n')].join('\r\n');
}

export function makeGoogle(env) {
  if (env.GOOGLE_MOCK === '1') return makeMock();
  const cal = encodeURIComponent(env.CALENDAR_ID || 'primary');
  return {
    async busy(fromMs, toMs) {
      const r = await gfetch(env, '/freeBusy', { method: 'POST', body: JSON.stringify({ timeMin: new Date(fromMs).toISOString(), timeMax: new Date(toMs).toISOString(), items: [{ id: env.CALENDAR_ID || 'primary' }] }) });
      if (r.status !== 200) throw new Error(`freeBusy ${r.status}: ${JSON.stringify(r.body)}`);
      const c = Object.values(r.body.calendars || {})[0] || {};
      if (c.errors?.length) throw new Error(`freeBusy calendar error: ${JSON.stringify(c.errors)}`);
      return (c.busy || []).map(b => ({ start: Date.parse(b.start), end: Date.parse(b.end) }));
    },
    async insert({ id, summary, description, startMs, endMs, email, displayName, requestId }) {
      const attendees = [{ email, displayName }, ...(env.EXTRA_ATTENDEES || '').split(',').map(s => s.trim()).filter(Boolean).map(e => ({ email: e }))];
      const body = { id, summary, description, start: { dateTime: new Date(startMs).toISOString() }, end: { dateTime: new Date(endMs).toISOString() }, attendees, conferenceData: { createRequest: { requestId, conferenceSolutionKey: { type: 'hangoutsMeet' } } } };
      const r = await gfetch(env, `/calendars/${cal}/events?conferenceDataVersion=1&sendUpdates=all`, { method: 'POST', body: JSON.stringify(body) });
      if (r.status === 409) { const g = await gfetch(env, `/calendars/${cal}/events/${id}`); return { duplicate: true, event: g.body }; }
      if (r.status !== 200) throw new Error(`events.insert ${r.status}: ${JSON.stringify(r.body)}`);
      return { event: r.body };
    },
    async get(id) { const r = await gfetch(env, `/calendars/${cal}/events/${id}`); return r.status === 200 ? r.body : null; },
    async sendMail(msg) {
      const raw = Buffer.from(mimeMessage(msg), 'utf8').toString('base64url');
      const r = await gfetch(env, '/users/me/messages/send', { method: 'POST', body: JSON.stringify({ raw }) }, 3, 'https://gmail.googleapis.com/gmail/v1');
      if (r.status !== 200) throw new Error(`gmail send ${r.status}: ${JSON.stringify(r.body)}`);
      return { messageId: r.body.id };
    },
  };
}

function makeMock() {
  const events = new Map();
  return {
    mock: true,
    seedBusy(start, end) { events.set(crypto.randomUUID(), { start, end }); },
    async busy() { return [...events.values()].map(e => ({ start: e.start, end: e.end })); },
    async insert({ id, startMs, endMs, email }) {
      if (events.has(id)) return { duplicate: true, event: { id, hangoutLink: 'https://meet.google.com/mock-mock-mock' } };
      events.set(id, { start: startMs, end: endMs, email });
      return { event: { id, hangoutLink: 'https://meet.google.com/mock-mock-mock' } };
    },
    async get(id) { return events.has(id) ? { id, status: 'confirmed', hangoutLink: 'https://meet.google.com/mock-mock-mock' } : null; },
    sent: [],
    async sendMail(msg) { this.sent.push({ ...msg, mime: mimeMessage(msg) }); return { messageId: `mock-${this.sent.length}` }; },
  };
}
