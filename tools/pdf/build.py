"""Hawaii 27 — traveller packs.

Builds one branded PDF per party: cover, letter, things to remember,
packing list, the itinerary, then the confirmations.

    node tools/pdf/export.js > tools/pdf/data.json
    python3 tools/pdf/build.py tools/pdf/data.json out/ [bd gj kelly]

If PRINTED_<KEY>=<n> is set, the confirmations section becomes a divider page
and the real printed emails are merged in afterwards by merge.py.
"""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from emails import EMAILS
from content import LETTER as LETTERS, REMEMBER, PACKING
from datetime import date
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.pdfgen import canvas

SRC, OUT = sys.argv[1], sys.argv[2]
data = json.load(open(SRC))

# Each party carries its own palette from the app.
THEME = {
    'bd':    {'ink': '#1B1B3A', 'accent': '#C47A8A', 'wash': '#F6F2F3', 'name': 'Ben & Dakotah'},
    'gj':    {'ink': '#17171A', 'accent': '#8E949E', 'wash': '#F3F4F5', 'name': 'Gina & John'},
    'kelly': {'ink': '#5E2E3C', 'accent': '#C47A8A', 'wash': '#FAF4F5', 'name': 'Kelly'},
}
WARN = colors.HexColor('#B3261E')

W, H = LETTER
M = 0.72 * inch
MONTH = ['', 'January','February','March','April','May','June','July',
         'August','September','October','November','December']
DOW = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']


def d(iso):
    y, m, dd = (int(x) for x in iso.split('-'))
    return date(y, m, dd)


def short(iso):
    x = d(iso)
    return f"{DOW[x.weekday()]} {x.day} {MONTH[x.month][:3]}"


def wrap(c, text, font, size, width):
    c.setFont(font, size)
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if c.stringWidth(t, font, size) <= width:
            cur = t
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines


def palm(c, x, y, s, col):
    """The app's palm mark, drawn to scale s."""
    c.saveState()
    c.translate(x, y)
    c.scale(s / 100.0, s / 100.0)
    c.setStrokeColor(col); c.setLineWidth(2.2); c.setLineCap(1)
    for path in [
        [(50,70),(32,80),(18,76)], [(50,70),(30,68),(14,58)], [(50,70),(34,58),(26,42)],
        [(50,70),(68,80),(82,76)], [(50,70),(70,68),(86,58)], [(50,70),(66,58),(74,42)],
    ]:
        p = c.beginPath(); p.moveTo(*path[0])
        p.curveTo(path[1][0],path[1][1],path[1][0],path[1][1],path[2][0],path[2][1])
        c.drawPath(p)
    c.setLineWidth(3.2)
    p = c.beginPath(); p.moveTo(47,70); p.curveTo(52,55,48,38,44,28); c.drawPath(p)
    c.setFillColor(col)
    c.circle(52,67,3,fill=1,stroke=0); c.circle(47,66,2.7,fill=1,stroke=0)
    c.restoreState()


def _band(c, title, sub, right, ink, accent):
    c.setFillColor(ink); c.rect(0, H - 1.5*inch, W, 1.5*inch, fill=1, stroke=0)
    c.setFillColor(colors.white); c.setFont('Helvetica-Bold', 19)
    c.drawString(M, H - 0.95*inch, title)
    if sub:
        c.setFillColor(accent); c.setFont('Helvetica', 10)
        c.drawString(M, H - 1.18*inch, sub)
    if right:
        c.setFillColor(accent); c.setFont('Helvetica', 9.5)
        c.drawRightString(W - M, H - 0.95*inch, right)
    return H - 2.0*inch


def _cont(c, title, party, grey):
    c.setFillColor(grey); c.setFont('Helvetica-Bold', 8)
    c.drawString(M, H - 0.6*inch, title)
    c.drawRightString(W - M, H - 0.6*inch, party['label'])
    c.setStrokeColor(colors.HexColor('#DDDDE2')); c.setLineWidth(0.5)
    c.line(M, H - 0.72*inch, W - M, H - 0.72*inch)
    return H - 1.15*inch


