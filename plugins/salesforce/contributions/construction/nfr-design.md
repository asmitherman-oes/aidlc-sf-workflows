---
target: nfr-design
plugin: salesforce
adds:
  scopes:
    - salesforce-classic
fragments:
  - anchor: before-step:5
    order: 100
---

## fragment: before-step:5

### Step 4a (salesforce): Salesforce NFR patterns

When the work targets Salesforce, pick NFR solutions from platform patterns:

- **Performance and limits**: bulkified service methods, selector classes with
  selective `WHERE` clauses on indexed fields, `Map<Id, SObject>` lookups,
  aggregate queries, Platform Cache (org or session partitions) for hot
  reference data, and Custom Metadata Types for configuration (no SOQL limit
  cost).
- **Asynchronous work**: Queueable (chained, with a `Finalizer` for failure
  handling) for post-commit work and callouts; Batch Apex for LDV; Platform
  Events or Change Data Capture to decouple; Scheduled Flows or Schedulable for
  cadence work. Avoid `@future` in new code.
- **Reliability**: idempotent integrations with external IDs and upsert, retry
  with backoff in Queueable chains, `Database.SaveResult` handling for
  partial-success DML, and a dead-letter record or Platform Event for failures.
- **Security design**: user-mode data access (`WITH USER_MODE`,
  `AccessLevel.USER_MODE`), `Security.stripInaccessible` on data returned to
  LWCs, and Named Credentials with External Credentials for callouts.
- **Observability**: a logging framework (Nebula Logger, or Platform
  Event-based logging that survives rollback), Apex exception emails routing,
  and Event Monitoring or debug log strategy. Never log sensitive field values.
