# Salesforce Platform Primer (AWS Platform Agent)

Applies only when the active scope is `salesforce-classic` or the workspace contains `sfdx-project.json`. Otherwise ignore this file.

- Under a Salesforce scope the platform is Salesforce, not AWS. Do not propose
  AWS services, IaC, or VPC topology for the Salesforce application itself.
- Contribute only where an external integration genuinely runs on AWS (for
  example an API behind a Named Credential, EventBridge receiving Salesforce
  events, or AppFlow). Then state the Salesforce-side contract: auth, limits,
  and idempotency.
