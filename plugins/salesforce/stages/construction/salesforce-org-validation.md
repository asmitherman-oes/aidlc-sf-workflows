---
slug: salesforce-org-validation
number: 3.20
name: Salesforce Org Validation
plugin: salesforce
phase: construction
execution: ALWAYS
condition: Always execute under a Salesforce scope once Build and Test has run. Apex only executes inside an org, so this stage proves the generated metadata deploys and its Apex tests pass with coverage in a non-production org.
lead_agent: aidlc-quality-agent
support_agents:
  - aidlc-pipeline-deploy-agent
  - aidlc-devsecops-agent
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
  - salesforce-tool-usage
scopes:
  - salesforce-classic
inputs: The Salesforce DX project source in the workspace, build-and-test-summary.md and build-test-results.md, salesforce-environment-strategy.md, and salesforce-access-matrix.md when produced
outputs: salesforce-org-validation-report.md, salesforce-apex-test-report.md, and the salesforce-apex-test-results.json sensor side-input under this stage's record dir (engine-resolved)
---

# Salesforce Org Validation

MANDATORY: Follow stage-protocol.md for approval gates, question format, and completion messages.

Prove the change works on the platform: the metadata deploys, the Apex tests
pass in an org with coverage that meets the targets, and Salesforce's analyzers
come back clean. Every step goes through Salesforce DX MCP tools or Salesforce
skills (see `{{HARNESS_DIR}}/knowledge/aidlc-shared/salesforce-tooling.md`).
This stage **never targets production**. Build and Test may defer Apex
execution to this stage, and anything deferred here is owned here.

## Steps

### Step 1: Choose the Validation Org

- Read `salesforce-environment-strategy.md` to find the intended validation org type.
- Call the MCP tool `list_all_orgs`, then ask the human to choose an existing
  scratch org or sandbox alias, or "Create a new scratch org". For a new
  scratch org, ask for the Dev Hub and the duration. Then create it with the MCP
  tool `create_scratch_org` (or the **`dx-org-manage`** skill) from
  `config/project-scratch-def.json`, polling with `resume_tool_operation`.
- Verify the org is not production: run
  `SELECT IsSandbox, OrganizationType FROM Organization` with `run_soql_query`,
  and check the scratch flag from `list_all_orgs`. If the org is production,
  STOP.

### Step 2: Deploy the Source

Deploy the package directories with the MCP tool `deploy_metadata`, following
the **`platform-metadata-deploy`** skill for test level and error triage. Echo
the target alias first. On failure, record every component error and present it
at the gate. Do not silently patch application source in this stage.

### Step 3: Prepare Test Access

Assign the permission sets named in `salesforce-access-matrix.md` with the MCP
tool `assign_permission_set` (or the **`dx-org-permission-set-assign`** skill).
Record each assignment.

### Step 4: Run Apex Tests with Coverage

Run the tests with the MCP tool `run_apex_test`, requesting code coverage and
following the **`platform-apex-test-run`** skill. Use `RunLocalTests` or the
change's own test classes, as the environment strategy specifies. Poll with
`resume_tool_operation` until the run finishes. When tests fail, follow the
skill's test-fix loop: present the failures, and fix them only with the
human's consent.

### Step 5: Run Salesforce Analyzers

- MCP `run_code_analyzer` (or the **`dx-code-analyzer-run`** skill) on all
  changed Apex, LWC, and Flow source. Treat severity 1–2 findings as
  gate findings.
- **`dx-apexguru-scan`** when the org has ApexGuru available.
- For LWCs: MCP `run_lwc_accessibility_jest_tests` (or
  **`experience-lwc-accessibility-jest-run`**),
  **`experience-lwc-security-validate`**, and
  **`design-systems-slds-validate`**.
- MCP `validate_and_optimize` / `score_issues` to score the generated work.

### Step 6: Generate Artifacts

Write `salesforce-apex-test-results.json` in this stage's record dir, using the
`run_apex_test` results. It is the side-input that the advisory
`salesforce-apex-coverage` sensor reads, and it takes this shape:

```json
{
  "org": { "alias": "<alias>", "type": "scratch|sandbox" },
  "summary": { "outcome": "Passed|Failed", "tests_ran": 0, "passing": 0, "failing": 0, "skipped": 0, "org_wide_coverage_pct": 0 },
  "classes": [ { "name": "<ApexClass>", "coverage_pct": 0 } ],
  "failures": [ { "class": "<TestClass>", "method": "<method>", "message": "<message>" } ],
  "targets": { "org_wide": 85, "per_class": 75 }
}
```

Never set a target below the 75% platform floor.

Write `salesforce-apex-test-report.md` with these sections:
`## Test Run Summary`, `## Coverage by Class`, `## Failures`,
`## LWC Jest Results`, and `## Slow Tests`.

Write `salesforce-org-validation-report.md` with these sections:
`## Validation Org`, `## Deployment Result`, `## Permission Set Assignments`,
`## Static Analysis` (Code Analyzer, ApexGuru, SLDS, LWS, and accessibility
findings, by severity), `## Unverified Checks`, and `## Verdict`.

### Step 7: Scratch Org Cleanup (Optional)

If this stage created a scratch org, ask whether to keep it or delete it. Call
`delete_org` only on an explicit yes, and only for that scratch org.

### Step 8: Completion Handoff

Hand completion to `stage-protocol.md` via
`bun {{HARNESS_DIR}}/tools/aidlc-orchestrate.ts report --stage salesforce-org-validation --result <outcome>`.
That `report` call owns every lifecycle transition and advancement; never perform one in prose.

### Step 9: Present Completion & Request Approval

Completion emoji: :white_check_mark:
- Summary: the deployment result, tests passed and failed, org-wide coverage against the target, and the analyzer findings
- Review path: this stage's engine-resolved record dir
- Standard 2-option approval (Approve / Request Changes). STOP for the human response.

## Sensors

`required-sections` and `upstream-coverage` check the markdown outputs.
`salesforce-apex-coverage` (advisory) reads the JSON and reports failing tests
and coverage below target. `salesforce-tool-usage` (blocking, at the gate)
requires recorded calls to:
- `deploy_metadata` or `platform-metadata-deploy`;
- `run_apex_test` or `platform-apex-test-run`;
- `run_code_analyzer` or `dx-code-analyzer-run`.

## Learn

When `directive.protocol_modules` lists `learnings`, follow
`stage-protocol-learnings.md`: keep the diary at `directive.memory_path` while
working and run the ritual before the approval gate. When the module is absent,
skip both the diary and the ritual.
