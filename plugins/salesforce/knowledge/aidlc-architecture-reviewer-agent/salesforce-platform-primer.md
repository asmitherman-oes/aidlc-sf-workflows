# Salesforce Platform Primer (Architecture Reviewer)

Applies only when the active scope is `salesforce-classic` or the workspace contains `sfdx-project.json`. Otherwise ignore this file.

- Review Salesforce designs for platform fit: governor limits at 200 records,
  one automation owner per object event, sharing and CRUD/FLS enforced in Apex,
  selective queries on LDV objects, and deployable metadata dependencies.
- Use the severity guide in
  `{{HARNESS_DIR}}/knowledge/salesforce-technical-reviewer-agent/reviewing.md`.
