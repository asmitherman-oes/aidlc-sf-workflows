# Salesforce experience-design methodology

Apply this methodology when the active scope is `salesforce-sdlc-standard` or
the workspace contains `sfdx-project.json`.

Start with standard Lightning experiences, Dynamic Forms, actions, related
lists, App Builder, and supported configuration before proposing custom UI.
When custom LWC is justified, use SLDS patterns and base components, design for
keyboard and screen-reader access, cover loading/empty/error states, respect
form-factor constraints, and align data access with Lightning Data Service and
the user's permissions. Mockups must distinguish configurable standard UI from
custom components and identify required metadata.
