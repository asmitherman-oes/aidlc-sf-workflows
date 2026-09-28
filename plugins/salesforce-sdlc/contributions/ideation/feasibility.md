---
target: feasibility
plugin: salesforce-sdlc
adds:
  scopes:
    - salesforce-sdlc-standard
fragments:
  - anchor: before-step:2
    order: 100
---

## fragment: before-step:2

### Salesforce capability-fit assessment

When the active scope is `salesforce-sdlc-standard`, inspect the local DX
project and use Salesforce DX MCP for relevant authorized-org facts before
asking feasibility questions. Evaluate, in order, existing standard capability,
installed-package capability, configuration, Flow, Apex, LWC, and external
integration. Capture licensing, edition, limits, data-volume, security,
packaging, and deployment constraints. Do not treat a requested implementation
technology as a settled design decision.
