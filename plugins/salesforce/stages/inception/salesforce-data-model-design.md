---
slug: salesforce-data-model-design
number: 2.22
name: Salesforce Data Model Design
plugin: salesforce
phase: inception
execution: CONDITIONAL
condition: Execute when the change creates or modifies objects, fields, relationships, record types, picklists, or custom metadata types, or loads or migrates data. Skip when the change only touches logic or UI on an unchanged schema.
lead_agent: salesforce-architect-agent
support_agents:
  - salesforce-admin-agent
  - salesforce-developer-agent
mode: inline
reviewer: salesforce-technical-reviewer-agent
review_artifact: salesforce-data-model
reviewer_max_iterations: 2
review_class: advisory
produces:
  - salesforce-data-model
  - salesforce-data-dictionary
consumes:
  - artifact: requirements
    required: true
  - artifact: components
    required: false
  - artifact: salesforce-solution-blueprint
    required: true
  - artifact: salesforce-build-approach-matrix
    required: false
  - artifact: salesforce-org-impact-analysis
    required: false
requires_stage:
  - salesforce-solution-design
sensors:
  - required-sections
  - upstream-coverage
scopes:
  - salesforce-classic
inputs: requirements.md, components.md (Salesforce Object Mapping), the Salesforce Solution Design artifacts, and the Salesforce Org Analysis impact analysis when produced
outputs: salesforce-data-model.md and salesforce-data-dictionary.md under this stage's record dir (engine-resolved)
---

# Salesforce Data Model Design

MANDATORY: Follow stage-protocol.md for approval gates, question format, and completion messages.

Design the org-wide schema the Units build against. A Salesforce schema is shared
by every Unit and is expensive to change after data exists, so it is designed
once, here, before the per-Unit Construction work.

Methodology: `{{HARNESS_DIR}}/knowledge/salesforce-architect-agent/salesforce-data-model-patterns.md`.

## Steps

### Step 1: Load Prior Context

Read `requirements.md`, `components.md` (`## Salesforce Object Mapping`),
`salesforce-solution-blueprint.md` (`## Metadata Inventory by Unit`),
`salesforce-build-approach-matrix.md`, and `salesforce-org-impact-analysis.md`
when produced. Before naming any existing field, confirm it with `run_soql_query`
on `FieldDefinition` (Tooling API) against the analysed org, if one is connected.

### Step 2: Create Data Model Questions

Create `salesforce-data-model-design-questions.md` in this stage's record dir,
using the [Answer]: tag format. Cover: standard vs custom object per entity,
relationship types (lookup vs master-detail, and whether cascade delete and
roll-ups are wanted), record types vs separate objects, external IDs for
integration upserts, data volumes and growth, data retention and archiving,
picklist value ownership (global value sets), and the migration or seed data
source.

### Step 3: Collect and Analyze Answers

Collect answers following stage-protocol.md §3 question flow, resolving every
ambiguity before generating artifacts.

### Step 4: Generate Artifacts

**`salesforce-data-model.md`**: `## Entity Relationship Diagram` (a mermaid
`erDiagram` using API names), `## Objects` (a table of API name, label, standard
or custom, sharing model driver (owner or master-detail parent), record types,
and owning Unit), `## Relationships` (a table of child, parent, type, field API
name, delete behaviour, and roll-ups), `## Large Data Volume and Skew` (volume
estimates, selective-query fields to index, skinny-table or archiving plans,
ownership and lookup skew mitigation), and `## Migration and Seed Data`.

**`salesforce-data-dictionary.md`**: one `## <Object API Name>` section per new
or changed object, each with a table:
`| Field API Name | Label | Type | Length/Precision | Required | Unique/External ID | Default/Formula | Help Text | Requirement |`.
Use the `__c` suffix for custom fields and objects, and a namespace prefix if
the package has one.

### Step 5: Completion Handoff

Hand completion to `stage-protocol.md` via
`bun {{HARNESS_DIR}}/tools/aidlc-orchestrate.ts report --stage salesforce-data-model-design --result <outcome>`.
That `report` call owns every lifecycle transition and advancement, including
the reviewer dispatch; never perform one in prose.

### Step 6: Present Completion & Request Approval

Completion emoji: :card_index_dividers:
- Summary: new and changed objects and fields, relationships, and LDV risks
- Review path: this stage's engine-resolved record dir
- Standard 2-option approval (Approve / Request Changes). STOP for the human response.

## Sensors

This stage's outputs are markdown artifacts under its record dir. The imported
`required-sections` and `upstream-coverage` sensors check those outputs.

Upstream targets: `requirements`, `components`, `salesforce-solution-blueprint`.

## Learn

When `directive.protocol_modules` lists `learnings`, follow
`stage-protocol-learnings.md`: keep the diary at `directive.memory_path` while
working and run the ritual before the approval gate. When the module is absent,
skip both the diary and the ritual.
