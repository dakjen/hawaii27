import { requireAuth } from '../../../../lib/auth';

export const runtime = 'nodejs';

export async function GET(req) {
  const session = requireAuth(req);
  if (!session) return Response.json({ authed: false }, { status: 401 });
  return Response.json({ authed: true, mode: session.mode, travelerId: session.travelerId || null });
}
