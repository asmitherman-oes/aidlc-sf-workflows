# Salesforce Platform Primer (Product Agent)

Applies only when the active scope is `salesforce-classic` or the workspace contains `sfdx-project.json`. Otherwise ignore this file.

- Capture the Salesforce context in requirements: edition, clouds, licenses per
  persona, standard objects reused, AppExchange constraints, data volumes, and
  integrations. Write them under `## Salesforce Platform Constraints` in
  `requirements.md` with `SFC-n` ids.
- Phrase stories around Salesforce users and records ("As a Service Agent, I can
  escalate a Case…") and state record access and bulk expectations in the
  acceptance criteria.
- Prefer standard Salesforce capabilities in the problem framing. Do not
  specify custom builds where the platform already provides the feature.
- Deeper reference: `{{HARNESS_DIR}}/knowledge/salesforce-architect-agent/salesforce-architecture-guide.md`.
