---
slug: salesforce-security-model-design
number: 2.23
name: Salesforce Security Model Design
plugin: salesforce
phase: inception
execution: CONDITIONAL
condition: Execute when the change adds objects or fields, new personas or user populations (including Experience Cloud or guest users), sensitive data, Apex entry points (AuraEnabled, REST, invocable), or integrations with their own users. Skip when access to every touched record and field is unchanged.
lead_agent: salesforce-security-agent
support_agents:
  - salesforce-architect-agent
  - salesforce-admin-agent
mode: inline
reviewer: salesforce-technical-reviewer-agent
review_artifact: salesforce-security-model
reviewer_max_iterations: 2
review_class: advisory
produces:
  - salesforce-security-model
  - salesforce-access-matrix
consumes:
  - artifact: requirements
    required: true
  - artifact: personas
    required: false
  - artifact: stories
    required: false
  - artifact: salesforce-solution-blueprint
    required: true
  - artifact: salesforce-data-model
    required: false
  - artifact: salesforce-data-dictionary
    required: false
requires_stage:
  - salesforce-data-model-design
sensors:
  - required-sections
  - upstream-coverage
scopes:
  - salesforce-classic
inputs: requirements.md, personas.md and stories.md when produced, the Salesforce Solution Design artifacts, and the Salesforce Data Model artifacts when produced
outputs: salesforce-security-model.md and salesforce-access-matrix.md under this stage's record dir (engine-resolved)
---

# Salesforce Security Model Design

MANDATORY: Follow stage-protocol.md for approval gates, question format, and completion messages.

Decide who can see and change which records and fields, and how code enforces
it. Construction builds permission sets and user-mode Apex against this model,
and Salesforce Org Validation tests against it.

Methodology: `{{HARNESS_DIR}}/knowledge/salesforce-security-agent/salesforce-security-guide.md`.

## Steps

### Step 1: Load Prior Context

Read `requirements.md`, `personas.md` (including its `## Salesforce Persona
Access` section), `stories.md`, `salesforce-solution-blueprint.md`,
`salesforce-data-model.md`, and `salesforce-data-dictionary.md` when produced.
If an org was analysed, query the existing OWD
(`SELECT QualifiedApiName, InternalSharingModel, ExternalSharingModel FROM EntityDefinition WHERE QualifiedApiName IN (...)`)
and existing permission sets touching these objects (`ObjectPermissions`,
`FieldPermissions`) with `run_soql_query`.

### Step 2: Create Security Questions

Create `salesforce-security-model-design-questions.md` in this stage's record
dir, using the [Answer]: tag format. Cover: personas and their licenses, OWD per
object (internal and external), role hierarchy reliance, sharing rules, teams,
or Apex managed sharing, sensitive and regulated fields (PII, PHI, PCI) and
whether Shield Platform Encryption or field audit history is required, external
or guest access, integration user permissions, and feature gating through
custom permissions.

### Step 3: Collect and Analyze Answers

Collect answers following stage-protocol.md §3 question flow, resolving every
ambiguity before generating artifacts.

### Step 4: Generate Artifacts

**`salesforce-security-model.md`**: `## Organization-Wide Defaults` (table per
object), `## Record Sharing` (role hierarchy use, sharing rules, teams, Apex
managed sharing with justification), `## Permission Set Design` (permission
sets and permission set groups per persona, muting sets, custom permissions),
`## Code Enforcement Rules` (default `with sharing`, user-mode SOQL and DML,
`Security.stripInaccessible` points, and each `without sharing` exception with
its justification), `## Sensitive Data` (classification, encryption, masking,
and logging restrictions), and `## External and Integration Access`.

**`salesforce-access-matrix.md`**: `## Object Access` with
`| Persona | Permission Set (Group) | Object | Create | Read | Edit | Delete | View All | Modify All |`
and `## Field Access` with `| Persona | Object.Field | Read | Edit |` for every
new or sensitive field. Org Validation uses these tables to drive
`System.runAs` tests.

### Step 5: Completion Handoff

Hand completion to `stage-protocol.md` via
`bun {{HARNESS_DIR}}/tools/aidlc-orchestrate.ts report --stage salesforce-security-model-design --result <outcome>`.
That `report` call owns every lifecycle transition and advancement, including
the reviewer dispatch; never perform one in prose.

### Step 6: Present Completion & Request Approval

Completion emoji: :lock:
- Summary: OWD changes, permission sets per persona, sensitive fields, and every
  sharing elevation with its justification
- Review path: this stage's engine-resolved record dir
- Standard 2-option approval (Approve / Request Changes). STOP for the human response.

## Sensors

This stage's outputs are markdown artifacts under its record dir. The imported
`required-sections` and `upstream-coverage` sensors check those outputs.

Upstream targets: `requirements`, `personas`, `salesforce-solution-blueprint`,
`salesforce-data-model`.

## Learn

When `directive.protocol_modules` lists `learnings`, follow
`stage-protocol-learnings.md`: keep the diary at `directive.memory_path` while
working and run the ritual before the approval gate. When the module is absent,
skip both the diary and the ritual.
