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
    title:'LGA → LAX', subtitle:'Ben & Dakotah · AA 4579 + 814 · 1:00pm · via PIT', location:'Los Angeles',
    booked:true, conf:'RAOSLV', departureUtc:'2027-01-14T18:00:00Z',
    detail:'LaGuardia 1:00pm → LAX 7:37pm via Pittsburgh. AA 4579 LGA–PIT, then AA 814 PIT–LAX on a 737 MAX 8. 7,000 AAdvantage miles + $5.60 each. Overnight in LA before the Maui hop. American moved this on 21 Sep — it was AA 4411 at 3:10pm into LAX at 8:26pm.',
    access:'American Airlines — aa.com or the AA app. Booked on AAdvantage under Dakotah Jennifer.',
    brief:'AA 4579 LaGuardia 1:00pm to Pittsburgh 2:45pm, seats 11F and 11D. Then AA 814 Pittsburgh 5:04pm to LAX 7:37pm, seats 10E and 10D. 2h 19m in Pittsburgh.' },
  { id:'bd-citizenm', party:'bd', type:'hotel', date:'2027-01-14', endDate:'2027-01-15',
    title:'citizenM Los Angeles', short:'citizenM', subtitle:'1 night · Ben & Dakotah', location:'Los Angeles',
    booked:true, conf:'83975525',
    detail:'Layover night between NYC and Maui. Guest room, 1 King, 2 adults. Check-in 2pm. Paid with a Premier Plus free night award plus a 3,000-point top-off.',
    link:{ url:'https://www.citizenm.com/hotels/united-states/los-angeles/los-angeles-downtown-hotel', label:'See this hotel' },
    brief:'Layover night between New York and Maui. Guest room, 1 King, 2 adults. Check-in 2pm, out 11am. 361 S Spring St, (213) 337-8658. No hotel parking — Broadway Spring Center is the nearby option.',
    access:'citizenM — citizenm.com or the citizenM app, under Dakotah Jennifer.' },
  { id:'bd-lax-ogg', party:'bd', type:'flight', date:'2027-01-15',
    title:'LAX → OGG', subtitle:'Ben & Dakotah · AA271 · 8:52am', location:'Maui',
    booked:true, conf:'7RIAL6', departureUtc:'2027-01-15T16:52:00Z',
    detail:'American Airlines AA271, Airbus A321neo. LAX 8:52am → Kahului 12:46pm, 5h 54m non-stop. Ticketed through Etihad Guest, operated by American — manage it at etihad.com. Dakotah ticket 6072415063536, Ben ticket 6072415063535. Booking reference 7RIAL6, 62,040 Etihad Guest miles for the two of you.',
    tip:'No seats assigned on this one yet — pick them at etihad.com.',
    access:'Ticketed by Etihad Guest, flown by American. Manage at etihad.com with reference 7RIAL6 — the surname on the booking is Polyakov. Check in with American.',
    brief:'AA 271, non-stop. LAX 8:52am, Kahului 12:46pm. 5h 54m. Airbus A321neo.' },
  { id:'bd-hyatt', party:'bd', type:'hotel', date:'2027-01-15', endDate:'2027-01-19',
    title:'Maui Hyatt', short:'Hyatt', subtitle:'4 nights · Ben & Dakotah', location:'Maui',
    booked:true, conf:'20308273',
    detail:'1 King with a pull-out sofa, 451 sq ft, lower floor, non-ocean view. 3 adults. Nights of 1/15–1/18, out 1/19 to move to the Waldorf. 25,000 Hyatt points per night, 100,000 total — transferred 1:1 from Chase Ultimate Rewards. Resort fee of $49 a night on top.',
    link:{ url:'https://www.hyatt.com/hyatt-regency/en-US/oggrm-hyatt-regency-maui-resort-and-spa', label:'See this hotel' },
    brief:'1 King with a pull-out sofa, 451 sq ft, lower floor, non-ocean view. 3 adults. Check in 4pm on the 15th, out 11am on the 19th to move to the Waldorf. 200 Nohea Kai Drive, Lahaina, (808) 661-1234. A quiet room and early check-in are on the booking as requests.',
    access:'World of Hyatt — hyatt.com or the World of Hyatt app, under Dakotah Jennifer.' },
  { id:'bd-waldorf', party:'bd', type:'hotel', date:'2027-01-19', endDate:'2027-01-22',
    title:'Grand Wailea, Waldorf Astoria', short:'Waldorf', subtitle:'3 nights · Ben & Dakotah', location:'Maui',
    booked:true, conf:'3463135886',
    detail:'Terrace View, 1 King, 3 adults. In 1/19, out 1/22 — AA254 leaves Kahului at 2:37pm that day. 130,000 Hilton points per night, 390,000 total.',
    link:{ url:'https://www.grandwailea.com/', label:'See this hotel' },
    brief:'Terrace View, 1 King, 3 adults. In on the 19th, out on the 22nd — AA 254 leaves Kahului at 2:37pm that day.',
    access:'Hilton Honors — hilton.com or the Hilton Honors app, under Dakotah Jennifer.' },
  { id:'bd-ogg-lax', party:'bd', type:'flight', date:'2027-01-22',
    title:'OGG → LAX', subtitle:'Ben & Dakotah · AA254 · 2:37pm', location:'Los Angeles',
    booked:true, conf:'7RO9GD', departureUtc:'2027-01-23T00:37:00Z',
    detail:'American Airlines AA254, Airbus A321neo. Kahului 2:37pm → LAX 10:13pm, 5h 36m non-stop. Ticketed through Etihad Guest (607 stock), operated by American — manage it at etihad.com. Dakotah seat 16C, ticket 6072415062096. Ben seat 16B, ticket 6072415062095. Booking reference 7RO9GD, 57,090 Etihad Guest miles for the two of you.',
    access:'Ticketed by Etihad Guest, flown by American. Manage at etihad.com with reference 7RO9GD — the surname on the booking is Polyakov. Check in with American.',
    brief:'AA 254, non-stop. Kahului 2:37pm, LAX 10:13pm. 5h 36m. Seats 16B and 16C.' },
  { id:'bd-westin-lax', party:'bd', type:'hotel', date:'2027-01-22', endDate:'2027-01-23',
    title:'Westin Los Angeles Airport', short:'Westin', subtitle:'1 night · Ben & Dakotah', location:'Los Angeles',
    conf:'94631061', booked:true,
    detail:'Deluxe guest room, 1 King, sofa bed, high floor. Night of the 22nd, after AA254 lands at 10:13pm and before the morning flight to Vegas. One reservation covering both nights — Kelly has the room on the 23rd.',
    link:{ url:'https://www.marriott.com/en-us/hotels/laxwi-the-westin-los-angeles-airport/overview/', label:'See this hotel' },
    brief:'Deluxe room, 1 King with sofa bed, high floor. At the airport. Kelly has the room the following night.',
    access:'Marriott Bonvoy — marriott.com or the Bonvoy app, confirmation 94631061 under Dakotah Jennifer. Covers both nights; Kelly has the second.' },
  { id:'bd-lax-las', party:'bd', type:'flight', date:'2027-01-23',
    title:'LAX → LAS', subtitle:'Ben & Dakotah · UA 2741 · 10:41am', location:'Las Vegas',
    conf:'C6JQJK', booked:true, departureUtc:'2027-01-23T18:41:00Z',
    detail:'United 2741, non-stop, LAX 10:41am → Las Vegas 12:00pm, 1h 19m. Economy. 20,000 Avianca LifeMiles + $31.20 for the two of you. Changes $150, refund $50.',
    access:'Booked through Avianca LifeMiles, flown by United. Manage at lifemiles.com with code C6JQJK. Check in with United.',
    brief:'UA 2741, non-stop. LAX 10:41am, Las Vegas 12:00pm. 1h 19m.' },
  { id:'bd-aria', party:'bd', type:'hotel', date:'2027-01-22', endDate:'2027-01-25',
    title:'Aria', short:'Aria', subtitle:'3 nights · Ben & Dakotah', location:'Las Vegas',
    conf:'5UFHBS97EZ', booked:true,
    detail:'Restore Deluxe Two Queen Strip View Room. In 1/22, out 1/25. Comped through MGM. You fly in on the morning of the 23rd, so the first night goes unused — it buys an early check-in.',
    link:{ url:'https://aria.mgmresorts.com/', label:'See this hotel' },
    brief:'Restore Deluxe Two Queen, Strip view. In on the 22nd, out on the 25th. You arrive the morning of the 23rd, so the first night just holds an early check-in.',
    access:'MGM Rewards — aria.mgmresorts.com or the MGM app, under Dakotah Jennifer.' },
  { id:'bd-home', party:'bd', type:'flight', date:'2027-01-25',
    title:'LAS → NYC', subtitle:'Ben & Dakotah', location:'New York',
    detail:'Planned, not booked. Home from Vegas after the Aria checkout.',
    brief:'Flight home from Las Vegas.' },

  // Gina & John
  { id:'gj-hyatt-dulles', party:'gj', type:'hotel', date:'2027-01-15', endDate:'2027-01-16',
    title:'Hyatt Regency Dulles', short:'Hyatt IAD', subtitle:'1 night · Gina & John', location:'Washington',
    booked:true, conf:'40023B28394357',
    detail:'1 King with a sofabed, 374 sq ft, city view, two guests, member rate. Check in 3pm, out by noon. $192.05 all in — $167 room plus $25.05 tax. A $50 incidental deposit is taken at check-in. Night before the 6:00am out of Dulles.',
    link:{ url:'https://www.hyatt.com/hyatt-regency/en-US/iadrd-hyatt-regency-dulles', label:'See this hotel' },
    brief:'King bed with a sofabed, 374 sq ft, city view, two guests. Check in 3pm on the 15th, out by noon. 2300 Dulles Corner Blvd., Herndon, (703) 713-1234. For the airport shuttle call that number and press 0 — the flight out of Dulles is 6:00am. Non-smoking is confirmed and a quiet room is requested.',
    access:'World of Hyatt — hyatt.com or the World of Hyatt app, under Gina Merritt. Confirmation 40023B28394357.' },
  { id:'gj-iad-lax', party:'gj', type:'flight', date:'2027-01-16',
    title:'IAD → LAX', subtitle:'Gina & John · 6:00am · First', location:'Los Angeles',
    booked:true, departureUtc:'2027-01-16T11:00:00Z',
    conf:'FKPURW',
    detail:'American, First class, non-stop. Washington Dulles 6:00am → LAX 9:01am, 6h 01m. 38,000 AAdvantage miles + $11.20 for the two of you. Two nights in LA before Maui.',
    access:'American Airlines — aa.com or the AA app, under Gina Merritt.',
    brief:'American, First class, non-stop. Washington Dulles 6:00am, LAX 9:01am. 6h 01m.' },
  { id:'gj-w-beverly', party:'gj', type:'hotel', date:'2027-01-16', endDate:'2027-01-18',
    title:'W Los Angeles — West Beverly Hills', short:'W LA', subtitle:'2 nights · Gina & John', location:'Los Angeles',
    booked:true,
    detail:'109,600 Bonvoy points + $81.20 for the two nights. Cash rate was $503 a night, $1,007 total. Nights of the 16th and 17th, out the 18th for the 8:35am to Maui.',
    tip:'The W is in Westwood, about 11 miles from LAX — usually 15 to 20 minutes. The flight to Maui is 8:35am on the 18th, so leaving the hotel around 6:30am gives plenty of room.',
    link:{ url:'https://www.marriott.com/en-us/hotels/laxwh-w-los-angeles-west-beverly-hills/overview/', label:'See this hotel' },
    brief:'Nights of the 16th and 17th, out on the 18th for the 8:35am to Maui.',
    access:'Marriott Bonvoy — marriott.com or the Bonvoy app, under Gina Merritt.' },
  { id:'gj-lax-ogg', party:'gj', type:'flight', date:'2027-01-18',
    title:'LAX → OGG', subtitle:'Gina & John · AS 933 · 8:30am', location:'Maui',
    booked:true, conf:'NLHQKB', departureUtc:'2027-01-18T16:30:00Z',
    detail:'AS 933, Airbus A330-200, Hawaiian Airlines operated by Alaska. LAX 8:30am → Kahului 12:10pm, 5h 40m non-stop. First class, 80,000 Alaska points for the two of them + $11.20.',
    access:'Alaska Airlines — alaskaair.com or the Alaska app, reference NLHQKB. Flight AS 933, check in with Hawaiian.',
    brief:'AS 933, non-stop. LAX 8:30am, Kahului 12:10pm. 5h 40m. First class, seats 2C and 2G.' },
  { id:'ac-wailea-gina-john', party:'gj', type:'hotel', date:'2027-01-18', endDate:'2027-01-19',
    title:'AC Hotel by Marriott Maui Wailea', short:'AC Wailea', subtitle:'1 night · Gina & John', location:'Maui',
    conf:'76648382', booked:true,
    detail:'Guest room, 1 King, sofa bed, balcony. Free night award topped off with 15k points.',
    link:{ url:'https://www.marriott.com/en-us/hotels/hnmac-ac-hotel-maui-wailea/overview/', label:'See this hotel' },
    brief:'Guest room, 1 King with sofa bed and balcony. One night before moving to the Waldorf.',
    access:'Marriott Bonvoy — marriott.com or the Bonvoy app, under Gina Merritt.' },
  { id:'gj-waldorf', party:'gj', type:'hotel', date:'2027-01-19', endDate:'2027-01-23',
    title:'Grand Wailea, Waldorf Astoria', short:'Waldorf', subtitle:'4 nights · Gina & John', location:'Maui',
    booked:true, conf:'3534263318',
    detail:'Terrace View, 1 King. In 1/19, out 1/23. 155,000 Hilton points per night, 620,000 total. Booked in Gina\'s name for one adult — Dakotah checked with Hilton and they will add John at check-in, no change needed beforehand.',
    link:{ url:'https://www.grandwailea.com/', label:'See this hotel' },
    brief:'Terrace View, 1 King. Check in 4pm on the 19th, out 11am on the 23rd. 3850 Wailea Alanui Drive, (808) 875-1234. Under Gina Merritt. The booking lists one guest — mention John at the desk and they will add him on arrival. A 60th-birthday upgrade request is on the booking.',
    access:'Hilton Honors — hilton.com or the Hilton Honors app, under Gina Merritt.' },
  { id:'gj-ogg-las', party:'gj', type:'flight', date:'2027-01-23',
    title:'OGG → LAS', subtitle:'Gina & John · 8:45pm · First · via HNL', location:'Las Vegas',
    booked:true, conf:'JNRIIH', departureUtc:'2027-01-24T06:45:00Z',
    detail:'Red-eye. Alaska 1195 Kahului 8:45pm → Honolulu 9:29pm, then Alaska 808 Honolulu 11:35pm → Las Vegas 7:15am Sunday. First class on both, 2h 06m connection, operated by Alaska as Hawaiian — check in with Hawaiian.',
    access:'Alaska Airlines — alaskaair.com or the Alaska app. Check in with Hawaiian for the first leg.',
    brief:'Red-eye. AS 1195 Kahului 8:45pm to Honolulu 9:29pm, seats 2E and 2F. Then AS 808 Honolulu 11:35pm to Las Vegas, arriving 7:15am Sunday, seats 3C and 3G. First class on both, 2h 06m connection.' },
  { id:'gj-caesars', party:'gj', type:'hotel', date:'2027-01-23', endDate:'2027-01-26',
    title:'Caesars Palace', short:'Caesars', subtitle:'3 nights · Gina & John', location:'Las Vegas',
    conf:'KPJJW', booked:true,
    detail:'Octavius Premium Room, 1 King, 550 sq ft. Room comped; $186.91 in resort fees still due. Free cancellation until 21 Jan 2027.',
    link:{ url:'https://www.caesars.com/caesars-palace', label:'See this hotel' },
    brief:'Octavius Premium Room, 1 King, 550 sq ft. In on the 23rd, out on the 26th. Free cancellation until 21 January.',
    access:'Caesars Rewards — caesars.com or the Caesars app, under Gina Merritt.' },
  { id:'gj-bellagio', party:'gj', type:'hotel', date:'2027-01-26', endDate:'2027-01-27',
    title:'Bellagio Las Vegas', short:'Bellagio', subtitle:'1 night · Gina & John', location:'Las Vegas',
    conf:'6M03Q0CCG6', booked:true,
    detail:'Restore Premier King, two guests. In 1/26, out 1/27, straight after Caesars. Comped — the $369 room was covered in full by an MGM Rewards offer. Free cancellation until 23 Jan.',
    link:{ url:'https://bellagio.mgmresorts.com/', label:'See this hotel' },
    brief:'Restore Premier King, two guests. In on the 26th, out on the 27th, straight after Caesars. Free cancellation until 23 January.',
    access:'MGM Rewards — bellagio.mgmresorts.com or the MGM app, under Gina Merritt.' },
  { id:'gj-las-bwi', party:'gj', type:'flight', date:'2027-01-27',
    title:'LAS → BWI', subtitle:'Gina & John', location:'Baltimore',
    detail:'Planned, not booked. Home from Vegas after the Bellagio checkout.',
    brief:'Flight home from Las Vegas.' },

  // Kelly
  { id:'kelly-bwi-lax', party:'kelly', type:'flight', date:'2027-01-15',
    title:'BWI → LAX', subtitle:'Kelly · 8:37am · non-stop', location:'Los Angeles',
    detail:'Planned, not booked. Baltimore 8:37am → LAX 11:39am, non-stop. 15,000 miles. Lands before noon, leaving the afternoon free before the 7:35am out of Long Beach — LGB is about 20 miles from LAX.',
    brief:'Baltimore 8:37am, LAX 11:39am, non-stop. Lands before noon, leaving the afternoon free.' },
  { id:'kelly-doubletree', party:'kelly', type:'hotel', date:'2027-01-15', endDate:'2027-01-16',
    title:'DoubleTree by Hilton LA Downtown', short:'DoubleTree', subtitle:'1 night · Kelly', location:'Los Angeles',
    booked:true, conf:'92838768',
    detail:'67,000 Hilton points. Fri 15 Jan, out Sat the 16th. She lands LAX 11:39am and flies out of Long Beach at 7:35am.',
    tip:'Downtown LA, so it is about 25 miles to Long Beach — roughly 40 minutes early on a Saturday. For a 7:35am flight that means leaving around 5:30am.',
    link:{ url:'https://www.hilton.com/en/hotels/laxdtdt-doubletree-los-angeles-downtown/', label:'See this hotel' },
    brief:'In Friday the 15th, out Saturday the 16th. Downtown LA.',
    access:'Hilton Honors — hilton.com or the Hilton Honors app. Booked by Dakotah.' },
  { id:'kelly-lgb-ogg', party:'kelly', type:'flight', date:'2027-01-16',
    title:'LGB → OGG', subtitle:'Kelly · 7:35am · First', location:'Maui',
    booked:true, conf:'KUHKWQ', departureUtc:'2027-01-16T15:35:00Z',
    detail:'Long Beach 7:35am, Kahului 1:53pm. 8h 18m via Honolulu with a 1h 17m connection. AS 869 LGB–HNL in First, operated by Alaska as Hawaiian Airlines; AS 1426 HNL–OGG in First, operated by Alaska. 40,000 points + $5.60.',
    access:'Alaska Airlines — alaskaair.com or the Alaska app, under Kelly Polyakov.',
    brief:'AS 869 Long Beach 7:35am to Honolulu 11:43am, seat 2J. Then AS 1426 Honolulu 1:00pm to Kahului 1:53pm, seat 2F. First class on both, 1h 17m connection.' },
  { id:'kelly-hyatt', party:'kelly', type:'hotel', date:'2027-01-16', endDate:'2027-01-19',
    title:'Maui Hyatt', short:'Hyatt', subtitle:'3 nights · Kelly', location:'Maui',
    conf:'810606', booked:true,
    detail:'Standard King. Nights of 1/16–1/18, out 1/19 to move to the Waldorf. She lands 1:53pm on the 16th. 25,000 + 25,000 + 30,000 = 80,000 Hyatt points, sourced as 48,000 Bilt at 1:1, 42,000 Chase at 4:3, and 500 already in the account.',
    link:{ url:'https://www.hyatt.com/hyatt-regency/en-US/oggrm-hyatt-regency-maui-resort-and-spa', label:'See this hotel' },
    brief:'Standard King. Nights of the 16th through the 18th, out on the 19th to move to the Waldorf.',
    access:'World of Hyatt — hyatt.com or the World of Hyatt app. Booked by Dakotah.' },
  { id:'kelly-waldorf', party:'kelly', type:'hotel', date:'2027-01-19', endDate:'2027-01-21',
    title:'Grand Wailea, Waldorf Astoria', short:'Waldorf', subtitle:'2 nights · Kelly', location:'Maui',
    conf:'3537802552', booked:true,
    detail:'Terrace View, 1 King. In Tue 1/19, out Thu 1/21. 155,000 Hilton points a night, 310,000 total — on Dakotah\'s points.',
    link:{ url:'https://www.grandwailea.com/', label:'See this hotel' },
    brief:'Terrace View, 1 King. In Tuesday the 19th, out Thursday the 21st.',
    access:'Hilton Honors — hilton.com or the Hilton Honors app. Booked on Dakotah\'s account.' },
  { id:'kelly-maui-coast', party:'kelly', type:'hotel', date:'2027-01-21', endDate:'2027-01-23',
    title:'Maui Coast Hotel', short:'Maui Coast', subtitle:'2 nights · Kelly', location:'Maui',
    conf:'1105222729', booked:true,
    detail:'Kai King, newly renovated. In Thu 1/21, out Sat 1/23. $659.44 all in — $238 and $240 a night, plus $89.44 tax and $92 resort fees. Kihei, about ten minutes from Wailea.',
    link:{ url:'https://www.mauicoasthotel.com/', label:'See this hotel' },
    brief:'Kai King, newly renovated. In Thursday the 21st, out Saturday the 23rd. Kihei, about ten minutes from Wailea.',
    access:'Maui Coast Hotel — mauicoasthotel.com, or call them. Under Kelly Polyakov.' },
  { id:'kelly-ogg-lax', party:'kelly', type:'flight', date:'2027-01-23',
    title:'OGG → LAX', subtitle:'Kelly · 2:53pm · First · via HNL', location:'Los Angeles',
    conf:'EUMJIZ', booked:true, departureUtc:'2027-01-24T00:53:00Z',
    detail:'Alaska 1425 Kahului 2:53pm → Honolulu 3:43pm, then Alaska 1400 Honolulu 4:29pm → LAX 11:59pm. First class on both, seat 2D, 46-minute connection. 40,000 Atmos Rewards points + $5.60. Ticket 0272160895098.',
    access:'Alaska Airlines — alaskaair.com or the Alaska app, under Kelly Polyakov. Ticket 0272160895098.',
    brief:'AS 1425 Kahului 2:53pm to Honolulu, then AS 1400 Honolulu 4:29pm to LAX, arriving 11:59pm. First class on both, seat 2D, 46-minute connection.' },
  { id:'kelly-westin-lax', party:'kelly', type:'hotel', date:'2027-01-23', endDate:'2027-01-24',
    title:'Westin Los Angeles Airport', short:'Westin', subtitle:'1 night · Kelly', location:'Los Angeles',
    conf:'94631061', booked:true,
    detail:'Night of the 23rd, on Ben & Dakotah\'s reservation — they check out that morning for Vegas. She lands LAX 11:59pm and flies home 7:30am.',
    tip:'The booking is in Dakotah\'s name. Make sure Kelly is added as a guest and the hotel knows she arrives after midnight, or the room can be released.',
    link:{ url:'https://www.marriott.com/en-us/hotels/laxwi-the-westin-los-angeles-airport/overview/', label:'See this hotel' },
    brief:'Night of the 23rd, on Ben and Dakotah\'s room — they check out that morning. At the airport.',
    access:'On Ben & Dakotah\'s Marriott Bonvoy reservation 94631061. Ask them to add you as a guest before you travel.' },
  { id:'kelly-lax-bwi', party:'kelly', type:'flight', date:'2027-01-24',
    title:'LAX → BWI', subtitle:'Kelly · 7:30am · via CLT', location:'Baltimore',
    booked:true, conf:'DGEMOG', departureUtc:'2027-01-24T15:30:00Z',
    detail:'AA 2808 LAX 7:30am → CLT 3:15pm, then AA 2846 CLT 4:10pm → BWI 5:36pm. Main Cabin, 55-minute connection. 9,500 AAdvantage miles + $5.60.',
    access:'American Airlines — aa.com or the AA app, under Kelly Polyakov.',
    brief:'AA 2808 LAX 7:30am to Charlotte 3:15pm, seat 19D. Then AA 2846 Charlotte 4:10pm to Baltimore 5:36pm, seat 12A. Main Cabin, 55-minute connection. Food for purchase on the first leg.' },
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
export const TRIP_END = '2027-01-27';

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
    '2027-01-15': { where: 'IAD' },
    '2027-01-16': { where: 'LAX', move: 'IAD → LAX' },
    '2027-01-17': { where: 'LAX' },
    '2027-01-18': { where: 'OGG', move: 'LAX → OGG' },
    '2027-01-19': { where: 'OGG' },
    '2027-01-20': { where: 'OGG' },
    '2027-01-21': { where: 'OGG' },
    '2027-01-22': { where: 'OGG' },
    '2027-01-23': { where: 'LAS', move: 'OGG → LAS' },
    '2027-01-24': { where: 'LAS' },
    '2027-01-25': { where: 'LAS' },
    '2027-01-26': { where: 'LAS' },
    '2027-01-27': { where: 'BWI', move: 'LAS → BWI' },
  },
  kelly: {
    '2027-01-15': { where: 'LAX', move: 'BWI → LAX' },
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
      id: i.id,
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
    room: 'Terrace View, 1 King',
    nights: 3,
    program: 'Hilton Honors',
    pointsPerNight: 130000,
    points: 390000,
    conf: '3463135886',
    cashValue: 2982,
    cash: 400,
    pointsPurchased: 80000,
    purchaseConf: '9596-1373-6507-8962-9528',
    transfer: { program: 'Amex Membership Rewards', ratio: 2.293, bonus: 0.147, blended: true },
    note: 'Cash basis $994/night (Garden View, flexible rate), incl. the $55 resort charge but before tax. 80,000 of the points were bought outright for $400 on a 100%-bonus promo (0.5c each); the rest came from Amex transfers at a blended 1:2.29 across 0% and 20% bonus windows.',
  },
  {
    id: 'gj-waldorf',
    conf: '3534263318',
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
    points: 3000,
    program: 'Marriott Bonvoy',
    room: 'Guest room, 1 King',
    conf: '83975525',
    awards: [{ type: 'freeNight35k', count: 1 }],
    cashValue: 194,
    note: 'Covered by a Premier Plus free night award (worth up to 35,000 points) plus a 3,000-point top-off. King room priced at $194 that Thursday including taxes and fees.',
  },
  {
    id: 'bd-nyc-lax',
    party: 'bd',
    type: 'flight',
    title: 'LGA → LAX',
    guests: 'Ben & Dakotah',
    room: 'AA 4579 + AA 814 via Pittsburgh, Main Cabin',
    conf: 'RAOSLV',
    location: 'Los Angeles',
    date: '2027-01-14',
    program: 'AAdvantage',
    cash: 11.20,
    points: 14000,
    cashValue: 1604,
    note: '7,000 miles + $5.60 per person, two people. Main Cabin on the same itinerary now prices at $802 per person — the fare has climbed a long way since this was booked.',
  },
  {
    id: 'bd-hyatt',
    party: 'bd',
    type: 'hotel',
    title: 'Maui Hyatt',
    guests: 'Ben & Dakotah',
    room: '1 King with pull-out sofa, 451 sq ft, non-ocean view',
    conf: '20308273',
    location: 'Maui',
    date: '2027-01-15',
    endDate: '2027-01-19',
    nights: 4,
    program: 'World of Hyatt',
    pointsPerNight: 25000,
    cash: 0,
    points: 100000,
    // Transferred at 1:1, before Chase moved Hyatt to 4:3 — this one is locked in.
    transfer: { program: 'Chase Ultimate Rewards', ratio: 1 },
    cashValue: 2504,
    note: 'King room at 25,000 Hyatt points a night against a $626 cash rate. Hyatt transfers 1:1 from Chase, so this cost 100,000 Chase points. Cash figure is pre-tax, and a $49 nightly resort fee is charged on top.',
  },
  {
    id: 'bd-lax-ogg',
    conf: '7RIAL6',
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
    conf: '7RO9GD',
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
    conf: 'KUHKWQ',
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
    conf: 'DGEMOG',
    note: 'Web-special pricing — the normal saver rate is 12,500. The $5.60 is the security fee. Cash fare was $307 one way.',
  },
  {
    id: 'car-1',
    party: 'bd',
    type: 'other',
    title: 'Rental car — Standard SUV',
    guests: 'Ben & Dakotah',
    location: 'Maui',
    date: '2027-01-15',
    endDate: '2027-01-22',
    cash: 587.52,
    points: 0,
    cashValue: 587.52,
    program: 'Avis',
    conf: '25986700US5',
    room: 'Chevrolet Equinox or similar, automatic, unlimited mileage',
    note: 'Booked with Avis, confirmation 25986700US5. Kahului Airport, pick up Fri 15 Jan at noon, back Fri 22 Jan at noon. 7 days. $417.99 base, $145.61 fees, $23.92 tax. The one car for the whole group.',
  },
  {
    id: 'gj-lax-ogg',
    conf: 'NLHQKB',
    party: 'gj',
    type: 'flight',
    title: 'LAX → OGG',
    guests: 'Gina & John',
    room: 'AS 933, non-stop',
    location: 'Maui',
    date: '2027-01-18',
    cash: 11.20,
    points: 80000,
    program: 'Alaska Mileage Plan',
    cashValue: 3040,
    note: '40,000 Alaska miles per person, two people, plus $5.60 each in taxes. Cash fare $1,520 per person one way.',
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
    conf: 'JNRIIH',
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
    conf: '94631061',
    party: 'bd',
    type: 'hotel',
    title: 'Westin Los Angeles Airport',
    guests: 'Ben & Dakotah',
    room: 'Deluxe, 1 King, sofa bed',
    location: 'Los Angeles',
    date: '2027-01-22',
    endDate: '2027-01-23',
    nights: 1,
    program: 'Marriott Bonvoy',
    cash: 23.20,
    points: 39000,
    cashValue: 243.03,
    note: 'Half of a two-night, 78,000-point reservation — Kelly has the other night. Fed by 31,000 on hand, 37,000 refunded from the original one-night booking, and 6,000 Amex at the 70% bonus.',
  },
  {
    id: 'gj-iad-lax',
    party: 'gj',
    type: 'flight',
    title: 'IAD → LAX',
    guests: 'Gina & John',
    room: 'American, First class, non-stop',
    location: 'Los Angeles',
    date: '2027-01-16',
    conf: 'FKPURW',
    program: 'AAdvantage',
    cash: 11.20,
    points: 38000,
    cashValue: 1547,
    note: '19,000 miles each. Cash fare for the same First seats was $1,547 for the two; Main Select was $707.',
  },
  {
    id: 'gj-hyatt-dulles',
    conf: '40023B28394357',
    party: 'gj',
    type: 'hotel',
    title: 'Hyatt Regency Dulles',
    guests: 'Gina & John',
    room: '1 King with sofabed, 374 sq ft, city view',
    location: 'Washington',
    date: '2027-01-15',
    endDate: '2027-01-16',
    nights: 1,
    cash: 192.05,
    points: 0,
    cashValue: 192.05,
    note: 'Paid in cash at the member rate — $167 room plus $25.05 tax. Cheap enough that points were better saved for Maui.',
  },
  {
    id: 'kelly-maui-coast',
    party: 'kelly',
    type: 'hotel',
    title: 'Maui Coast Hotel',
    guests: 'Kelly',
    room: 'Kai King, newly renovated',
    location: 'Maui',
    date: '2027-01-21',
    endDate: '2027-01-23',
    nights: 2,
    conf: '1105222729',
    cash: 659.44,
    points: 0,
    cashValue: 659.44,
    note: 'Maui Coast Rewards rate, paid in cash. $238 + $240 room, $89.44 tax, $92 resort fees. Booked on Dakotah\'s email.',
  },
  {
    id: 'kelly-hyatt',
    party: 'kelly',
    type: 'hotel',
    title: 'Maui Hyatt',
    guests: 'Kelly',
    room: 'Standard King',
    location: 'Maui',
    date: '2027-01-16',
    endDate: '2027-01-19',
    nights: 3,
    conf: '810606',
    program: 'World of Hyatt',
    cash: 0,
    points: 80000,
    cashValue: 2966.62,
    note: 'Kelly\'s room on Dakotah\'s points. 25,000 + 25,000 + 30,000 a night. Cash for the same nights is $2,966.62 all in — $782 / $812 / $746 room plus $626.62 in occupancy, resort and state tax. Fed by 48,000 Bilt at 1:1 and 42,000 Chase at 4:3.',
  },
  {
    id: 'gj-w-beverly',
    party: 'gj',
    type: 'hotel',
    title: 'W Los Angeles — West Beverly Hills',
    guests: 'Gina & John',
    location: 'Los Angeles',
    date: '2027-01-16',
    endDate: '2027-01-18',
    nights: 2,
    program: 'Marriott Bonvoy',
    cash: 81.20,
    points: 109600,
    cashValue: 1007,
    note: 'Gina & John\'s own Bonvoy points — 109,600 plus $81.20. Member flexible rate for the same nights was $503 each, $1,007 total, taxes and fees included.',
  },
  {
    id: 'kelly-westin-lax',
    party: 'kelly',
    paidBy: 'bd',
    type: 'hotel',
    title: 'Westin Los Angeles Airport',
    guests: 'Kelly',
    location: 'Los Angeles',
    date: '2027-01-23',
    endDate: '2027-01-24',
    nights: 1,
    conf: '94631061',
    program: 'Marriott Bonvoy',
    cash: 23.20,
    points: 39000,
    cashValue: 243.03,
    note: 'Kelly\'s night on Ben & Dakotah\'s two-night reservation and their Bonvoy points. The $46.40 destination fee and tax covers both nights.',
  },
  {
    id: 'kelly-doubletree',
    conf: '92838768',
    party: 'kelly',
    paidBy: 'bd',
    type: 'hotel',
    title: 'DoubleTree by Hilton LA Downtown',
    guests: 'Kelly',
    location: 'Los Angeles',
    date: '2027-01-15',
    endDate: '2027-01-16',
    nights: 1,
    program: 'Hilton Honors',
    cash: 0,
    points: 67000,
    room: '1 King, fridge',
    cashValue: 283.54,
    transfer: { program: 'Amex Membership Rewards', ratio: 2.769 },
    note: 'Kelly\'s night before the Long Beach flight. The Hilton points came from a 26,000-point Amex transfer on 9 Oct that landed 72,000. Cash at the Honors discount was $283.54 all in — $244.02 room plus $39.52 tax.',
  },
  {
    id: 'kelly-ogg-lax',
    party: 'kelly',
    type: 'flight',
    title: 'OGG → LAX',
    guests: 'Kelly',
    room: 'Alaska 1425 + 1400 via Honolulu, First class',
    location: 'Los Angeles',
    date: '2027-01-23',
    conf: 'EUMJIZ',
    program: 'Alaska Mileage Plan',
    paidBy: 'bd',
    cash: 5.60,
    points: 40000,
    cashValue: 1274,
    note: '40,000 Atmos Rewards points + $5.60, on Dakotah\'s account and card. Cash fare for the same First class seats was $1,274 one way.',
  },
  {
    id: 'bd-lax-las',
    party: 'bd',
    type: 'flight',
    title: 'LAX → LAS',
    guests: 'Ben & Dakotah',
    room: 'UA 2741, non-stop, Economy',
    location: 'Las Vegas',
    date: '2027-01-23',
    conf: 'C6JQJK',
    program: 'Avianca LifeMiles',
    cash: 31.20,
    points: 20000,
    cashValue: 322,
    note: '10,000 LifeMiles each plus $31.20 in taxes and fees. Cash fare was $161 a person for United Economy Standard, $322 for the two. Changes cost $150, cancelling $50.',
  },
  {
    id: 'gj-bellagio',
    party: 'gj',
    type: 'hotel',
    title: 'Bellagio Las Vegas',
    guests: 'Gina & John',
    room: 'Restore Premier King',
    location: 'Las Vegas',
    date: '2027-01-26',
    endDate: '2027-01-27',
    nights: 1,
    conf: '6M03Q0CCG6',
    cash: 0,
    points: 0,
    cashValue: 369,
    note: 'Comped on an MGM Rewards offer — the room was $369 and the offer took all of it. Watch for a resort fee at checkout; Caesars charged one on their comped room.',
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
