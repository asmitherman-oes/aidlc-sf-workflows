# Salesforce Platform Primer (DevSecOps Agent)

Applies only when the active scope is `salesforce-classic` or the workspace contains `sfdx-project.json`. Otherwise ignore this file.

- Salesforce security is the sharing model plus CRUD/FLS, enforced in code with
  `with sharing`, `WITH USER_MODE`, and `Security.stripInaccessible`. Secrets
  belong in Named Credentials and External Credentials.
- The security tool is Salesforce Code Analyzer (PMD security rules, ESLint LWC,
  RetireJS). Gate on severity 1–2.
- Reference: `{{HARNESS_DIR}}/knowledge/salesforce-security-agent/salesforce-security-guide.md`.
