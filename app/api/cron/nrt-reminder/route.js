import { sendPushToAll } from '../../../../lib/push';
import { ITINERARY } from '../../../../lib/data';

export const runtime = 'nodejs';

function daysBetween(targetDateStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(targetDateStr + 'T00:00:00'); target.setHours(0,0,0,0);
  return Math.round((target - today) / 86400000);
}

export async function GET(req) {
  // Vercel Cron sends a bearer token; reject if not present in production
  const auth = req.headers.get('authorization') || '';
  const expected = process.env.CRON_SECRET;
  if (expected && auth !== `Bearer ${expected}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const nrtFlight = ITINERARY.find(i => i.type === 'flight' && i.title.includes('Narita'));
  if (!nrtFlight) return Response.json({ skipped: 'no-nrt-flight' });

  const days = daysBetween(nrtFlight.date);
  if (![0, 1, 2].includes(days)) {
    return Response.json({ skipped: 'out-of-window', days });
  }

  const when = days === 0 ? 'TODAY' : days === 1 ? 'TOMORROW' : `in ${days} days`;
  const result = await sendPushToAll({
    title: 'NARITA — not Haneda',
    body: `Tokyo → Taipei flight ${when} departs from NRT (Narita), not HND. Allow 60–90 min from central Tokyo.`,
  });
  return Response.json({ ok: true, days, ...result });
}
