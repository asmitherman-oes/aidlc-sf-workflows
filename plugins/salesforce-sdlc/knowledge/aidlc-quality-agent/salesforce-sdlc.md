# Salesforce quality methodology

Apply this methodology when the active scope is `salesforce-sdlc-standard` or
the workspace contains `sfdx-project.json`.

Build a risk-based verification plan covering the metadata types that changed.
Use Salesforce Code Analyzer, Apex tests, LWC Jest tests, Flow behavior checks,
and validation-only deployments as applicable. Coverage is a release constraint,
not a substitute for assertions: verify positive, negative, bulk, permission,
sharing, limit, and integration-failure behavior.

Use Salesforce DX MCP or Salesforce CLI for factual test and validation results.
Record the command/tool, target org alias, test level, component set, failures,
warnings, and evidence location. Never report a validation as successful from
generated prose alone.
