# Salesforce development methodology

Apply this methodology when the active scope is `salesforce-sdlc-standard` or
the workspace contains `sfdx-project.json`.

Before implementation, inspect the project and use Salesforce DX MCP for live
metadata facts when available. Never invent object, field, class, Flow,
permission, package, or org API names.

- Keep metadata under the package directories declared by `sfdx-project.json`.
- Prefer standard functionality and declarative implementation before code.
- For Flow, define entry criteria, ordering, recursion behavior, fault paths,
  bulk behavior, and activation/deployment handling.
- For Apex, bulkify all entry points; avoid queries or DML in loops; enforce the
  intended sharing model and CRUD/FLS; handle partial failure and limits; and
  add meaningful tests using isolated test data.
- For LWC, prefer Lightning Data Service and base components, follow SLDS and
  accessibility requirements, validate client/server trust boundaries, and add
  Jest tests for observable behavior.
- Use Named Credentials and External Credentials for secrets and authentication.
- Do not hardcode record IDs, usernames, endpoints, credentials, or org URLs.
- Do not deploy or mutate org state during code generation.
