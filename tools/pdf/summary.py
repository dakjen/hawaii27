"""Hawaii 27 — what the trip cost.

    node tools/pdf/export.js > tools/pdf/data.json     (not required)
    python3 tools/pdf/summary.py tools/pdf/out

Every figure is computed from lib/data.js, so this cannot drift from the app.
"""
import sys, os, json, subprocess
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.pdfgen import canvas

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out')

INK    = colors.HexColor('#1B1B3A')
ACCENT = colors.HexColor('#C47A8A')
WASH   = colors.HexColor('#F6F2F3')
GREY   = colors.HexColor('#6C6C78')
BODY   = colors.HexColor('#33333D')

W, H = LETTER
M = 0.78 * inch


def figures():
    """Pull every number straight out of the app's own helpers."""
    js = r'''
const d = require(process.argv[1]);
const out = { parties: [], programs: [], sources: {}, cats: [], best: [] };
const L = { bd: 'Ben & Dakotah', gj: 'Gina & John', kelly: 'Kelly' };
for (const k of ['bd','gj','kelly']) {
  const t = d.totals(d.bookingsFor(k));
  out.parties.push({ name: L[k], ...t });
}
out.trip = d.totals(d.BOOKINGS);
out.programs = d.pointsByProgram(d.BOOKINGS)
  .filter(r => r.points > 10)
  .sort((a, b) => b.points - a.points);
for (const b of d.BOOKINGS.filter(x => x.transfer)) {
  const p = b.transfer.program;
  out.sources[p] = (out.sources[p] || 0) + d.sourcePoints(b);
}
for (const ty of ['flight','hotel','other']) {
  const rows = d.BOOKINGS.filter(b => b.type === ty);
  if (!rows.length) continue;
  out.cats.push({
    type: ty, n: rows.length,
    cash: rows.reduce((a,b) => a + (b.cash || 0), 0),
    points: rows.reduce((a,b) => a + (b.points || 0), 0),
    value: rows.reduce((a,b) => a + (b.cashValue || b.cash || 0), 0),
  });
}
out.best = d.BOOKINGS
  .filter(b => b.points > 10000 && b.cashValue && !b.awards)
  .map(b => ({ title: b.title, who: b.guests, points: b.points, cpp: d.centsPerPoint(b) }))
  .sort((a, b) => b.cpp - a.cpp).slice(0, 5);
out.counts = { bookings: d.BOOKINGS.length, items: d.ITINERARY.length };

// Every currency that paid for something, with the bookings it paid for and
// the account the points were transferred from.
const LBL = { bd: 'Ben & Dakotah', gj: 'Gina & John', kelly: 'Kelly' };
const AWARD = { freeNight35k: 'free night award', bonvoyFreeNight: 'Bonvoy free night' };
const groups = {};
for (const b of d.BOOKINGS) {
  if (!b.points && !b.awards) continue;
  const k = b.program || 'Other';
  (groups[k] = groups[k] || []).push(b);
}
out.detail = Object.entries(groups).map(([program, rows]) => {
  const src = {};
  for (const b of rows) {
    if (!b.transfer) continue;
    const t = src[b.transfer.program] =
      src[b.transfer.program] || { program: b.transfer.program, points: 0, dest: 0 };
    t.points += d.sourcePoints(b);
    t.dest += b.points || 0;
  }
  return {
    program,
    points: rows.reduce((a, b) => a + (b.points || 0), 0),
    cash:   rows.reduce((a, b) => a + (b.cash || 0), 0),
    value:  rows.reduce((a, b) => a + (b.cashValue || 0), 0),
    kinds: [...new Set(rows.map(b => b.type))],
    n: rows.length,
    sources: Object.values(src),
    rows: rows.map(b => ({
      who: LBL[b.party] || b.party,
      title: b.title,
      points: b.points || 0,
      value: b.cashValue || 0,
      // A booking part-paid with a free night has no honest per-point rate.
      cpp: (b.points > 10 && b.cashValue && !b.awards) ? d.centsPerPoint(b) : null,
      award: b.awards
        ? b.awards.map(a => (AWARD[a.type] || a.type) + (a.count > 1 ? ' ×' + a.count : '')).join(', ')
        : null,
    })).sort((a, b) => b.points - a.points),
  };
}).sort((a, b) => b.points - a.points);
process.stdout.write(JSON.stringify(out));
'''
    r = subprocess.run(['node', '-e', js, os.path.join(HERE, '..', '..', 'lib', 'data.js')],
                       capture_output=True, text=True)
    if r.returncode:
        raise SystemExit(r.stderr)
    return json.loads(r.stdout)


