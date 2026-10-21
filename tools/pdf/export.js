// Dump the app's own data into the shape build.py reads.
// Unbooked items are dropped: a traveller's pack should only carry what is real.
const path = require('path');
const d = require(path.join(__dirname, '..', '..', 'lib', 'data.js'));

const out = {};
for (const key of ['bd', 'gj', 'kelly']) {
  out[key] = {
    label: d.PARTIES[key].label,
    items: d.ITINERARY
      .filter(i => i.party === key && i.booked)
      .map(i => ({
        type: i.type, date: i.date, endDate: i.endDate || null,
        title: i.title, subtitle: i.subtitle || null,
        brief: i.brief || null, detail: i.detail || null,
        access: i.access || null, conf: i.conf || null,
        booked: !!i.booked, tip: i.tip || null,
        bags: i.bags || null, bagsWarn: !!i.bagsWarn, lounges: i.lounges || null,
      })),
  };
}
process.stdout.write(JSON.stringify(out, null, 1));
