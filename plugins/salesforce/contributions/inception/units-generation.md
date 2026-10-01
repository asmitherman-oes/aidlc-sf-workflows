---
target: units-generation
plugin: salesforce
adds:
  scopes:
    - salesforce-classic
fragments:
  - anchor: before-step:6
    order: 100
---

## fragment: before-step:6

### Step 5a (salesforce): Salesforce Unit boundaries

When the work targets Salesforce, check each Unit of Work against metadata
deployability:

- Every Unit should map to a package directory (or a clearly owned folder set
  inside one) in `sfdx-project.json`, so it can be deployed and tested
  independently.
- Record schema dependencies explicitly: a Unit that adds fields another Unit's
  Apex references must deploy first, and that ordering belongs in
  `unit-of-work-dependency.md`.
- Shared org-wide metadata (custom objects and fields used by several Units,
  global value sets, permission set groups) gets one owning Unit. Prefer a
  foundation or "schema" Unit that the others depend on.
- Use the Unit `kind` values the engine knows: an Apex/LWC feature is `service`
  or `ui`, a metadata-only foundation is `library`, and a package or release
  Unit is `packaging`.
