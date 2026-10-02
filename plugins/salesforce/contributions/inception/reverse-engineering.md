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

When the repository contains `sfdx-project.json`, scan it with Salesforce's tools,
not a generic code scan:

- Run Salesforce Code Analyzer over the package directories (MCP
  `run_code_analyzer`, or the **`dx-code-analyzer-run`** skill) and MCP
  `scan_apex_class_for_antipatterns` on the Apex classes and triggers. Record
  the findings in the code-quality-assessment artifact.
- Inventory the metadata by type from every `packageDirectories` path: Apex,
  triggers, LWC, Aura, flows, objects and fields, permission sets, Lightning
  pages, and custom metadata. Record the trigger framework, the async patterns,
  and the `sourceApiVersion` in the technology-stack artifact.
- List Aura bundles as migration candidates for **`experience-aura-lwc-migrate`**.
