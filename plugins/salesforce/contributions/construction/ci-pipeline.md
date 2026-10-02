---
target: ci-pipeline
plugin: salesforce
adds:
  scopes:
    - salesforce-classic
fragments:
  - anchor: before-step:5
    order: 100
---

## fragment: before-step:5

### Step 4a (salesforce): Salesforce CI pipeline

When the work targets Salesforce, design the CI configuration with Salesforce's
DevOps skills: **`platform-metadata-deploy`** (sf CLI v2 deploy, validate, and
quick-deploy pipelines) and **`dx-code-analyzer-configure`** (the Code Analyzer
configuration and severity gates). If the team uses DevOps Center, use the
**`dx-devops-pipeline-manage`** and **`dx-devops-test-pipeline-configure`**
skills, or the MCP `devops` toolset, instead of a hand-rolled pipeline.

The pipeline must authenticate non-interactively (JWT bearer flow, with secrets
held in CI), and must:

- on pull requests, run Code Analyzer, LWC Jest, and a check-only validation
  with tests;
- on merge, quick-deploy the validated job.

Record failing Apex tests, coverage below the NFR target, and Code Analyzer
findings at severity 1–2 as quality-gate failures in `quality-gates.md`.
