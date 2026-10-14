# Research areas

The source of truth is `data/research-areas.json`. The three areas group research
contributions, not mutually exclusive paper categories. Counts refer to the 14
public paper records; related versions of one work are counted once.

| Work | Efficient FMs | Reliable & decentralized learning | Privacy & security |
| --- | --- | --- | --- |
| AE-PSL | Yes | Yes | |
| MaTU | Yes | Yes | |
| MPSL | Yes | Yes | |
| DeltaMask | Yes | Yes | |
| EncCluster | Yes | Yes | Yes |
| EFU | | | Yes |
| FiBA | | | Yes |
| FedCompress | | Yes | |
| FedCode | | Yes | |
| FedLN | | Yes | |
| FedSTAR | | Yes | |
| FedSER | | Yes | Yes |
| PLiX | | Yes | |
| DA-MLDG | | Yes | |

Classification uses the public abstracts and the source-bound method/evaluation
digests for all 14 papers. In particular:

- The FM area includes vision-only and multimodal models. EncCluster's membership
  also reflects its related NeurIPS 2024 Federated Foundation Models paper.
- FL and SL remain distinct methods within decentralized learning. PLiX and
  DA-MLDG belong to the reliable-learning side of this area; neither is presented
  as a distributed algorithm.
- FedSER retains raw speech locally. This is a data-locality contribution, not a
  differential-privacy or update-leakage guarantee. Compression alone does not
  qualify FedCode or DeltaMask as privacy mechanisms.
- Privacy includes attack analysis, not only defenses. EFU and FiBA are placed
  by their main contributions rather than adding them to every FL-related filter.
- Current drafts inform the descriptions of language-model efficiency and
  privacy–fairness trade-offs. They are excluded from public paper/project lists.
  LLM reasoning and agentic systems remain in the profile/current-work context,
  rather than being attached to unrelated published papers.

## Rebuild both sites

From this repository:

```sh
python3 scripts/build_research.py --sync-nousphera ../nousphera-migration/nousphera-site
python3 scripts/build_publications.py
python3 ../nousphera-migration/nousphera-site/scripts/build_projects.py
```

The explicit sync copies the manifest into the independent Nousphera checkout;
each site builds without runtime requests to the other. Add new **public** papers
to the manifest when adding their project/publication record. The builders reject
missing or unknown assignments, and local tests compare the two copies.

Publication links use `?topic=<area>#publications`; project links use
`?area=<area>#collection`. A project search intersects with the selected area.
Browser Back/Forward restores the selected group. Keyboard navigation, modified
link clicks and reduced-motion preferences retain their native behavior.
