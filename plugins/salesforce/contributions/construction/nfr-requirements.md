---
target: nfr-requirements
plugin: salesforce
adds:
  scopes:
    - salesforce-classic
fragments:
  - anchor: before-step:6
    order: 100
---

## fragment: before-step:6

### Step 5a (salesforce): Salesforce NFRs

When the work targets Salesforce, express the NFRs as platform-measurable targets:

- **Governor limit budget** (in `performance-requirements.md`, section
  `## Governor Limit Budget`): per critical synchronous transaction at 200
  records, the target ceilings as a share of the platform limits (100 SOQL
  queries, 50,000 rows retrieved, 150 DML statements, 10,000 DML rows,
  10,000 ms CPU, 6 MB heap, 100 callouts). A typical target is below 50% so that
  other automation on the same object still fits.
- **Scalability** (in `scalability-requirements.md`): data volumes and growth
  per object, query selectivity requirements, async volume (Batch and Queueable
  job counts per day against the org's async Apex limit), and API call budget
  per 24 hours.
- **Security** (in `security-requirements.md`): sharing and CRUD/FLS
  enforcement requirements, sensitive field handling, Code Analyzer severity
  gates (no Critical or High security violations), and secrets only in Named
  Credentials.
- **Testability**: the Apex coverage floor per class and org-wide (at least the
  75% platform floor; the default target is 85% org-wide and 75% per class),
  Jest coverage for LWCs, and bulk tests required for every trigger path.
- **Tech stack decisions** (in `tech-stack-decisions.md`): `sourceApiVersion`,
  the trigger framework, the logging framework, the LWC testing tooling, and
  Code Analyzer.
