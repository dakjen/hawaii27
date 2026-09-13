function appleMap(name, ll) {
  return `https://maps.apple.com/?q=${encodeURIComponent(name)}&ll=${ll}&dirflg=d`;
}

// ── Who's on the trip ────────────────────────────────────────────────────────
// Three travel parties, straight from the Hawaii 2027 planning doc.
// `money` picks the Money tab: 'spend' shows what you paid in points and
// cash; 'value' shows what the trip would have cost — for the parties Ben &
// Dakotah are covering, so nobody sees a bill they didn't pay.
export const PARTIES = {
  bd:    { id: 'bd',    label: 'Ben & Dakotah', short: 'B&D',   initials: 'BD', money: 'spend', seesAll: true  },
  gj:    { id: 'gj',    label: 'Gina & John',   short: 'G&J',   initials: 'GJ', money: 'value', seesAll: false },
  kelly: { id: 'kelly', label: 'Kelly',         short: 'Kelly', initials: 'K',  money: 'value', seesAll: false },
};

// App logins. `theme` drives the palette once they sign in.
// Each login maps 1:1 onto a travel party in PARTIES. The login ids are just
// the env-var slots (KIDS_PIN / DJ_PIN / BP_PIN); the party is who they are.
export const TRAVELERS = {
  kids: { id: 'kids', displayName: 'Ben & Dakotah', theme: 'navy',  party: 'bd'    },
  dj:   { id: 'dj',   displayName: 'Gina & John',   theme: 'black', party: 'gj'    },
  bp:   { id: 'bp',   displayName: 'Kelly',         theme: 'pink',  party: 'kelly' },
};
export const TRAVELER_IDS = Object.keys(TRAVELERS);
export const DEFAULT_THEME = 'white';

