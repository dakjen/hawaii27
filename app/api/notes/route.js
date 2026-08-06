import { getDb, initDb } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';

export const runtime = 'nodejs';

export async function GET(req) {
  if (!requireAuth(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await initDb();
    const sql = getDb();
    const notes = await sql`
      SELECT * FROM notes ORDER BY created_at DESC LIMIT 50
    `;
    return Response.json({ notes });
  } catch (e) {
    return Response.json({ notes: [], error: e.message });
  }
}

export async function POST(req) {
  if (!requireAuth(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const sql = getDb();
    await sql`UPDATE notes SET read = TRUE WHERE read = FALSE`;
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
