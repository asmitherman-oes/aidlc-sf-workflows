---
target: environment-provisioning
plugin: salesforce-sdlc
adds:
  scopes:
    - salesforce-sdlc-standard
fragments:
  - anchor: before-step:2
    order: 100
---

## fragment: before-step:2

### Salesforce environment preparation

For `salesforce-sdlc-standard`, prepare only the approved Salesforce development
or release environment: authorized org alias, scratch-org definition, sandbox,
package configuration, required features, permission assignments, test data,
and integration prerequisites. Do not provision AWS resources unless the
approved architecture contains AWS components. Treat org creation, permission
assignment, data loading, and feature enablement as mutations requiring the
stage's applicable approval and an explicit target alias.
