---
target: functional-design
plugin: salesforce-sdlc
adds:
  scopes:
    - salesforce-sdlc-standard
fragments:
  - anchor: before-step:2
    order: 100
---

## fragment: before-step:2

### Salesforce functional-design plan

For `salesforce-sdlc-standard`, map each unit to concrete metadata categories
without inventing API names. Define user interaction, record and transaction
lifecycle, Flow or Apex behavior, errors and fault paths, permission and sharing
behavior, bulk behavior, integration boundaries, and test seams. Use Salesforce
DX MCP when an org fact affects the design. Identify configuration-only work
explicitly so code generation does not manufacture unnecessary source.
