---
slug: salesforce-org-analysis
number: 2.20
name: Salesforce Org Analysis
plugin: salesforce
phase: inception
execution: CONDITIONAL
condition: Execute when a target Salesforce org (sandbox, scratch, or a read-only production login) is authorized for this workflow, or when the workspace is an existing Salesforce DX project whose target org must be checked for conflicts. Skip for a greenfield project with no org yet.
lead_agent: salesforce-architect-agent
support_agents:
  - salesforce-admin-agent
  - salesforce-devops-agent
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
scopes:
  - salesforce-classic
inputs: requirements.md (including its Salesforce Platform Constraints section), stories.md and components.md when produced, Reverse Engineering artifacts when brownfield, and the live target org through the Salesforce DX MCP server
outputs: salesforce-org-profile.md and salesforce-org-impact-analysis.md under this stage's record dir (engine-resolved)
---

# Salesforce Org Analysis

MANDATORY: Follow stage-protocol.md for approval gates, question format, and completion messages.

Ground the Salesforce design in the real target org before anyone designs
against it. This stage is **read-only against the org**: it queries and, with
consent, retrieves. It never deploys, assigns permissions, or changes data.

Tool reference for every Salesforce DX MCP call below, including `sf` CLI
fallbacks when the MCP server is not connected:
`{{HARNESS_DIR}}/knowledge/salesforce-devops-agent/salesforce-dx-mcp-tools.md`.

## Steps

### Step 1: Resolve the Target Org

- Call the Salesforce DX MCP tool `list_all_orgs` to see the authorized orgs.
  If the MCP server is unavailable, run `sf org list --json`.
- Ask the human which org alias to analyse, with options built from the list
  plus "No org yet: skip this stage". Never guess.
- Confirm the choice with `get_username` and echo the alias, username, and
  whether the org is a scratch org, sandbox, or production. Production is
  allowed here only because this stage is read-only.
- If the human chooses to skip, report the stage as skipped through the
  completion handoff and stop.

### Step 2: Profile the Org

Use `run_soql_query` against the confirmed org and record each query with its
result summary:

- `SELECT Name, OrganizationType, IsSandbox, InstanceName, NamespacePrefix, LanguageLocaleKey, TimeZoneSidKey FROM Organization`
- `SELECT Name, TotalLicenses, UsedLicenses, Status FROM UserLicense WHERE Status = 'Active'`
- Installed packages (Tooling API): `SELECT SubscriberPackage.Name, SubscriberPackage.NamespacePrefix, SubscriberPackageVersion.Name FROM InstalledSubscriberPackage`
- The org's API version from `get_username`/org display, compared with the
  workspace `sfdx-project.json` `sourceApiVersion` when present.
- Limits: `sf org list limits --target-org <alias> --json` (the MCP server has no
  limits tool). Record API requests, data storage, file storage, and async Apex
  executions.

### Step 3: Analyse Impact on Existing Metadata

From `requirements.md` (its `## Salesforce Platform Constraints` section),
`stories.md`, and `components.md`, list every object, feature, and integration
the change touches. For each touched object, query (Tooling API where noted):

- Fields: `SELECT QualifiedApiName, DataType, IsIndexed FROM FieldDefinition WHERE EntityDefinition.QualifiedApiName = '<Object>'`
- Triggers: `SELECT Name, TableEnumOrId, Status FROM ApexTrigger WHERE TableEnumOrId = '<Object>'` (Tooling)
- Record-triggered flows: `SELECT ApiName, ProcessType, TriggerType, TriggerObjectOrEventLabel, IsActive FROM FlowDefinitionView WHERE TriggerObjectOrEventLabel != null`
- Validation rules: `SELECT ValidationName, Active, EntityDefinition.QualifiedApiName FROM ValidationRule WHERE EntityDefinition.QualifiedApiName = '<Object>'` (Tooling)
- Volumes: `SELECT COUNT() FROM <Object>`. Flag large data volume (over about one
  million rows) and ownership or lookup skew (over 10,000 children per parent
  or owner).

With the human's consent, use `retrieve_metadata` to pull specific components
whose source the design must read. Retrieval writes into the workspace, so state
which components and directory first.

### Step 4: Generate Artifacts

Write `salesforce-org-profile.md` with these H2 sections:
`## Org Identity`, `## Licenses and Clouds`, `## Installed Packages`,
`## Limits Snapshot`, `## API Version`, and `## Evidence` (the queries run, each
with its result summary).

Write `salesforce-org-impact-analysis.md` with these H2 sections:
`## Touched Objects` (a table of object, standard or custom, field count, and
record volume), `## Existing Automation` (a table of object, triggers, flows,
validation rules, and process or workflow leftovers), `## Conflicts and Risks`
(each conflict tied to a requirement id, such as an existing field name clash,
competing automation, LDV, skew, or a license gap), and `## Recommendations for
Solution Design`.

Every claim about the org must cite its query or retrieve evidence.

### Step 5: Completion Handoff

Hand completion to `stage-protocol.md` via
`bun {{HARNESS_DIR}}/tools/aidlc-orchestrate.ts report --stage salesforce-org-analysis --result <outcome>`.
That `report` call owns every lifecycle transition and advancement; never perform one in prose, and never narrate this bookkeeping to the user.

### Step 6: Present Completion & Request Approval

Completion emoji: :cloud:
- Summary: org identity, license or package gaps, and the top conflicts found
- Review path: this stage's engine-resolved record dir
- Standard 2-option approval (Approve / Request Changes). STOP for the human response.

## Sensors

This stage's outputs are markdown artifacts under its record dir. The imported
`required-sections` and `upstream-coverage` sensors check those outputs.

Upstream targets: `requirements`, `stories`, `components`, `unit-of-work`.

## Learn

When `directive.protocol_modules` lists `learnings`, follow
`stage-protocol-learnings.md`: keep the diary at `directive.memory_path` while
working and run the ritual before the approval gate. When the module is absent,
skip both the diary and the ritual.
