# Salesforce DevOps Guide

## Development models

| Model | When | Unit of deployment |
|-------|------|--------------------|
| Org development (source tracking off) | Existing production org, sandboxes, no packaging | Manifest (`package.xml`) or source paths |
| Source-driven + scratch orgs | Greenfield or modular teams with a Dev Hub | Source paths, promoted through sandboxes |
| Unlocked packages | Modular org with independently versioned domains | Package version (`sf package version create`, then `install`) |
| 2GP managed packages | ISV / AppExchange | Namespaced, promoted package versions |

## Environments

- **Scratch orgs**: disposable (1–30 days), defined by
  `config/project-scratch-def.json` (edition, features, settings). Use one per
  feature or developer, and seed them with `sf data import tree` or a data plan.
- **Sandboxes**: Developer (metadata only), Developer Pro (more storage),
  Partial Copy (sample data, template-driven), and Full (complete copy, for UAT
  and performance). Plan refresh cadence and post-refresh steps such as email
  deliverability, integration endpoints, and masked data.
- **Promotion path**: dev (scratch or dev sandbox), then integration/QA sandbox,
  then UAT (partial or full), then production. Every promotion is from git,
  never sandbox-to-sandbox change sets.

## Deployment discipline

1. **Validate first.** For production, run `sf project deploy validate` with
   `RunLocalTests` (or `RunSpecifiedTests` that cover at least 75% of the
   deployed Apex) ahead of the window, then `sf project deploy quick --job-id`
   inside the window. A validation stays quick-deployable for 10 days as long
   as no other deploy intervenes.
2. **Dependency order.** Objects and fields come before code that references
   them, and code comes before flows, pages, and permission sets that grant
   access to it. One manifest deploys atomically; split deploys need the order
   written down.
3. **Destructive changes.** Use `destructiveChangesPre.xml` (delete before
   deploy) or `destructiveChangesPost.xml` (delete after). Deleting fields with
   data needs a data backup decision.
4. **Post-deploy steps.** Assign permission sets, load Custom Metadata and
   reference data, reschedule jobs, and activate flows that deploy inactive.
5. **Rollback.** Salesforce has no transactional rollback across deploys. Plan a
   redeploy of the previous git tag, destructive removals, or a feature switch
   (custom permission or Custom Metadata flag) per release.

## CI/CD

- Auth: JWT bearer flow with a Connected App or External Client App and a
  certificate. Store the server key and consumer key as CI secrets.
- Pull request: lint (ESLint for LWC, Prettier Apex), LWC Jest, Code Analyzer
  (fail on severity 1–2), then validate against the target org or deploy plus
  test in a scratch org.
- Merge: quick deploy the validated job, or deploy with tests to non-production.
- Deltas: `sfdx-git-delta` generates `package.xml` and destructive changes
  between two commits.
- Track releases with git tags, and record the deployment id per environment.

## Release calendar

Salesforce ships three major releases a year (Spring, Summer, Winter).
Sandboxes on preview instances upgrade weeks before production. Run regression
tests in a preview sandbox and avoid deploying during the production upgrade
weekend.
