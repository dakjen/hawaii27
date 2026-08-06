import { getDb } from './db';

let webpushModule = null;
let configured = false;

async function getWebPush() {
  if (webpushModule) return webpushModule;
  const mod = await import('web-push');
  webpushModule = mod.default || mod;
  return webpushModule;
}

function clean(v) {
  return (v || '').replace(/[^A-Za-z0-9_\-:/@.+]/g, '').trim();
}

async function ensureConfigured() {
  const pub = clean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
  const priv = clean(process.env.VAPID_PRIVATE_KEY);
  const subject = (process.env.VAPID_SUBJECT || 'mailto:dakjencreativellc@gmail.com').trim();
  if (!pub || !priv) return null;
  const wp = await getWebPush();
  if (!configured) {
    wp.setVapidDetails(subject, pub, priv);
    configured = true;
  }
  return wp;
}

export async function sendPushToOne(sub, payload) {
  const wp = await ensureConfigured();
  if (!wp) throw new Error('VAPID keys not configured');
  return wp.sendNotification(
    { endpoint: sub.endpoint, keys: sub.keys || { p256dh: sub.p256dh, auth: sub.auth } },
    JSON.stringify(payload)
  );
}

export async function sendPushToAll(payload) {
  let wp;
  try {
    wp = await ensureConfigured();
  } catch (e) {
    return { sent: 0, error: 'web-push-unavailable' };
  }
  if (!wp) return { sent: 0, skipped: 'vapid-not-configured' };

  const sql = getDb();
  let subs;
  try {
    subs = await sql`SELECT id, endpoint, p256dh, auth FROM push_subscriptions`;
  } catch (_) {
    return { sent: 0, skipped: 'no-subscriptions-table' };
  }

  const body = JSON.stringify(payload);
  let sent = 0;
  const stale = [];
  await Promise.all(subs.map(async (s) => {
    try {
      await wp.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        body
      );
      sent++;
    } catch (e) {
      if (e?.statusCode === 404 || e?.statusCode === 410) stale.push(s.id);
    }
  }));
  if (stale.length) {
    try { await sql`DELETE FROM push_subscriptions WHERE id = ANY(${stale})`; } catch (_) {}
  }
  return { sent, removed: stale.length };
}
