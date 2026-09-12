import { getDb } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/auth';

export const runtime = 'nodejs';

export async function DELETE(req, { params }) {
  if (!requireAuth(req, 'sender')) return Response.json({ error: 'Admin only' }, { status: 403 });
  try {
    const { id } = await params;
    const numId = Number(id);
    if (!Number.isInteger(numId)) return Response.json({ error: 'Bad id' }, { status: 400 });
    const sql = getDb();
    await sql`DELETE FROM group_plans WHERE id = ${numId}`;
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
