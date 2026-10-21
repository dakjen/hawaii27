"""Route saved Gmail results into printed confirmation PDFs, by message id.

    python3 tools/pdf/sortmail.py

Scans the session's tool-results directory, matches each saved get_message
payload against MAP below, and prints it to the right party folder in trip
order. Re-running is safe: anything already printed is skipped.
"""
import json, os, glob, sys, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
TOOLRESULTS = os.path.expanduser(
    '~/.claude/projects/-Users-dakotahjennifer-Desktop-development-TOKYOHOe-hawaii27/'
    '814cab50-5ff4-4f72-babb-c91f01a75f35/tool-results')

# Gmail message id -> (party, filename). Numbered so they land in trip order.
MAP = {
    # Ben & Dakotah
    '1a14ff774a513fe9': ('bd', '01-american-RAOSLV-lga-lax.pdf'),
    '1a14ff8dba63aa58': ('bd', '02-citizenm-83975525.pdf'),
    '1a14ffc63523c78a': ('bd', '03-etihad-7RIAL6-lax-ogg.pdf'),
    '1a14ff91d673831d': ('bd', '04-hyatt-maui-20308273.pdf'),
    '1a14d71090ede90c': ('bd', '05-waldorf-3463135886.pdf'),
    '1a14ffa4de64466e': ('bd', '06-avis-25986700US5.pdf'),
    '1a14ffc39c7c84e2': ('bd', '07-etihad-7RO9GD-ogg-lax.pdf'),
    '1a14cef8f044e9ad': ('bd', '08-westin-lax-94631061.pdf'),
    '1a14cef6f1b5b164': ('bd', '09-lifemiles-C6JQJK-lax-las.pdf'),
    '1a15007e11aaf483': ('bd', '10-aria-5UFHBS97EZ.pdf'),

    # Gina & John
    '1a14ffb26b1c8734': ('gj', '01-hyatt-dulles-40023B28394357.pdf'),
    '1a150076c98dedfd': ('gj', '02-w-beverly-hills-87507190.pdf'),
    '1a14ffaa2833859f': ('gj', '03-hawaiian-NLHQKB-lax-ogg.pdf'),
    '1a14ffb877aafd1f': ('gj', '04-waldorf-3534263318.pdf'),
    '1a14ffa88a643694': ('gj', '05-hawaiian-JNRIIH-ogg-las.pdf'),
    '1a14d677f39b0e28': ('gj', '06-bellagio-6M03Q0CCG6.pdf'),
    '1a15bdb3e980e3e4': ('gj', '07-delta-JDJZBA-las-bwi.pdf'),

    # Kelly
    '1a15bd9e0212f49e': ('kelly', '01-united-N0S934-bwi-lax.pdf'),
    '1a14d705b8f7da6a': ('kelly', '02-doubletree-92838768.pdf'),
    '1a14d7304a5682e1': ('kelly', '03-alaska-KUHKWQ-lgb-ogg.pdf'),
    '1a14d70745e69aee': ('kelly', '04-waldorf-3537802552.pdf'),
    '1a14cefc58440da9': ('kelly', '05-maui-coast-1105222729.pdf'),
    '1a14cf0745d086c4': ('kelly', '06-alaska-EUMJIZ-ogg-lax.pdf'),
    '1a14ff7a52d2a895': ('kelly', '07-american-DGEMOG-lax-bwi.pdf'),
}


def main():
    seen, done, skipped = {}, 0, 0
    files = sorted(glob.glob(os.path.join(TOOLRESULTS, '*get_message*.txt'))
                + glob.glob(os.path.join(TOOLRESULTS, '*get_thread*.txt')))
    for f in files:
        try:
            d = json.load(open(f))
        except Exception:
            continue
        if isinstance(d, dict) and isinstance(d.get('messages'), list):
            for m in d['messages']:
                if m.get('id') in MAP and (m.get('htmlBody') or m.get('plaintextBody')):
                    seen[m['id']] = f
            continue
        mid = d.get('id')
        if mid in MAP:
            seen[mid] = f          # later files win, so a refetch supersedes
    for mid, (party, name) in MAP.items():
        out = os.path.join(HERE, 'mail', party, name)
        if mid not in seen:
            skipped += 1
            continue
        if os.path.exists(out):
            continue
        subprocess.run([sys.executable, os.path.join(HERE, 'printmail.py'), seen[mid], out])
        done += 1
    print('\nprinted %d  |  already done %d  |  not yet fetched %d'
          % (done, len(MAP) - done - skipped, skipped))
    for mid, (party, name) in MAP.items():
        if mid not in seen:
            print('  still needed:', party, name)


if __name__ == '__main__':
    main()
