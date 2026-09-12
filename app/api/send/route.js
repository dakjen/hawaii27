import { timingSafeEqual } from 'node:crypto';
import { getDb, initDb } from '../../../lib/db';
import { sendPushToAll } from '../../../lib/push';
import { requireAuth } from '../../../lib/auth';

export const runtime = 'nodejs';

const MAX_MESSAGE_LEN = 2000;
const RATE_WINDOW_MS = 2_000;
const recentByIp = new Map();

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function POST(req) {
  try {
    if (!requireAuth(req, 'sender')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const now = Date.now();
    const last = recentByIp.get(ip) || 0;
    if (now - last < RATE_WINDOW_MS) {
      return Response.json({ error: 'Too many requests' }, { status: 429 });
    }
    recentByIp.set(ip, now);

    const { message, password } = await req.json();
    if (typeof message !== 'string' || !message.trim() || message.length > MAX_MESSAGE_LEN) {
      return Response.json({ error: 'Invalid message' }, { status: 400 });
    }

    const expected = process.env.SENDER_PASSWORD;
    if (!expected || !safeEqual(password, expected)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initDb();
    const sql = getDb();
    const trimmed = message.trim();
    await sql`INSERT INTO notes (message) VALUES (${trimmed})`;

    // Fan out push notifications. Don't fail the request if this errors.
    try {
      await sendPushToAll({
        title: 'New note from Dakotah',
        body: trimmed.length > 120 ? trimmed.slice(0, 117) + '...' : trimmed,
      });
    } catch (_) {}

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
