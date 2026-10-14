#!/usr/bin/env python3
"""Stage only public static resources for GitHub Pages."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
DESTINATION = ROOT / '_site'


def main():
    if DESTINATION.exists():
        shutil.rmtree(DESTINATION)
    DESTINATION.mkdir()
    for source in ROOT.iterdir():
        if source.is_file() and source.suffix in ('.html', '.css', '.xml', '.txt'):
            shutil.copy2(source, DESTINATION / source.name)
    for name in ('assets', 'css', 'js', 'projects', 'data'):
        shutil.copytree(ROOT / name, DESTINATION / name,
                        ignore=shutil.ignore_patterns('.DS_Store', '__pycache__'))
    (DESTINATION / '.nojekyll').touch()
    print(f'Public site staged in {DESTINATION}')


if __name__ == '__main__':
    main()
