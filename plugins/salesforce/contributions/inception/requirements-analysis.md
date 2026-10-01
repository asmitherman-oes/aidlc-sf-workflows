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
`sfdx-project.json` in the workspace), add these to the clarifying questions,
skipping any the request already answers:

- Org edition and clouds in use (Sales, Service, Experience, Marketing, Industries)
- User licenses and personas for the change (Salesforce, Platform,
  Experience Cloud, guest), and the user counts
- Standard objects to reuse vs new custom objects, and AppExchange packages
  already installed or acceptable
- Data volumes per object (current and three-year growth), and data migration needs
- Integrations: systems, direction, frequency, volume, and real-time vs batch
- Security and compliance: sensitive data (PII, PHI, PCI), Shield, data
  residency, and audit needs
- UI surface: Lightning Experience record or app pages, Experience Cloud,
  mobile app, or utility bar
- Release constraints: target environments, release windows, and Salesforce
  seasonal release timing

## fragment: before-step:11

### Step 10a (salesforce): Salesforce Platform Constraints section

When the work targets Salesforce, add a `## Salesforce Platform Constraints`
section to `requirements.md` covering: the edition, clouds, and licenses; the
personas and their licenses; the objects in scope (standard or custom); data
volumes; integrations; security and compliance constraints; the UI surfaces;
the environments and release windows; and the governor-limit sensitive
requirements (bulk loads, high-frequency updates, large queries). Give each
constraint an id (`SFC-1`, `SFC-2`, …) so the Salesforce design stages can
trace to it.
