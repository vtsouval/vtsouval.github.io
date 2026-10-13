"""Check generated icons without rewriting the working HTML pages."""
from pathlib import Path
import sys
import tempfile
import unittest
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from build_icons import build_icons, inline_icons


class IconBuildTests(unittest.TestCase):
    def test_inlines_geometry_and_preserves_accessibility_attributes(self):
        source = '<svg class="icon" aria-hidden="true"><use href="assets/icons.svg#mail"></use></svg>'
        output = inline_icons(source)
        icon = ET.fromstring(output)
        self.assertEqual(icon.get('viewBox'), '0 0 24 24')
        self.assertEqual(icon.get('aria-hidden'), 'true')
        self.assertEqual(icon.get('focusable'), 'false')
        self.assertEqual(icon.get('stroke'), 'currentColor')
        self.assertEqual(icon.get('data-icon'), 'mail')
        self.assertEqual([child.tag for child in icon], ['rect', 'path'])
        self.assertNotIn('<use', output)
        self.assertEqual(inline_icons(output), output)

    def test_keeps_unrelated_svg_and_markup_byte_for_byte(self):
        source = '<p>A &amp; B</p>\n<svg viewBox="0 0 4 4"><path d="M0 0h4"/></svg><svg><use href="elsewhere.svg#mail"/></svg>'
        self.assertEqual(inline_icons(source), source)

    def test_handles_xlink_and_rejects_unknown_sprite_symbols(self):
        self.assertIn('data-icon="sun"', inline_icons("<svg><use xlink:href='assets/icons.svg#sun'/></svg>"))
        with self.assertRaisesRegex(ValueError, 'unknown'):
            inline_icons('<svg><use href="assets/icons.svg#unknown"/></svg>')

    def test_existing_inline_icons_refresh_when_sprite_geometry_changes(self):
        original = inline_icons('<svg><use href="assets/icons.svg#mail"/></svg>')
        with tempfile.TemporaryDirectory() as directory:
            sprite = Path(directory) / 'icons.svg'
            sprite.write_text('<svg fill="none" stroke="currentColor"><symbol id="mail" viewBox="0 0 10 10"><path d="M1 2h3"/></symbol></svg>')
            updated = inline_icons(original, sprite)
            self.assertIn('viewBox="0 0 10 10"', updated)
            self.assertIn('M1 2h3', updated)
            self.assertNotIn('<rect', updated)
            self.assertEqual(inline_icons(updated, sprite), updated)

    def test_build_is_idempotent_and_contains_no_external_dependencies(self):
        with tempfile.TemporaryDirectory() as directory:
            pages = [Path(directory) / name for name in ['index.html', 'cv.html']]
            for page in pages:
                page.write_text('<svg class="icon"><use href="assets/icons.svg#github"/></svg>')
            self.assertEqual(build_icons(pages), 2)
            first = [page.read_bytes() for page in pages]
            self.assertEqual(build_icons(pages), 0)
            self.assertEqual([page.read_bytes() for page in pages], first)
            self.assertTrue(all(b'fill="currentColor"' in output for output in first))


if __name__ == '__main__':
    unittest.main()
