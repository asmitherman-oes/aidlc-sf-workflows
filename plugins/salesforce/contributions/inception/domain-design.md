---
target: domain-design
plugin: salesforce
adds:
  scopes:
    - salesforce-classic
fragments:
  - anchor: before-step:5
    order: 100
---

## fragment: before-step:5

### Step 4a (salesforce): Salesforce object and component mapping

When the work targets Salesforce, add a `## Salesforce Object Mapping` section to
`components.md`:

- **Entities to SObjects**: a table with the columns
  `| Entity | Standard/Custom | Candidate API Name | Rationale |`. Check standard
  objects with **`platform-data-and-tooling-api-context-get`** before proposing
  a custom one.
- **Components to Salesforce building blocks**: for each component, give the
  likely realisation and the Salesforce skill that will generate it. A
  realisation is one of: Apex service or selector, trigger handler, Flow, LWC,
  Platform Event, or integration. The skills are listed in
  `{{HARNESS_DIR}}/knowledge/aidlc-shared/salesforce-tooling.md`.
