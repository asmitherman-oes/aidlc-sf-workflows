---
target: reverse-engineering
plugin: salesforce
adds:
  scopes:
    - salesforce-classic
fragments:
  - anchor: before-step:3
    order: 100
---

## fragment: before-step:3

### Step 2a (salesforce): Salesforce DX source scan

When the repository contains `sfdx-project.json`, extend the developer code scan
with a Salesforce metadata inventory taken from every `packageDirectories` path:

- **Metadata by type.** Count and list `classes/` (Apex; separate `@IsTest`
  classes), `triggers/` (with object and events), `lwc/` and `aura/` bundles,
  `flows/` (with process type and trigger object), `objects/` (custom objects
  and fields, record types, validation rules, list views), `permissionsets/`,
  `permissionsetgroups/`, `profiles/`, `layouts/`, `flexipages/`,
  `customMetadata/`, `labels/`, `namedCredentials/`, and `staticresources/`.
- **Patterns.** Identify the trigger framework (one trigger per object with a
  handler, or logic in triggers), the service, selector, and domain layering,
  the test data factory, async usage (Queueable, Batch, `@future`, Schedulable,
  Platform Events), and a logging framework.
- **Risks.** Flag SOQL or DML inside loops, hardcoded record Ids,
  `without sharing` classes, `SeeAllData=true`, Process Builder or Workflow Rule
  leftovers, multiple triggers on one object, and the `sourceApiVersion` gap
  against the current release.

Record the inventory in the technology-stack and code-quality-assessment
artifacts. Salesforce Org Analysis later reconciles it with the live org.
