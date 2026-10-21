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
for (const b of d.BOOKINGS) {
  for (const r of d.sourceBreakdown(b)) {
    if (r.earned) continue;
    out.sources[r.program] = (out.sources[r.program] || 0) + r.sourcePoints;
  }
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
out.hilton = d.HILTON_LEDGER;

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
    for (const r of d.sourceBreakdown(b)) {
      if (r.earned) continue;
      const t = src[r.program] = src[r.program] || { program: r.program, points: 0, dest: 0 };
      t.points += r.sourcePoints;
      t.dest += r.destPoints;
    }
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

// What the market reckons each currency is worth, against what we got.
const BM = d.BENCHMARK.cents;
out.benchmark = { source: d.BENCHMARK.source, asOf: d.BENCHMARK.asOf };
out.compare = out.detail.map(g => ({
  program: g.program,
  points: g.points,
  value: g.value,
  ours: g.points > 10 ? g.value * 100 / g.points : null,
  market: BM[g.program] || null,
  fedPoints: 0,
  fed: false,
}));
// Transfer currencies: the honest rate is per point we actually gave up.
const srcAgg = {};
for (const b of d.BOOKINGS) {
  for (const r of d.sourceBreakdown(b)) {
    if (r.earned) continue;
    const t = srcAgg[r.program] =
      srcAgg[r.program] || { program: r.program, out: 0, value: 0, into: {} };
    t.out += r.sourcePoints;
    t.value += r.value;
    t.into[b.program] = (t.into[b.program] || 0) + r.destPoints;
    const row = out.compare.find(x => x.program === b.program);
    if (row) row.fedPoints = (row.fedPoints || 0) + r.destPoints;
  }
}
// Pooled account top-ups, apportioned across that programme's redemptions.
for (const at of d.ACCOUNT_TRANSFERS) {
  const g = out.detail.find(x => x.program === at.into);
  if (!g || !g.points) continue;
  const dest = Math.round(at.points * (at.ratio ?? 1));
  const t = srcAgg[at.program] =
    srcAgg[at.program] || { program: at.program, out: 0, value: 0, into: {} };
  t.out += at.points;
  t.value += g.value * dest / g.points;
  t.into[at.into] = (t.into[at.into] || 0) + dest;
  const row = out.compare.find(x => x.program === at.into);
  if (row) row.fedPoints = (row.fedPoints || 0) + dest;
}
// A row only earns the dagger when bank points paid for most of it.
for (const r of out.compare) r.fed = r.points > 10 && (r.fedPoints || 0) / r.points >= 0.5;
out.transfers = Object.values(srcAgg).map(t => ({
  program: t.program,
  out: t.out,
  value: t.value,
  ours: t.value * 100 / t.out,
  market: BM[t.program] || null,
  into: Object.entries(t.into).map(([pr, n]) => ({ program: pr, points: n }))
                              .sort((a, b) => b.points - a.points),
})).sort((a, b) => b.out - a.out);
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



def market_page(c, f):
    """Our rate against the published market rate, including the bank points."""
    c.setFillColor(INK); c.rect(0, H - 1.2*inch, W, 1.2*inch, fill=1, stroke=0)
    c.setFillColor(colors.white); c.setFont('Helvetica-Bold', 16)
    c.drawString(M, H - 0.72*inch, 'YOUR RATE AGAINST THE MARKET')
    c.setFillColor(ACCENT); c.setFont('Helvetica', 9)
    c.drawString(M, H - 0.95*inch, 'Benchmarked against %s' % f['benchmark']['source'])
    y = H - 1.62*inch

    c.setFillColor(BODY); c.setFont('Helvetica', 9.4)
    for ln in [
        'A point is only worth what you get out of it. The benchmark column is what the',
        'market reckons each currency is typically worth; the column beside it is what this',
        'trip actually extracted. Where you transferred bank points in, the real rate is the',
        'one per point you gave up \u2014 that is the first section.',
    ]:
        c.drawString(M, y, ln); y -= 13
    y -= 0.26*inch

    # ── the bank points ────────────────────────────────────────────────────
    c.setFillColor(INK); c.setFont('Helvetica-Bold', 11.5)
    c.drawString(M, y, 'The bank points you actually spent')
    c.setStrokeColor(colors.HexColor('#DDDDE2')); c.setLineWidth(0.6)
    c.line(M, y - 6, W - M, y - 6)
    y -= 24

    for t in f['transfers']:
        block = 0.82*inch
        c.setFillColor(WASH); c.rect(M, y - block, W - 2*M, block, fill=1, stroke=0)
        c.setFillColor(ACCENT); c.rect(M, y - block, 2.4, block, fill=1, stroke=0)
        c.setFillColor(INK); c.setFont('Helvetica-Bold', 11)
        c.drawString(M + 0.22*inch, y - 0.22*inch, t['program'])
        c.setFont('Helvetica-Bold', 11)
        c.drawRightString(W - M - 0.22*inch, y - 0.22*inch, pts(t['out']) + ' points out')
        c.setFillColor(GREY); c.setFont('Helvetica', 8.4)
        became = ', '.join('%s %s' % (pts(i['points']), i['program']) for i in t['into'])
        c.drawString(M + 0.22*inch, y - 0.4*inch,
                     clip(c, 'Became ' + became, W - 2*M - 0.5*inch, 'Helvetica', 8.4))
        c.drawString(M + 0.22*inch, y - 0.55*inch, 'which bought ' + money2(t['value']) + ' of travel')

        c.setFillColor(GREY); c.setFont('Helvetica-Bold', 7)
        c.drawString(M + 0.22*inch, y - 0.725*inch, 'YOUR RATE')
        c.drawString(M + 1.95*inch, y - 0.725*inch, 'MARKET')
        c.setFillColor(ACCENT if t['ours'] >= t['market'] else GREY)
        c.setFont('Helvetica-Bold', 11)
        c.drawString(M + 1.0*inch, y - 0.72*inch, '%.2f\u00a2' % t['ours'])
        c.setFillColor(BODY); c.setFont('Helvetica', 11)
        c.drawString(M + 2.7*inch, y - 0.72*inch, '%.2f\u00a2' % t['market'])
        mult = t['ours'] / t['market']
        c.setFillColor(ACCENT if mult >= 1 else GREY)
        c.setFont('Helvetica-Bold', 9.4)
        c.drawRightString(W - M - 0.22*inch, y - 0.72*inch,
                          '%.2f\u00d7 the benchmark' % mult)
        y -= block + 10
    y -= 0.14*inch

    # ── every programme ────────────────────────────────────────────────────
    c.setFillColor(INK); c.setFont('Helvetica-Bold', 11.5)
    c.drawString(M, y, 'Every programme, your rate against the benchmark')
    c.setStrokeColor(colors.HexColor('#DDDDE2')); c.setLineWidth(0.6)
    c.line(M, y - 6, W - M, y - 6)
    y -= 22

    X_PTS, X_OURS, X_MKT, X_MULT = M + 3.0*inch, M + 4.1*inch, M + 5.1*inch, W - M - 0.05*inch
    c.setFillColor(GREY); c.setFont('Helvetica-Bold', 7)
    c.drawRightString(X_PTS, y, 'POINTS')
    c.drawRightString(X_OURS, y, 'YOU GOT')
    c.drawRightString(X_MKT, y, 'MARKET')
    c.drawRightString(X_MULT, y, 'VS BENCHMARK')
    y -= 15

    for r in f['compare']:
        if not r['market'] or not r['ours']:
            continue
        c.setFillColor(BODY); c.setFont('Helvetica', 9.2)
        label = r['program'] + ('  \u2020' if r['fed'] else '')
        c.drawString(M + 0.05*inch, y, label)
        c.setFillColor(INK); c.setFont('Helvetica-Bold', 9.2)
        c.drawRightString(X_PTS, y, pts(r['points']))
        mult = r['ours'] / r['market']
        c.setFillColor(ACCENT if mult >= 1 else GREY)
        c.setFont('Helvetica-Bold', 9.2)
        c.drawRightString(X_OURS, y, '%.2f\u00a2' % r['ours'])
        c.setFillColor(BODY); c.setFont('Helvetica', 9.2)
        c.drawRightString(X_MKT, y, '%.2f\u00a2' % r['market'])
        c.setFillColor(ACCENT if mult >= 1 else GREY)
        c.setFont('Helvetica-Bold', 9.2)
        c.drawRightString(X_MULT, y, '%.2f\u00d7' % mult)
        y -= 15

    y -= 10
    c.setFillColor(GREY); c.setFont('Helvetica', 8.2)
    c.drawString(M + 0.05*inch, y,
                 '\u2020 Bought with bank points, so this row is not your real rate \u2014 the section above is.')
    y -= 12
    c.drawString(M + 0.05*inch, y,
                 'Benchmark valuations published %s. They are typical redemptions, not best or worst cases.'
                 % f['benchmark']['asOf'])



def hilton_page(c, f):
    """Every Hilton point that went in from 25 March, and every one that came out."""
    L = f['hilton']
    c.setFillColor(INK); c.rect(0, H - 1.2*inch, W, 1.2*inch, fill=1, stroke=0)
    c.setFillColor(colors.white); c.setFont('Helvetica-Bold', 16)
    c.drawString(M, H - 0.72*inch, 'THE HILTON ACCOUNTS, FROM 25 MARCH')
    c.setFillColor(ACCENT); c.setFont('Helvetica', 9)
    c.drawString(M, H - 0.95*inch, 'The day the first points purchase for this trip went in')
    y = H - 1.62*inch

    c.setFillColor(BODY); c.setFont('Helvetica', 9.4)
    for ln in ['Hilton is the biggest points line of the trip and the hardest to read, because the',
               'rooms were paid from balances rather than from single transfers. So here is the',
               'account itself: everything credited since 25 March, and the four rooms it paid for.']:
        c.drawString(M, y, ln); y -= 13
    y -= 0.22*inch

    KIND = {'buy': 'bought', 'amex': 'transferred', 'refund': 'refunded'}
    for acct in L['accounts']:
        c.setFillColor(INK); c.setFont('Helvetica-Bold', 11.5)
        c.drawString(M, y, acct['who'] + "\u2019s account")
        c.setStrokeColor(colors.HexColor('#DDDDE2')); c.setLineWidth(0.6)
        c.line(M, y - 6, W - M, y - 6)
        y -= 20

        tot = {'buy': 0, 'amex': 0, 'refund': 0}
        amex_known = 0
        amex_unknown = 0
        cash = 0
        for r in acct['credits']:
            tot[r['kind']] += r['points']
            if r['kind'] == 'refund':
                continue
            cash += r.get('cash', 0)
            if r['kind'] == 'amex':
                if r.get('amex'): amex_known += r['amex']
                else: amex_unknown += r['points']
            c.setFillColor(GREY); c.setFont('Helvetica', 8.4)
            c.drawString(M + 0.2*inch, y, r['date'])
            c.setFillColor(BODY); c.setFont('Helvetica', 8.8)
            c.drawString(M + 1.0*inch, y, r['what'])
            if r.get('amex'):
                c.setFillColor(GREY); c.setFont('Helvetica-Oblique', 8.2)
                c.drawRightString(M + 5.0*inch, y, 'from %s Amex' % pts(r['amex']))
            if r.get('cash'):
                c.setFillColor(GREY); c.setFont('Helvetica-Oblique', 8.2)
                c.drawRightString(M + 5.0*inch, y, 'for %s' % money2(r['cash']))
            c.setFillColor(INK); c.setFont('Helvetica-Bold', 8.8)
            c.drawRightString(W - M - 0.05*inch, y, '+' + pts(r['points']))
            y -= 13

        y -= 4
        c.setStrokeColor(colors.HexColor('#EEEEF1')); c.line(M + 0.2*inch, y + 6, W - M, y + 6)
        y -= 6
        # Bought and transferred are points newly acquired. A refund is not —
        # it is points already owned, spent on a booking and handed back when
        # that booking cancelled, so it nets to zero against the earlier spend.
        for k in ('buy', 'amex'):
            if not tot[k]: continue
            c.setFillColor(GREY); c.setFont('Helvetica', 8.6)
            c.drawString(M + 0.2*inch, y, KIND[k])
            c.setFillColor(BODY); c.setFont('Helvetica-Bold', 8.6)
            c.drawRightString(W - M - 0.05*inch, y, pts(tot[k]))
            y -= 13
        acquired = tot['buy'] + tot['amex']
        c.setFillColor(INK); c.setFont('Helvetica-Bold', 9.2)
        c.drawString(M + 0.2*inch, y, 'acquired since 25 March')
        c.drawRightString(W - M - 0.05*inch, y, pts(acquired))
        y -= 16
        y -= 4

        for r in acct['debits']:
            c.setFillColor(BODY); c.setFont('Helvetica', 8.8)
            c.drawString(M + 1.0*inch, y, r['what'])
            c.setFillColor(ACCENT); c.setFont('Helvetica-Bold', 8.8)
            c.drawRightString(W - M - 0.05*inch, y, '\u2212' + pts(r['points']))
            y -= 13
        out_total = sum(r['points'] for r in acct['debits'])
        c.setFillColor(INK); c.setFont('Helvetica-Bold', 9.2)
        c.drawString(M + 0.2*inch, y, 'spent on this trip')
        c.drawRightString(W - M - 0.05*inch, y, pts(out_total))
        y -= 16

        bits = []
        if tot['refund']:
            bits.append('Two cancellations handed %s points back to this account. Left out above \u2014 '
                        'a refund is not a point coming in, it is a point being returned.'
                        % pts(tot['refund']))
            if out_total > acquired:
                bits.append('%s of the %s spent here came off that returned balance.'
                            % (pts(out_total - acquired), pts(out_total)))
        if amex_known: bits.append('%s Amex on the statements' % pts(amex_known))
        if amex_unknown: bits.append('%s of it moved before the statement window, so its Amex cost is not evidenced' % pts(amex_unknown))
        if cash: bits.append('%s in cash for the purchases' % money2(cash))
        if acct.get('note'): bits.append(acct['note'])
        for b in bits:
            c.setFillColor(GREY); c.setFont('Helvetica-Oblique', 8.2)
            c.drawString(M + 0.2*inch, y, clip(c, b, W - 2*M - 0.3*inch, 'Helvetica-Oblique', 8.2))
            y -= 12
        y -= 0.2*inch


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

    # ── what that was worth against the published market rate ──────────────
    market_page(c, f)
    c.showPage()

    # ── the Hilton accounts, which no single transfer explains ─────────────
    hilton_page(c, f)
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