// ── Itinerary ────────────────────────────────────────────────────────────────
// Hotel stays run date → endDate (checkout). Anything marked tbd isn't booked.
export const ITINERARY = [
  // Ben & Dakotah
  { id:'bd-nyc-lax', party:'bd', type:'flight', date:'2027-01-14',
    title:'NYC → LAX', subtitle:'Ben & Dakotah', location:'Los Angeles',
    booked:true, detail:'Cross-country leg on American Airlines miles: 7,000 AAdvantage miles + $5.60 each for Dakotah and Ben. Overnight in LA before the Maui hop.' },
  { id:'bd-citizenm', party:'bd', type:'hotel', date:'2027-01-14', endDate:'2027-01-15',
    title:'citizenM Los Angeles', short:'citizenM', subtitle:'1 night · Ben & Dakotah', location:'Los Angeles',
    booked:true, detail:'Layover night between NYC and Maui. Paid with a 35,000-point free night award.',
    link:{ url:'https://www.citizenm.com/hotels/united-states/los-angeles/los-angeles-downtown-hotel', label:'See this hotel' } },
  { id:'bd-lax-ogg', party:'bd', type:'flight', date:'2027-01-15',
    title:'LAX → OGG', subtitle:'Ben & Dakotah · AA271 · 8:52am', location:'Maui',
    booked:true, departureUtc:'2027-01-15T16:52:00Z',
    detail:'American Airlines AA271, Airbus A321neo. LAX 8:52am → Kahului 12:46pm, 5h 54m non-stop. Ticketed through Etihad Guest, operated by American — manage it at etihad.com. Dakotah ticket 6072415063536, Ben ticket 6072415063535. Booking reference 7RIAL6, 62,040 Etihad Guest miles for the two of you.',
    tip:'No seats assigned on this one yet — pick them at etihad.com.' },
  { id:'bd-hyatt', party:'bd', type:'hotel', date:'2027-01-15', endDate:'2027-01-19',
    title:'Maui Hyatt', short:'Hyatt', subtitle:'4 nights · Ben & Dakotah', location:'Maui',
    booked:true, detail:'King room. Nights of 1/15–1/18, out 1/19 to move to the Waldorf. 25,000 Hyatt points per night, 100,000 total — transferred 1:1 from Chase Ultimate Rewards.',
    link:{ url:'https://www.hyatt.com/hyatt-regency/en-US/oggrm-hyatt-regency-maui-resort-and-spa', label:'See this hotel' } },
  { id:'bd-waldorf', party:'bd', type:'hotel', date:'2027-01-19', endDate:'2027-01-22',
    title:'Grand Wailea, Waldorf Astoria', short:'Waldorf', subtitle:'3 nights · Ben & Dakotah', location:'Maui',
    booked:true, detail:'Garden View, 1 King. In 1/19, out 1/22 — AA254 leaves Kahului at 2:16pm that day. 130,000 Hilton points per night, 390,000 total.',
    link:{ url:'https://www.grandwailea.com/', label:'See this hotel' } },
  { id:'bd-ogg-lax', party:'bd', type:'flight', date:'2027-01-22',
    title:'OGG → LAX', subtitle:'Ben & Dakotah · AA254 · 2:37pm', location:'Los Angeles',
    booked:true, departureUtc:'2027-01-23T00:37:00Z',
    detail:'American Airlines AA254, Airbus A321neo. Kahului 2:37pm → LAX 10:13pm, 5h 36m non-stop. Ticketed through Etihad Guest (607 stock), operated by American — manage it at etihad.com. Dakotah seat 16C, ticket 6072415062096. Ben seat 16B, ticket 6072415062095. Booking reference 7RO9GD, 57,090 Etihad Guest miles for the two of you.' },
  { id:'bd-westin-lax', party:'bd', type:'hotel', date:'2027-01-22', endDate:'2027-01-23',
    title:'Westin Los Angeles Airport', short:'Westin', subtitle:'1 night · Ben & Dakotah', location:'Los Angeles',
    conf:'94631061', booked:true,
    detail:'Deluxe guest room, 1 King, sofa bed, high floor. Bonvoy redemption: 37,000 points + $23.20. Overnight after AA254 lands at 10:13pm, before the morning flight to Vegas. Free cancellation until 11:59pm on 20 Jan.',
    link:{ url:'https://www.marriott.com/en-us/hotels/laxwi-the-westin-los-angeles-airport/overview/', label:'See this hotel' } },
  { id:'bd-lax-las', party:'bd', type:'flight', date:'2027-01-23',
    title:'LAX → LAS', subtitle:'Ben & Dakotah · UA 1731 · 8:15am', location:'Las Vegas',
    detail:'Planned, not booked. United 1731, Boeing 737-800, LAX 8:15am → Las Vegas 9:22am, 1h 07m non-stop. Via Virgin reward seats: 8,500 points + $14.10 each, or 10,900 points flat.' },
  { id:'bd-aria', party:'bd', type:'hotel', date:'2027-01-22', endDate:'2027-01-25',
    title:'Aria', short:'Aria', subtitle:'3 nights · Ben & Dakotah', location:'Las Vegas',
    conf:'5UFHBS97EZ', booked:true,
    detail:'Restore Deluxe Two Queen Strip View Room. In 1/22, out 1/25. Comped through MGM. Arrival depends on getting from LAX to Las Vegas the night of the 22nd — AA254 lands LAX at 9:41pm.',
    link:{ url:'https://aria.mgmresorts.com/', label:'See this hotel' } },
  { id:'bd-home', party:'bd', type:'flight', date:'2027-01-25',
    title:'LAS → NYC', subtitle:'Ben & Dakotah', location:'New York',
    detail:'Planned, not booked. Home from Vegas after the Aria checkout.' },

  // Gina & John
  { id:'gj-bwi-lax', party:'gj', type:'flight', date:'2027-01-16',
    title:'BWI → LAX', subtitle:'Gina & John', location:'Los Angeles',
    detail:'Two nights in LA before Maui.' },
  { id:'gj-lax-ogg', party:'gj', type:'flight', date:'2027-01-18',
    title:'LAX → OGG', subtitle:'Gina & John · AS 933 · 8:35am', location:'Maui',
    booked:true, departureUtc:'2027-01-18T16:35:00Z',
    detail:'AS 933, Hawaiian Airlines operated by Alaska. LAX 8:35am → Kahului 12:31pm, 5h 56m non-stop.' },
  { id:'ac-wailea-gina-john', party:'gj', type:'hotel', date:'2027-01-18', endDate:'2027-01-19',
    title:'AC Hotel by Marriott Maui Wailea', short:'AC Wailea', subtitle:'1 night · Gina & John', location:'Maui',
    conf:'76648382', booked:true,
    detail:'Guest room, 1 King, sofa bed, balcony. Free night award topped off with 15k points.',
    link:{ url:'https://www.marriott.com/en-us/hotels/hnmac-ac-hotel-maui-wailea/overview/', label:'See this hotel' } },
  { id:'gj-waldorf', party:'gj', type:'hotel', date:'2027-01-19', endDate:'2027-01-23',
    title:'Grand Wailea, Waldorf Astoria', short:'Waldorf', subtitle:'4 nights · Gina & John', location:'Maui',
    booked:true, detail:'Terrace View, 1 King. In 1/19, out 1/23. 155,000 Hilton points per night, 620,000 total.',
    link:{ url:'https://www.grandwailea.com/', label:'See this hotel' } },
  { id:'gj-ogg-las', party:'gj', type:'flight', date:'2027-01-23',
    title:'OGG → LAS', subtitle:'Gina & John · 8:45pm · First · via HNL', location:'Las Vegas',
    booked:true, departureUtc:'2027-01-24T06:45:00Z',
    detail:'Red-eye. Alaska 1195 Kahului 8:45pm → Honolulu 9:29pm, then Alaska 808 Honolulu 11:35pm → Las Vegas 7:15am Sunday. First class on both, 2h 06m connection, operated by Alaska as Hawaiian — check in with Hawaiian.' },
  { id:'gj-caesars', party:'gj', type:'hotel', date:'2027-01-23', endDate:'2027-01-26',
    title:'Caesars Palace', short:'Caesars', subtitle:'3 nights · Gina & John', location:'Las Vegas',
    conf:'KPJJW', booked:true,
    detail:'Octavius Premium Room, 1 King, 550 sq ft. Room comped; $186.91 in resort fees still due. Free cancellation until 21 Jan 2027.',
    link:{ url:'https://www.caesars.com/caesars-palace', label:'See this hotel' } },
  { id:'gj-las-bwi', party:'gj', type:'flight', date:'2027-01-26',
    title:'LAS → BWI', subtitle:'Gina & John', location:'Baltimore',
    detail:'Planned, not booked. Home from Vegas after the Caesars checkout.' },

  // Kelly
  { id:'kelly-lgb-ogg', party:'kelly', type:'flight', date:'2027-01-16',
    title:'LGB → OGG', subtitle:'Kelly · 7:35am · First', location:'Maui',
    booked:true, departureUtc:'2027-01-16T15:35:00Z',
    detail:'Long Beach 7:35am, Kahului 1:53pm. 8h 18m via Honolulu with a 1h 17m connection. AS 869 LGB–HNL in First, operated by Alaska as Hawaiian Airlines; AS 1426 HNL–OGG in First, operated by Alaska. 40,000 points + $5.60.' },
  { id:'kelly-hyatt', party:'kelly', type:'hotel', date:'2027-01-16', endDate:'2027-01-19',
    title:'Maui Hyatt', short:'Hyatt', subtitle:'3 nights · Kelly', location:'Maui',
    detail:'Planned, not booked. Nights of 1/16–1/18, out 1/19. She lands 1:53pm on the 16th, so nothing needed for the night of the 15th. 25,000 + 25,000 + 30,000 = 80,000 Hyatt points.',
    link:{ url:'https://www.hyatt.com/hyatt-regency/en-US/oggrm-hyatt-regency-maui-resort-and-spa', label:'See this hotel' } },
  { id:'kelly-waldorf', party:'kelly', type:'hotel', date:'2027-01-19', endDate:'2027-01-21',
    title:'Grand Wailea, Waldorf Astoria', short:'Waldorf', subtitle:'2 nights · Kelly', location:'Maui',
    conf:'3537802552', booked:true,
    detail:'Terrace View, 1 King. In Tue 1/19, out Thu 1/21. 155,000 Hilton points a night, 310,000 total — on Dakotah\'s points.',
    link:{ url:'https://www.grandwailea.com/', label:'See this hotel' } },
  { id:'kelly-ogg-lax', party:'kelly', type:'flight', date:'2027-01-23',
    title:'OGG → LAX', subtitle:'Kelly', location:'Los Angeles',
    detail:'Planned, not booked. Off Maui on the 23rd to catch the 7:30am out of LAX the next morning. Needs a night in LA.' },
  { id:'kelly-lax-bwi', party:'kelly', type:'flight', date:'2027-01-24',
    title:'LAX → BWI', subtitle:'Kelly · 7:30am · via CLT', location:'Baltimore',
    booked:true, departureUtc:'2027-01-24T15:30:00Z',
    detail:'AA 2808 LAX 7:30am → CLT 3:15pm, then AA 2846 CLT 4:10pm → BWI 5:36pm. Main Cabin, 55-minute connection. 9,500 AAdvantage miles + $5.60.' },
].sort((a, b) => {
  const byDate = a.date.localeCompare(b.date);
  if (byDate) return byDate;
  const rank = { flight: 0, hotel: 1 };
  const byType = (rank[a.type] ?? 2) - (rank[b.type] ?? 2);
  if (byType) return byType;
  if (a.departureUtc && b.departureUtc) return a.departureUtc.localeCompare(b.departureUtc);
  return 0;
});

