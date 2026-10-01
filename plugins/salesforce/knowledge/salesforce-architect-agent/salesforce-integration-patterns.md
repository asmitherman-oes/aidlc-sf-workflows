# Salesforce Integration Patterns

| Pattern | Direction | Mechanism | Choose when |
|---------|-----------|-----------|-------------|
| Request and reply | Outbound, sync | Apex callout via Named Credential, or an HTTP Callout action in Flow | The user waits for the answer; low volume |
| Fire and forget | Outbound, async | Platform Event to middleware, Queueable callout, or Outbound Message | No immediate answer needed; must survive retries |
| Batch data sync | Either | Bulk API 2.0, ETL or middleware with External IDs | High volume, periodic |
| Remote call-in | Inbound | REST/SOAP API, Composite API, or a custom `@RestResource` | An external system creates or reads records |
| UI update from data change | Outbound | Change Data Capture (CDC) or Platform Events over the Pub/Sub API | External consumers need near-real-time changes |
| Data virtualization | Read-only external | Salesforce Connect (OData or a custom adapter) | Data stays in the source system |

## Rules

- **Auth.** Use Named Credentials with External Credentials (OAuth 2.0 client
  credentials, JWT, or per-user auth) for outbound calls. For inbound calls, use
  a dedicated integration user with an API-only permission set, through a
  Connected App or External Client App with the least OAuth scopes.
- **Idempotency.** Upsert on External IDs, and send idempotency keys on
  outbound calls.
- **Limits.** Budget API calls per 24 hours against the org allocation, and
  watch for concurrent long-running request limits (synchronous requests over
  5 s count toward a concurrency cap).
- **Error handling.** Retry with backoff in Queueable chains. Dead-letter to a
  custom error object or Platform Event, and alert on it.
- **Transactions.** No callout after uncommitted DML in the same transaction.
  Publish events with "publish after commit" unless they must survive rollback,
  as logging events do.
- **Contracts.** Version custom REST resources (`/services/apexrest/v1/...`),
  use DTO classes, and document the error shape and HTTP status codes.
