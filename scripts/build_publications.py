"""Render publications into index.html using only the Python standard library."""
import html
import json
import re
import unicodedata
from pathlib import Path
from urllib.parse import urlparse
from build_icons import build_icons

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'data/publications.json').read_text())
area_path = ROOT / 'data/research-areas.json'
areas = json.loads(area_path.read_text())['areas'] if area_path.exists() else []
esc = html.escape
topic_names = {
    'efficient': 'efficiency',
    'foundation': 'foundation models',
    'federated': 'federated learning',
    'privacy': 'privacy security',
    'supervision': 'limited supervision',
}
topic_names.update({area['id']: area['title'] for area in areas})


def research_topics(publication):
    slug = urlparse(publication.get('links', {}).get('Project', '')).path.strip('/').split('/')[-1].lower().replace('_', '-')
    matches = [area['id'] for area in areas if slug in area['papers']]
    return matches or publication['topics']


def publication_id(publication):
    title = unicodedata.normalize('NFKD', publication.get('id', publication['title']))
    title = title.encode('ascii', 'ignore').decode().lower()
    return 'pub-' + re.sub(r'[^a-z0-9]+', '-', title).strip('-')


def link_icon(label, url=''):
    if label == 'Video':
        return '<svg class="youtube-mark" aria-hidden="true"><use href="assets/icons.svg#youtube"></use></svg>'
    icon = {'Paper': 'file', 'Preprint': 'file', 'Code': 'code', 'Project': 'project', 'Poster': 'poster', 'Cite': 'quote', 'Expand': 'chevron'}.get(label, 'external')
    if label == 'Code' and urlparse(url).hostname == 'github.com':
        icon = 'github'
    return f'<svg class="icon" aria-hidden="true"><use href="assets/icons.svg#{icon}"></use></svg>'


def render_authors(authors):
    rendered = []
    for author in authors.split(', '):
        if author == 'V. Tsouvalas':
            rendered.append(f'<strong>{esc(author)}</strong>')
        else:
            rendered.append(esc(author))
    return ', '.join(rendered)


def event_text(publication):
    event = publication.get('event')
    if not event:
        return ''
    location = event['location']
    if event.get('format') == 'virtual':
        location = f'Virtual Event · {location} (Host)'
    elif event.get('attendance') == 'virtual':
        location += ' (Virtual Attendance)'
    return location


def render_venue(publication, fallback_year=None, related=False):
    """Keep each version and its workshop status explicit in a compact side column."""
    original = publication['venue']
    label = original.split(' · ')[0]
    kind = publication.get('type', '')
    year_match = re.search(r'\b(20\d{2})\b', label)
    year = year_match.group(1) if year_match else str(publication.get('year', fallback_year or ''))
    subtitle = ''
    if '@' in label:
        subtitle, label = [part.strip() for part in label.rsplit('@', 1)]
        subtitle += ' · Workshop'
    elif kind == 'Workshop' or 'Workshop' in original:
        subtitle = 'Workshop'
    label = re.sub(r'\s*\b20\d{2}\b', '', label).strip()
    label = re.sub(r'^(?:IEEE|ACM)\s+(?=ICASSP|CIKM|PerCom)', '', label)
    if label == 'Pervasive and Mobile Computing':
        label = 'Pervasive & Mobile Computing'
    is_preprint = kind == 'Preprint' or original.startswith('arXiv:')
    if is_preprint:
        label, subtitle = 'Preprint', ''
    subline = f'<span class="pub-venue-note">{esc(subtitle)}</span>' if subtitle else ''
    content = f'<span class="pub-venue-copy"><span class="pub-venue-line"><span>{esc(label)}</span><time>{esc(year)}</time></span>{subline}</span>'
    links = publication.get('links', {})
    url = publication.get('url') or links.get('Published Version') or links.get('Paper')
    description = ('Related publication: ' if related else '') + publication['title'] + ' — ' + original
    if url:
        return f'<a class="pub-venue" href="{esc(url, quote=True)}" title="{esc(description, quote=True)}" aria-label="{esc(description, quote=True)}">{content}</a>'
    return f'<span class="pub-venue">{content}</span>'


def render_resources(publication):
    links = publication['links']
    # A resources-only repository is not evidence of a released implementation.
    code = links.get('Code')
    resources = [('Paper', links.get('Paper') or links.get('Preprint')),
                 ('Project', links.get('Project')), ('Code', code),
                 ('Poster', links.get('Poster')), ('Video', links.get('Video'))]
    return ''.join(
        f'<a class="pub-resource" href="{esc(url, quote=True)}" aria-label="{esc(label + " — " + publication["title"], quote=True)}" title="{label}">{link_icon(label, url)}<span class="pub-tooltip" aria-hidden="true">{label}</span></a>'
        for label, url in resources if url
    )


def render_abstract(publication):
    text = f'<p>{esc(publication["summary"])}</p>' if publication.get('summary') else ''
    versions = []
    links = publication['links']
    for label in ['Published Version', 'Preprint']:
        if links.get(label) and links[label] != links.get('Paper'):
            versions.append(f'<a href="{esc(links[label], quote=True)}">{esc(label)}</a>')
    for version in publication.get('related', []):
        versions.append(f'<a href="{esc(version["url"], quote=True)}">{esc(version["title"])}</a>')
    extra = '<div class="pub-version-links">' + ' <span aria-hidden="true">·</span> '.join(versions) + '</div>' if versions else ''
    return f'<div class="pub-abstract"><span class="pub-abstract-label">Short Abstract</span>{text}{extra}</div>'


rows = []
for p in sorted(data, key=lambda p: -p['year']):
    topics = research_topics(p)
    authors = render_authors(p['authors'])
    links = render_resources(p)
    venues = render_venue(p) + ''.join(render_venue(v, p['year'], related=True) for v in p.get('related', []))
    search = ' '.join([
        p['title'], p['authors'], str(p['year']), p['venue'], p['type'],
        *p['topics'], *topics, *(topic_names.get(topic, topic) for topic in topics),
        *p.get('keywords', []), p.get('summary', ''),
        event_text(p), p.get('event', {}).get('date_label', ''),
        *(f'{version["title"]} {version["venue"]} {event_text(version)}' for version in p.get('related', [])),
    ])
    rows.append(f'''<article class="publication" id="{publication_id(p)}" data-year="{p['year']}" data-topics="{esc(' '.join(topics))}" data-search="{esc(search, quote=True)}">
  <details class="pub-disclosure" name="publication-abstract"><summary title="Toggle short abstract"><h3>{esc(p['title'])}</h3><span class="pub-expand">{link_icon('Expand')}<span class="sr-only">Short abstract</span></span></summary>{render_abstract(p)}</details>
  <div class="pub-byline"><p class="authors">{authors}</p><div class="pub-resources" role="group" aria-label="Paper resources">{links}</div></div>
  <div class="pub-venues" role="group" aria-label="Publication venues and related versions">{venues}</div>
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
