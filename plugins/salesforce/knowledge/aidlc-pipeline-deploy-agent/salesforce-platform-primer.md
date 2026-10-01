# Salesforce Platform Primer (Pipeline / Deploy Agent)

Applies only when the active scope is `salesforce-classic` or the workspace contains `sfdx-project.json`. Otherwise ignore this file.

- The deploy tool is the Salesforce CLI (`sf`). Use JWT bearer auth in CI, a
  check-only `sf project deploy validate` on pull requests, and
  `sf project deploy quick` on merge. Gate on Code Analyzer and Apex coverage.
- References: `{{HARNESS_DIR}}/knowledge/salesforce-devops-agent/salesforce-devops-guide.md`
  and `{{HARNESS_DIR}}/knowledge/salesforce-devops-agent/salesforce-dx-mcp-tools.md`.
