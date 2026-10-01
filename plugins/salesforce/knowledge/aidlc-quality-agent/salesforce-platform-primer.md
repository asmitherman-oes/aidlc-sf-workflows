# Salesforce Platform Primer (Quality Agent)

Applies only when the active scope is `salesforce-classic` or the workspace contains `sfdx-project.json`. Otherwise ignore this file.

- Apex tests run only inside an org. Run them through the Salesforce DX MCP
  `run_apex_test` tool (with coverage) when a non-production validation org is
  authorized; otherwise defer them to the Salesforce Org Validation stage, which
  owns them.
- Run the org-free checks locally: LWC Jest (`sfdx-lwc-jest`), ESLint
  (`@salesforce/eslint-config-lwc`), and Salesforce Code Analyzer.
- Coverage targets: at least 75% (platform floor); plugin defaults are 85%
  org-wide and 75% per class. Bulk, negative, and permission tests are required.
- Reference: `{{HARNESS_DIR}}/knowledge/salesforce-qa-agent/salesforce-testing-guide.md`.
