# Salesforce architecture review criteria

Apply this methodology when the active scope is `salesforce-sdlc-standard` or
the workspace contains `sfdx-project.json`.

Require evidence that standard capability, configuration, and Flow were
evaluated before custom Apex, LWC, or external infrastructure. Review metadata
reuse, automation interaction, transaction boundaries, governor limits,
bulkification, sharing, CRUD/FLS, authentication, packaging, deployment order,
testability, and operational ownership. Flag guessed org state, hardcoded org
identifiers, unjustified AWS components, and designs that cannot be promoted
repeatably between environments.
