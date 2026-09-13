import { getDb, initDb } from '../../../lib/db';
import { readSessionFromRequest } from '../../../lib/auth';
import { sendPushToAll } from '../../../lib/push';

export const runtime = 'nodejs';

const MAX_LEN = 2000;

// Kept in sync with TRAVELERS/PARTIES in lib/data.js.
const AUTHOR_LABELS = {
  kids: 'Ben & Dakotah',
  dj: 'Gina & John',
  bp: 'Kelly',
  admin: 'Admin',
};

// Everyone signed in can read the thread and post to it.
export async function GET(req) {
  const session = readSessionFromRequest(req);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await initDb();
    const sql = getDb();
    // The thread only shows the last week. Older rows stay in the table but
    // drop off the page.
    const messages = await sql`
      SELECT id, author, body, created_at
      FROM messages
      WHERE created_at > NOW() - INTERVAL '7 days'
      ORDER BY created_at ASC
      LIMIT 500
    `;
    return Response.json({ messages });
  } catch (e) {
    return Response.json({ messages: [], error: e.message });
  }
}

export async function POST(req) {
  const session = readSessionFromRequest(req);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Author comes from the signed cookie, never from the request body.
  const author = session.mode === 'sender' ? 'admin' : session.travelerId;
  if (!author) return Response.json({ error: 'No author' }, { status: 400 });

  try {
    const { body } = await req.json();
    if (typeof body !== 'string' || !body.trim()) {
      return Response.json({ error: 'Empty message' }, { status: 400 });
    }
    if (body.length > MAX_LEN) {
      return Response.json({ error: 'Too long' }, { status: 400 });
    }
    await initDb();
    const sql = getDb();
    const [message] = await sql`
      INSERT INTO messages (author, body)
      VALUES (${author}, ${body.trim()})
      RETURNING id, author, body, created_at
    `;
    // Notify everyone but the author. Never fail the post over a push error.
    try {
      await sendPushToAll({
        title: `New message from ${AUTHOR_LABELS[author] || author}`,
        body: message.body.length > 120 ? message.body.slice(0, 117) + '…' : message.body,
      }, author);
    } catch (_) {}

    return Response.json({ message });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
