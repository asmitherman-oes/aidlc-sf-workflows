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

When the work targets Salesforce:

- Map each Unit to a package directory in `sfdx-project.json`, or to a clearly
  owned set of folders inside one.
- Put Units that own schema before the Units whose Apex, Flows, or LWCs
  reference that schema.
- Give shared metadata exactly one owning Unit.
- Set each Unit's kind: Apex or LWC features are `service` or `ui`, a
  metadata-only foundation is `library`, and a package or release Unit is
  `packaging`.