def cover(c, key, party):
    th = THEME[key]
    ink, accent = colors.HexColor(th['ink']), colors.HexColor(th['accent'])
    items = [i for i in party['items'] if i['type'] != 'note']
    c.setFillColor(ink); c.rect(0, 0, W, H, fill=1, stroke=0)
    palm(c, W/2 - 52, H/2 + 1.25*inch, 104, accent)
    c.setFillColor(colors.white); c.setFont('Helvetica-Bold', 40)
    c.drawCentredString(W/2, H/2 + 0.35*inch, 'HAWAII 27')
    c.setFillColor(accent); c.setFont('Helvetica-Bold', 11)
    c.drawCentredString(W/2, H/2 + 0.05*inch, 'J A N U A R Y   2 0 2 7')
    c.setStrokeColor(accent); c.setLineWidth(0.8)
    c.line(W/2 - 1.1*inch, H/2 - 0.42*inch, W/2 + 1.1*inch, H/2 - 0.42*inch)
    c.setFillColor(colors.white); c.setFont('Helvetica', 26)
    c.drawCentredString(W/2, H/2 - 1.0*inch, party['label'])
    if items:
        span = f"{short(items[0]['date'])}  –  {short(items[-1].get('endDate') or items[-1]['date'])}"
        c.setFillColor(accent); c.setFont('Helvetica', 11)
        c.drawCentredString(W/2, H/2 - 1.32*inch, span)
    f = sum(1 for i in items if i['type'] == 'flight')
    h = sum(1 for i in items if i['type'] == 'hotel')
    c.setFillColor(colors.white); c.setFont('Helvetica', 9.5)
    c.drawCentredString(W/2, H/2 - 1.78*inch, f"{f} flights  ·  {h} hotel stays")
    c.showPage()


def letter(c, key, party):
    body = LETTERS.get(key)
    if not body: return
    th = THEME[key]
    ink, accent = colors.HexColor(th['ink']), colors.HexColor(th['accent'])
    c.setFillColor(ink); c.rect(0, H - 1.5*inch, W, 1.5*inch, fill=1, stroke=0)
    palm(c, M, H - 1.2*inch, 42, accent)
    c.setFillColor(accent); c.setFont('Helvetica-Bold', 8.5)
    c.drawString(M + 0.68*inch, H - 0.8*inch, 'A NOTE BEFORE YOU GO')
    c.setFillColor(colors.white); c.setFont('Helvetica-Bold', 22)
    c.drawString(M + 0.68*inch, H - 1.15*inch, body['greeting'])
    y = H - 2.15*inch
    width = W - 2*M - 0.3*inch
    for para in body['paras']:
        for ln in wrap(c, para, 'Helvetica', 10.2, width):
            c.setFillColor(colors.HexColor('#2C2C36')); c.setFont('Helvetica', 10.2)
            c.drawString(M, y, ln); y -= 15.5
        y -= 9
    y -= 8
    c.setStrokeColor(accent); c.setLineWidth(0.9)
    c.line(M, y, M + 0.95*inch, y)
    y -= 22
    c.setFillColor(ink); c.setFont('Helvetica-Oblique', 14)
    c.drawString(M, y, body['signoff'])
    c.showPage()


def remember(c, key, party):
    items = REMEMBER.get(key, [])
    if not items: return
    th = THEME[key]
    ink, accent = colors.HexColor(th['ink']), colors.HexColor(th['accent'])
    wash, grey = colors.HexColor(th['wash']), colors.HexColor('#6C6C78')
    y = _band(c, 'THINGS TO REMEMBER', party['label'], 'Read this one before you fly', ink, accent)
    TX = M + 0.44*inch
    for n, (head, text) in enumerate(items, 1):
        rw = (W - M - 0.24*inch) - TX
        hl = wrap(c, head, 'Helvetica-Bold', 10.5, rw)
        bl = wrap(c, text, 'Helvetica', 8.8, rw)
        block = 10 + len(hl)*13 + 4 + len(bl)*11.6 + 10
        if y - block < 0.8*inch:
            c.showPage(); y = _cont(c, 'THINGS TO REMEMBER', party, grey)
        top, bottom = y, y - block
        c.setFillColor(wash); c.rect(M, bottom, W - 2*M, block, fill=1, stroke=0)
        c.setFillColor(accent); c.rect(M, bottom, 2.4, block, fill=1, stroke=0)
        base = top - 19
        c.setFillColor(accent); c.setFont('Helvetica-Bold', 11.5)
        c.drawString(M + 0.17*inch, base, str(n))
        yy = base
        c.setFillColor(ink); c.setFont('Helvetica-Bold', 10.5)
        for ln in hl: c.drawString(TX, yy, ln); yy -= 13
        yy -= 4
        c.setFillColor(colors.HexColor('#33333D')); c.setFont('Helvetica', 8.8)
        for ln in bl: c.drawString(TX, yy, ln); yy -= 11.6
        y = bottom - 9
    c.showPage()


