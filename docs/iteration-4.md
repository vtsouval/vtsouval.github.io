# Training sources and NeurIPS workshop service — 2026-10-13

The CV's professional-development section is now named Training & certificates. Its existing `#development` anchor is preserved. Both NVIDIA records have full workshop titles, exact certificate issue dates, a PDF certificate link and a separate official workshop link. The homepage timeline links to these records.

## NVIDIA competency certificates

- Model Parallelism: Building and Deploying Large Neural Networks — issued 22 January 2026.
- Data Parallelism: How to Train Deep Learning Models on Multiple GPUs — issued 21 January 2026.

The PDF files were found under the author's local `Job Hunting/Certificates` folder and copied unchanged to `assets/certificates/` as requested. Text extraction confirms the recipient, title and issue date; the model-parallelism certificate was also rendered and inspected. The original documents contain competency-certificate IDs but no private email address or account credential. The certificates and course descriptions have distinct labels and destinations.

Official workshop pages:

- https://www.nvidia.com/en-au/training/instructor-led-workshops/model-parallelism-build-deploy-large-neural-networks/
- https://www.nvidia.com/en-gb/training/instructor-led-workshops/train-deep-learning-models-on-multi-gpus/

## ASCI

The supplied page's URL has an old spring-school slug, but its actual title and programme identify the A16 Winter School on Efficient Deep Learning, 28 November–1 December 2023. It belongs to the existing 2023 record, not the separate 2024 Computer Vision by Learning course.

Source: https://asci.school/project/a16-spring-school-on-heterogeneous-computing-systems/

## ICT with Industry

The event ran 15–19 January 2024. Case 3 was Axini's AI/LLMs and Model Based Testing. The outcome report explicitly names Vasileios Tsouvalas as a participant and Dolly Sapra as academic lead. The CV links to the event, supplied case overview and public outcome report.

- Event: https://www.lorentzcenter.nl/ictwi2024
- Supplied case overview: https://www.lorentzcenter.nl/index.php?pntType=ConPagina&pntHandler=DownloadAction&id=2001&conBestandId=3254
- Outcome report: https://ict-research.nl/wp-content/uploads/2024/04/ICT-with-Industry-2024-report-voor-website.pdf

## AgenticOS at NeurIPS 2026

The author supplied the OpenReview reviewer-group link and clarified that the role was for the AgenticOS workshop in 2026. The public organizer site independently lists Vasileios Tsouvalas, Eindhoven University of Technology, under Reviewers / Program Committee Members. The CV and homepage therefore say AgenticOS workshop at NeurIPS 2026, rather than main-conference reviewer.

- Public committee: https://agentic-fmos.github.io/
- Public venue group: https://openreview.net/group?id=NeurIPS.cc/2026/Workshop/AgenticOS
- Author profile: https://openreview.net/profile?id=~Vasileios_Tsouvalas1

The profile itself encountered an access challenge during the check. No review assignments or confidential review content were accessed. The site links to the public workshop page rather than the private reviewer portal.

## Verification

- Both local certificate copies match their source PDFs by SHA-256 and are served as HTTP 200 `application/pdf` by the preview server.
- 131 local file/fragment references and unique IDs checked across the homepage, CV and SVG symbols.
- Desktop and 390px mobile layouts checked without horizontal overflow; the CV's active-section indicator recognizes the renamed training section.
- `git diff --check` passes. Changes remain local; no deployment or external-profile edits.
