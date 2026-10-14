#!/usr/bin/env python3
"""Extract compact emblems from the official local SVGs without redrawing paths.

Run from any directory. Source artwork and provenance live in assets/events.
Raster-only identities remain raster files; they are not disguised as vectors.
"""
from copy import deepcopy
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1] / "assets" / "events"
NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", NS)


def source(name):
    return ET.parse(ROOT / name).getroot()


def by_id(root, identifier):
    return next(e for e in root.iter() if e.get("id") == identifier)


def save(name, title, viewbox, elements):
    svg = ET.Element(f"{{{NS}}}svg", {"viewBox": viewbox})
    ET.SubElement(svg, f"{{{NS}}}title").text = title
    for element in elements:
        svg.append(deepcopy(element))
    # Strip editor metadata and IDs; preserve every drawing coordinate/transform.
    for element in svg.iter():
        for key in list(element.attrib):
            if key == "id" or key.startswith("data-") or key.startswith("{"):
                del element.attrib[key]
    target = ROOT / "marks" / name
    target.parent.mkdir(exist_ok=True)
    target.write_text(ET.tostring(svg, encoding="unicode") + "\n")


neurips = source("neurips.svg")
group = ET.Element(f"{{{NS}}}g", {"transform": by_id(neurips, "cvpage2_top").get("transform")})
for identifier in ("path10", "path12"):
    group.append(deepcopy(by_id(neurips, identifier)))
save("neurips.svg", "NeurIPS emblem", "0 0 26 27", [group])

icml = source("icml.svg")
group = ET.Element(f"{{{NS}}}g", {"transform": by_id(icml, "g612").get("transform")})
for identifier in ("g792", "g796", "g800", "g804", "g808"):
    group.append(deepcopy(by_id(icml, identifier)))
save("icml.svg", "ICML emblem", "0 0 98 96", [group])

icassp = source("icassp-2022.svg")
colors = {"cls-2": "#ee384b", "cls-3": "#c63457", "cls-4": "#882947"}
paths = []
for element in icassp.iter(f"{{{NS}}}path"):
    if element.get("class") in colors:
        path = deepcopy(element)
        path.set("fill", colors[path.attrib.pop("class")])
        paths.append(path)
save("icassp-2022.svg", "ICASSP 2022 emblem", "-2 25 108 113", paths)

nvidia = source("nvidia.svg")
save("nvidia.svg", "NVIDIA eye mark", "-1 -1 32.3 22", [by_id(nvidia, "nvidia-logo-eye-mark")])

flower = source("flower.svg")
save("flower.svg", "Flower emblem", "-0.5 -0.5 83.02 73.05", list(flower))
# Keep only the NDSS lock/network emblem, retaining all source transforms.
ndss = source("ndss.svg")
group = ET.Element(f"{{{NS}}}g", {"transform": "translate(-43 -37.936)"})
for identifier in ("Path_19", "Group_3"):
    group.append(deepcopy(by_id(ndss, identifier)))
save("ndss.svg", "NDSS emblem", "-1 -1 29 39", [group])
save("springer.svg", "Springer publisher emblem", "0 0 90 110", list(source("springer.svg"))[:2])
print("Built seven emblems from official vector geometry.")
