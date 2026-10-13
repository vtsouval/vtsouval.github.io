# Publication resources and search metadata

Verified on 13 October 2026 against public GitHub repository READMEs, arXiv abstracts and TU/e publication records. This audit records resource matching and editorial metadata; it does not validate that repository experiments reproduce the papers. Repository placement does not establish the website author's ownership or maintenance role.

## Scope

All 14 existing publication records, their topic assignments, and the three related versions are retained. Each main record now has a concise `summary`, a `keywords` array for search, and a `sources` array recording the evidence used. Summaries paraphrase the primary abstract's problem and method; they do not reproduce whole abstracts or introduce new performance claims. Keywords include method names, expanded task names, common acronyms and relevant technique terms.

The public inventories were checked through the GitHub REST API: [Nousphera repositories](https://api.github.com/orgs/Nousphera/repos?per_page=100&type=public), [vtsouval repositories](https://api.github.com/users/vtsouval/repos?per_page=100). Additional repositories were located by method-name search and accepted only after checking their README's paper citation.

The personal website now uses Nousphera for its organization links. The maintained FedSTAR, FedLN, and FedCompress copies preserve their original Git history and attribution.

## Verified paper-to-code links

Eight Code links were added; the existing FedSTAR Code link was confirmed. No authorship or maintainer claim was added.

| Publication / method | Public code | Match evidence |
| --- | --- | --- |
| AE-PSL | [Nousphera/AE_PSL](https://github.com/Nousphera/AE_PSL) | README names the paper, authors and [arXiv:2607.17913](https://arxiv.org/abs/2607.17913). |
| MPSL | [Nousphera/MPSL](https://github.com/Nousphera/MPSL) | README title and citation match [arXiv:2502.06355](https://arxiv.org/abs/2502.06355). |
| EFU | [SamaneMohammadi/EFU](https://github.com/SamaneMohammadi/EFU) | README links the CIKM DOI and [arXiv:2508.07873](https://arxiv.org/abs/2508.07873), with matching authors. |
| EncCluster | [SamaneMohammadi/EncCluster](https://github.com/SamaneMohammadi/EncCluster) | README links the journal article and [arXiv:2406.09152](https://arxiv.org/abs/2406.09152), with a matching journal citation. |
| FedLN | [Nousphera/FedLN](https://github.com/Nousphera/FedLN) | README uses the journal title and links [DOI 10.1145/3626242](https://doi.org/10.1145/3626242) and the preprint. |
| FedCompress | [Nousphera/FedCompress](https://github.com/Nousphera/FedCompress) | README links [arXiv:2401.14211](https://arxiv.org/abs/2401.14211) and gives the matching ICASSP 2024 title and DOI. |
| FedCode | [vtsouval/FedCode](https://github.com/vtsouval/FedCode) | README title, authors and [arXiv:2311.09270](https://arxiv.org/abs/2311.09270) match. |
| DA-MLDG | [vtsouval/DA_MLDG](https://github.com/vtsouval/DA_MLDG) | README citation names the same paper, authors and PerFail 2023 venue as the [TU/e record](https://research.tue.nl/en/publications/on-efficacy-of-meta-learning-for-domain-generalization-in-speech-/). |
| FedSTAR — existing link | [Nousphera/FedSTAR](https://github.com/Nousphera/FedSTAR) | README cites both the TECS paper ([DOI 10.1145/3520128](https://doi.org/10.1145/3520128)) and its ICASSP related version. |

## Abstract sources

The complete evidence URL lists live alongside the records in `data/publications.json`.

| Main entry | Primary abstract source |
| --- | --- |
| AE-PSL | [arXiv:2607.17913](https://arxiv.org/abs/2607.17913) |
| MaTU | [arXiv:2502.06376](https://arxiv.org/abs/2502.06376) |
| MPSL | [arXiv:2502.06355](https://arxiv.org/abs/2502.06355) |
| EFU | [arXiv:2508.07873](https://arxiv.org/abs/2508.07873) |
| EncCluster | [arXiv:2406.09152](https://arxiv.org/abs/2406.09152) |
| DeltaMask | [arXiv:2311.17299](https://arxiv.org/abs/2311.17299), checked against the [published paper](https://research.tue.nl/files/349909071/2024337517.pdf) |
| FedLN | [arXiv:2208.09378](https://arxiv.org/abs/2208.09378), with the matching journal title and method in the repository README |
| FedCompress | [arXiv:2401.14211](https://arxiv.org/abs/2401.14211) |
| FedCode | [arXiv:2311.09270](https://arxiv.org/abs/2311.09270) |
| Invisible backdoor attacks | [TU/e publication abstract](https://research.tue.nl/en/publications/on-the-effectiveness-of-invisible-backdoor-attacks-in-federated-l/) |
| PLiX | [arXiv:2305.03058](https://arxiv.org/abs/2305.03058) |
| Meta-learning for speech emotion recognition | [TU/e publication abstract](https://research.tue.nl/en/publications/on-efficacy-of-meta-learning-for-domain-generalization-in-speech-/) |
| FedSTAR | [arXiv:2107.06877](https://arxiv.org/abs/2107.06877) |
| Semi-supervised federated speech emotion recognition | [arXiv:2202.02611](https://arxiv.org/abs/2202.02611) |

FedLN and FedCode numerical results differ between available README and preprint versions. The website summaries describe the common method and omit those metrics. Conference labels, proceedings years and related-version grouping have not been changed by this resource audit.

## Unresolved or unavailable resources

- **PLiX:** the arXiv record links `https://github.com/FewshotML/plix`, but both the public URL and GitHub README API returned HTTP 404 on the audit date. It was not added as an active Code link.
- **MaTU:** no matching public code repository was established in the checked organization inventories, personal inventory or repository searches. Its verified paper link remains available.
- **DeltaMask:** the GitHub repository search returned an unrelated steganography tool and a profile repository. Neither matches the research paper, so neither was linked.
- **Invisible backdoor attacks and semi-supervised federated speech emotion recognition:** no direct paper-to-repository match was established. A repository for a nearby research topic is not sufficient evidence.
- **Nousphera organization profile:** some project entries point directly to papers rather than code. In particular, its EFU row currently shares the MaTU arXiv link; the paper-matched EFU repository was used instead.

These are search outcomes, not claims that code does not exist.

## Public work outside the bibliography

[GridPFN](https://github.com/Nousphera/GridPFN) is a public Nousphera software project, also linked to a [project website](https://nousphera.github.io/GridPFN/). Its README describes personalized home-energy forecasting and planning with TabPFN, federated controller learning and an agentic assistant. The checked README contains no paper title, author list, DOI or arXiv citation establishing a new publication. It is therefore a candidate for a separate software/projects section, not an automatic bibliography addition. Its implementation and benchmark claims were not reproduced in this audit.

The other Nousphera research-code repositories, MPSL and AE_PSL, already correspond to records in the bibliography. No additional publication record is proposed from that organization without bibliographic evidence.
