import { getDb, initDb } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';

export const runtime = 'nodejs';

const ALLOWED_CITIES = ['Tokyo', 'Osaka', 'Taipei', 'Anywhere'];

export async function GET(req) {
  if (!requireAuth(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await initDb();
    const sql = getDb();
    const items = await sql`
      SELECT id, name, city, done, created_at
      FROM shopping_items
      ORDER BY done ASC, created_at DESC
    `;
    return Response.json({ items });
  } catch (e) {
    return Response.json({ items: [], error: e.message });
  }
}

export async function POST(req) {
  if (!requireAuth(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { name, city } = await req.json();
    if (typeof name !== 'string' || !name.trim() || name.length > 200) {
      return Response.json({ error: 'Invalid name' }, { status: 400 });
    }
    const finalCity = ALLOWED_CITIES.includes(city) ? city : 'Anywhere';
    await initDb();
    const sql = getDb();
    const [item] = await sql`
      INSERT INTO shopping_items (name, city)
      VALUES (${name.trim()}, ${finalCity})
      RETURNING id, name, city, done, created_at
    `;
    return Response.json({ item });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
