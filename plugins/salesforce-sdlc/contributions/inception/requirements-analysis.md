---
target: requirements-analysis
plugin: salesforce-sdlc
adds:
  scopes:
    - salesforce-sdlc-standard
fragments:
  - anchor: before-step:2
    order: 100
---

## fragment: before-step:2

### Salesforce requirements context

For `salesforce-sdlc-standard`, ground requirements in discovered org and
repository evidence. Capture affected personas, licenses, objects, record
lifecycle, automation, permissions, sharing, reporting, integrations, data
volume, mobile/accessibility needs, audit needs, and release constraints.
Separate business outcomes from proposed metadata or code. Every acceptance
criterion must be testable without assuming that Apex, Flow, or LWC is the
correct implementation.