def packing(c, key, party):
    cats = PACKING.get(key, [])
    if not cats: return
    th = THEME[key]
    ink, accent = colors.HexColor(th['ink']), colors.HexColor(th['accent'])
    grey = colors.HexColor('#6C6C78')
    top = _band(c, 'PACKING LIST', party['label'], 'Tick as you go', ink, accent) - 0.05*inch

    def h(cat): return 20 + len(cat[1]) * 14.5 + 14
    total = sum(h(cat) for cat in cats)
    target = total / 2.0
    colw = (W - 2*M - 0.4*inch) / 2
    colx = [M, M + colw + 0.4*inch]
    y = [top, top]
    col, run = 0, 0.0
    for cat in cats:
        need = h(cat)
        if col == 0 and run > 0 and run + need > target:
            col, run = 1, 0.0
        if y[col] - need < 0.8*inch and col == 0:
            col, run = 1, 0.0
        x = colx[col]
        name, items = cat
        c.setFillColor(accent); c.setFont('Helvetica-Bold', 8.5)
        c.drawString(x, y[col], name.upper())
        c.setStrokeColor(colors.HexColor('#DDDDE2')); c.setLineWidth(0.5)
        c.line(x, y[col] - 6.5, x + colw, y[col] - 6.5)
        y[col] -= 20
        for it in items:
            c.setStrokeColor(colors.HexColor('#B9B9C4')); c.setLineWidth(0.7)
            c.rect(x, y[col] - 1.5, 7.5, 7.5, fill=0, stroke=1)
            c.setFillColor(colors.HexColor('#33333D')); c.setFont('Helvetica', 9)
            c.drawString(x + 13.5, y[col], it)
            y[col] -= 14.5
        y[col] -= 14
        run += need
    c.setFillColor(grey); c.setFont('Helvetica', 7.5)
    c.drawString(M, 0.5*inch, 'Times are local. Confirmation numbers as issued.')
    c.showPage()


