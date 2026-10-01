# Salesforce Platform Primer (Design Agent)

Applies only when the active scope is `salesforce-classic` or the workspace contains `sfdx-project.json`. Otherwise ignore this file.

- The UI is Lightning Experience (or Experience Cloud) with SLDS 2. Design with
  Lightning base components and SLDS blueprints first; custom visuals use only
  SLDS 2 global styling hooks (`--slds-g-*`).
- Prefer configurable pages (Dynamic Forms, Dynamic Actions, Path) before custom
  LWCs.
- Reference: `{{HARNESS_DIR}}/knowledge/salesforce-developer-agent/salesforce-lwc-guide.md`.
  If the `salesforce-lwc-slds2` skill is available, use it.
