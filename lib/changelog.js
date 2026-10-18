// One line per thing that got booked or changed. When a deploy lands, every
// entry that hasn't been announced yet goes out as a push to the party it's
// about (and admin), then gets marked sent so it never repeats.
//
//   id       unique, stable — date + slug
//   party    'bd' | 'gj' | 'kelly' | null for everyone
//   title    the notification headline, written to the person
//   body     one short line

export const CHANGES = [
  {
    id: '2026-09-14-bd-car',
    party: 'bd',
    title: 'Ben & Dakotah — your rental car is booked.',
    body: 'Standard SUV at Kahului, 15–22 Jan.',
  },
  {
    id: '2026-09-27-gj-iad-lax',
    party: 'gj',
    title: 'Gina & John — your flight out is booked.',
    body: 'IAD → LAX, First class non-stop, 6:00am Sat 16 Jan.',
  },
  {
    id: '2026-09-28-gj-hyatt-dulles',
    party: 'gj',
    title: 'Gina & John — your Dulles hotel is booked.',
    body: 'Hyatt Regency Dulles, Fri 15 Jan, the night before your 6am flight.',
  },
  {
    id: '2026-09-28-kelly-maui-coast',
    party: 'kelly',
    title: 'Kelly — your Maui Coast Hotel is booked.',
    body: 'Kai King, 21–23 Jan, after the Waldorf.',
  },
  {
    id: '2026-10-08-kelly-hyatt',
    party: 'kelly',
    title: 'Kelly — your Maui Hyatt is booked.',
    body: 'Standard King, 16–19 Jan, with Ben & Dakotah.',
  },
  {
    id: '2026-10-08-gj-w-beverly',
    party: 'gj',
    title: 'Gina & John — your LA hotel is booked.',
    body: 'W West Beverly Hills, 16–18 Jan, before Maui.',
  },
  {
    id: '2026-10-10-kelly-doubletree',
    party: 'kelly',
    title: 'Kelly — your LA hotel is booked.',
    body: 'DoubleTree LA Downtown, Fri 15 Jan, before the Long Beach flight.',
  },
  {
    id: '2026-10-17-bd-lax-las',
    party: 'bd',
    title: 'Ben & Dakotah — your Vegas flight is booked.',
    body: 'UA 2741, LAX 10:41am Sat 23 Jan.',
  },
];
