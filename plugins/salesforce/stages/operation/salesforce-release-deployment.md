---
slug: salesforce-release-deployment
number: 4.20
name: Salesforce Release Deployment
plugin: salesforce
phase: operation
execution: CONDITIONAL
condition: Execute only when the human asks to promote the validated change to a named downstream org (QA, UAT, staging sandbox, or production). Skip when the workflow ends at a validated scratch org or sandbox.
lead_agent: salesforce-devops-agent
support_agents:
  - salesforce-security-agent
  - salesforce-qa-agent
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
scopes:
  - salesforce-classic
inputs: salesforce-org-validation-report.md, salesforce-apex-test-report.md, salesforce-environment-strategy.md, salesforce-access-matrix.md, and the Salesforce DX project source
outputs: salesforce-release-plan.md, salesforce-deployment-log.md, and salesforce-post-deployment-verification.md under this stage's record dir (engine-resolved)
---

# Salesforce Release Deployment

MANDATORY: Follow stage-protocol.md for approval gates, question format, and completion messages.

Promote the validated change to a downstream org with a validated, repeatable,
reversible release. **Every write to an org in this stage needs an explicit
human confirmation that names the target org alias.** A production deployment
needs a second confirmation, after the human has seen a successful validation.

Tool reference and CLI fallbacks:
`{{HARNESS_DIR}}/knowledge/salesforce-devops-agent/salesforce-dx-mcp-tools.md`.
Release methodology:
`{{HARNESS_DIR}}/knowledge/salesforce-devops-agent/salesforce-devops-guide.md`.

## Steps

### Step 1: Confirm the Release Target

- Read `salesforce-org-validation-report.md`. If its `## Verdict` is not ready,
  STOP and say why.
- Call `list_all_orgs`. Ask the human for the target org alias, the release
  window, and the approver. Confirm with `get_username` and
  `SELECT IsSandbox, OrganizationType FROM Organization`, then echo the alias,
  username, and production or sandbox.

### Step 2: Build the Release Plan

Write `salesforce-release-plan.md` with these sections:
- `## Release Scope`: a manifest (`package.xml`) generated from the change, for
  example `sf project generate manifest --source-dir <dirs>`, or a delta from
  git.
- `## Destructive Changes`: `destructiveChangesPre.xml` and
  `destructiveChangesPost.xml` contents, or none.
- `## Test Level`: `RunLocalTests` or `RunSpecifiedTests` with the named
  classes. Production requires tests that cover at least 75% of the deployed
  Apex.
- `## Pre-Deployment Steps` and `## Post-Deployment Steps`: manual setup,
  permission set assignments, Custom Metadata or seed data, and scheduled jobs
  to stop or restart.
- `## Rollback Plan`: redeploy the previous version from git, use destructive
  changes, or switch a feature toggle through a custom permission or custom
  metadata, with an owner for each.

Present the plan and ask for approval before any org write.

### Step 3: Validate (Check-Only) Deployment

- For **production**, and for any org where the human wants a validation-first
  release, run a check-only validation:
  `sf project deploy validate --manifest <package.xml> --test-level <level> [--tests ...] --target-org <alias> --json`.
  Record the validation job id, test results, and coverage.
- For a **sandbox**, the human may instead approve a direct `deploy_metadata`
  through the MCP server with the planned test level.

### Step 4: Deploy

After the human confirms again, naming the target alias:
- Production, or validate-first: run quick deploy of the validated job,
  `sf project deploy quick --job-id <id> --target-org <alias> --json`.
- Sandbox direct: call `deploy_metadata` with the release manifest.

Poll long operations (`resume_tool_operation`, or `sf project deploy report`)
and record every result in `salesforce-deployment-log.md`: `## Target Org`,
`## Validation Run`, `## Deployment Run` (job ids, components, and test
results), `## Destructive Changes Applied`, and `## Issues`.

### Step 5: Post-Deployment Steps and Verification

Run the approved post-deployment steps: `assign_permission_set` for the
planned assignments, and data or metadata loads. Verify with read-only checks:
`run_soql_query` confirms the new components exist and are active (for example
`FlowDefinitionView` `IsActive`, or the new fields in `FieldDefinition`), and
smoke tests run where approved. Write `salesforce-post-deployment-verification.md`
with `## Steps Executed`, `## Smoke Checks`, `## Open Issues`, and
`## Rollback Decision` (not needed, or executed with its result).

### Step 6: Completion Handoff

Hand completion to `stage-protocol.md` via
`bun {{HARNESS_DIR}}/tools/aidlc-orchestrate.ts report --stage salesforce-release-deployment --result <outcome>`.
That `report` call owns every lifecycle transition and advancement; never perform one in prose.

### Step 7: Present Completion & Request Approval

Completion emoji: :rocket:
- Summary: target org, deployment status, tests and coverage in the target, the
  post-deployment checks, and the rollback readiness
- Review path: this stage's engine-resolved record dir
- Standard 2-option approval (Approve / Request Changes). STOP for the human response.

## Sensors

This stage's outputs are markdown artifacts under its record dir. The imported
`required-sections` and `upstream-coverage` sensors check those outputs.

Upstream targets: `salesforce-org-validation-report`, `salesforce-environment-strategy`.

## Learn

When `directive.protocol_modules` lists `learnings`, follow
`stage-protocol-learnings.md`: keep the diary at `directive.memory_path` while
working and run the ritual before the approval gate. When the module is absent,
skip both the diary and the ritual.
