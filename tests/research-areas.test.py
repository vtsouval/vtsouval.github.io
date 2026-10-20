"""Verify that clickable area tiles and published paper memberships agree."""
from html.parser import HTMLParser
import json
from pathlib import Path
import unittest
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.tiles = {}
        self.papers = {}
        self.current = None
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'a' and 'area-primary' in attrs.get('class', '').split() and 'data-research-topic' in attrs:
            self.tiles[attrs['data-research-topic']] = attrs['href']
        if tag == 'article' and attrs.get('class') == 'publication':
            self.current = set(attrs['data-topics'].split())
        if tag == 'a' and self.current is not None and attrs.get('title') == 'Project':
            slug = urlparse(attrs['href']).path.strip('/').split('/')[-1].lower().replace('_', '-')
            self.papers[slug] = self.current

    def handle_endtag(self, tag):
        if tag == 'article':
            self.current = None


class ResearchAreaTests(unittest.TestCase):
    def test_tile_destinations_match_complete_publication_groups(self):
        page = Page((ROOT / 'index.html').read_text())
        self.assertEqual(set(page.tiles), {'foundation', 'decentralized', 'privacy'})
        self.assertEqual(len(page.papers), 14)
        self.assertEqual(page.papers['mpsl'], {'foundation', 'decentralized'})
        self.assertEqual(page.papers['efu'], {'privacy'})
        self.assertEqual(page.papers['plix'], {'decentralized'})
        for area, count in [('foundation', 5), ('decentralized', 12), ('privacy', 4)]:
            self.assertEqual(page.tiles[area], f'?topic={area}#publications')
            self.assertEqual(sum(area in memberships for memberships in page.papers.values()), count)

    def test_shared_catalog_has_no_missing_or_private_paper(self):
        source = json.loads((ROOT / 'data/research-areas.json').read_text())
        public = json.loads((ROOT / 'data/publications.json').read_text())
        slugs = {urlparse(p['links']['Project']).path.strip('/').split('/')[-1].lower().replace('_', '-') for p in public}
        mapped = {slug for area in source['areas'] for slug in area['papers']}
        self.assertEqual(slugs, mapped)
        sibling = ROOT.parent / 'nousphera-migration/nousphera-site/data/research-areas.json'
        if sibling.exists():
            self.assertEqual(source, json.loads(sibling.read_text()))


if __name__ == '__main__':
    unittest.main()
