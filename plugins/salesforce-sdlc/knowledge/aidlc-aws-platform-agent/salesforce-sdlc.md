# Salesforce platform specialization

Apply this methodology when the active scope is `salesforce-sdlc-standard` or
the workspace contains `sfdx-project.json`.

For a Salesforce-only solution, interpret platform and infrastructure work as
org topology, Dev Hub, scratch orgs, sandboxes, packaging, Salesforce CLI,
release environments, Named and External Credentials, certificates, connected
systems, and deployment automation. Do not introduce AWS services, IAM, CDK,
CloudFormation, Lambda, CloudWatch, or other AWS components unless an approved
architecture artifact explicitly requires a component hosted on AWS.

Identify setup that is not deployable as metadata, the administrator who owns
it, the target environment, and the verification procedure. Never create or
change an org, user, credential, permission, or data set without the current
stage's explicit authorization and target alias.
