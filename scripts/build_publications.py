"""Render publications into index.html using only the Python standard library."""
import html
import json
import re
import unicodedata
from pathlib import Path
from build_icons import build_icons

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'data/publications.json').read_text())
esc = html.escape
topic_names = {
    'efficient': 'efficiency',
    'foundation': 'foundation models',
    'federated': 'federated learning',
    'privacy': 'privacy security',
    'supervision': 'limited supervision',
}


def publication_id(publication):
    title = unicodedata.normalize('NFKD', publication.get('id', publication['title']))
    title = title.encode('ascii', 'ignore').decode().lower()
    return 'pub-' + re.sub(r'[^a-z0-9]+', '-', title).strip('-')


def link_icon(label):
    icon = {'Paper': 'file', 'Preprint': 'file', 'Code': 'code', 'Cite': 'quote'}.get(label, 'external')
    return f'<svg class="icon" aria-hidden="true"><use href="assets/icons.svg#{icon}"></use></svg>'


rows = []
for p in sorted(data, key=lambda p: -p['year']):
    authors = esc(p['authors']).replace('V. Tsouvalas', '<strong>V. Tsouvalas</strong>')
    links = ' '.join(f'<a href="{esc(url, quote=True)}">{link_icon(label)}{esc(label)}</a>' for label, url in p['links'].items())
    related = ''.join(f'<li><a href="{esc(v["url"], quote=True)}">{esc(v["title"])}</a> — {esc(v["venue"])}</li>' for v in p.get('related', []))
    versions = f'<details class="related-publications"><summary>Related publication</summary><ul>{related}</ul></details>' if related else ''
    keywords = ''.join(f'<span class="pub-keyword" data-keyword="{esc(keyword, quote=True)}">{esc(keyword)}</span>' for keyword in p.get('keywords', [])[:4])
    keywords = f'<div class="pub-keywords" aria-label="Keywords">{keywords}</div>' if keywords else ''
    summary = f'<details class="pub-summary"><summary>Summary</summary><p>{esc(p["summary"])}</p></details>' if p.get('summary') else ''
    search = ' '.join([
        p['title'], p['authors'], str(p['year']), p['venue'], p['type'],
        *p['topics'], *(topic_names.get(topic, topic) for topic in p['topics']),
        *p.get('keywords', []), p.get('summary', ''),
        *(f'{version["title"]} {version["venue"]}' for version in p.get('related', [])),
    ])
    rows.append(f'''<article class="publication" id="{publication_id(p)}" data-year="{p['year']}" data-topics="{esc(' '.join(p['topics']))}" data-search="{esc(search, quote=True)}">
  <div class="pub-year">{p['year']}</div>
  <div><div class="pub-meta">{esc(p['venue'])} <span>· {esc(p['type'])}</span></div>
  <h3>{esc(p['title'])}</h3><p class="authors">{authors}</p>
  {keywords}<div class="paper-links">{links}</div>{summary}{versions}</div>
</article>''')
page = ROOT / 'index.html'
text = page.read_text()
start, end = '<!-- PUBLICATIONS START -->', '<!-- PUBLICATIONS END -->'
assert text.count(start) == text.count(end) == 1
before = text.split(start)[0]
after = text.split(end)[1]
page.write_text(before + start + '\n' + '\n'.join(rows) + '\n' + end + after)
build_icons([page])
print(f'Rendered {len(rows)} publication entries with {sum(len(p.get("related", [])) for p in data)} related versions.')