// ── Day grid ─────────────────────────────────────────────────────────────────
// The planning doc's master table: where each party is on each day.
// `where` is the airport/city code, `move` marks a travel day.
export const TRIP_START = '2027-01-14';
export const TRIP_END = '2027-01-26';

export const TRIP_DAYS = (() => {
  const out = [];
  const d = new Date(TRIP_START + 'T12:00:00');
  const end = new Date(TRIP_END + 'T12:00:00');
  while (d <= end) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return out;
})();

export const DAY_GRID = {
  bd: {
    '2027-01-14': { where: 'LAX', move: 'NYC → LAX' },
    '2027-01-15': { where: 'OGG', move: 'LAX → OGG' },
    '2027-01-16': { where: 'OGG' },
    '2027-01-17': { where: 'OGG' },
    '2027-01-18': { where: 'OGG' },
    '2027-01-19': { where: 'OGG' },
    '2027-01-20': { where: 'OGG' },
    '2027-01-21': { where: 'OGG' },
    '2027-01-22': { where: 'LAX', move: 'OGG → LAX' },
    '2027-01-23': { where: 'LAS', move: 'LAX → LAS' },
    '2027-01-24': { where: 'LAS' },
    '2027-01-25': { where: 'NYC', move: 'LAS → NYC' },
  },
  gj: {
    '2027-01-16': { where: 'LAX', move: 'BWI → LAX' },
    '2027-01-17': { where: 'LAX' },
    '2027-01-18': { where: 'OGG', move: 'LAX → OGG' },
    '2027-01-19': { where: 'OGG' },
    '2027-01-20': { where: 'OGG' },
    '2027-01-21': { where: 'OGG' },
    '2027-01-22': { where: 'OGG' },
    '2027-01-23': { where: 'LAS', move: 'OGG → LAS' },
    '2027-01-24': { where: 'LAS' },
    '2027-01-25': { where: 'LAS' },
    '2027-01-26': { where: 'BWI', move: 'LAS → BWI' },
  },
  kelly: {
    '2027-01-16': { where: 'OGG', move: 'LGB → OGG' },
    '2027-01-17': { where: 'OGG' },
    '2027-01-18': { where: 'OGG' },
    '2027-01-19': { where: 'OGG' },
    '2027-01-20': { where: 'OGG' },
    '2027-01-21': { where: 'OGG' },
    '2027-01-22': { where: 'OGG' },
    '2027-01-23': { where: 'LAX', move: 'OGG → LAX' },
    '2027-01-24': { where: 'BWI', move: 'LAX → BWI' },
  },
};

