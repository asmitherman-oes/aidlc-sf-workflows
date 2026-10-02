---
target: refined-mockups
plugin: salesforce
adds:
  scopes:
    - salesforce-classic
  sensors:
    - salesforce-tool-usage
fragments:
  - anchor: before-step:5
    order: 100
---

## fragment: before-step:5

### Step 4a (salesforce): Lightning and SLDS mapping with Salesforce tooling

When the work targets Salesforce, design the UI with Salesforce's design tooling:

- Load **`design-systems-slds-apply`**. Use it to choose between Lightning Base
  Components and SLDS blueprints, and for styling hooks and icons.
- Use the MCP tools `guide_lbc_usage` and `explore_lbc_components` to map every
  UI element in `design-system-mapping.md` to a base component.
- Apply the **`platform-flexipage-generate`** rules for record, app, and home
  pages. Prefer configuration (Dynamic Forms and Dynamic Actions) over a custom
  LWC.
- Use the MCP tool `guide_component_accessibility` for the accessibility
  checklist.

The blocking `salesforce-tool-usage` gate requires a recorded call to
`design-systems-slds-apply`, `guide_lbc_usage`, or `explore_lbc_components`.
