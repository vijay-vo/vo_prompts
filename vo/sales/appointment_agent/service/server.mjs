// VoiceOwl demo-booking tools: POST /getAvailableSlots (getAvailableSlots), POST /bookAppointment (bookAppointment), POST /email (after-call email).
import http from 'node:http';
import fs from 'node:fs';
import net from 'node:net';
// Slow networks: Node 20 gives each address only 250 ms to connect, then fails with ETIMEDOUT. Give it 5 s.
net.setDefaultAutoSelectFamilyAttemptTimeout(5000);
import { makeGoogle } from './google.mjs';
import { config, getAvailableSlots, bookAppointment, SAY, clean } from './slots.mjs';
import { validTz } from './labels.mjs';

function loadEnv() {
  const env = { ...process.env };
  try {
    for (const line of fs.readFileSync(new URL('./.env', import.meta.url), 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {}
  return env;
}
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MAIL = {
  sent: { sent: true, toolResponse: 'Success: The email was sent.' },
  skipped: { sent: false, reason: 'nothing_to_send', toolResponse: 'Success: No email was needed for this call.' },
  badTo: { sent: false, reason: 'bad_address', toolResponse: 'Failure: The email address is not valid.' },
  error: { sent: false, reason: 'error', toolResponse: 'Failure: The email could not be sent.' },
};
async function sendEmail({ google, body }) {
  const to = clean(body.to), subject = clean(body.subject), text = clean(body.body);
  if (/^none$/i.test(subject) || /^none$/i.test(text) || !subject || !text) return MAIL.skipped;
  if (!EMAIL_RE.test(to)) return MAIL.badTo;
  const { messageId } = await google.sendMail({ to, subject, body: text });
  return { ...MAIL.sent, messageId };
}

export function makeApp(env, google = makeGoogle(env)) {
  const cfg = config(env);
  return async (req, res) => {
    const send = (code, obj) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };
    try {
      if (req.method === 'GET' && req.url === '/health') return send(200, { ok: true });
      if (!env.API_KEY || req.headers['x-api-key'] !== env.API_KEY) return send(401, { error: 'unauthorized' });
      if (req.method !== 'POST' || !['/getAvailableSlots', '/bookAppointment', '/email'].includes(req.url)) return send(404, { error: 'not found' });
      let raw = ''; for await (const c of req) { raw += c; if (raw.length > 1e5) return send(413, { error: 'too large' }); }
      const body = raw ? JSON.parse(raw) : {};
      if (req.url === '/email') {
        console.log(new Date().toISOString(), req.url, JSON.stringify({ to: body.to ? '***' : undefined, subject: body.subject }));
        return send(200, await sendEmail({ google, body }));
      }
      console.log(new Date().toISOString(), req.url, JSON.stringify({ ...body, email: body.email ? '***' : undefined }));
      if (!validTz(body.timezone)) return send(400, { error: 'timezone must be an IANA name such as Asia/Kolkata' });
      if (req.url === '/getAvailableSlots') return send(200, await getAvailableSlots({ google, cfg, body }));
      if (!body.slotId || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email || '')) return send(400, { booked: false, reason: 'error', toolResponse: SAY.bookError });
      const r = await bookAppointment({ google, cfg, body });
      return send(r.status, r.out);
    } catch (e) {
      console.error('ERROR', e.message);
      if (req.url === '/email') return send(200, MAIL.error);
      return send(req.url === '/bookAppointment' ? 200 : 500, req.url === '/bookAppointment'
        ? { booked: false, reason: 'error', toolResponse: SAY.bookError }
        : { slots: [], toolResponse: SAY.calendarDown });
    }
  };
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const env = loadEnv();
  const port = Number(env.PORT || 8787);
  http.createServer(makeApp(env))
    .on('error', e => { console.error(e.code === 'EADDRINUSE' ? `Port ${port} is busy: the service is already running (ss -ltnp 'sport = :${port}' shows the pid). Stop it first.` : e.message); process.exit(1); })
    .listen(port, () => console.log(`booking tools on :${port}${env.GOOGLE_MOCK === '1' ? ' (MOCK calendar)' : ''}`));
}
