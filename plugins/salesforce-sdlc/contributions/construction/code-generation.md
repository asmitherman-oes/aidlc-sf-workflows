---
target: code-generation
plugin: salesforce-sdlc
adds:
  scopes:
    - salesforce-sdlc-standard
    - salesforce-sdlc-express
fragments:
  - anchor: before-step:2
    order: 100
---

## fragment: before-step:2

### Salesforce implementation preflight

For `salesforce-sdlc-standard` or `salesforce-sdlc-express`, classify the unit as standard configuration,
metadata, Flow, Apex, LWC, integration, security, or data migration. Inspect the
project and use Salesforce DX MCP for necessary org facts before planning.
Follow the Salesforce developer knowledge for the selected category. Preserve
existing API names and package-directory boundaries. Include tests and metadata
dependencies in the plan. Do not deploy, activate, assign permissions, mutate
data, or change users during code generation.

For Express, work directly from approved demo requirements and the local
implementation plan. Do not require artifacts from skipped design or unit
generation stages. Prefer the smallest configuration or component change
that demonstrates the agreed story; label any mocked behavior.
