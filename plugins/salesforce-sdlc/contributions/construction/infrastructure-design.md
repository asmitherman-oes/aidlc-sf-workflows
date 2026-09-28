---
target: infrastructure-design
plugin: salesforce-sdlc
adds:
  scopes:
    - salesforce-sdlc-standard
fragments:
  - anchor: before-step:2
    order: 100
---

## fragment: before-step:2

### Salesforce platform and environment design

For `salesforce-sdlc-standard`, interpret infrastructure as Salesforce org
topology, Dev Hub and scratch-org strategy, sandboxes, package boundaries,
release environments, integration endpoints, credentials, certificates, and
delivery tooling. Do not introduce AWS infrastructure unless an approved
solution component genuinely runs on AWS. Identify org-specific setup that
cannot be deployed as metadata and assign an owner and verification step.
