"""Render publications into index.html using only the Python standard library."""
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'data/publications.json').read_text())
esc = html.escape
rows = []
for p in sorted(data, key=lambda p: -p['year']):
    authors = esc(p['authors']).replace('V. Tsouvalas', '<strong>V. Tsouvalas</strong>')
    links = ' '.join(f'<a href="{esc(url, quote=True)}">{esc(label)} <span aria-hidden="true">↗</span></a>' for label, url in p['links'].items())
    related = ''.join(f'<li><a href="{esc(v["url"], quote=True)}">{esc(v["title"])}</a> — {esc(v["venue"])}</li>' for v in p.get('related', []))
    versions = f'<details><summary>Related publication</summary><ul>{related}</ul></details>' if related else ''
    rows.append(f'''<article class="publication" data-topics="{esc(' '.join(p['topics']))}">
  <div class="pub-year">{p['year']}</div>
  <div><div class="pub-meta">{esc(p['venue'])} <span>· {esc(p['type'])}</span></div>
  <h3>{esc(p['title'])}</h3><p class="authors">{authors}</p>
  <div class="paper-links">{links}</div>{versions}</div>
</article>''')
page = ROOT / 'index.html'
text = page.read_text()
start, end = '<!-- PUBLICATIONS START -->', '<!-- PUBLICATIONS END -->'
assert text.count(start) == text.count(end) == 1
before = text.split(start)[0]
after = text.split(end)[1]
page.write_text(before + start + '\n' + '\n'.join(rows) + '\n' + end + after)
print(f'Rendered {len(rows)} publication entries with {sum(len(p.get("related", [])) for p in data)} related versions.')
