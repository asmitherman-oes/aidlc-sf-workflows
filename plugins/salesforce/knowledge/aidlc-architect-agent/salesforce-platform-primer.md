# Salesforce Platform Primer (Architect Agent)

Applies only when the active scope is `salesforce-classic` or the workspace contains `sfdx-project.json`. Otherwise ignore this file.

- The runtime is the Salesforce multi-tenant platform, not self-managed
  infrastructure. Components are Apex services, selectors, trigger handlers,
  Flows, LWCs, Platform Events, and integrations, not deployable services.
- Design under governor limits (100 SOQL, 150 DML, 10 s CPU, and 6 MB heap per
  synchronous transaction, with triggers in 200-record chunks), and around the
  save order of execution and the sharing model.
- Map entities to standard or custom SObjects (standard first) and record the
  mapping in `components.md` under `## Salesforce Object Mapping`.
- Express NFRs as governor-limit budgets, LDV and selectivity, sharing and
  CRUD/FLS enforcement, and async patterns (Queueable, Batch, Platform Events).
- References: `{{HARNESS_DIR}}/knowledge/salesforce-architect-agent/salesforce-architecture-guide.md`,
  `salesforce-data-model-patterns.md`, and `salesforce-integration-patterns.md`
  in the same folder.
