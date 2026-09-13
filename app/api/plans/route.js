import { getDb, initDb } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';
import { TRAVELERS } from '../../../lib/data';

export const runtime = 'nodejs';

// Anyone signed in can read the group plans; only admin writes them.
export async function GET(req) {
  const session = requireAuth(req);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  // Travelers only see plans that are for everyone or name their party.
  const myParty = session.mode === 'sender' ? null : TRAVELERS[session.travelerId]?.party || null;
  try {
    await initDb();
    const sql = getDb();
    const plans = session.mode === 'sender'
      ? await sql`
          SELECT id, title, detail, day, time_label, location, kind, parties, link, created_at
          FROM group_plans
          ORDER BY day ASC, created_at ASC
        `
      : await sql`
          SELECT id, title, detail, day, time_label, location, kind, parties, link, created_at
          FROM group_plans
          WHERE parties IS NULL OR ${myParty} = ANY(parties)
          ORDER BY day ASC, created_at ASC
        `;
    const votes = await sql`SELECT plan_id, voter, vote FROM plan_votes`;
    const byPlan = {};
    for (const v of votes) (byPlan[v.plan_id] = byPlan[v.plan_id] || []).push(v);
    return Response.json({
      plans: plans.map(p => ({ ...p, votes: byPlan[p.id] || [] })),
    });
  } catch (e) {
    return Response.json({ plans: [], error: e.message });
  }
}

export async function POST(req) {
  if (!requireAuth(req, 'sender')) return Response.json({ error: 'Admin only' }, { status: 403 });
  try {
    const { title, detail, day, timeLabel, location, kind, parties, link } = await req.json();
    if (typeof title !== 'string' || !title.trim() || title.length > 200) {
      return Response.json({ error: 'Invalid title' }, { status: 400 });
    }
    if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      return Response.json({ error: 'Invalid day' }, { status: 400 });
    }
    const finalKind = kind === 'vote' ? 'vote' : 'confirmed';
    const valid = ['bd', 'gj', 'kelly'];
    const finalParties = Array.isArray(parties) && parties.length && parties.length < valid.length
      ? parties.filter(x => valid.includes(x))
      : null; // everyone
    const finalLink = typeof link === 'string' && /^https?:\/\//i.test(link.trim()) ? link.trim() : null;
    await initDb();
    const sql = getDb();
    const [plan] = await sql`
      INSERT INTO group_plans (title, detail, day, time_label, location, kind, parties, link)
      VALUES (
        ${title.trim()},
        ${detail?.trim?.() || null},
        ${day},
        ${timeLabel?.trim?.() || null},
        ${location?.trim?.() || null},
        ${finalKind},
        ${finalParties},
        ${finalLink}
      )
      RETURNING id, title, detail, day, time_label, location, kind, parties, link, created_at
    `;
    return Response.json({ plan: { ...plan, votes: [] } });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
