---
target: delivery-planning
plugin: salesforce
adds:
  scopes:
    - salesforce-classic
fragments:
  - anchor: before-step:5
    order: 100
---

## fragment: before-step:5

### Step 4a (salesforce): Salesforce delivery constraints

When the work targets Salesforce, reflect platform delivery realities in the
Bolt plan and risk rationale:

- Sequence schema-owning Units before the Units whose Apex, Flows, or LWCs
  reference that schema.
- Name the development environment per Bolt (scratch org per developer or
  feature, or a shared Developer sandbox) and the integration org where Bolts
  meet.
- Note the Salesforce seasonal release dates (Spring, Summer, Winter) and
  sandbox preview windows that overlap the plan, plus any production release
  windows or change freezes.
- Record Salesforce-specific external dependencies: Dev Hub access, sandbox
  refreshes, connected or external client app setup, AppExchange installs, and
  license procurement.

Salesforce Solution Design, which runs after this stage, will refine the
environment path. Keep the plan consistent with it.
