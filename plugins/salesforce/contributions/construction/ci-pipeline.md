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

When the work targets Salesforce, the generated CI configuration (GitHub
Actions, GitLab CI, Azure DevOps, or the team's tool) must:

- Install the `sf` CLI (`npm install --global @salesforce/cli`) and the Code
  Analyzer plugin.
- Authenticate non-interactively with the JWT bearer flow:
  `sf org login jwt --client-id $SF_CLIENT_ID --jwt-key-file server.key --username $SF_USERNAME --instance-url <login url> --alias ci-target`.
  Keep the key and client id in CI secrets, never in the repository.
- On pull requests: run LWC Jest, ESLint, and Code Analyzer (fail on severity
  1–2), then a check-only validation
  (`sf project deploy validate --source-dir <dirs> --test-level RunLocalTests --target-org ci-target`)
  or a deploy to an ephemeral scratch org with `sf apex run test --code-coverage`.
- On merge to the release branch: quick deploy the validated job id
  (`sf project deploy quick --job-id <id>`), or a full deploy with tests for
  non-production targets.
- Optionally deploy deltas with `sfdx-git-delta` when the project uses it,
  including generated destructive changes.
- Treat failing Apex tests, coverage below the NFR target, and Critical or High
  analyzer findings as quality-gate failures in `quality-gates.md`.
