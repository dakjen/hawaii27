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
];