// Days every party with a filled-in lane is on Maui together.
// Parties whose dates aren't in yet don't count against the overlap.
const SCHEDULED_PARTIES = Object.keys(DAY_GRID).filter(k => Object.keys(DAY_GRID[k]).length > 0);
export const TOGETHER_DAYS = SCHEDULED_PARTIES.length === 0 ? [] : TRIP_DAYS.filter(day =>
  SCHEDULED_PARTIES.every(k => DAY_GRID[k][day]?.where === 'OGG'));

// Hotel nights per party, mapped onto the trip-day axis. A stay runs from
// check-in through the night before checkout, so the checkout day isn't a night.
export function staySegments(party) {
  const out = [];
  for (const i of ITINERARY) {
    if (i.party !== party || i.type !== 'hotel' || !i.endDate) continue;
    const start = TRIP_DAYS.indexOf(i.date);
    if (start < 0) continue;
    const endIdx = TRIP_DAYS.indexOf(i.endDate);
    const lastNight = (endIdx < 0 ? TRIP_DAYS.length : endIdx) - 1;
    if (lastNight < start) continue;
    out.push({
      start,
      len: lastNight - start + 1,
      label: i.short || i.title,
      booked: !!i.booked,
    });
  }
  return out.sort((a, b) => a.start - b.start);
}

export function itineraryFor(party) {
  return ITINERARY.filter(i => i.party === party || i.parties?.includes(party));
}

// Hotels still being shopped for, from the doc's notes.
export const HOTEL_SHORTLIST = {
  'Maui': ['Wailea Beach Resort — Marriott, Maui'],
};

// Shared costs from the doc's budget table.
// Nothing is split at the moment — Ben & Dakotah are covering both cars.
export const SHARED_BUDGET = [];

export function sharedFor(party) {
  return SHARED_BUDGET.filter(b => !b.parties || b.parties.includes(party));
}

export function shareOf(b) {
  return b.perParty ?? b.amount ?? 0;
}

export function lineTotal(b) {
  return b.perParty != null ? b.perParty * (b.parties?.length || 1) : (b.amount ?? 0);
}

export const SHARED_BUDGET_TOTAL = SHARED_BUDGET.reduce((n, b) => n + lineTotal(b), 0);

