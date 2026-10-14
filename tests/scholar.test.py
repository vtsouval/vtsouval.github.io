"""Scholar parsing, freshness and safe fallback without external requests."""
from datetime import datetime, timezone
from pathlib import Path
import sys
import unittest
from urllib.error import HTTPError

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from update_scholar import PROFILE_URL, parse_profile, refresh_metrics, render_metrics, validate_snapshot

PAGE = '''<div id="gsc_prf_in">Vasileios Tsouvalas</div>
<table id="gsc_rsb_st"><tr><th></th><th>All</th><th>Since 2021</th></tr>
<tr><td><a>Citations</a></td><td>1,244</td><td>999</td></tr>
<tr><td>h-index</td><td>18</td><td>12</td></tr>
<tr><td>i10-index</td><td>16</td><td>10</td></tr></table>'''
NOW = datetime(2026, 10, 14, 12, tzinfo=timezone.utc)


def snapshot(date='2026-10-13T12:00:00+00:00', citations=244):
    return {'profile_id': 'FgPQz3QAAAAJ', 'profile_url': PROFILE_URL,
            'name': 'Vasileios Tsouvalas', 'source': 'Google Scholar',
            'citations': citations, 'h_index': 8, 'i10_index': 6, 'updated_at': date}


class ScholarTests(unittest.TestCase):
    def test_reads_all_time_column_and_validates_identity(self):
        self.assertEqual(parse_profile(PAGE), {'citations': 1244, 'h_index': 18, 'i10_index': 16})
        with self.assertRaises(ValueError):
            parse_profile(PAGE.replace('Vasileios Tsouvalas', 'Someone Else'))

    def test_rejects_challenge_missing_rows_and_impossible_values(self):
        for source in ['<h1>Verify you are human</h1>', PAGE.replace('h-index','missing'), PAGE.replace('1,244','20')]:
            with self.assertRaises(ValueError):
                parse_profile(source)

    def test_success_records_actual_fetch_time(self):
        result = refresh_metrics(snapshot(), lambda _: PAGE, now=NOW)
        self.assertEqual(result['citations'], 1244)
        self.assertEqual(result['updated_at'], NOW.isoformat())

    def test_blocked_request_preserves_values_and_date(self):
        cached = snapshot()
        def blocked(_):
            raise HTTPError(PROFILE_URL, 429, 'Too Many Requests', {}, None)
        self.assertEqual(refresh_metrics(cached, blocked, now=NOW), cached)

    def test_uses_newer_published_cache_when_scholar_is_blocked(self):
        import json
        published = snapshot('2026-10-14T08:00:00+00:00', 250)
        def fetch(url):
            if url.endswith('.json'):
                return json.dumps(published)
            raise OSError('temporarily unavailable')
        result = refresh_metrics(snapshot(), fetch, now=NOW, previous_url='https://vtsouval.github.io/data/scholar-metrics.json')
        self.assertEqual(result, published)

    def test_foreign_or_malformed_snapshots_are_rejected(self):
        for bad in [dict(snapshot(),profile_id='other'), dict(snapshot(),citations=-1),dict(snapshot(),h_index=True),dict(snapshot(),updated_at='yesterday')]:
            with self.assertRaises(ValueError):
                validate_snapshot(bad)

    def test_no_valid_source_fails_instead_of_inventing_counts(self):
        with self.assertRaises(ValueError):
            refresh_metrics(None, lambda _: 'blocked', now=NOW)

    def test_render_exposes_source_date_and_both_metrics(self):
        rendered = render_metrics(snapshot())
        self.assertIn('244', rendered)
        self.assertIn('h-index <b>8</b>', rendered)
        self.assertIn('13 October 2026', rendered)
        self.assertIn('Google Scholar', rendered)
        self.assertIn(PROFILE_URL.replace('&','&amp;'), rendered)


if __name__ == '__main__':
    unittest.main()
