import { getDb, initDb } from './db';
import { sendPushTo, sendPushToAll } from './push';
import { CHANGES } from './changelog';
import { TRAVELERS } from './data';

// Which logins belong to a party — the changelog speaks in parties, the
// subscription table in traveler ids.
function loginsFor(party) {
  return Object.values(TRAVELERS).filter(t => t.party === party).map(t => t.id);
}

// Announce every changelog entry that hasn't gone out yet. Runs once per
// server instance; safe to call from any hot path.
let flushed = null;
export function announceChanges() {
  if (!flushed) flushed = flush().catch(() => { flushed = null; });
  return flushed;
}

async function flush() {
  await initDb();
  const sql = getDb();
  const done = new Set((await sql`SELECT id FROM change_notices`).map(r => r.id));
  for (const c of CHANGES) {
    if (done.has(c.id)) continue;
    const payload = { title: c.title, body: c.body || '' };
    try {
      if (c.party) await sendPushTo([...loginsFor(c.party), 'admin'], payload);
      else await sendPushToAll(payload);
    } catch (_) {}
    await sql`INSERT INTO change_notices (id) VALUES (${c.id}) ON CONFLICT DO NOTHING`;
  }
}
