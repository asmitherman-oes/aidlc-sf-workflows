---
slug: salesforce-release-deployment
number: 4.20
name: Salesforce Release Deployment
plugin: salesforce
phase: operation
execution: CONDITIONAL
condition: Execute only when the human asks to promote the validated change to a named downstream org (QA, UAT, staging sandbox, or production). Skip when the workflow ends at a validated scratch org or sandbox.
lead_agent: aidlc-pipeline-deploy-agent
support_agents:
  - aidlc-devsecops-agent
  - aidlc-quality-agent
mode: inline
produces:
  - salesforce-release-plan
  - salesforce-deployment-log
  - salesforce-post-deployment-verification
consumes:
  - artifact: salesforce-org-validation-report
    required: true
  - artifact: salesforce-apex-test-report
    required: false
  - artifact: salesforce-environment-strategy
    required: false
  - artifact: salesforce-access-matrix
    required: false
requires_stage:
  - salesforce-org-validation
sensors:
  - required-sections
  - upstream-coverage
  - salesforce-tool-usage
scopes:
  - salesforce-classic
inputs: salesforce-org-validation-report.md, salesforce-apex-test-report.md, salesforce-environment-strategy.md, salesforce-access-matrix.md, and the Salesforce DX project source
outputs: salesforce-release-plan.md, salesforce-deployment-log.md, and salesforce-post-deployment-verification.md under this stage's record dir (engine-resolved)
---

# Salesforce Release Deployment

MANDATORY: Follow stage-protocol.md for approval gates, question format, and completion messages.

Promote the validated change to a downstream org with a validated, repeatable,
and reversible release, using the **`platform-metadata-deploy`** skill and the
Salesforce DX MCP tools (see `{{HARNESS_DIR}}/knowledge/aidlc-shared/salesforce-tooling.md`).
**Every write to an org in this stage needs an explicit human confirmation that
names the target org alias.** A production deployment needs a second
confirmation after a successful validation.

## Steps

### Step 1: Confirm the Release Target

- Read `salesforce-org-validation-report.md`. If its `## Verdict` is not ready,
  STOP.
- Call `list_all_orgs`. Ask the human for the target alias, the release window,
  and the approver. Confirm the org with `get_username` and the
  `Organization` query through `run_soql_query`, then echo the alias, username,
  and production or sandbox.

### Step 2: Build the Release Plan

Follow **`platform-metadata-deploy`** to build the release manifest and
destructive changes. Retrieve any baseline with
**`platform-metadata-retrieve`** / `retrieve_metadata` if needed. Write
`salesforce-release-plan.md` with these sections:
- `## Release Scope`;
- `## Destructive Changes`;
- `## Test Level`;
- `## Pre-Deployment Steps`;
- `## Post-Deployment Steps`;
- `## Rollback Plan`.

Present the plan and get approval before any org write.

### Step 3: Validate (Check-Only) Deployment

For production, and for any validate-first release, run the check-only
validation that **`platform-metadata-deploy`** prescribes, with the planned test
level. Record the validation job id, the test results, and coverage.

### Step 4: Deploy

After a second confirmation that names the alias, either quick-deploy the
validated job (production) or deploy with the MCP tool `deploy_metadata`
(sandbox). Poll with `resume_tool_operation`, and record everything in
`salesforce-deployment-log.md` under these sections: `## Target Org`,
`## Validation Run`, `## Deployment Run`, `## Destructive Changes Applied`, and
`## Issues`.

### Step 5: Post-Deployment Steps and Verification

Run the approved post-deployment steps. Assign permission sets with
`assign_permission_set` or **`dx-org-permission-set-assign`**. Verify the
deployment with read-only `run_soql_query` checks and the approved smoke tests.
Write `salesforce-post-deployment-verification.md` with these sections:
`## Steps Executed`, `## Smoke Checks`, `## Open Issues`, and
`## Rollback Decision`.

### Step 6: Completion Handoff

Hand completion to `stage-protocol.md` via
`bun {{HARNESS_DIR}}/tools/aidlc-orchestrate.ts report --stage salesforce-release-deployment --result <outcome>`.
That `report` call owns every lifecycle transition and advancement; never perform one in prose.

### Step 7: Present Completion & Request Approval

Completion emoji: :rocket:
- Summary: the target org, deployment status, tests and coverage in the target org, the post-deployment checks, and rollback readiness
- Review path: this stage's engine-resolved record dir
- Standard 2-option approval (Approve / Request Changes). STOP for the human response.

## Sensors

`required-sections` and `upstream-coverage` check the markdown outputs.
`salesforce-tool-usage` (blocking, at the gate) requires a recorded
`deploy_metadata` or `platform-metadata-deploy` call.

## Learn

When `directive.protocol_modules` lists `learnings`, follow
`stage-protocol-learnings.md`: keep the diary at `directive.memory_path` while
working and run the ritual before the approval gate. When the module is absent,
skip both the diary and the ritual.
