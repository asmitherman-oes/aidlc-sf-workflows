---
target: contract-design
plugin: salesforce
adds:
  scopes:
    - salesforce-classic
fragments:
  - anchor: before-step:5
    order: 100
---

## fragment: before-step:5

### Step 4a (salesforce): Salesforce contract surfaces

When the work targets Salesforce, write the contracts in `contract-summary.md` in
platform terms:

- `@AuraEnabled`, `@InvocableMethod`, and `@RestResource` Apex entry points,
  shaped the way **`platform-apex-generate`** defines them.
- Platform Event and Change Data Capture channels.
- Callouts through Named Credentials and External Credentials, designed with
  **`integration-connectivity-generate`**.

For each contract, state the sharing context it runs in and the governor limits
it consumes. Take those facts from **`platform-docs-get`**.