def build(key, party, c):
    th = THEME[key]
    ink, accent, wash = colors.HexColor(th['ink']), colors.HexColor(th['accent']), colors.HexColor(th['wash'])
    grey = colors.HexColor('#6C6C78')
    items = [i for i in party['items'] if i['type'] != 'note']
    page = [1]

    def header(first):
        if first:
            c.setFillColor(ink); c.rect(0, H - 1.95*inch, W, 1.95*inch, fill=1, stroke=0)
            palm(c, M, H - 1.62*inch, 52, accent)
            c.setFillColor(colors.white); c.setFont('Helvetica-Bold', 25)
            c.drawString(M + 0.95*inch, H - 1.12*inch, 'HAWAII 27')
            c.setFillColor(accent); c.setFont('Helvetica-Bold', 9.5)
            c.drawString(M + 0.97*inch, H - 1.35*inch, 'JANUARY 2027')
            c.setFillColor(colors.white); c.setFont('Helvetica', 15)
            c.drawRightString(W - M, H - 1.12*inch, party['label'])
            if items:
                span = f"{short(items[0]['date'])} – {short(items[-1].get('endDate') or items[-1]['date'])}"
                c.setFillColor(accent); c.setFont('Helvetica', 9.5)
                c.drawRightString(W - M, H - 1.35*inch, span)
            return H - 2.45*inch
        c.setFillColor(grey); c.setFont('Helvetica-Bold', 8)
        c.drawString(M, H - 0.6*inch, 'HAWAII 27')
        c.drawRightString(W - M, H - 0.6*inch, party['label'])
        c.setStrokeColor(colors.HexColor('#DDDDE2')); c.setLineWidth(0.5)
        c.line(M, H - 0.72*inch, W - M, H - 0.72*inch)
        return H - 1.15*inch

    def footer():
        c.setFillColor(grey); c.setFont('Helvetica', 7.5)
        c.drawString(M, 0.5*inch, 'Times are local. Confirmation numbers as issued.')
        c.drawRightString(W - M, 0.5*inch, f"{page[0]}")

    y = header(True)
    PAD, TITLE, LINE, TIP = 9, 13, 11, 10.5
    TX = M + 1.62*inch

    for it in items:
        body_lines = wrap(c, it.get('brief') or it.get('detail',''), 'Helvetica', 8.6, (W - M) - TX) if (it.get('brief') or it.get('detail')) else []
        acc_lines  = wrap(c, it.get('access',''), 'Helvetica', 8.2, (W - M) - TX - 62) if it.get('access') else []
        bag_lines  = wrap(c, it.get('bags',''),   'Helvetica', 8.2, (W - M) - TX - 62) if it.get('bags') else []
        lng_lines  = wrap(c, it.get('lounges',''),'Helvetica', 8.2, (W - M) - TX - 62) if it.get('lounges') else []
        tip_lines  = wrap(c, it['tip'], 'Helvetica-Oblique', 8.2, (W - M) - TX) if it.get('tip') else []

        content = TITLE
        if it['subtitle']: content += LINE
        content += len(body_lines) * LINE
        if acc_lines: content += len(acc_lines) * 10.5 + 4
        if it['conf']: content += 14
        if bag_lines: content += len(bag_lines) * 10.5 + 4
        if lng_lines: content += len(lng_lines) * 10.5 + 4
        if tip_lines: content += len(tip_lines) * TIP + 4
        block = PAD + content + PAD

        if y - block < 0.78*inch:
            footer(); c.showPage(); page[0] += 1; y = header(False)

        top = y; bottom = top - block
        c.setFillColor(wash); c.rect(M, bottom, W - 2*M, block, fill=1, stroke=0)
        c.setFillColor(accent); c.rect(M, bottom, 2.4, block, fill=1, stroke=0)
        base = top - PAD - 9.5

        c.setFillColor(ink); c.setFont('Helvetica-Bold', 9.5)
        c.drawString(M + 0.18*inch, base, short(it['date']))
        if it['endDate']:
            c.setFillColor(grey); c.setFont('Helvetica', 8)
            c.drawString(M + 0.18*inch, base - 11, 'to ' + short(it['endDate']))

        c.setFillColor(ink); c.setFont('Helvetica-Bold', 11.5)
        c.drawString(TX, base, it['title'])

        # A bag that still has to be bought is the one thing worth shouting about.
        if it.get('bagsWarn'):
            tag = 'BAG NEEDED'; tagcol = WARN
        else:
            tag = 'BOOKED'; tagcol = accent
        c.setFont('Helvetica-Bold', 7)
        tw = c.stringWidth(tag, 'Helvetica-Bold', 7)
        c.setFillColor(tagcol)
        c.roundRect(W - M - tw - 14, base - 2, tw + 10, 11.5, 2.5, fill=1, stroke=0)
        c.setFillColor(colors.white)
        c.drawString(W - M - tw - 9, base + 1.2, tag)

        yy = base - TITLE
        if it['subtitle']:
            c.setFillColor(grey); c.setFont('Helvetica', 8.6)
            c.drawString(TX, yy, it['subtitle']); yy -= LINE
        c.setFillColor(colors.HexColor('#33333D')); c.setFont('Helvetica', 8.6)
        for ln in body_lines:
            c.drawString(TX, yy, ln); yy -= LINE
        if acc_lines:
            yy -= 3
            c.setFillColor(grey); c.setFont('Helvetica-Bold', 6.8)
            c.drawString(TX, yy, 'ACCESS VIA')
            c.setFillColor(colors.HexColor('#33333D')); c.setFont('Helvetica', 8.2)
            for ln in acc_lines: c.drawString(TX + 62, yy, ln); yy -= 10.5
            yy -= 1
        if it['conf']:
            yy -= 1
            c.setFillColor(grey); c.setFont('Helvetica-Bold', 6.8)
            c.drawString(TX, yy, 'CONFIRMATION')
            c.setFillColor(ink); c.setFont('Courier-Bold', 9.5)
            c.drawString(TX + 62, yy - 0.6, it['conf'])
            yy -= 13
        if bag_lines:
            yy -= 3
            warn = it.get('bagsWarn')
            c.setFillColor(WARN if warn else grey); c.setFont('Helvetica-Bold', 6.8)
            c.drawString(TX, yy, 'BAG TO BUY' if warn else 'CHECKED BAGS')
            c.setFillColor(WARN if warn else colors.HexColor('#33333D'))
            c.setFont('Helvetica-Bold' if warn else 'Helvetica', 8.2)
            for ln in bag_lines: c.drawString(TX + 62, yy, ln); yy -= 10.5
            yy -= 1
        if lng_lines:
            yy -= 3
            c.setFillColor(grey); c.setFont('Helvetica-Bold', 6.8)
            c.drawString(TX, yy, 'LOUNGES')
            c.setFillColor(colors.HexColor('#33333D')); c.setFont('Helvetica', 8.2)
            for ln in lng_lines: c.drawString(TX + 62, yy, ln); yy -= 10.5
            yy -= 1
        if tip_lines:
            yy -= 3
            c.setFillColor(accent); c.setFont('Helvetica-Oblique', 8.2)
            for ln in tip_lines: c.drawString(TX, yy, ln); yy -= TIP

        y = bottom - 7

    footer(); c.showPage()


