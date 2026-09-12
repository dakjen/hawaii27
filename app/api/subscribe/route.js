import { getDb, initDb } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';

export const runtime = 'nodejs';

export async function POST(req) {
  const session = requireAuth(req);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const subscriber = session.mode === 'sender' ? 'admin' : session.travelerId || null;
  try {
    const sub = await req.json();
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      return Response.json({ error: 'Invalid subscription' }, { status: 400 });
    }
    await initDb();
    const sql = getDb();
    await sql`
      INSERT INTO push_subscriptions (endpoint, p256dh, auth, subscriber)
      VALUES (${sub.endpoint}, ${sub.keys.p256dh}, ${sub.keys.auth}, ${subscriber})
      ON CONFLICT (endpoint) DO UPDATE SET subscriber = ${subscriber}
    `;
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  if (!requireAuth(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { endpoint } = await req.json();
    if (!endpoint) return Response.json({ error: 'Missing endpoint' }, { status: 400 });
    const sql = getDb();
    await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint}`;
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
