"""Drop the junk pages from printed confirmation emails.

    python3 tools/pdf/trim.py tools/pdf/mail

Marketing emails print with a long tail: unsubscribe footers, app-download
banners, conditions of carriage, elite-tier baggage matrices, hazardous-goods
notices, and pages holding three orphaned words. None of that helps anyone at
a desk.

Rule: page one of each email always stays (branding plus the confirmation).
After that a page stays only if it carries something specific to this
reservation — a confirmation code, a flight number, a 2027 date, a seat, a
check-in line, or a money total.
"""
import sys, os, glob, re, json, subprocess
from pypdf import PdfReader, PdfWriter

HERE = os.path.dirname(os.path.abspath(__file__))

# Confirmation codes straight from the app, so the test is trip-specific.
def conf_codes():
    out = subprocess.run(['node', '-e',
        "const d=require('%s');"
        "console.log(d.ITINERARY.filter(x=>x.conf).map(x=>x.conf).join('\\n'))"
        % os.path.join(HERE, '..', '..', 'lib', 'data.js')],
        capture_output=True, text=True)
    codes = set()
    for line in out.stdout.split():
        for part in re.split(r'[/\s]+', line):
            part = part.strip()
            if len(part) >= 5:
                codes.add(part.upper())
    return codes

CODES = conf_codes()

ANCHOR = re.compile(r'''(
    confirmation\s*(number|code|\#)|record\s*locator|booking\s*reference|
    check[\s-]?in|check[\s-]?out|
    \b(AA|AS|UA|DL|WN|B6|HA)\s?\d{2,4}\b|
    \bseat\s*[:#]?\s*\d{1,2}[A-F]\b|
    \b(jan|january)\s*\d{1,2},?\s*2027\b|\b2027-01-\d{2}\b|\b\d{1,2}[\s-](jan|january)[\s-]?2027\b|
    total\s*(price|charges|for\s*stay|ticket\s*value|cost)|
    amount\s*(paid|charged|due)|miles\s*(used|redeemed)|points\s*(per\s*night|redeemed)|
    room\s*type|nightly\s*rate|guest\s*name|passenger
)''', re.I | re.X)


def page_text(pg):
    try:
        return ' '.join((pg.extract_text() or '').split())
    except Exception:
        return ''


def keep(text, first):
    if first:
        return True, ''
    if len(text) < 60:
        return False, 'near-empty'
    if any(c in text.upper() for c in CODES):
        return True, ''
    if ANCHOR.search(text):
        return True, ''
    return False, 'boilerplate'


def trim(path):
    r = PdfReader(path)
    w = PdfWriter()
    cut = []
    for i, pg in enumerate(r.pages):
        ok, why = keep(page_text(pg), i == 0)
        if ok:
            w.add_page(pg)
        else:
            cut.append(why)
    if not w.pages:
        return len(r.pages), len(r.pages), []
    with open(path, 'wb') as f:
        w.write(f)
    return len(r.pages), len(w.pages), cut


def main(root):
    before = after = 0
    for party in ['bd', 'gj', 'kelly']:
        files = sorted(glob.glob(os.path.join(root, party, '*.pdf')))
        if not files:
            continue
        print('\n%s' % party.upper())
        for f in files:
            b, a, cut = trim(f)
            before += b; after += a
            note = '' if b == a else '  cut %d' % (b - a)
            print('  %-44s %2d -> %2d%s' % (os.path.basename(f), b, a, note))
    print('\n%d pages -> %d pages  (%d cut)' % (before, after, before - after))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'tools/pdf/mail')
