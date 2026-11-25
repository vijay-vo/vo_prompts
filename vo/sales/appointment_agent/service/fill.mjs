// Fill a prompt's {{placeholders}} for a quick test in any LLM chat. Prints the filled prompt.
// Values come from JSON on stdin (optional; a /pendingReplies reply uses its first pending mail) and from key=value arguments,
// which win. A missing value becomes Not Available, and is listed on stderr.
//   curl ... /pendingReplies | node fill.mjs ../email/email.txt fname=Priya company=BrightLoans "priorContext=First call to them."
//   node fill.mjs ../prior_context/prior_context.txt fname=Priya "emailHistory=$(cat email.txt)" < /dev/null
import fs from 'node:fs';

const [file, ...args] = process.argv.slice(2);
if (!file) { console.error('usage: node fill.mjs <prompt file> [key=value ...]  (JSON on stdin optional)'); process.exit(1); }
let vals = {};
if (!process.stdin.isTTY) {
  const raw = fs.readFileSync(0, 'utf8').trim();
  if (raw) { const j = JSON.parse(raw); vals = j.pending ? (j.pending[0] || {}) : j; }
}
for (const a of args) { const i = a.indexOf('='); if (i > 0) vals[a.slice(0, i)] = a.slice(i + 1); }
const missing = new Set();
const out = fs.readFileSync(file, 'utf8').replace(/\{\{(\w+)\}\}/g, (_, k) => {
  if (vals[k] == null || vals[k] === '') { missing.add(k); return 'Not Available'; }
  return String(vals[k]);
});
process.stdout.write(out);
if (missing.size) console.error(`\n[fill.mjs] not given, so Not Available: ${[...missing].join(', ')}`);
if (vals.messageId) console.error(`[fill.mjs] messageId for /replyInThread: ${vals.messageId}`);
