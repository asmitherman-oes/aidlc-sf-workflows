# Salesforce architecture methodology

Apply this methodology when the active scope is `salesforce-sdlc-standard` or
the workspace contains `sfdx-project.json`.

## Decision order

1. Reuse existing standard functionality or metadata where it satisfies the
   requirement safely.
2. Prefer maintainable configuration and permission-set-based access.
3. Evaluate Flow for orchestration and record automation.
4. Use Apex, LWC, or external services only when their capabilities are needed.

Inspect both local source and the authorized org through Salesforce DX MCP
before defining components. Address data model, automation ordering, sharing,
CRUD/FLS, transaction boundaries, governor limits, asynchronous processing,
integration authentication, packaging, and deployment dependencies. Record why
rejected standard or declarative alternatives were insufficient.

Interpret infrastructure as Salesforce org topology, environments, Dev Hub,
scratch-org strategy, sandboxes, packages, connected systems, and delivery
tooling unless the solution actually contains external infrastructure.
