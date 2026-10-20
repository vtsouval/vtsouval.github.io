"""Build the shared research-area tiles; optionally sync the Nousphera manifest."""
import argparse
from html import escape as esc
import json
from pathlib import Path
import re
from urllib.parse import urlparse

from build_icons import inline_icons

ROOT = Path(__file__).resolve().parents[1]


def build(sync_to=None):
    source = ROOT / 'data/research-areas.json'
    areas = json.loads(source.read_text())['areas']
    papers = json.loads((ROOT / 'data/publications.json').read_text())
    slugs = {urlparse(p['links']['Project']).path.strip('/').split('/')[-1].lower().replace('_', '-') for p in papers}
    assigned = {slug for area in areas for slug in area['papers']}
    if assigned != slugs:
        raise ValueError(f'Research areas must cover exactly the public paper catalog: {assigned ^ slugs}')
    if len({a['id'] for a in areas}) != len(areas):
        raise ValueError('Research area IDs must be unique')

    def icon(name, cls='icon'):
        return f'<svg class="{cls}" aria-hidden="true"><use href="assets/icons.svg#{name}"></use></svg>'

    cards = []
    for area in areas:
        key, title = area['id'], esc(area['title'])
        cards.append(f'''<article class="area-card" data-area="{key}">
  <a class="area-primary" href="?topic={key}#publications" data-research-topic="{key}" aria-label="{title} — view publications">
    <span class="area-symbol">{icon(area['icon'])}</span>
    <h3>{title}</h3><p>{esc(area['description'])}</p>
    <span class="area-papers"><span>Publications</span>{icon('arrow')}</span>
  </a>
  <a class="area-projects" href="https://nousphera.github.io/?area={key}#collection" aria-label="{title} — projects on Nousphera" title="Projects on Nousphera">{icon('project')}<span>Projects</span>{icon('arrow')}</a>
</article>''')
    markup = f'''<section id="research" class="section shell research" aria-labelledby="research-title">
  <span id="code" class="section-anchor" aria-hidden="true"></span>
  <div class="section-heading"><h2 id="research-title">Research Areas</h2></div>
  <div class="research-grid">{''.join(cards)}</div>
</section>'''
    page = ROOT / 'index.html'
    text = page.read_text()
    start, end = '<!-- RESEARCH START -->', '<!-- RESEARCH END -->'
    assert text.count(start) == text.count(end) == 1
    text = text.split(start)[0] + start + '\n' + inline_icons(markup) + '\n' + end + text.split(end)[1]
    buttons = '<button type="button" data-filter="all" aria-pressed="true">All Work</button>'
    buttons += ''.join(f'<button type="button" data-filter="{a["id"]}" aria-pressed="false">{esc(a["title"])}</button>' for a in areas)
    text, count = re.subn(r'(<div class="filters"[^>]*>).*?(</div>)', lambda m: m[1] + buttons + m[2], text, count=1, flags=re.S)
    assert count == 1
    page.write_text(text)
    if sync_to:
        target = Path(sync_to) / 'data/research-areas.json'
        if not target.parent.is_dir():
            raise ValueError('Nousphera target must be an existing site checkout')
        target.write_bytes(source.read_bytes())
    print(f'Built {len(areas)} research areas covering {len(slugs)} public papers.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sync-nousphera', type=Path, help='Existing Nousphera site checkout')
    build(parser.parse_args().sync_nousphera)
