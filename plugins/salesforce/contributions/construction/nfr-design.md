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

When the work targets Salesforce, take each NFR solution from Salesforce's
skills:

- **Apex performance and async.** Use the patterns that
  **`platform-apex-generate`** prescribes: selectors, Queueable with a
  Finalizer, Batch, Schedulable, and Platform Events. Use the antipattern list
  behind the MCP tool `scan_apex_class_for_antipatterns` and
  **`dx-apexguru-scan`** as the list of things the design must avoid.
- **Queries.** Design selective queries with **`platform-soql-query`**.
- **Integrations and reliability.** Use **`integration-connectivity-generate`**
  for Named Credentials, retries, and event-driven decoupling.
- **Client-side.** Use the MCP tools `guide_lds_development` and
  `guide_lds_data_consistency` for LWC data access and caching, and
  `guide_lws_security` for Lightning Web Security.
- **Security design.** Take user-mode data access and the sharing context from
  the Salesforce Security Model and **`platform-permission-set-generate`**.
- **Encryption.** Use **`platform-encryption-configure`** wherever the security
  requirements call for Shield.
