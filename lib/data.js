function appleMap(name, ll) {
  return `https://maps.apple.com/?q=${encodeURIComponent(name)}&ll=${ll}&dirflg=d`;
}

// Placeholder itinerary — fill with kids/DJ/BP trip details.
export const ITINERARY = [];

// Traveler metadata — used when the 3-traveler restructure lands.
export const TRAVELERS = {
  kids: { id: 'kids', displayName: 'The Kids', itinerary: [] },
  dj:   { id: 'dj',   displayName: 'DJ',       itinerary: [] },
  bp:   { id: 'bp',   displayName: 'BP',       itinerary: [] },
};
export const TRAVELER_IDS = Object.keys(TRAVELERS);

export const DESTINATIONS = {
  'Honolulu, Oahu': {
    emoji: '🌺', tagline: 'Waikiki & the South Shore',
    facts: [
      'Waikiki\'s sand was imported from Manhattan Beach, CA in the 1920s — the whole beach is man-made.',
      'Diamond Head formed in a single eruption 300,000 years ago. Hike to the top in ~45 minutes.',
      'Hawaii is the only US state that grows coffee commercially.',
    ],
    tips: [
      { icon:'🏔️', text:'Hike Diamond Head before 7am — beat the heat and crowds.' },
      { icon:'🌅', text:'Sunset at House Without a Key at the Halekulani — free live hula.' },
      { icon:'🚌', text:'The Bus covers the whole island for a few bucks. Google Maps routes work.' },
      { icon:'🛒', text:'Foodland Farms has incredible fresh poke.' },
    ],
    eats: [
      { name:'Ono Seafood', vibe:'Local poke spot since 1995. Never-frozen ahi. Come before noon.', maps:appleMap('Ono Seafood Honolulu','21.2755,-157.8183'), order:'Shoyu ahi + spicy ahi.', price:'$10–18' },
      { name:'Rainbow Drive-In', vibe:'Plate lunch institution since 1961. The loco moco is the gold standard.', maps:appleMap('Rainbow Drive-In Honolulu','21.2786,-157.8243'), order:'Loco Moco.', price:'$8–14' },
    ],
  },
  'Maui': {
    emoji: '🌴', tagline: 'The Valley Isle',
    facts: [
      'The Road to Hana has 620 curves and 59 bridges — 46 are one-lane.',
      'Haleakalā\'s summit is 10,023 ft — sunrise above the clouds.',
      'Lahaina was Hawaii\'s royal capital until 1845.',
    ],
    tips: [
      { icon:'🌋', text:'Haleakalā sunrise needs a reservation 60 days out — book early.' },
      { icon:'🚗', text:'Drive Hana clockwise (through Ke\'anae). Less traffic.' },
      { icon:'🐢', text:'Ho\'okipa Beach at sunset — sea turtles come ashore.' },
    ],
    eats: [
      { name:'Mama\'s Fish House', vibe:'Iconic Maui splurge. Menu names the fisherman who caught your fish.', maps:appleMap('Mama\'s Fish House Maui','20.9339,-156.3820'), order:'Whatever the day boat brought.', price:'$$$$' },
    ],
  },
  'Big Island': {
    emoji: '🌋', tagline: 'Kona & Hilo',
    facts: [
      'Mauna Kea from base (below sea level) to summit is taller than Everest.',
      'The Big Island is still growing — Kilauea has added over 500 acres since 1983.',
      'Kona coffee is grown on volcanic slopes at 1,500–3,000 ft.',
    ],
    tips: [
      { icon:'🌋', text:'Volcanoes NP at night — glowing lava views if there\'s an active eruption.' },
      { icon:'⭐', text:'Mauna Kea stargazing tour. Cold at summit — bring layers.' },
      { icon:'☕', text:'Kona coffee farm tours — beans direct from source.' },
    ],
    eats: [
      { name:'Da Poke Shack', vibe:'Kailua-Kona poke spot beloved by locals.', maps:appleMap('Da Poke Shack Kona','19.6297,-155.9973'), order:'Pele\'s Kiss (spicy ahi).', price:'$12–18' },
    ],
  },
  'Kauai': {
    emoji: '🏝️', tagline: 'The Garden Isle',
    facts: [
      'Kauai is the oldest of the main Hawaiian islands at ~5 million years.',
      'Mount Waiʻaleʻale is one of the wettest spots on Earth (~450 in/yr).',
      'No building on Kauai is taller than a coconut palm — by law.',
    ],
    tips: [
      { icon:'🚁', text:'Helicopter tour of the Nā Pali Coast — the only way to see most of it.' },
      { icon:'🏞️', text:'Waimea Canyon — the "Grand Canyon of the Pacific". Early = clear views.' },
      { icon:'🏖️', text:'Poipu Beach for snorkeling; Hanalei Bay for chill sunsets.' },
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
