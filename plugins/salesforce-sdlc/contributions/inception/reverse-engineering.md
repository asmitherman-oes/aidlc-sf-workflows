---
target: reverse-engineering
plugin: salesforce-sdlc
adds:
  scopes:
    - salesforce-sdlc-standard
fragments:
  - anchor: before-step:2
    order: 100
---

## fragment: before-step:2

### Salesforce repository and org discovery

For `salesforce-sdlc-standard`, scan `sfdx-project.json`, package directories,
manifests, metadata source, tests, analyzer configuration, and deployment
automation. Use Salesforce DX MCP to inspect relevant metadata in the explicitly
allowed org. Compare repository and org evidence; report drift or unavailable
evidence rather than assuming either side is complete. Inventory objects,
fields, record types, automation, Apex, user interfaces, permissions,
integrations, custom metadata, packages, and dependency relationships relevant
to the intent. Read-only discovery must not deploy or mutate the org.
