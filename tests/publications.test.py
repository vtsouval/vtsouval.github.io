"""Black-box checks of the publication generator without changing the working page."""
import json
from html.parser import HTMLParser
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class PublicationHTML(HTMLParser):
    def __init__(self):
        super().__init__()
        self.articles = []
        self.keywords = 0
        self.keyword_elements = []
        self.details = []
        self.text = []
        self.links = []

    def handle_starttag(self, tag, attributes):
        attributes = dict(attributes)
        if tag == 'article':
            self.articles.append(attributes)
        if attributes.get('class') == 'pub-keyword':
            self.keywords += 1
            self.keyword_elements.append((tag, attributes))
        if tag == 'details':
            self.details.append(attributes)
        if tag == 'a':
            self.links.append(attributes)

    def handle_data(self, text):
        self.text.append(text)


class PublicationBuildTests(unittest.TestCase):
    paper = {
        'title': 'Café: Robust Models', 'authors': 'A. García, V. Tsouvalas',
        'year': 2025, 'venue': 'ICASSP', 'type': 'Conference',
        'topics': ['efficient'],
        'keywords': ['speech', 'noise', 'fine-tuning', 'edge', 'compression'],
        'summary': 'Representations for noisy environments & low-resource devices.',
        'links': {'Paper': 'https://example.org/paper?a=1&b=2'},
        'related': [{'title': 'Earlier Speech Models', 'venue': 'ICML 2024', 'url': 'https://example.org/earlier'}],
    }

    def render(self, papers, areas=None):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'scripts').mkdir()
            (root / 'data').mkdir()
            (root / 'assets').mkdir()
            shutil.copyfile(ROOT / 'scripts/build_publications.py', root / 'scripts/build_publications.py')
            shutil.copyfile(ROOT / 'scripts/build_icons.py', root / 'scripts/build_icons.py')
            shutil.copyfile(ROOT / 'scripts/venue_assets.py', root / 'scripts/venue_assets.py')
            shutil.copyfile(ROOT / 'data/venues.json', root / 'data/venues.json')
            shutil.copyfile(ROOT / 'assets/icons.svg', root / 'assets/icons.svg')
            (root / 'data/publications.json').write_text(json.dumps(papers))
            if areas is not None:
                (root / 'data/research-areas.json').write_text(json.dumps({'areas': areas}))
            (root / 'data/people.json').write_text(json.dumps({'A. García': {'name': 'Ana García', 'url': 'https://example.org/author'}}))
            (root / 'index.html').write_text('<main><!-- PUBLICATIONS START --><!-- PUBLICATIONS END --></main>')
            subprocess.run(['python3', str(root / 'scripts/build_publications.py')], check=True, capture_output=True)
            markup = (root / 'index.html').read_text()
        parsed = PublicationHTML()
        parsed.feed(markup)
        return markup, parsed

    def test_search_index_contains_metadata_and_nonvisible_keyword_and_related_version(self):
        _, parsed = self.render([self.paper])
        article = parsed.articles[0]
        self.assertEqual(article.get('data-year'), '2025')
        text = article.get('data-search', '')
        for term in ['Café', 'García', '2025', 'ICASSP', 'Conference', 'efficient', 'compression', 'noisy environments', 'Earlier Speech Models', 'ICML 2024']:
            self.assertIn(term, text)

    def test_abstract_is_available_without_javascript_and_collapsed_initially(self):
        markup, parsed = self.render([self.paper])
        self.assertEqual(parsed.keywords, 0)
        self.assertNotIn('hidden', parsed.articles[0])
        self.assertTrue(any(d.get('class') == 'pub-disclosure' and 'open' not in d for d in parsed.details))
        self.assertIn('noisy environments &amp; low-resource', markup)
        self.assertTrue(all(d.get('name') == 'publication-abstract' for d in parsed.details))

    def test_repository_page_urls_preserve_research_area_filters(self):
        paper = {**self.paper, 'links': {
            **self.paper['links'], 'Project': 'https://nousphera.github.io/AE_PSL/'}}
        _, parsed = self.render([paper], areas=[
            {'id': 'foundation', 'title': 'Foundation models', 'papers': ['ae-psl']},
            {'id': 'decentralized', 'title': 'Decentralized learning', 'papers': ['ae-psl']},
        ])
        self.assertEqual(set(parsed.articles[0]['data-topics'].split()),
                         {'foundation', 'decentralized'})

    def test_authors_are_plain_text_even_when_profile_metadata_exists(self):
        markup, parsed = self.render([self.paper])
        self.assertNotIn('https://example.org/author', markup)
        self.assertIn('A. García', ' '.join(parsed.text))
        self.assertIn('<strong>V. Tsouvalas</strong>', markup)

    def test_article_ids_survive_reordering(self):
        other = {**self.paper, 'title': 'Another Study', 'year': 2024}
        _, first = self.render([self.paper, other])
        _, second = self.render([other, self.paper])
        first_ids = [article.get('id') for article in first.articles]
        self.assertTrue(all(first_ids))
        self.assertEqual(len(set(first_ids)), 2)
        self.assertEqual(first_ids, [article.get('id') for article in second.articles])

    def test_keywords_remain_searchable_without_visible_keyword_labels(self):
        _, parsed = self.render([self.paper])
        self.assertFalse(parsed.keyword_elements)
        self.assertIn('compression', parsed.articles[0]['data-search'])
        self.assertNotIn('compression', ' '.join(parsed.text))

    def test_publication_icons_render_without_external_svg_requests(self):
        markup, _ = self.render([self.paper])
        self.assertNotIn('<use', markup)
        self.assertIn('data-icon="file"', markup)
        self.assertIn('viewBox="0 0 24 24"', markup)

    def test_event_location_is_searchable_and_html_safe(self):
        paper = {**self.paper, 'event': {
            'location': 'Changsha, China & <test>', 'attendance': 'virtual',
            'url': 'https://example.org/event?a=1&b=2',
            'date_label': '29–31 December 2024',
        }}
        markup, parsed = self.render([paper])
        self.assertIn('Changsha, China & <test> (Virtual Attendance)', parsed.articles[0]['data-search'])
        self.assertIn('Changsha, China &amp; &lt;test&gt; (Virtual Attendance)', markup)
        self.assertNotIn('Changsha', ' '.join(parsed.text))
        self.assertNotIn('29–31 December 2024', ' '.join(parsed.text))

    def test_related_version_has_its_own_venue_and_searchable_event_context(self):
        paper = {**self.paper, 'related': [{
            'title': 'An Earlier Workshop Paper', 'venue': 'PerCom 2022 · Workshop',
            'url': 'https://example.org/workshop',
            'event': {'location': 'Pisa, Italy', 'format': 'virtual'},
        }]}
        markup, parsed = self.render([paper])
        self.assertIn('PerCom', ' '.join(parsed.text))
        self.assertIn('Virtual Event · Pisa, Italy (Host)', markup)
        self.assertIn('Pisa, Italy', parsed.articles[0]['data-search'])
        self.assertNotIn('Pisa, Italy', ' '.join(parsed.text))
        self.assertTrue(any(a.get('href') == 'https://example.org/workshop' and
                            'An Earlier Workshop Paper' in a.get('aria-label', '') for a in parsed.links))
        self.assertNotIn('related-publications', markup)

    def test_resource_icons_are_named_and_repositories_are_not_duplicated(self):
        paper = {**self.paper, 'links': {**self.paper['links'],
            'Code': 'https://github.com/example/code',
            'Repository': 'https://github.com/example/code',
            'Project': 'https://example.org/project',
            'Poster': 'https://example.org/poster.pdf'}}
        markup, parsed = self.render([paper])
        resources = [a for a in parsed.links if a.get('class') == 'pub-resource']
        self.assertEqual(len(resources), 4)
        self.assertEqual(len({a['href'] for a in resources}), 4)
        self.assertTrue(all(a.get('aria-label') and a.get('title') for a in resources))
        self.assertIn('data-icon="poster"', markup)
        self.assertIn('data-icon="project"', markup)

    def test_preprint_uses_simple_status_instead_of_identifier_as_venue(self):
        _, parsed = self.render([{**self.paper, 'venue': 'arXiv:1234.56789', 'type': 'Preprint', 'related': []}])
        self.assertIn('Preprint', ' '.join(parsed.text))
        self.assertNotIn('arXiv:1234.56789', ' '.join(parsed.text))
        self.assertIn('arXiv:1234.56789', parsed.articles[0]['data-search'])

    def test_resources_only_repository_is_not_advertised_as_released_code(self):
        paper = {**self.paper, 'links': {**self.paper['links'],
            'Repository': 'https://github.com/example/resources-only',
            'Project': 'https://example.org/project'}}
        _, parsed = self.render([paper])
        self.assertFalse(any(a.get('aria-label', '').startswith('Code —') for a in parsed.links))
        self.assertTrue(any(a.get('href') == 'https://example.org/project' for a in parsed.links))


if __name__ == '__main__':
    unittest.main()
