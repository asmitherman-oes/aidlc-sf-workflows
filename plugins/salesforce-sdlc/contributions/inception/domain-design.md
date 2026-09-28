---
target: domain-design
plugin: salesforce-sdlc
adds:
  scopes:
    - salesforce-sdlc-standard
fragments:
  - anchor: before-step:2
    order: 100
---

## fragment: before-step:2

### Salesforce solution-classification plan

For `salesforce-sdlc-standard`, plan the design around actual Salesforce
metadata and org capabilities. Classify each capability as standard platform,
configuration, Flow, Apex, LWC, integration, security, analytics, or data
migration. Evaluate reuse before creating components. Address data model,
automation order, transaction and asynchronous boundaries, governor limits,
sharing and CRUD/FLS, packaging, deployment dependencies, and coexistence with
installed packages. Record why rejected standard or declarative alternatives
were insufficient.
