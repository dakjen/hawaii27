import { neon } from '@neondatabase/serverless';

export function getDb() {
  const url = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  return neon(url);
}

export async function initDb() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      read BOOLEAN DEFAULT FALSE
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id SERIAL PRIMARY KEY,
      endpoint TEXT UNIQUE NOT NULL,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  // Added after the fact — existing rows get a NULL subscriber and still
  // receive everything, which is the safe default.
  await sql`ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS subscriber TEXT`;
  // Plans are either settled ("we're going here, here's the reservation")
  // or proposals the group votes on.
  await sql`ALTER TABLE group_plans ADD COLUMN IF NOT EXISTS kind TEXT DEFAULT 'confirmed'`;
  await sql`ALTER TABLE group_plans ADD COLUMN IF NOT EXISTS seed_key TEXT UNIQUE`;
  await sql`ALTER TABLE group_plans ADD COLUMN IF NOT EXISTS parties TEXT[]`;
  await seedPlans(sql);
  await sql`
    CREATE TABLE IF NOT EXISTS plan_votes (
      id SERIAL PRIMARY KEY,
      plan_id INTEGER NOT NULL REFERENCES group_plans(id) ON DELETE CASCADE,
      voter TEXT NOT NULL,
      vote BOOLEAN NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (plan_id, voter)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      author TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS group_plans (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      detail TEXT,
      day DATE NOT NULL,
      time_label TEXT,
      location TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

// Reservations that were made outside the app. Inserted once — the seed_key
// keeps them from duplicating on every cold start, and admin can edit or
// delete them like any other plan afterwards.
const SEED_PLANS = [
  {
    key: 'dinner-hale-moolelo-2027-01-17',
    title: 'Hale Moʻolelo',
    day: '2027-01-17',
    time_label: '5:00 PM',
    location: null,
    detail: 'Table for 2.',
    parties: ['bd'],
  },
  {
    key: 'dinner-ferraros-2027-01-21',
    title: "Ferraro's Restaurant & Bar",
    day: '2027-01-21',
    time_label: '5:45 PM',
    location: null,
    detail: "Table for 5 — everyone. Ben & Dakotah's last night on Maui.",
    parties: null,
  },
];

async function seedPlans(sql) {
  for (const p of SEED_PLANS) {
    await sql`
      INSERT INTO group_plans (title, detail, day, time_label, location, kind, seed_key, parties)
      VALUES (${p.title}, ${p.detail}, ${p.day}, ${p.time_label}, ${p.location}, 'confirmed', ${p.key}, ${p.parties})
      ON CONFLICT (seed_key) DO NOTHING
    `;
  }
}
