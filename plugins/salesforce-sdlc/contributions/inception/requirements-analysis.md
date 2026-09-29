---
target: requirements-analysis
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

### Salesforce requirements context

For `salesforce-sdlc-standard` or `salesforce-sdlc-express`, ground requirements in discovered org and
repository evidence. Capture affected personas, licenses, objects, record
lifecycle, automation, permissions, sharing, reporting, integrations, data
volume, mobile/accessibility needs, audit needs, and release constraints.
Separate business outcomes from proposed metadata or code. Every acceptance
criterion must be testable without assuming that Apex, Flow, or LWC is the
correct implementation.

For Express, capture only demo-relevant items: audience, one happy-path story,
acceptance checks, explicit exclusions, org alias, synthetic data, and the
minimum implementation decisions. Record mocks and production-readiness gaps.
