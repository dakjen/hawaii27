import { timingSafeEqual } from 'node:crypto';
import { makeSession, sessionCookieHeader } from '../../../../lib/auth';

export const runtime = 'nodejs';

const RATE_WINDOW_MS = 1500;
const recentByIp = new Map();

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const last = recentByIp.get(ip) || 0;
  if (now - last < RATE_WINDOW_MS) {
    return Response.json({ error: 'Too many attempts' }, { status: 429 });
  }
  recentByIp.set(ip, now);

  let pin;
  try { ({ pin } = await req.json()); } catch (_) {}
  if (!pin || typeof pin !== 'string') {
    return Response.json({ error: 'Missing pin' }, { status: 400 });
  }

  // 3 travelers + 1 sender
  const travelerPins = {
    kids: process.env.KIDS_PIN,
    dj:   process.env.DJ_PIN,
    bp:   process.env.BP_PIN,
  };
  const senderPin = process.env.SENDER_PIN;

  let mode = null;
  let travelerId = null;
  for (const [id, expected] of Object.entries(travelerPins)) {
    if (expected && safeEqual(pin, expected)) { mode = 'traveler'; travelerId = id; break; }
  }
  if (!mode && senderPin && safeEqual(pin, senderPin)) mode = 'sender';

  if (!mode) return Response.json({ error: 'Invalid PIN' }, { status: 401 });

  const token = makeSession(mode, travelerId ? { travelerId } : {});
  if (!token) return Response.json({ error: 'Server misconfigured (AUTH_SECRET)' }, { status: 500 });

  return new Response(JSON.stringify({ ok: true, mode, travelerId }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': sessionCookieHeader(token),
    },
  });
}