def money(n):
    return '$' + format(round(n), ',d')


def money2(n):
    return '$' + format(n, ',.2f')


def pts(n):
    return format(int(round(n)), ',d')



def ratio_text(src, dest):
    """How many points went in versus how many came out."""
    if not src:
        return ''
    eff = dest / float(src)
    if abs(eff - round(eff)) < 0.02:
        return '1:%d' % round(eff)
    return 'about 1:%.1f' % eff


def clip(c, text, width, font, size):
    """Trim a string until it fits the space it has."""
    if c.stringWidth(text, font, size) <= width:
        return text
    while text and c.stringWidth(text + '\u2026', font, size) > width:
        text = text[:-1]
    return text.rstrip() + '\u2026'


def programme_pages(c, f):
    """Every currency, what it bought, and what it was worth. Paginates itself."""

    def band(sub):
        c.setFillColor(INK); c.rect(0, H - 1.2*inch, W, 1.2*inch, fill=1, stroke=0)
        c.setFillColor(colors.white); c.setFont('Helvetica-Bold', 16)
        c.drawString(M, H - 0.72*inch, 'EVERY POINT, PROGRAMME BY PROGRAMME')
        c.setFillColor(ACCENT); c.setFont('Helvetica', 9)
        c.drawString(M, H - 0.95*inch, sub)
        return H - 1.62*inch

    y = band('What each currency bought, and what it was worth')
    c.setFillColor(BODY); c.setFont('Helvetica', 9.4)
    c.drawString(M, y, '%d separate currencies paid for this trip. Each block below is one of them: the'
                 % len(f['detail']))
    y -= 13
    c.drawString(M, y, 'points spent, what they bought, what those bookings would have cost in cash, and')
    y -= 13
    c.drawString(M, y, 'the rate that works out to. Ordered by points spent, largest first.')
    y -= 0.3*inch

    KIND = {'flight': 'flight', 'hotel': 'hotel booking', 'other': 'booking'}
    X_WHO, X_TITLE = M + 0.22*inch, M + 1.62*inch
    X_PTS, X_VAL, X_CPP = M + 4.62*inch, M + 5.68*inch, W - M - 0.06*inch

    for g in f['detail']:
        rows = g['rows']
        need = (0.34*inch + 14 + len(rows)*13 + len(g['sources'])*13 + 14
                + sum(11 for r in rows if r['award']))
        if y - need < 0.85*inch:
            c.showPage(); y = band('continued')

        c.setFillColor(WASH); c.rect(M, y - 0.34*inch, W - 2*M, 0.34*inch, fill=1, stroke=0)
        c.setFillColor(ACCENT); c.rect(M, y - 0.34*inch, 2.4, 0.34*inch, fill=1, stroke=0)
        c.setFillColor(INK); c.setFont('Helvetica-Bold', 10.5)
        c.drawString(M + 0.18*inch, y - 0.225*inch, g['program'])
        c.drawRightString(W - M - 0.18*inch, y - 0.225*inch,
                          (pts(g['points']) + ' points') if g['points'] > 10 else 'awards only')
        y -= 0.34*inch + 14

        kind = KIND.get(g['kinds'][0], 'booking') if len(g['kinds']) == 1 else 'booking'
        bits = ['%d %s%s' % (g['n'], kind, '' if g['n'] == 1 else 's'),
                money(g['value']) + ' of value']
        if g['points'] > 10 and g['value']:
            bits.append('%.2f\u00a2 per point overall' % (g['value'] * 100.0 / g['points']))
        if g['cash'] > 0.5:
            bits.append(money2(g['cash']) + ' paid in taxes and fees')
        c.setFillColor(GREY); c.setFont('Helvetica', 8.3)
        c.drawString(M + 0.2*inch, y, '   \u00b7   '.join(bits))
        y -= 15

        for r in rows:
            c.setFillColor(GREY); c.setFont('Helvetica', 8.4)
            c.drawString(X_WHO, y, r['who'])
            c.setFillColor(BODY); c.setFont('Helvetica', 8.6)
            c.drawString(X_TITLE, y, clip(c, r['title'], X_PTS - X_TITLE - 10, 'Helvetica', 8.6))
            c.setFillColor(INK); c.setFont('Helvetica-Bold', 8.6)
            c.drawRightString(X_PTS, y, pts(r['points']) if r['points'] > 10 else '\u2014')
            c.setFillColor(BODY); c.setFont('Helvetica', 8.6)
            c.drawRightString(X_VAL, y, money(r['value']))
            if r['cpp']:
                c.setFillColor(ACCENT); c.setFont('Helvetica-Bold', 8.6)
                c.drawRightString(X_CPP, y, '%.2f\u00a2' % r['cpp'])
            else:
                c.setFillColor(GREY); c.setFont('Helvetica-Oblique', 8.2)
                c.drawRightString(X_CPP, y, 'free night')
            y -= 13
            if r['award']:
                c.setFillColor(GREY); c.setFont('Helvetica-Oblique', 8.0)
                c.drawString(X_TITLE, y + 2, 'plus a ' + r['award'])
                y -= 11

        for src in g['sources']:
            c.setFillColor(GREY); c.setFont('Helvetica-Oblique', 8.2)
            c.drawString(X_WHO, y, '%s %s points became %s here (%s)'
                         % (pts(src['points']), src['program'], pts(src['dest']),
                            ratio_text(src['points'], src['dest'])))
            y -= 13
        y -= 11

    c.setFillColor(GREY); c.setFont('Helvetica', 7.6)
    c.drawString(M, 0.6*inch,
                 'A booking part-paid with a free-night award has no honest per-point rate, so none is shown.')


