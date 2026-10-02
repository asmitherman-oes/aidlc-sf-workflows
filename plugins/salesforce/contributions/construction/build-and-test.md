---
target: build-and-test
plugin: salesforce
adds:
  scopes:
    - salesforce-classic
  sensors:
    - salesforce-tool-usage
fragments:
  - anchor: before-step:3
    order: 100
  - anchor: before-step:10
    order: 100
  - anchor: in:Sensors
    order: 100
---

## fragment: before-step:3

### Step 2a (salesforce): Salesforce build instructions

When the work targets Salesforce, "build" means proving the metadata compiles,
deploys, and passes Salesforce's analyzers. In `build-instructions.md`, document
the following.

**Prerequisites:**
- the `sf` CLI;
- Node.js for LWC Jest;
- the `salesforce-dx` MCP server;
- the Salesforce skills (`npx skills add forcedotcom/sf-skills`).

**Org-free checks:**
- Salesforce Code Analyzer (MCP `run_code_analyzer`, or **`dx-code-analyzer-run`**);
- LWC Jest, plus Sa11y through **`experience-lwc-accessibility-jest-run`**;
- **`design-systems-slds-validate`** for the LWCs.

**Compile and deploy check:**
- a dry-run deploy following **`platform-metadata-deploy`**, against an
  authorized non-production org.

## fragment: before-step:10

### Step 9a (salesforce): Salesforce execution and deferral

When the work targets Salesforce:

- Always run the org-free checks: Code Analyzer, LWC Jest, and the SLDS
  validation. Treat Code Analyzer findings at severity 1–2 as failures.
- If a non-production validation org is already authorized for this workflow,
  run the Apex tests against it with the MCP tool `run_apex_test` (following
  **`platform-apex-test-run`**).
- Otherwise, defer Apex execution and the dry-run deploy to the **Salesforce Org
  Validation** stage, which is scheduled later in this plan and owns them.
  Record that stage as the owner and its `salesforce-apex-test-report.md` as the
  expected evidence. Deferred checks stay `Unverified` here.
- Never run tests or deploy against production from this stage.

## fragment: in:Sensors

The salesforce plugin binds the BLOCKING `salesforce-tool-usage` gate sensor to
this stage. The sensor requires a recorded `run_code_analyzer` or
`dx-code-analyzer-run` call before the approval gate opens.
