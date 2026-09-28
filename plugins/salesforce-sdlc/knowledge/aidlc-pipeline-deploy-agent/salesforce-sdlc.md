# Salesforce delivery methodology

Apply this methodology when the active scope is `salesforce-sdlc-standard` or
the workspace contains `sfdx-project.json`.

Plan promotions across explicitly named development, test, staging, and
production orgs. Define package directories or manifests, dependency order,
validation-only deployment, Apex test level, destructive changes, Flow
activation, permission assignment, data migration, and manual post-deployment
steps. Prefer source-controlled, repeatable Salesforce CLI or DX MCP operations.

Use an explicitly allowed org alias. Never use `ALLOW_ALL_ORGS` as a team
default, and never infer that the default org is safe for mutation. Production
deployment, destructive metadata, user changes, and data changes require the
applicable AI-DLC approval gate and a documented rollback or forward-fix plan.
