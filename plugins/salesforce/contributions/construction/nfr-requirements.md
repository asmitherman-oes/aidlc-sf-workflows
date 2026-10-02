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

When the work targets Salesforce, write each NFR as a target the platform can
measure. Take every limit value from **`platform-docs-get`** (governor limits),
never from memory.

- **Governor limit budget** (in `performance-requirements.md`, a
  `## Governor Limit Budget` section). For each critical synchronous transaction
  at 200 records, set a ceiling as a share of each platform limit: SOQL queries,
  rows, DML statements, DML rows, CPU, heap, and callouts.
- **Scalability** (in `scalability-requirements.md`):
  - volumes and growth per object;
  - query selectivity, checked with **`platform-soql-query`**;
  - the async job budget;
  - the 24-hour API call budget.
- **Security** (in `security-requirements.md`):
  - sharing and CRUD/FLS enforcement;
  - sensitive field handling;
  - zero Code Analyzer findings at severity 1–2 (**`dx-code-analyzer-run`**);
  - secrets only in Named Credentials.
- **Testability**:
  - Apex coverage: at least the 75% platform floor, with a default target of
    85% org-wide and 75% per class;
  - bulk tests for every trigger path;
  - LWC Jest tests.
- **Tech stack decisions** (in `tech-stack-decisions.md`): `sourceApiVersion`,
  the trigger framework, logging, and the Salesforce skills and MCP toolsets
  this project requires.