// ── Money ────────────────────────────────────────────────────────────────────
// One entry per paid booking, tied to the party that paid for it.
//   cash      — out-of-pocket USD (taxes/fees included)
//   points    — loyalty points burned on top of any award certificate
//   awards    — free-night certificates burned (see AWARDS for their value)
//   cashValue — what the same booking would have cost paying cash, so the
//               redemption gets scored instead of guessed.
export const AWARDS = {
  freeNight35k: {
    label: 'Free Night Award (35k)',
    pointsValue: 35000,
    note: 'Which program this certificate came from still needs confirming.',
  },
  bonvoyFreeNight: {
    label: 'Bonvoy Free Night Award',
    pointsValue: 85000,
    note: 'One per year on the card anniversary. Tops out at 85k points; you can add up to 15k points to reach a pricier night.',
  },
};

export const BOOKINGS = [
  {
    id: 'ac-wailea-gina-john',
    party: 'gj',
    type: 'hotel',
    title: 'AC Hotel by Marriott Maui Wailea',
    guests: 'Gina & John',
    room: 'Guest room, 1 King, sofa bed, balcony',
    location: 'Maui',
    date: '2027-01-18',
    endDate: '2027-01-19',
    nights: 1,
    conf: '76648382',
    program: 'Marriott Bonvoy',
    cash: 29.68,
    points: 15000,
    awards: [{ type: 'bonvoyFreeNight', count: 1 }],
    cashValue: 1023,
    note: 'Free night award topped off with 15k points.',
  },
  {
    id: 'bd-waldorf',
    party: 'bd',
    type: 'hotel',
    title: 'Grand Wailea, Waldorf Astoria',
    guests: 'Ben & Dakotah',
    location: 'Maui',
    date: '2027-01-19',
    endDate: '2027-01-22',
    room: 'Garden View, 1 King — sleeps 4, balcony, sofa',
    nights: 3,
    program: 'Hilton Honors',
    pointsPerNight: 130000,
    points: 390000,
    cashValue: 2982,
    cash: 400,
    pointsPurchased: 80000,
    purchaseConf: '9596-1373-6507-8962-9528',
    transfer: { program: 'Amex Membership Rewards', ratio: 2.293, bonus: 0.147, blended: true },
    note: 'Cash basis $994/night (Garden View, flexible rate), incl. the $55 resort charge but before tax. 80,000 of the points were bought outright for $400 on a 100%-bonus promo (0.5c each); the rest came from Amex transfers at a blended 1:2.29 across 0% and 20% bonus windows.',
  },
  {
    id: 'gj-waldorf',
    party: 'gj',
    type: 'hotel',
    title: 'Grand Wailea, Waldorf Astoria',
    guests: 'Gina & John',
    location: 'Maui',
    date: '2027-01-19',
    endDate: '2027-01-23',
    room: 'Terrace View, 1 King — sleeps 4, balcony, sofa',
    nights: 4,
    program: 'Hilton Honors',
    pointsPerNight: 155000,
    cash: 0,
    points: 620000,
    cashValue: 3748,
    transfer: { program: 'Amex Membership Rewards', ratio: 2.6, bonus: 0.30 },
    note: 'Cash basis $937/night (Honors Discount, Terrace View), incl. the $55 resort charge but before tax.',
  },
  {
    id: 'bd-citizenm',
    party: 'bd',
    type: 'hotel',
    title: 'citizenM Los Angeles',
    guests: 'Ben & Dakotah',
    location: 'Los Angeles',
    date: '2027-01-14',
    endDate: '2027-01-15',
    nights: 1,
    cash: 0,
    points: 0,
    room: 'King room',
    awards: [{ type: 'freeNight35k', count: 1 }],
    cashValue: 194,
    note: 'Covered by a 35,000-point free night award. King room prices at $194 that Thursday including taxes and fees, or 44,000 points — so the certificate went 9,000 points further than booking with points today.',
  },
  {
    id: 'bd-nyc-lax',
    party: 'bd',
    type: 'flight',
    title: 'NYC → LAX',
    guests: 'Ben & Dakotah',
    location: 'Los Angeles',
    date: '2027-01-14',
    program: 'AAdvantage',
    cash: 11.20,
    points: 14000,
    note: '7,000 miles + $5.60 per person, two people. The $5.60 is the September 11th Security Fee — the miles covered the fare itself.',
  },
  {
    id: 'bd-hyatt',
    party: 'bd',
    type: 'hotel',
    title: 'Maui Hyatt',
    guests: 'Ben & Dakotah',
    room: 'King room',
    location: 'Maui',
    date: '2027-01-15',
    endDate: '2027-01-19',
    nights: 4,
    program: 'World of Hyatt',
    pointsPerNight: 25000,
    cash: 0,
    points: 100000,
    transfer: { program: 'Chase Ultimate Rewards', ratio: 1 },
    cashValue: 2504,
    note: 'King room at 25,000 Hyatt points a night against a $626 cash rate. Hyatt transfers 1:1 from Chase, so this cost 100,000 Chase points. Cash figure is pre-tax.',
  },
  {
    id: 'bd-lax-ogg',
    party: 'bd',
    type: 'flight',
    title: 'LAX → OGG',
    guests: 'Ben & Dakotah',
    room: 'AA271, Airbus A321neo',
    location: 'Maui',
    date: '2027-01-15',
    conf: '7RIAL6',
    program: 'Etihad Guest',
    cash: 0,
    points: 62040,
    gifted: true,
    cashValue: 568.72,
    note: '31,020 miles each, booked 23 Mar 2026. Operated by American as AA271. A Christmas gift — someone else\'s miles, so nothing out of Dakotah and Ben\'s pocket. Cash basis: the $1,092 round-trip main-economy fare for two, split across the legs in proportion to miles.',
  },
  {
    id: 'bd-ogg-lax',
    party: 'bd',
    type: 'flight',
    title: 'OGG → LAX',
    guests: 'Ben & Dakotah',
    room: 'AA254, Airbus A321neo',
    location: 'Los Angeles',
    date: '2027-01-22',
    conf: '7RO9GD',
    program: 'Etihad Guest',
    cash: 0,
    points: 57090,
    gifted: true,
    cashValue: 523.28,
    note: '28,545 miles each, booked 23 Mar 2026. Operated by American as AA254. A Christmas gift — someone else\'s miles, so nothing out of Dakotah and Ben\'s pocket. Cash basis: the $1,092 round-trip main-economy fare for two, split across the legs in proportion to miles.',
  },
  {
    id: 'bd-aria',
    party: 'bd',
    type: 'hotel',
    title: 'Aria',
    guests: 'Ben & Dakotah',
    room: 'Restore Deluxe Two Queen, Strip View',
    location: 'Las Vegas',
    date: '2027-01-22',
    endDate: '2027-01-25',
    nights: 3,
    conf: '5UFHBS97EZ',
    cash: 0,
    points: 0,
    cashValue: 1832.77,
    note: 'Comped through MGM. Rack rate for the same room and dates is $1,832.77 all in — $340 / $645 / $690 plus tax. The MGM Rewards member rate would have been $1,336.97. Nothing paid, no points spent.',
  },
  {
    id: 'kelly-lgb-ogg',
    party: 'kelly',
    paidBy: 'bd',
    type: 'flight',
    title: 'LGB → OGG',
    guests: 'Kelly',
    room: 'AS 869 + AS 1426, First class throughout',
    location: 'Maui',
    date: '2027-01-16',
    cash: 5.60,
    points: 40000,
    program: 'Alaska Mileage Plan',
    cashValue: 1274,
    note: 'First class both segments via Honolulu. 40,000 Alaska miles + $5.60. Cash fare for the same seats was $1,274 one way.',
  },
  {
    id: 'kelly-waldorf',
    party: 'kelly',
    paidBy: 'bd',
    type: 'hotel',
    title: 'Grand Wailea, Waldorf Astoria',
    guests: 'Kelly',
    room: 'Terrace View, 1 King',
    location: 'Maui',
    date: '2027-01-19',
    endDate: '2027-01-21',
    nights: 2,
    conf: '3537802552',
    program: 'Hilton Honors',
    pointsPerNight: 155000,
    cash: 0,
    points: 310000,
    cashValue: 1874,
    transfer: { program: 'Amex Membership Rewards', ratio: 2.6, bonus: 0.30 },
    note: 'Kelly\'s room, booked on Dakotah\'s Hilton points. Cash basis $937/night, pre-tax. Topped up with a 16,000-point Amex transfer at the 30% bonus (41,600 Hilton); the rest came from the existing balance. Scored at the 1:2.6 rate, which is what replacing the points would cost.',
  },
  {
    id: 'kelly-lax-bwi',
    party: 'kelly',
    paidBy: 'bd',
    type: 'flight',
    title: 'LAX → BWI',
    guests: 'Kelly',
    room: 'AA 2808 + AA 2846 via Charlotte, Main Cabin',
    location: 'Baltimore',
    date: '2027-01-24',
    program: 'AAdvantage',
    cash: 5.60,
    points: 9500,
    cashValue: 307,
    note: 'Web-special pricing — the normal saver rate is 12,500. The $5.60 is the security fee. Cash fare was $307 one way.',
  },
  {
    id: 'cars',
    party: 'bd',
    type: 'other',
    title: 'Rental cars',
    guests: 'Ben & Dakotah',
    location: 'Maui',
    date: '2027-01-15',
    endDate: '2027-01-22',
    cash: 800,
    points: 0,
    note: 'Two vehicles at about $400 each, both covered by Ben & Dakotah. Hertz and Budget had the best prices.',
  },
  {
    id: 'gj-lax-ogg',
    party: 'gj',
    type: 'flight',
    title: 'LAX → OGG',
    guests: 'Gina & John',
    room: 'AS 933, non-stop',
    location: 'Maui',
    date: '2027-01-18',
    cash: 0,
    points: 80000,
    program: 'Alaska Mileage Plan',
    cashValue: 3040,
    note: '40,000 Alaska miles per person, two people. Cash fare $1,520 per person one way.',
  },
  {
    id: 'gj-caesars',
    party: 'gj',
    type: 'hotel',
    title: 'Caesars Palace',
    guests: 'Gina & John',
    room: 'Octavius Premium Room, 1 King',
    location: 'Las Vegas',
    date: '2027-01-23',
    endDate: '2027-01-26',
    nights: 3,
    conf: 'KPJJW',
    cash: 186.91,
    points: 0,
    cashValue: 1549.73,
    note: 'Comped room on Gina\'s Caesars Rewards — the room itself is free, but Caesars still charges resort fees, so $186.91 is out of pocket. Public price for the same three nights is $1,549.73 all in: $1,202 room ($354 / $424 / $424) plus $164.85 resort fees and $182.88 tax.',
  },
  {
    id: 'gj-ogg-las',
    party: 'gj',
    type: 'flight',
    title: 'OGG → LAS',
    guests: 'Gina & John',
    room: 'Alaska 1195 + 808 via Honolulu, First class',
    location: 'Las Vegas',
    date: '2027-01-23',
    cash: 11.20,
    points: 100000,
    program: 'Alaska Mileage Plan',
    cashValue: 3414,
    note: 'Red-eye, First both legs. 50,000 Alaska miles + $5.60 per person, two people. Cash fare $1,707 per person one way.',
  },
  {
    id: 'bd-westin-lax',
    party: 'bd',
    type: 'hotel',
    title: 'Westin Los Angeles Airport',
    guests: 'Ben & Dakotah',
    room: 'Deluxe, 1 King, sofa bed',
    location: 'Los Angeles',
    date: '2027-01-22',
    endDate: '2027-01-23',
    nights: 1,
    conf: '94631061',
    program: 'Marriott Bonvoy',
    cash: 23.20,
    points: 37000,
    note: '37,000 Bonvoy points plus $23.20 in taxes. Full cash rate for the night still to record.',
  },
].sort((a, b) => {
  const byDate = (a.date || '').localeCompare(b.date || '');
  if (byDate) return byDate;
  const rank = { flight: 0, hotel: 1 };
  return (rank[a.type] ?? 2) - (rank[b.type] ?? 2);
});

