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

    def handle_starttag(self, tag, attributes):
        attributes = dict(attributes)
        if tag == 'article':
            self.articles.append(attributes)
        if attributes.get('class') == 'pub-keyword':
            self.keywords += 1
            self.keyword_elements.append((tag, attributes))
        if tag == 'details':
            self.details.append(attributes)


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

    def render(self, papers):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'scripts').mkdir()
            (root / 'data').mkdir()
            shutil.copyfile(ROOT / 'scripts/build_publications.py', root / 'scripts/build_publications.py')
            (root / 'data/publications.json').write_text(json.dumps(papers))
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

    def test_keeps_static_content_with_compact_keywords_and_collapsed_summary(self):
        markup, parsed = self.render([self.paper])
        self.assertEqual(parsed.keywords, 4)
        self.assertNotIn('hidden', parsed.articles[0])
        self.assertTrue(any(d.get('class') == 'pub-summary' and 'open' not in d for d in parsed.details))
        self.assertIn('noisy environments &amp; low-resource', markup)

    def test_article_ids_survive_reordering(self):
        other = {**self.paper, 'title': 'Another Study', 'year': 2024}
        _, first = self.render([self.paper, other])
        _, second = self.render([other, self.paper])
        first_ids = [article.get('id') for article in first.articles]
        self.assertTrue(all(first_ids))
        self.assertEqual(len(set(first_ids)), 2)
        self.assertEqual(first_ids, [article.get('id') for article in second.articles])

    def test_keywords_preserve_search_queries_as_static_labels_without_javascript(self):
        _, parsed = self.render([self.paper])
        self.assertEqual([attributes.get('data-keyword') for tag, attributes in parsed.keyword_elements],
                         ['speech', 'noise', 'fine-tuning', 'edge'])
        self.assertTrue(all(tag == 'span' for tag, attributes in parsed.keyword_elements))


if __name__ == '__main__':
    unittest.main()
