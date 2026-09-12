import { getDb, initDb } from '../../../../../lib/db';
import { readSessionFromRequest } from '../../../../../lib/auth';

export const runtime = 'nodejs';

// Anyone signed in can vote; one vote each, changeable.
export async function POST(req, { params }) {
  const session = readSessionFromRequest(req);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const voter = session.mode === 'sender' ? 'admin' : session.travelerId;
  if (!voter) return Response.json({ error: 'No voter' }, { status: 400 });

  try {
    const { id } = await params;
    const planId = Number(id);
    if (!Number.isInteger(planId)) return Response.json({ error: 'Bad id' }, { status: 400 });

    const { vote } = await req.json();
    if (typeof vote !== 'boolean') return Response.json({ error: 'Vote must be yes or no' }, { status: 400 });

    await initDb();
    const sql = getDb();
    await sql`
      INSERT INTO plan_votes (plan_id, voter, vote)
      VALUES (${planId}, ${voter}, ${vote})
      ON CONFLICT (plan_id, voter) DO UPDATE SET vote = ${vote}, created_at = NOW()
    `;
    const votes = await sql`SELECT plan_id, voter, vote FROM plan_votes WHERE plan_id = ${planId}`;
    return Response.json({ votes });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
