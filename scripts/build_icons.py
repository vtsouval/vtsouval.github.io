"""Inline the local icon sprite for reliable HTTP and file:// rendering.

Run `python3 scripts/build_icons.py` after editing either HTML page or the sprite.
Generated SVGs retain data-icon so subsequent builds also refresh inline icons.
Publication generation can import build_icons and call it after writing HTML.
"""
from copy import deepcopy
from html import escape
from html.parser import HTMLParser
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SPRITE = ROOT / 'assets/icons.svg'
SVG = re.compile(r'<svg\b(?P<attrs>[^>]*)>(?P<body>.*?)</svg\s*>', re.I | re.S)
USE = re.compile(r'\s*<use\b(?P<attrs>[^>]*?)(?:/\s*>|>\s*</use\s*>)\s*', re.I | re.S)
PRESENTATION = ('fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin')


class Attributes(HTMLParser):
    def handle_starttag(self, tag, attrs):
        self.attributes = dict(attrs)


def attributes(source):
    parser = Attributes()
    parser.feed('<svg' + source + '>')
    return parser.attributes


def set_attribute(source, name, value):
    """Change one attribute without reformatting unrelated HTML attributes."""
    pattern = re.compile(r'\s+' + re.escape(name) + r'\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>]+)', re.I)
    return pattern.sub('', source).rstrip() + f' {name}="{escape(value, quote=True)}"'


def inline_icons(text, sprite_path=None):
    """Return HTML with only this site's icon references replaced by geometry."""
    sprite = ET.parse(sprite_path or SPRITE).getroot()
    symbols = {}
    for symbol in sprite:
        if symbol.tag.split('}')[-1] != 'symbol':
            continue
        children = [deepcopy(child) for child in symbol]
        for child in children:
            for element in child.iter():
                element.tag = element.tag.split('}')[-1]
        geometry = ''.join(ET.tostring(child, encoding='unicode', short_empty_elements=True) for child in children)
        symbols[symbol.attrib['id']] = (symbol.attrib.get('viewBox', '0 0 24 24'), geometry)

    def replace(match):
        source = match['attrs']
        existing = attributes(source)
        name = existing.get('data-icon')
        if not name:
            use = USE.fullmatch(match['body'])
            if not use:
                return match.group(0)
            reference = attributes(use['attrs'])
            href = reference.get('href', reference.get('xlink:href', ''))
            if not href.startswith('assets/icons.svg#'):
                return match.group(0)
            name = href.split('#', 1)[1]
        if name not in symbols:
            raise ValueError(f'Unknown icon symbol: {name}')
        viewbox, geometry = symbols[name]
        # Stable ordering makes the first and later builds byte-for-byte identical.
        managed = {'data-icon': name, 'viewBox': viewbox, 'focusable': 'false'}
        managed.update({key: sprite.attrib[key] for key in PRESENTATION if key in sprite.attrib})
        for key, value in managed.items():
            source = set_attribute(source, key, value)
        return f'<svg{source}>{geometry}</svg>'

    return SVG.sub(replace, text)


def build_icons(paths=None):
    """Update the supplied HTML paths (both public pages by default)."""
    changed = 0
    for path in paths if paths is not None else [ROOT / 'index.html', ROOT / 'cv.html']:
        path = Path(path)
        original = path.read_text(encoding='utf-8')
        rendered = inline_icons(original)
        if rendered != original:
            path.write_text(rendered, encoding='utf-8')
            changed += 1
    return changed


if __name__ == '__main__':
    print(f'Updated inline icons in {build_icons()} page(s).')