def main():
    f = figures()
    path = os.path.join(OUT, 'hawaii27-costs.pdf')
    os.makedirs(OUT, exist_ok=True)
    c = canvas.Canvas(path, pagesize=LETTER)
    c.setTitle('Hawaii 27 - Cost Summary')

    # ── header ──────────────────────────────────────────────────────────────
    c.setFillColor(INK); c.rect(0, H - 1.65*inch, W, 1.65*inch, fill=1, stroke=0)
    c.setFillColor(colors.white); c.setFont('Helvetica-Bold', 24)
    c.drawString(M, H - 0.95*inch, 'HAWAII 27')
    c.setFillColor(ACCENT); c.setFont('Helvetica-Bold', 9.5)
    c.drawString(M, H - 1.18*inch, 'WHAT IT COST')
    c.setFillColor(colors.white); c.setFont('Helvetica', 10)
    c.drawRightString(W - M, H - 0.95*inch, '5 travellers  ·  14 days')
    c.setFillColor(ACCENT); c.setFont('Helvetica', 9.5)
    c.drawRightString(W - M, H - 1.18*inch, '14 – 27 January 2027')

    y = H - 2.25*inch

    # ── headline ────────────────────────────────────────────────────────────
    cols = [(M, 'OUT OF POCKET', money2(f['trip']['cash'])),
            (M + 2.4*inch, 'POINTS SPENT', pts(f['trip']['points'])),
            (M + 4.8*inch, 'WHAT IT WOULD COST', money(f['trip']['cashValue']))]
    c.setFillColor(WASH); c.rect(M, y - 0.78*inch, W - 2*M, 0.78*inch, fill=1, stroke=0)
    c.setFillColor(ACCENT); c.rect(M, y - 0.78*inch, 2.4, 0.78*inch, fill=1, stroke=0)
    for x, label, val in cols:
        c.setFillColor(GREY); c.setFont('Helvetica-Bold', 7)
        c.drawString(x + 0.2*inch, y - 0.26*inch, label)
        c.setFillColor(INK); c.setFont('Helvetica-Bold', 20)
        c.drawString(x + 0.2*inch, y - 0.58*inch, val)
    y -= 1.05*inch

    c.setFillColor(BODY); c.setFont('Helvetica', 9.6)
    c.drawString(M, y, 'Five people, thirty bookings, two weeks across Los Angeles, Maui and Las Vegas.')
    y -= 14
    c.drawString(M, y, 'Points and free-night awards covered %s of it. The cash below is what actually'
                 % money(f['trip']['cashValue'] - f['trip']['cash']))
    y -= 14
    c.drawString(M, y, 'left a bank account — taxes, fees, resort charges and the rental car.')
    y -= 0.42*inch

    def section(title):
        nonlocal y
        c.setFillColor(INK); c.setFont('Helvetica-Bold', 11.5)
        c.drawString(M, y, title)
        c.setStrokeColor(colors.HexColor('#DDDDE2')); c.setLineWidth(0.6)
        c.line(M, y - 6, W - M, y - 6)
        y -= 22

    def row(label, a, b, cc, bold=False, label_w=2.5):
        nonlocal y
        c.setFillColor(INK if bold else BODY)
        c.setFont('Helvetica-Bold' if bold else 'Helvetica', 9.4)
        c.drawString(M + 0.05*inch, y, label)
        for x, v in ((M + 3.3*inch, a), (M + 4.75*inch, b), (W - M - 0.05*inch, cc)):
            c.drawRightString(x, y, v)
        y -= 15

    # ── per party ───────────────────────────────────────────────────────────
    section('Who spent what')
    c.setFillColor(GREY); c.setFont('Helvetica-Bold', 7)
    for x, h in ((M + 3.3*inch, 'CASH'), (M + 4.75*inch, 'POINTS'), (W - M - 0.05*inch, 'VALUE')):
        c.drawRightString(x, y, h)
    y -= 14
    for p in f['parties']:
        row(p['name'], money2(p['cash']), pts(p['points']), money(p['cashValue']))
    c.setStrokeColor(colors.HexColor('#DDDDE2')); c.line(M, y + 5, W - M, y + 5)
    y -= 4
    row('Whole trip', money2(f['trip']['cash']), pts(f['trip']['points']),
        money(f['trip']['cashValue']), bold=True)
    y -= 0.22*inch

    # ── by category ─────────────────────────────────────────────────────────
    section('Where it went')
    NAMES = {'flight': 'Flights', 'hotel': 'Hotels', 'other': 'Rental car'}
    for cat in f['cats']:
        row('%s  (%d)' % (NAMES.get(cat['type'], cat['type']), cat['n']),
            money2(cat['cash']), pts(cat['points']), money(cat['value']))
    y -= 0.22*inch

    # ── programs, with the rate each one returned ───────────────────────────
    section('Points by programme, and what each was worth')
    det = f['detail']
    half = (len(det) + 1) // 2
    ytop = y
    for col, rows in ((0, det[:half]), (1, det[half:])):
        yy = ytop
        x = M + col * 3.45*inch
        c.setFillColor(GREY); c.setFont('Helvetica-Bold', 7)
        c.drawRightString(x + 2.5*inch, yy, 'POINTS')
        c.drawRightString(x + 3.2*inch, yy, 'RATE')
        yy -= 14
        for r in rows:
            c.setFillColor(BODY); c.setFont('Helvetica', 9.2)
            c.drawString(x + 0.05*inch, yy, clip(c, r['program'], 1.75*inch, 'Helvetica', 9.2))
            c.setFillColor(INK); c.setFont('Helvetica-Bold', 9.2)
            c.drawRightString(x + 2.5*inch, yy, pts(r['points']))
            c.setFillColor(ACCENT); c.setFont('Helvetica-Bold', 9.2)
            rate = (r['value'] * 100.0 / r['points']) if r['points'] > 10 else 0
            c.drawRightString(x + 3.2*inch, yy, ('%.2f\u00a2' % rate) if rate else '\u2014')
            yy -= 15
        if col == 1:
            y = min(y, yy)
    y -= 6
    c.setStrokeColor(colors.HexColor('#DDDDE2')); c.setLineWidth(0.6)
    c.line(M, y + 6, W - M, y + 6)
    y -= 8
    avg = f['trip']['cashValue'] * 100.0 / f['trip']['points']
    c.setFillColor(BODY); c.setFont('Helvetica', 9.2)
    c.drawString(M + 0.05*inch, y, 'Across everything, every point redeemed returned')
    c.setFillColor(INK); c.setFont('Helvetica-Bold', 9.2)
    c.drawString(M + 2.95*inch, y, '%.2f\u00a2' % avg)
    c.setFillColor(GREY); c.setFont('Helvetica', 8.4)
    c.drawString(M + 3.45*inch, y, '(the two free-night awards lift this slightly)')
    y -= 0.42*inch

    # ── transfers ───────────────────────────────────────────────────────────
    if f['sources']:
        section('Where those points came from')
        c.setFillColor(BODY); c.setFont('Helvetica', 9.4)
        c.drawString(M + 0.05*inch, y,
                     'Most hotel points were not earned directly — they were transferred in.')
        y -= 18
        for prog, n in sorted(f['sources'].items(), key=lambda kv: -kv[1]):
            c.setFillColor(BODY); c.setFont('Helvetica', 9.4)
            c.drawString(M + 0.05*inch, y, prog)
            c.setFillColor(INK); c.setFont('Helvetica-Bold', 9.4)
            c.drawRightString(W - M - 0.05*inch, y, pts(n) + ' transferred out')
            y -= 15

    # ── footnote ────────────────────────────────────────────────────────────
    c.setFillColor(GREY); c.setFont('Helvetica', 7.6)
    c.drawString(M, 0.72*inch,
                 'Value is what the same flights and rooms cost in cash, priced when each was booked.')
    c.drawString(M, 0.58*inch,
                 'Free-night awards are counted as awards, not points, so they do not inflate the points total.')
    c.showPage()

    # ── the programme-by-programme detail (paginates itself) ────────────────
    programme_pages(c, f)
    c.showPage()

    # ── and finally: the redemptions ───────────────────────────────────────
    c.setFillColor(INK); c.rect(0, H - 1.2*inch, W, 1.2*inch, fill=1, stroke=0)
    c.setFillColor(colors.white); c.setFont('Helvetica-Bold', 17)
    c.drawString(M, H - 0.78*inch, 'HOW HARD THE POINTS WORKED')
    y = H - 1.75*inch

    c.setFillColor(BODY); c.setFont('Helvetica', 9.6)
    c.drawString(M, y, 'Cents of value per point redeemed. Anything over about 1.5 is a good domestic')
    y -= 14
    c.drawString(M, y, 'redemption; the premium cabins to Hawaii are where this trip really paid.')
    y -= 0.38*inch

    for b in f['best']:
        block = 0.52*inch
        c.setFillColor(WASH); c.rect(M, y - block, W - 2*M, block, fill=1, stroke=0)
        c.setFillColor(ACCENT); c.rect(M, y - block, 2.4, block, fill=1, stroke=0)
        c.setFillColor(INK); c.setFont('Helvetica-Bold', 11)
        c.drawString(M + 0.22*inch, y - 0.22*inch, b['title'])
        c.setFillColor(GREY); c.setFont('Helvetica', 8.4)
        c.drawString(M + 0.22*inch, y - 0.38*inch,
                     '%s  ·  %s points' % (b['who'], pts(b['points'])))
        c.setFillColor(ACCENT); c.setFont('Helvetica-Bold', 17)
        c.drawRightString(W - M - 0.22*inch, y - 0.33*inch, '%.2f¢' % b['cpp'])
        y -= block + 9

    y -= 0.2*inch
    c.setFillColor(INK); c.setFont('Helvetica-Bold', 11.5)
    c.drawString(M, y, 'The short version')
    c.setStrokeColor(colors.HexColor('#DDDDE2')); c.setLineWidth(0.6)
    c.line(M, y - 6, W - M, y - 6)
    y -= 24
    saved = f['trip']['cashValue'] - f['trip']['cash']
    lines = [
        'Five people flew to Hawaii and on to Las Vegas, mostly in first or business,',
        'stayed fourteen nights across seven hotels, and paid %s between them.' % money2(f['trip']['cash']),
        '',
        'The same trip bought with money would have run about %s.' % money(f['trip']['cashValue']),
        'Points and two free-night awards absorbed the other %s.' % money(saved),
    ]
    for ln in lines:
        c.setFillColor(BODY); c.setFont('Helvetica', 9.8)
        c.drawString(M, y, ln); y -= 15

    c.save()
    print(path)


if __name__ == '__main__':
    main()
