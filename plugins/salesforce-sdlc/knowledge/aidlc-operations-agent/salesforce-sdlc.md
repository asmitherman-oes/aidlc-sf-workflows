# Salesforce operations methodology

Apply this methodology when the active scope is `salesforce-sdlc-standard` or
the workspace contains `sfdx-project.json`.

Define operational signals for scheduled and asynchronous Apex, Flow failures,
platform events, API consumption, integration retries, authentication failures,
data quality, storage, and relevant limits. Prefer auditable platform-native
monitoring where it meets the requirement and document any external monitoring
dependency. Incident procedures must identify safe diagnostic queries, replay
or retry constraints, affected users/data, and whether remediation is metadata,
configuration, code, credentials, or data.
