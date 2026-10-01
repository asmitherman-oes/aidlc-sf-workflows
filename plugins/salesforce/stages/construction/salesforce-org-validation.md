---
slug: salesforce-org-validation
number: 3.20
name: Salesforce Org Validation
plugin: salesforce
phase: construction
execution: ALWAYS
condition: Always execute under a Salesforce scope once Build and Test has run. Apex only executes inside an org, so this stage proves the generated metadata deploys and its Apex tests pass with coverage in a non-production org.
lead_agent: salesforce-devops-agent
support_agents:
  - salesforce-qa-agent
  - salesforce-security-agent
mode: inline
produces:
  - salesforce-org-validation-report
  - salesforce-apex-test-report
consumes:
  - artifact: build-and-test-summary
    required: false
  - artifact: build-test-results
    required: false
  - artifact: salesforce-environment-strategy
    required: false
  - artifact: salesforce-access-matrix
    required: false
requires_stage:
  - build-and-test
sensors:
  - required-sections
  - upstream-coverage
  - salesforce-apex-coverage
scopes:
  - salesforce-classic
inputs: The Salesforce DX project source in the workspace, build-and-test-summary.md and build-test-results.md, salesforce-environment-strategy.md, and salesforce-access-matrix.md when produced
outputs: salesforce-org-validation-report.md, salesforce-apex-test-report.md, and the salesforce-apex-test-results.json sensor side-input under this stage's record dir (engine-resolved)
---

# Salesforce Org Validation

MANDATORY: Follow stage-protocol.md for approval gates, question format, and completion messages.

Prove the change works on the platform: the metadata deploys, the Apex tests
pass in an org with coverage that meets the targets, and static analysis is
clean. This stage **never targets production**. Build and Test may defer Apex
execution to this stage. Any check deferred here is owned here and must be
executed or reported as `Unverified`.

Tool reference and CLI fallbacks:
`{{HARNESS_DIR}}/knowledge/salesforce-devops-agent/salesforce-dx-mcp-tools.md`.
Testing methodology:
`{{HARNESS_DIR}}/knowledge/salesforce-qa-agent/salesforce-testing-guide.md`.

## Steps

### Step 1: Choose the Validation Org

- Read `salesforce-environment-strategy.md` for the intended validation org type.
- Call `list_all_orgs` and ask the human to choose: an existing scratch org or
  sandbox alias, or "Create a new scratch org" from
  `config/project-scratch-def.json`. If they choose a new scratch org, ask
  for the Dev Hub alias and the duration, then call `create_scratch_org`. Poll
  with `resume_tool_operation` if it returns a job id.
- Verify the chosen org is NOT production:
  `SELECT IsSandbox, OrganizationType FROM Organization` via `run_soql_query`,
  plus the scratch-org flag from `list_all_orgs`. If `IsSandbox = false` and it is
  not a scratch org, STOP and ask for a different org. Never continue against
  production.

### Step 2: Deploy the Source

- Call `deploy_metadata` for the project's package directories (or the
  manifest the environment strategy names) to the validation org. Echo the
  target alias first.
- If the deployment fails, record every component error (type, name, line, and
  message) in the report. Do not silently patch application source in this
  stage. Present the failures at the gate so the human can choose Request
  Changes to send the work back to Code Generation, or authorize a named,
  minimal fix.

### Step 3: Prepare Test Access

Assign the permission sets that `salesforce-access-matrix.md` names to the
running user with `assign_permission_set`, so that UI smoke checks and any
non-`runAs` tests see the intended access. Record each assignment.

### Step 4: Run Apex Tests with Coverage

Call `run_apex_test` against the validation org with code coverage requested.
Use test level `RunLocalTests` for a full-org project, or the specific test
classes the change owns when the strategy says `RunSpecifiedTests`. Poll with
`resume_tool_operation` until the run completes. Capture the outcome,
pass/fail/skip counts, org-wide coverage, per-class coverage for every class the
change touches, failing methods with messages and stack traces, and the slowest
tests.

### Step 5: Run LWC Jest and Static Analysis

- If `package.json` contains `@salesforce/sfdx-lwc-jest`, run the project's
  `test:unit` script (or `npx sfdx-lwc-jest`) and capture results.
- Run Salesforce Code Analyzer on the changed Apex, LWC, and Flow source: the
  MCP `run_code_analyzer` tool when the server exposes it, otherwise
  `sf code-analyzer run --workspace . --target <changed paths>`. Treat
  Critical and High (severity 1–2) security and performance violations as
  findings for the gate.

### Step 6: Generate Artifacts

Write `salesforce-apex-test-results.json` in this stage's record dir, exactly in
this shape. It is the side-input the advisory `salesforce-apex-coverage`
sensor reads, not a `produces:` deliverable:

```json
{
  "org": { "alias": "<alias>", "type": "scratch|sandbox" },
  "summary": { "outcome": "Passed|Failed", "tests_ran": 0, "passing": 0, "failing": 0, "skipped": 0, "org_wide_coverage_pct": 0 },
  "classes": [ { "name": "<ApexClass>", "coverage_pct": 0 } ],
  "failures": [ { "class": "<TestClass>", "method": "<method>", "message": "<message>" } ],
  "targets": { "org_wide": 85, "per_class": 75 }
}
```

Take the targets from the NFR Requirements and Testing Contract when they set
coverage floors. Never set them below the platform's 75% org-wide deployment
floor.

Write `salesforce-apex-test-report.md` with `## Test Run Summary`,
`## Coverage by Class` (with each class below target flagged), `## Failures`,
`## LWC Jest Results`, and `## Slow Tests`.

Write `salesforce-org-validation-report.md` with `## Validation Org`,
`## Deployment Result` (components deployed and errors),
`## Permission Set Assignments`, `## Static Analysis` (violations by severity
with file and rule), `## Unverified Checks` (anything that could not run, and
why), and `## Verdict` (Ready for release, or Not ready with the blocking
items).

### Step 7: Scratch Org Cleanup (Optional)

If this stage created a scratch org, ask whether to keep it for UAT or delete it.
Call `delete_org` only on an explicit yes, and only for that scratch org.

### Step 8: Completion Handoff

Hand completion to `stage-protocol.md` via
`bun {{HARNESS_DIR}}/tools/aidlc-orchestrate.ts report --stage salesforce-org-validation --result <outcome>`.
That `report` call owns every lifecycle transition and advancement; never perform one in prose.

### Step 9: Present Completion & Request Approval

Completion emoji: :white_check_mark:
- Summary: deployment result, tests passed and failed, org-wide coverage against
  target, classes below target, and Critical or High analyzer findings
- The `salesforce-apex-coverage` sensor finding, if any
- Review path: this stage's engine-resolved record dir
- Standard 2-option approval (Approve / Request Changes). STOP for the human response.

## Sensors

This stage's outputs are markdown artifacts plus `salesforce-apex-test-results.json`
under its record dir. `required-sections` and `upstream-coverage` check the
markdown. `salesforce-apex-coverage` (advisory) reads the JSON and reports
failing tests, org-wide coverage below target, and touched classes below the
per-class target. It reports and does not block; drive the code and tests to
meet the targets rather than lowering them.

Upstream targets: `build-and-test-summary`, `build-test-results`,
`salesforce-environment-strategy`, `salesforce-access-matrix`.

## Learn

When `directive.protocol_modules` lists `learnings`, follow
`stage-protocol-learnings.md`: keep the diary at `directive.memory_path` while
working and run the ritual before the approval gate. When the module is absent,
skip both the diary and the ritual.