def confirmations(c, key, party):
    th = THEME[key]
    ink, accent, wash = colors.HexColor(th['ink']), colors.HexColor(th['accent']), colors.HexColor(th['wash'])
    grey = colors.HexColor('#6C6C78')
    mails = EMAILS.get(key, [])
    if not mails: return
    y = _band(c, 'CONFIRMATIONS', party['label'], f"{len(mails)} on file", ink, accent)
    for mail in mails:
        need = 0.52*inch + len(mail['lines']) * 12.5 + 0.2*inch
        if y - need < 0.8*inch:
            c.showPage(); y = _cont(c, 'CONFIRMATIONS', party, grey)
        c.setFillColor(wash); c.rect(M, y - need, W - 2*M, need, fill=1, stroke=0)
        c.setFillColor(accent); c.rect(M, y - need, 2.4, need, fill=1, stroke=0)
        yy = y - 0.28*inch
        c.setFillColor(ink); c.setFont('Helvetica-Bold', 13)
        c.drawString(M + 0.22*inch, yy, mail['title']); yy -= 13
        c.setFillColor(grey); c.setFont('Helvetica', 8)
        c.drawString(M + 0.22*inch, yy, mail['meta']); yy -= 15
        for kind, text in mail['lines']:
            if kind == 'h':
                c.setFillColor(accent); c.setFont('Courier-Bold', 11)
            elif kind == 'b':
                yy -= 3
                c.setFillColor(ink); c.setFont('Helvetica-Bold', 8); text = text.upper()
            else:
                c.setFillColor(colors.HexColor('#2C2C36')); c.setFont('Courier', 8.6)
            c.drawString(M + 0.22*inch, yy, text); yy -= 12.5
        y = y - need - 0.16*inch
    c.showPage()


def conf_divider(c, key, party, n):
    """Opens the confirmations section when real printed emails follow."""
    th = THEME[key]
    ink, accent = colors.HexColor(th['ink']), colors.HexColor(th['accent'])
    c.setFillColor(ink); c.rect(0, 0, W, H, fill=1, stroke=0)
    palm(c, W/2 - 42, H/2 + 1.0*inch, 84, accent)
    c.setFillColor(colors.white); c.setFont('Helvetica-Bold', 26)
    c.drawCentredString(W/2, H/2 + 0.2*inch, 'CONFIRMATIONS')
    c.setFillColor(accent); c.setFont('Helvetica', 11)
    c.drawCentredString(W/2, H/2 - 0.08*inch, party['label'])
    c.setStrokeColor(accent); c.setLineWidth(0.8)
    c.line(W/2 - 1.1*inch, H/2 - 0.45*inch, W/2 + 1.1*inch, H/2 - 0.45*inch)
    c.setFillColor(colors.white); c.setFont('Helvetica', 10)
    c.drawCentredString(W/2, H/2 - 0.85*inch, 'The emails as they were sent, one per reservation.')
    c.setFillColor(accent); c.setFont('Helvetica', 9.5)
    c.drawCentredString(W/2, H/2 - 1.15*inch, '%d on file' % n)
    c.showPage()


if __name__ == '__main__':
    keys = sys.argv[3:] or ['bd', 'gj', 'kelly']
    stem = 'all' if len(keys) == 3 else '-'.join(keys)
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, 'hawaii27-%s.pdf' % stem)
    c = canvas.Canvas(path, pagesize=LETTER)
    c.setTitle('Hawaii 27 - Itineraries'); c.setAuthor('Hawaii 27')
    for key in keys:
        cover(c, key, data[key])
        letter(c, key, data[key])
        remember(c, key, data[key])
        packing(c, key, data[key])
        build(key, data[key], c)
        printed = int(os.environ.get('PRINTED_' + key.upper(), '0'))
        if printed:
            conf_divider(c, key, data[key], printed)
        else:
            confirmations(c, key, data[key])
    c.save()
    print(path)
