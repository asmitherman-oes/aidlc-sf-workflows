# Salesforce product methodology

Apply this methodology when the active scope is `salesforce-sdlc-standard` or
the workspace contains `sfdx-project.json`.

- Express requirements in business outcomes while preserving Salesforce terms,
  licenses, editions, clouds, personas, and record lifecycle constraints.
- Establish whether the requirement is already satisfied by standard platform
  capability, installed packages, existing metadata, or current automation.
- Use the Salesforce DX MCP server to inspect relevant org state when available.
  If it is unavailable, identify the missing evidence instead of guessing.
- Capture acceptance criteria for permissions, bulk behavior, error handling,
  reporting, mobile use, accessibility, and deployment verification.
- Separate required behavior from a proposed implementation. Do not turn an
  early request for Apex, Flow, or LWC into a design commitment.
