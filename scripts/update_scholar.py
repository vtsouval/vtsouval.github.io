#!/usr/bin/env python3
"""Refresh one public Scholar profile, preserving the last verified snapshot."""
import argparse
from datetime import datetime, timezone
from html import escape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.request import Request, urlopen

PROFILE_ID = 'FgPQz3QAAAAJ'
PROFILE_URL = f'https://scholar.google.com/citations?user={PROFILE_ID}&hl=en'
PROFILE_NAME = 'Vasileios Tsouvalas'
ROOT = Path(__file__).resolve().parents[1]
START = '<!-- SCHOLAR_METRICS_START -->'
END = '<!-- SCHOLAR_METRICS_END -->'


class ProfileParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_table = False
        self.in_name = False
        self.cell = None
        self.row = []
        self.rows = []
        self.name = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id') == 'gsc_prf_in':
            self.in_name = True
        if tag == 'table' and attrs.get('id') == 'gsc_rsb_st':
            self.in_table = True
        if self.in_table and tag == 'tr':
            self.row = []
        if self.in_table and tag in ('td', 'th'):
            self.cell = []

    def handle_data(self, data):
        if self.in_name:
            self.name.append(data)
        if self.cell is not None:
            self.cell.append(data)

    def handle_endtag(self, tag):
        if tag == 'div':
            self.in_name = False
        if self.in_table and tag in ('td', 'th') and self.cell is not None:
            self.row.append(''.join(self.cell).strip())
            self.cell = None
        if self.in_table and tag == 'tr':
            self.rows.append(self.row)
        if tag == 'table':
            self.in_table = False


def validate_values(record):
    for key in ('citations', 'h_index', 'i10_index'):
        value = record.get(key)
        if type(value) is not int or value < 0:
            raise ValueError(f'Invalid {key}')
    if record['h_index'] ** 2 > record['citations'] or record['i10_index'] * 10 > record['citations']:
        raise ValueError('Inconsistent citation metrics')


def parse_profile(source):
    parser = ProfileParser()
    parser.feed(source)
    if ' '.join(''.join(parser.name).split()) != PROFILE_NAME:
        raise ValueError('The response does not identify the expected Scholar profile')
    rows = {row[0]: row[1:] for row in parser.rows if len(row) >= 2}
    if rows.get('') and rows[''][0] != 'All':
        raise ValueError('Unexpected Scholar metric columns')
    metrics = {}
    for label, key in [('Citations', 'citations'), ('h-index', 'h_index'), ('i10-index', 'i10_index')]:
        values = rows.get(label, [])
        value = re.sub(r'[,\s]', '', values[0]) if values else ''
        if not value.isascii() or not value.isdigit():
            raise ValueError(f'Missing or invalid Scholar metric: {label}')
        metrics[key] = int(value)
    validate_values(metrics)
    return metrics


def validate_snapshot(record):
    if not isinstance(record, dict) or record.get('profile_id') != PROFILE_ID or record.get('profile_url') != PROFILE_URL or record.get('name') != PROFILE_NAME:
        raise ValueError('Snapshot does not belong to the expected profile')
    validate_values(record)
    stamp = datetime.fromisoformat(record.get('updated_at', ''))
    if stamp.tzinfo is None:
        raise ValueError('Snapshot date needs a timezone')
    return record


def fetch_text(url):
    request = Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en'})
    with urlopen(request, timeout=25) as response:
        data = response.read(2_000_001)
    if len(data) > 2_000_000:
        raise ValueError('Unexpectedly large response')
    return data.decode('utf-8')


def refresh_metrics(cached, fetcher=fetch_text, *, now=None, previous_url=None):
    now = now or datetime.now(timezone.utc)
    if cached is not None:
        validate_snapshot(cached)
    # Scheduled builds start from main. Recover the latest published snapshot so
    # a failed refresh cannot roll the numbers back to the committed seed.
    if previous_url:
        try:
            published = validate_snapshot(json.loads(fetcher(previous_url)))
            published_time = datetime.fromisoformat(published['updated_at'])
            if published_time <= now and (cached is None or published_time > datetime.fromisoformat(cached['updated_at'])):
                cached = published
        except (OSError, ValueError, TypeError) as error:
            print(f'Published snapshot unavailable: {error}', file=sys.stderr)
    try:
        metrics = parse_profile(fetcher(PROFILE_URL))
        return {'source': 'Google Scholar', 'profile_id': PROFILE_ID,
                'profile_url': PROFILE_URL, 'name': PROFILE_NAME,
                **metrics, 'updated_at': now.isoformat()}
    except (OSError, ValueError) as error:
        if cached is None:
            raise ValueError('No verified Scholar snapshot is available') from error
        print(f'::warning::Scholar refresh unavailable; retaining verified metrics from {cached["updated_at"]}. {error}', file=sys.stderr)
        return cached


def render_metrics(record):
    validate_snapshot(record)
    date = datetime.fromisoformat(record['updated_at']).strftime('%d %B %Y').lstrip('0')
    citations, h_index = record['citations'], record['h_index']
    label = f'Google Scholar: {citations:,} citations, h-index {h_index}. Updated {date}; checked daily.'
    return (f'<li class="profile-scholar"><a href="{escape(PROFILE_URL, quote=True)}" '
            f'title="{escape(label, quote=True)}" aria-label="{escape(label, quote=True)}">'
            f'<strong>{citations:,}</strong><span>Citations<small>h-index <b>{h_index}</b></small></span></a></li>')


def update_markup(source, record):
    pattern = re.escape(START) + r'.*?' + re.escape(END)
    output, count = re.subn(pattern, START + '\n      ' + render_metrics(record) + '\n      ' + END, source, flags=re.S)
    if count != 1:
        raise ValueError('Expected exactly one Scholar metrics block')
    return output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--refresh', action='store_true')
    parser.add_argument('--previous-url', help='Previously deployed metrics JSON for fallback')
    args = parser.parse_args()
    target = ROOT / 'data/scholar-metrics.json'
    cached = validate_snapshot(json.loads(target.read_text())) if target.exists() else None
    record = refresh_metrics(cached, previous_url=args.previous_url) if args.refresh else cached
    if record is None:
        raise SystemExit('Run with --refresh to fetch the first verified snapshot.')
    page = ROOT / 'index.html'
    markup = update_markup(page.read_text(), record)
    target.write_text(json.dumps(record, indent=2) + '\n')
    page.write_text(markup)
    print(f'Scholar: {record["citations"]} citations · h-index {record["h_index"]} · {record["updated_at"]}')


if __name__ == '__main__':
    main()
