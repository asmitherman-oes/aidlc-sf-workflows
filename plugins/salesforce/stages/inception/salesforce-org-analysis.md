---
slug: salesforce-org-analysis
number: 2.20
name: Salesforce Org Analysis
plugin: salesforce
phase: inception
execution: CONDITIONAL
condition: Execute when a target Salesforce org (sandbox, scratch, or a read-only production login) is authorized for this workflow, or when the workspace is an existing Salesforce DX project whose target org must be checked for conflicts. Skip for a greenfield project with no org yet.
lead_agent: aidlc-architect-agent
support_agents:
  - aidlc-developer-agent
  - aidlc-pipeline-deploy-agent
mode: inline
produces:
  - salesforce-org-profile
  - salesforce-org-impact-analysis
consumes:
  - artifact: requirements
    required: true
  - artifact: stories
    required: false
  - artifact: components
    required: false
  - artifact: unit-of-work
    required: false
  - artifact: code-structure
    required: false
    conditional_on: brownfield
  - artifact: technology-stack
    required: false
    conditional_on: brownfield
requires_stage:
  - requirements-analysis
sensors:
  - required-sections
  - upstream-coverage
  - salesforce-tool-usage
scopes:
  - salesforce-classic
inputs: requirements.md (including its Salesforce Platform Constraints section), stories.md and components.md when produced, Reverse Engineering artifacts when brownfield, and the live target org through the Salesforce DX MCP server
outputs: salesforce-org-profile.md and salesforce-org-impact-analysis.md under this stage's record dir (engine-resolved)
---

# Salesforce Org Analysis

MANDATORY: Follow stage-protocol.md for approval gates, question format, and completion messages.

Ground the Salesforce design in the real target org before anyone designs
against it. This stage is **read-only against the org**. The work goes through
Salesforce's own tooling (see `{{HARNESS_DIR}}/knowledge/aidlc-shared/salesforce-tooling.md`).
The `salesforce-tool-usage` gate checks the recorded calls before approval.

## Steps

### Step 1: Resolve the Target Org

- Call the Salesforce DX MCP tool `list_all_orgs`. Ask the human which org alias
  to analyse, offering the listed aliases plus "No org yet: skip this stage".
  Never guess.
- Confirm the choice with the MCP tool `get_username`, and echo the alias,
  username, and whether the org is scratch, sandbox, or production.
  Production is allowed only because this stage is read-only.
- If the human chooses to skip, report the stage as skipped through the
  completion handoff and stop.

### Step 2: Inventory the Org with Salesforce Tooling

Invoke the **`dx-org-analyze`** skill in single-org mode against the confirmed
alias and follow it. It produces the inventory of metadata components,
permissions, profiles, installed packages, and licenses. Supplement it with the
MCP tool `run_soql_query` (use the **`platform-soql-query`** skill to author
non-trivial queries) for anything the inventory does not cover: org identity,
API version, and active licenses.

### Step 3: Analyse Impact on Existing Metadata

From `requirements.md` (its `## Salesforce Platform Constraints` section),
`stories.md`, and `components.md`, list every object, feature, and integration
the change touches. For each touched object, use `run_soql_query` (Tooling API
where needed) to read its fields, triggers, record-triggered flows, validation
rules, and record volume. Use **`platform-data-and-tooling-api-context-get`**
for standard-object field facts instead of recalling them. Flag large data
volumes, data skew, and naming or automation conflicts.

With the human's consent, retrieve specific components whose source the design
must read. Use the **`platform-metadata-retrieve`** skill or the MCP tool
`retrieve_metadata`, and first state which components and which directory.

### Step 4: Generate Artifacts

Write `salesforce-org-profile.md` with these sections: `## Org Identity`,
`## Licenses and Clouds`, `## Installed Packages`, `## Limits Snapshot`,
`## API Version`, and `## Evidence`. The Evidence section lists the skill runs
and queries used, each with a result summary.

Write `salesforce-org-impact-analysis.md` with these sections:
`## Touched Objects`, `## Existing Automation`, `## Conflicts and Risks`, and
`## Recommendations for Solution Design`. Tie each conflict to a requirement id.

Every claim about the org must cite its tool evidence.

### Step 5: Completion Handoff

Hand completion to `stage-protocol.md` via
`bun {{HARNESS_DIR}}/tools/aidlc-orchestrate.ts report --stage salesforce-org-analysis --result <outcome>`.
That `report` call owns every lifecycle transition and advancement; never perform one in prose, and never narrate this bookkeeping to the user.

### Step 6: Present Completion & Request Approval

Completion emoji: :cloud:
- Summary: the org's identity, any license or package gaps, and the top conflicts
- Review path: this stage's engine-resolved record dir
- Standard 2-option approval (Approve / Request Changes). STOP for the human response.

## Sensors

`required-sections` and `upstream-coverage` check the markdown outputs.
`salesforce-tool-usage` (blocking, at the gate) requires that the recorded
calls include `list_all_orgs`, `get_username`, or `dx-org-analyze`, plus
`run_soql_query`, `dx-org-analyze`, or `platform-soql-query`.

## Learn

When `directive.protocol_modules` lists `learnings`, follow
`stage-protocol-learnings.md`: keep the diary at `directive.memory_path` while
working and run the ritual before the approval gate. When the module is absent,
skip both the diary and the ritual.
