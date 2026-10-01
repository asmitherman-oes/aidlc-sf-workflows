# Salesforce Platform Primer (Developer Agent)

Applies only when the active scope is `salesforce-classic` or the workspace contains `sfdx-project.json`. Otherwise ignore this file.

- Generate Salesforce DX source-format metadata under the Unit's package
  directory. Every Apex class, trigger, and LWC carries its `-meta.xml` at the
  project `sourceApiVersion`. New fields ship with the permission set changes
  that grant them.
- Before writing any Apex or LWC, read and follow these MUST rules:
  `{{HARNESS_DIR}}/knowledge/salesforce-developer-agent/salesforce-apex-guide.md`,
  `{{HARNESS_DIR}}/knowledge/salesforce-developer-agent/salesforce-lwc-guide.md`,
  `{{HARNESS_DIR}}/knowledge/salesforce-developer-agent/salesforce-dx-project-guide.md`,
  `{{HARNESS_DIR}}/knowledge/salesforce-security-agent/salesforce-security-guide.md`, and
  `{{HARNESS_DIR}}/knowledge/salesforce-qa-agent/salesforce-testing-guide.md`.
- Bulkify (no SOQL or DML in loops), use one trigger per object that delegates
  to a handler, default to `with sharing` plus user-mode data access, and never
  hardcode Ids or secrets.
- Write an Apex test class per class (single, bulk 200, negative, and
  `System.runAs` paths) and a Jest test per LWC.
- Salesforce DX MCP: `run_soql_query` (read-only) to confirm field API names.
  Never deploy or delete orgs during Code Generation. Tool reference:
  `{{HARNESS_DIR}}/knowledge/salesforce-devops-agent/salesforce-dx-mcp-tools.md`.
- In Reverse Engineering, inventory metadata by type from `sfdx-project.json`
  package directories.
