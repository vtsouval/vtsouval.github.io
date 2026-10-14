"""Shared local venue badges. Publisher marks identify publishers, not new logos."""
from html import escape
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VENUES = json.loads((ROOT / 'data/venues.json').read_text())


def venue_badge(brand):
    item = VENUES[brand]
    if item.get('icon'):
        artwork = f'<svg class="brand-glyph" aria-hidden="true"><use href="assets/icons.svg#{escape(item["icon"], quote=True)}"></use></svg>'
    elif item.get('file_dark'):
        artwork = ''.join(
            f'<img class="brand-logo brand-logo-{theme}" src="assets/events/{escape(item[key], quote=True)}" alt="" width="40" height="40" decoding="async">'
            for theme, key in [('light', 'file'), ('dark', 'file_dark')]
        )
    else:
        artwork = f'<img class="brand-logo" src="assets/events/{escape(item["file"], quote=True)}" alt="" width="40" height="40" decoding="async">'
    title = f' title="{escape(item.get("name", brand.upper()))} publisher logo"' if item.get('identity') == 'Publisher' else ''
    return f'<span class="brand-mark" aria-hidden="true"{title}>{artwork}</span>'


def venue_link(brand, label, url, inline=False):
    style = 'venue-link' + (' brand-inline' if inline else '')
    return f'<a class="{style}" data-brand="{escape(brand)}" href="{escape(url, quote=True)}">{venue_badge(brand)}<span>{escape(label)}</span></a>'


def publication_venue(publication):
    # Keep the full workshop or journal name; the icon is supplementary.
    label = publication['venue']
    for brand, item in VENUES.items():
        if any(token in label for token in item.get('match', [])):
            return f'<span class="venue-link brand-inline" data-brand="{brand}">{venue_badge(brand)}<span>{escape(label)}</span></span>'
    # New venues remain readable before their artwork is added to the registry.
    return escape(label)
