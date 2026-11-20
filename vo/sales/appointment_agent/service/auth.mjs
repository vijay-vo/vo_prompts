// One-time helper: sign in as the calendar owner and print the refresh token for .env.
// Usage: node auth.mjs   (needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env, OAuth client type "Desktop app")
import http from 'node:http';
import fs from 'node:fs';

const env = {};
for (const line of fs.readFileSync(new URL('./.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const PORT = 53682, redirect = `http://127.0.0.1:${PORT}`;
const scope = ['https://www.googleapis.com/auth/calendar.freebusy', 'https://www.googleapis.com/auth/calendar.events.owned'].join(' ');
const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, redirect_uri: redirect, response_type: 'code', scope, access_type: 'offline', prompt: 'consent' });
console.log('\nOpen this link, sign in with the calendar owner account, and approve:\n\n' + url + '\n');
http.createServer(async (req, res) => {
  const code = new URL(req.url, redirect).searchParams.get('code');
  if (!code) { res.end('No code.'); return; }
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, redirect_uri: redirect, grant_type: 'authorization_code' }) });
  const j = await r.json();
  res.end(j.refresh_token ? 'Done. Go back to the terminal.' : 'Failed: ' + JSON.stringify(j));
  console.log(j.refresh_token ? `\nPut this line in .env:\n\nGOOGLE_REFRESH_TOKEN=${j.refresh_token}\n` : 'Failed: ' + JSON.stringify(j));
  process.exit(0);
}).listen(PORT, '127.0.0.1');
