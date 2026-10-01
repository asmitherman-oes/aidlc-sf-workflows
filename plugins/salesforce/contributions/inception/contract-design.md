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

When the work targets Salesforce, express cross-Unit and external contracts in
platform terms in `contract-summary.md`:

- **Apex entry points**: `@AuraEnabled` methods (cacheable or not) called by
  LWCs, `@InvocableMethod` actions called by Flows, and `@RestResource` classes
  (URL mapping, HTTP verbs, request and response DTOs, and error shape).
- **Events**: Platform Event objects (`__e`) with fields and publish behaviour
  (publish after commit or immediately), and Change Data Capture channels.
- **Outbound callouts**: the Named Credential and External Credential per
  system, timeouts, retries, and idempotency keys.
- **Inbound integrations**: the integration user, its permission set, and the
  external ID fields used for upserts.
- For each contract, state the sharing context it runs in (user mode or system
  mode) and the limits it consumes per call.
