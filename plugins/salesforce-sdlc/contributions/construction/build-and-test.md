---
target: build-and-test
plugin: salesforce-sdlc
adds:
  scopes:
    - salesforce-sdlc-standard
    - salesforce-sdlc-express
fragments:
  - anchor: before-step:1
    order: 100
---

## fragment: before-step:1

### Salesforce verification contract

For `salesforce-sdlc-standard` or `salesforce-sdlc-express`, select verification from Salesforce Code
Analyzer, Apex tests, LWC Jest tests, Flow behavior checks, and validation-only
deployment based on the changed metadata. Use an explicitly allowed non-
production org alias. Capture commands or MCP tools, component set, API version,
test level, assertions, failures, warnings, and evidence paths. Apex coverage
does not replace behavioral assertions. Do not report successful validation
without machine-produced results.

For Express, verify the demo happy path plus relevant permission/error behavior
and changed-component tests. Record a short demo walkthrough, reset steps,
known limitations, and unverified checks in the existing test artifacts.
