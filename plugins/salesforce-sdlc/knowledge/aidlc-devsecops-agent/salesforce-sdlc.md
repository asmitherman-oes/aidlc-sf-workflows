# Salesforce security methodology

Apply this methodology when the active scope is `salesforce-sdlc-standard` or
the workspace contains `sfdx-project.json`.

Review least privilege across permission sets, permission-set groups, sharing,
roles, queues, public groups, guest users, and integration users. Verify Apex
sharing behavior plus object-, field-, and record-level enforcement. Treat
Named Credentials, External Credentials, certificates, Connected Apps, and
OAuth policy as security boundaries. Identify sensitive data, audit needs,
retention, encryption, masking, and non-production data controls.

Do not recommend profile expansion, `without sharing`, broad guest access, or
embedded credentials as shortcuts. Make residual risks and required human or
administrator actions explicit.
