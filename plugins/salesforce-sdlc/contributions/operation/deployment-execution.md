---
target: deployment-execution
plugin: salesforce-sdlc
adds:
  scopes:
    - salesforce-sdlc-standard
fragments:
  - anchor: before-step:2
    order: 100
---

## fragment: before-step:2

### Salesforce deployment controls

For `salesforce-sdlc-standard`, resolve the exact target alias and verify it is
the approved environment before any mutation. Review the package or manifest,
dependency order, destructive changes, Apex test level, Flow activation,
permissions, data migration, manual steps, and rollback or forward-fix plan.
Prefer validation-only deployment and recorded test evidence before execution.
Use Salesforce DX MCP or CLI results as evidence and stop on target ambiguity.
