---
target: build-and-test
plugin: salesforce
adds:
  scopes:
    - salesforce-classic
  sensors:
    - salesforce-apex-antipatterns
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

When the work targets Salesforce, "build" means proving the metadata compiles and
deploys. In `build-instructions.md`, document:

- The prerequisites: the `sf` CLI (`sf --version`), Node.js for LWC Jest, an
  authorized validation org alias, and the Salesforce DX MCP server when it is
  used.
- The local static checks, which need no org: `npx prettier --check` with
  `prettier-plugin-apex` if the project uses it, ESLint with
  `@salesforce/eslint-config-lwc`, and Salesforce Code Analyzer
  (`sf code-analyzer run --workspace . --target <changed paths>`).
- The compile and deploy check: `sf project deploy start --dry-run --source-dir <package dirs> --target-org <alias>`
  (or the MCP `deploy_metadata` tool against a scratch org).

## fragment: before-step:10

### Step 9a (salesforce): Salesforce execution and deferral

When the work targets Salesforce:

- Always run the org-free checks: LWC Jest, ESLint, and Code Analyzer.
- Apex tests run only inside an org. If a non-production validation org is
  already authorized for this workflow, run the per-Unit Apex test commands
  against it (MCP `run_apex_test`, or `sf apex run test ... --code-coverage`).
  Otherwise, defer Apex execution and the dry-run deployment to the
  **Salesforce Org Validation** stage, which is scheduled later in this plan and
  explicitly owns them. Record that stage as the owner and its report
  (`salesforce-apex-test-report.md`) as the expected evidence path. Deferred
  Apex checks stay `Unverified` here.
- Never run tests or deploy against a production org from this stage.

## fragment: in:Sensors

The salesforce plugin adds the ADVISORY `salesforce-apex-antipatterns` sensor
here too, so Apex fixed during test generation is re-checked on write.