// Money is grouped by whose trip it is. `paidBy` stays on the record as a
// note about who covered it, but doesn't move a booking between tabs.
export function bookingsFor(party) {
  return BOOKINGS.filter(b => b.party === party);
}

// Everything on a party's own itinerary, regardless of who paid.
export function bookingsOwnedBy(party) {
  return BOOKINGS.filter(b => b.party === party);
}

export function tripValue(bookings) {
  return bookings.reduce((n, b) => n + (b.cashValue ?? 0), 0);
}

export function pointsByProgram(bookings) {
  const out = {};
  for (const b of bookings) {
    if (b.points) out[b.program || 'points'] = (out[b.program || 'points'] || 0) + b.points;
    for (const a of b.awards || []) {
      const label = AWARDS[a.type]?.label || 'Free night award';
      out[label] = (out[label] || 0) + (a.count || 1);
    }
  }
  return Object.entries(out).map(([program, points]) => ({ program, points }));
}

// Points-equivalent of the certificates burned on a booking.
export function awardPoints(b) {
  return (b.awards || []).reduce(
    (sum, a) => sum + (AWARDS[a.type]?.pointsValue || 0) * (a.count || 1), 0);
}

export function awardCount(b) {
  return (b.awards || []).reduce((sum, a) => sum + (a.count || 1), 0);
}

