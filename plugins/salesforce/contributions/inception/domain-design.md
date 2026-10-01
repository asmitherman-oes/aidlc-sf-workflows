---
target: domain-design
plugin: salesforce
adds:
  scopes:
    - salesforce-classic
fragments:
  - anchor: before-step:5
    order: 100
---

## fragment: before-step:5

### Step 4a (salesforce): Salesforce object and component mapping

When the work targets Salesforce, add a `## Salesforce Object Mapping` section
to `components.md`, below the human-readable view:

- **Entities to SObjects**: `| Entity | Standard/Custom | Candidate API Name | Rationale |`.
  Reuse a standard object (Account, Contact, Case, Opportunity, …) whenever
  its semantics match, and say why when they do not.
- **Components to Salesforce building blocks**: per component, its likely
  realisation, such as Apex service, selector, or domain classes, a trigger
  handler, record-triggered Flow, LWC, Platform Event, or integration via
  Named Credential. Salesforce Solution Design confirms these choices.

Keep the YAML catalogue platform-neutral. The mapping section is the Salesforce
projection of it.
