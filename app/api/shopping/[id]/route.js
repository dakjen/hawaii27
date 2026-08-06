import { getDb } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/auth';

export const runtime = 'nodejs';

export async function PATCH(req, { params }) {
  if (!requireAuth(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const numId = Number(id);
    if (!Number.isInteger(numId)) return Response.json({ error: 'Bad id' }, { status: 400 });
    const { done } = await req.json();
    const sql = getDb();
    await sql`UPDATE shopping_items SET done = ${!!done} WHERE id = ${numId}`;
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  if (!requireAuth(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const numId = Number(id);
    if (!Number.isInteger(numId)) return Response.json({ error: 'Bad id' }, { status: 400 });
    const sql = getDb();
    await sql`DELETE FROM shopping_items WHERE id = ${numId}`;
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