// Cents of value per point. `includeAwards` prices the certificates at their
// points value too — the honest floor, since a free night isn't really free.
export function centsPerPoint(b, includeAwards = false) {
  if (b.cashValue == null) return null;   // no cash rate to compare against yet
  const spent = (b.points || 0) + (includeAwards ? awardPoints(b) : 0);
  if (!spent) return null;
  return ((b.cashValue - b.cash) / spent) * 100;
}

export function totals(bookings) {
  return bookings.reduce((acc, b) => ({
    // Gifted bookings cost the traveller nothing, so they don't count as spend.
    cash: acc.cash + (b.gifted ? 0 : (b.cash || 0)),
    points: acc.points + (b.gifted ? 0 : (b.points || 0)),
    awards: acc.awards + (b.gifted ? 0 : awardCount(b)),
    awardPoints: acc.awardPoints + (b.gifted ? 0 : awardPoints(b)),
    cashValue: acc.cashValue + (b.cashValue || b.cash || 0),
    gifted: acc.gifted + (b.gifted ? (b.cashValue || 0) : 0),
  }), { cash: 0, points: 0, awards: 0, awardPoints: 0, cashValue: 0, gifted: 0 });
}

// Amex points actually spent, given the transfer ratio in effect at the time.
export function sourcePoints(b) {
  if (!b.transfer?.ratio || !b.points) return null;
  const transferred = b.points - (b.pointsPurchased || 0);
  return transferred > 0 ? Math.round(transferred / b.transfer.ratio) : 0;
}

