"""Staple printed confirmation emails onto the back of a built pack."""
import sys, os, glob
from pypdf import PdfWriter, PdfReader

base, maildir, out = sys.argv[1], sys.argv[2], sys.argv[3]
w = PdfWriter()
for pg in PdfReader(base).pages:
    w.add_page(pg)
mails = sorted(glob.glob(os.path.join(maildir, '*.pdf')))
for m in mails:
    for pg in PdfReader(m).pages:
        w.add_page(pg)
with open(out, 'wb') as f:
    w.write(f)
print(out, '->', len(PdfReader(out).pages), 'pages (', len(mails), 'printed emails )')
