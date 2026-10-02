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

When the work targets Salesforce:

- Schedule Units that own schema first.
- Name the development org for each Bolt: a scratch org (see
  **`dx-org-manage`**) or a Developer sandbox.
- Note the Salesforce seasonal releases and sandbox preview dates that overlap
  the plan. Get the dates from **`platform-docs-get`**.
- Record the Salesforce-specific dependencies: Dev Hub access, sandbox
  refreshes, connected or external client apps, AppExchange installs, and
  licenses.

Salesforce Solution Design runs after this stage and refines the environment
path.
