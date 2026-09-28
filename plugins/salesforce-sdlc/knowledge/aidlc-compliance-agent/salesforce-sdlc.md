# Salesforce compliance methodology

Apply this methodology when the active scope is `salesforce-sdlc-standard` or
the workspace contains `sfdx-project.json`.

Map regulated or sensitive data to objects and fields, access paths, sharing,
exports, integrations, retention, deletion, masking, encryption, consent, and
audit evidence. Consider field history, setup audit trail, event monitoring,
debug logs, platform encryption, sandbox data controls, and installed-package
data flows only when available and licensed; do not assume entitlement. Produce
evidence requirements that can be validated in the target org and identify
manual administrator controls separately from deployable metadata.
