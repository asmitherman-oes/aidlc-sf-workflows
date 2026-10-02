---
target: requirements-analysis
plugin: salesforce
adds:
  scopes:
    - salesforce-classic
fragments:
  - anchor: before-step:7
    order: 100
  - anchor: before-step:11
    order: 100
---

## fragment: before-step:7

### Step 6a (salesforce): Salesforce platform questions

When the work targets Salesforce (the `salesforce-classic` scope, or an
`sfdx-project.json` in the workspace), add these topics to the clarifying
questions, skipping any the request already answers:

- the org edition and clouds;
- licenses and personas;
- standard objects to reuse vs new custom objects;
- AppExchange packages;
- data volumes;
- integrations;
- sensitive data and compliance;
- UI surfaces;
- release windows.

Check edition, license, and feature facts with **`platform-docs-get`**, and check
whether a standard object already fits with
**`platform-data-and-tooling-api-context-get`**. Do not state these facts from
memory.

## fragment: before-step:11

### Step 10a (salesforce): Salesforce Platform Constraints section

When the work targets Salesforce, add a `## Salesforce Platform Constraints`
section to `requirements.md`, giving each constraint an id (`SFC-1`, `SFC-2`, …).
Cover:

- edition, clouds, and licenses;
- personas;
- the objects in scope;
- data volumes;
- integrations;
- security and compliance;
- UI surfaces;
- environments and release windows;
- governor-limit-sensitive requirements.

Cite the `platform-docs-get` result for each platform fact.
