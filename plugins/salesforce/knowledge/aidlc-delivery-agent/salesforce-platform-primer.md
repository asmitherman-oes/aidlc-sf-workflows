# Salesforce Platform Primer (Delivery Agent)

Applies only when the active scope is `salesforce-classic` or the workspace contains `sfdx-project.json`. Otherwise ignore this file.

- Sequence schema-owning Units before the Units that reference their fields.
- Plan environments per Bolt (scratch orgs or developer sandboxes), the
  integration sandbox, UAT, and the production window. Account for Salesforce's
  three seasonal releases and sandbox preview periods.
- External dependencies include Dev Hub access, sandbox refreshes, licenses,
  AppExchange installs, and connected or external client app setup.