// Cents of value per point of the ORIGINAL currency, which is what the
// redemption really cost — Hilton points on their own flatter the deal.
export function centsPerSourcePoint(b) {
  const src = sourcePoints(b);
  if (!src || b.cashValue == null) return null;
  return ((b.cashValue - b.cash) / src) * 100;
}

export function money(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export const DESTINATIONS = {
  'Maui': {
    icon: 'TreePalm', tagline: 'The Valley Isle',
    facts: [
      'The Road to Hana has 620 curves and 59 bridges — 46 are one-lane.',
      'Haleakalā\'s summit is 10,023 ft — sunrise above the clouds.',
      'Lahaina was Hawaii\'s royal capital until 1845.',
    ],
    tips: [
      { icon:'Mountain', text:'Haleakalā sunrise needs a reservation 60 days out — book early.' },
      { icon:'Car', text:'Drive Hana clockwise (through Ke\'anae). Less traffic.' },
      { icon:'Fish', text:'Ho\'okipa Beach at sunset — sea turtles come ashore.' },
    ],
    eats: [
      { name:'Mama\'s Fish House', vibe:'Iconic Maui splurge. Menu names the fisherman who caught your fish.', maps:appleMap('Mama\'s Fish House Maui','20.9339,-156.3820'), order:'Whatever the day boat brought.', price:'$$$$' },
    ],
  },
  'Big Island': {
    icon: 'Mountain', tagline: 'Kona & Hilo',
    facts: [
      'Mauna Kea from base (below sea level) to summit is taller than Everest.',
      'The Big Island is still growing — Kilauea has added over 500 acres since 1983.',
      'Kona coffee is grown on volcanic slopes at 1,500–3,000 ft.',
    ],
    tips: [
      { icon:'Mountain', text:'Volcanoes NP at night — glowing lava views if there\'s an active eruption.' },
      { icon:'Star', text:'Mauna Kea stargazing tour. Cold at summit — bring layers.' },
      { icon:'Coffee', text:'Kona coffee farm tours — beans direct from source.' },
    ],
    eats: [
      { name:'Da Poke Shack', vibe:'Kailua-Kona poke spot beloved by locals.', maps:appleMap('Da Poke Shack Kona','19.6297,-155.9973'), order:'Pele\'s Kiss (spicy ahi).', price:'$12–18' },
    ],
  },
  'Kauai': {
    icon: 'Leaf', tagline: 'The Garden Isle',
    facts: [
      'Kauai is the oldest of the main Hawaiian islands at ~5 million years.',
      'Mount Waiʻaleʻale is one of the wettest spots on Earth (~450 in/yr).',
      'No building on Kauai is taller than a coconut palm — by law.',
    ],
    tips: [
      { icon:'Plane', text:'Helicopter tour of the Nā Pali Coast — the only way to see most of it.' },
      { icon:'Mountain', text:'Waimea Canyon — the "Grand Canyon of the Pacific". Early = clear views.' },
      { icon:'Umbrella', text:'Poipu Beach for snorkeling; Hanalei Bay for chill sunsets.' },
    ],
    eats: [
      { name:'Hamura Saimin', vibe:'Kauai institution since the 1950s. Cash only.', maps:appleMap('Hamura Saimin Lihue','21.9764,-159.3722'), order:'Special saimin + BBQ stick.', price:'$8–14' },
    ],
  },
};

export const AFFIRMATIONS = [
  "The world didn't get smaller. You just got braver.",
  "Be where your feet are. The rest will sort itself out.",
  "Every stranger is a story you haven't heard yet.",
  "Go slow enough to actually see it.",
  "The detour is usually the point.",
  "You are exactly where you're supposed to be.",
  "Eat the thing you can't pronounce. Order another.",
  "Don't just see it. Let it hit you.",
  "The best souvenir is who you become out there.",
  "Nothing is wasted when you're paying attention.",
];
