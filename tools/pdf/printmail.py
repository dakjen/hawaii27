"""Print a saved Gmail get_message result to PDF, as the email actually looks.

    python3 tools/pdf/printmail.py <saved-json> <out.pdf>

The saved file is what the Gmail connector writes when a result is too large to
return inline. It holds the real htmlBody, so this is the genuine email with its
own branding — not a transcription.
"""
import json, sys, html, re, os, subprocess

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

SHELL = """<!doctype html><html><head><meta charset="utf-8"><style>
@page {{ size: letter; margin: 0.5in; }}
body {{ margin:0; font-family:Arial,Helvetica,sans-serif;
       -webkit-print-color-adjust:exact; print-color-adjust:exact; }}
.hdr {{ border-bottom:2px solid #333; padding:0 0 9px; margin:0 0 15px; }}
.hdr .k {{ font:bold 8.5px Arial; color:#6C6C78; letter-spacing:.09em; text-transform:uppercase; }}
.hdr .s {{ font:bold 15px Arial; color:#1a1a1a; margin:3px 0 6px; }}
.hdr .m {{ font:11px Arial; color:#33333D; line-height:1.5; }}
img {{ max-width:100%; height:auto; }}
table {{ max-width:100%; }}
</style></head><body>
<div class="hdr">
  <div class="k">Confirmation email</div>
  <div class="s">{subject}</div>
  <div class="m"><b>From:</b> {sender}<br><b>Received:</b> {date}</div>
</div>
{body}
</body></html>"""


def _unwrap(d):
    # get_thread payloads wrap the message in a list; take the first real one.
    if isinstance(d, dict) and 'messages' in d and isinstance(d['messages'], list):
        for m in d['messages']:
            if m.get('htmlBody') or m.get('plaintextBody'):
                return m
    return d


def main(src, out):
    d = _unwrap(json.load(open(src)))
    body = d.get('htmlBody') or ''
    if not body:
        body = '<pre style="font:12px/1.5 monospace;white-space:pre-wrap">%s</pre>' % \
               html.escape(d.get('plaintextBody', ''))
    # Drop tracking pixels so printing does not ping the senders.
    body = re.sub(r'<img[^>]*(?:pzdirect|/tr/i/|/o/\?|open\.aspx)[^>]*>', '', body, flags=re.I)

    page = SHELL.format(
        subject=html.escape((d.get('subject') or '').replace('Fwd: ', '')),
        sender=html.escape(d.get('sender', '')),
        date=d.get('date', ''),
        body=body,
    )
    tmp = os.path.splitext(out)[0] + '.html'
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(tmp, 'w', encoding='utf-8').write(page)

    subprocess.run([CHROME, '--headless', '--disable-gpu', '--no-sandbox',
                    '--no-pdf-header-footer', '--virtual-time-budget=15000',
                    '--print-to-pdf=' + out, 'file://' + os.path.abspath(tmp)],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)
    os.remove(tmp)
    if not os.path.exists(out):
        print('  FAILED', out); return 1
    from pypdf import PdfReader
    print('  %-42s %d pages  %s' % (os.path.basename(out), len(PdfReader(out).pages),
                                    (d.get('subject') or '')[:46]))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1], sys.argv[2]))
