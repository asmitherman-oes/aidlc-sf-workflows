---
slug: salesforce-data-model-design
number: 2.22
name: Salesforce Data Model Design
plugin: salesforce
phase: inception
execution: CONDITIONAL
condition: Execute when the change creates or modifies objects, fields, relationships, record types, picklists, or custom metadata types, or loads or migrates data. Skip when the change only touches logic or UI on an unchanged schema.
lead_agent: aidlc-architect-agent
support_agents:
  - aidlc-developer-agent
mode: inline
reviewer: aidlc-architecture-reviewer-agent
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
  - salesforce-tool-usage
scopes:
  - salesforce-classic
inputs: requirements.md, components.md (Salesforce Object Mapping), the Salesforce Solution Design artifacts, and the Salesforce Org Analysis impact analysis when produced
outputs: salesforce-data-model.md and salesforce-data-dictionary.md under this stage's record dir (engine-resolved)
---

# Salesforce Data Model Design

MANDATORY: Follow stage-protocol.md for approval gates, question format, and completion messages.

Design the org-wide schema that the Units build against, once, before
per-Unit Construction. The schema rules come from Salesforce's metadata skills,
so the design is valid metadata from the start. See
`{{HARNESS_DIR}}/knowledge/aidlc-shared/salesforce-tooling.md`.

## Steps

### Step 1: Load Prior Context and Salesforce References

- Read `requirements.md`, `components.md` (`## Salesforce Object Mapping`),
  `salesforce-solution-blueprint.md`, `salesforce-build-approach-matrix.md`, and
  `salesforce-org-impact-analysis.md` when produced.
- Use **`platform-data-and-tooling-api-context-get`** for every standard object
  the design touches, and **`platform-metadata-api-context-get`** for the
  CustomObject and CustomField schema.
- If an org is connected, confirm existing fields with the MCP tool
  `run_soql_query` on `FieldDefinition` (Tooling API).

### Step 2: Apply the Salesforce Object and Field Skills

Load **`platform-custom-object-generate`** and
**`platform-custom-field-generate`**, and design within their rules: name fields,
sharing model per object, relationship types and cascade behaviour, roll-ups,
picklists and global value sets, formula constraints, and external IDs. Use
**`platform-custom-metadata-type-generate`** for configuration data, and
**`platform-soql-query`** to check that the planned query filters are selective
on large objects.

### Step 3: Create Data Model Questions

Create `salesforce-data-model-design-questions.md` in this stage's record dir,
using the [Answer]: tag format. Cover:
- standard vs custom object per entity;
- relationship types;
- record types vs separate objects;
- external IDs;
- data volumes, growth, and retention;
- picklist ownership;
- the migration and seed data source.

### Step 4: Collect and Analyze Answers

Collect answers following stage-protocol.md §3 question flow. Resolve every
ambiguity before generating artifacts.

### Step 5: Generate Artifacts

**`salesforce-data-model.md`** has these sections:
- `## Entity Relationship Diagram`: a mermaid `erDiagram` using API names,
  generated with **`external-diagram-mermaid-generate`**.
- `## Objects`.
- `## Relationships`.
- `## Large Data Volume and Skew`.
- `## Migration and Seed Data`.
- `## Sources`: the Salesforce skills consulted and the rules they imposed.

**`salesforce-data-dictionary.md`** has one `## <Object API Name>` section for
each new or changed object. Each section holds a field table with these columns:
`| Field API Name | Label | Type | Length/Precision | Required | Unique/External ID | Default/Formula | Help Text | Requirement |`.

### Step 6: Completion Handoff

Hand completion to `stage-protocol.md` via
`bun {{HARNESS_DIR}}/tools/aidlc-orchestrate.ts report --stage salesforce-data-model-design --result <outcome>`.
That `report` call owns every lifecycle transition and advancement, including
the reviewer dispatch; never perform one in prose.

### Step 7: Present Completion & Request Approval

Completion emoji: :card_index_dividers:
- Summary: new and changed objects and fields, relationships, and LDV risks
- Review path: this stage's engine-resolved record dir
- Standard 2-option approval (Approve / Request Changes). STOP for the human response.

## Sensors

`required-sections` and `upstream-coverage` check the markdown outputs.
`salesforce-tool-usage` (blocking, at the gate) requires a recorded
`platform-custom-object-generate` or `platform-custom-field-generate` call,
plus a schema-reference skill.

## Learn

When `directive.protocol_modules` lists `learnings`, follow
`stage-protocol-learnings.md`: keep the diary at `directive.memory_path` while
working and run the ritual before the approval gate. When the module is absent,
skip both the diary and the ritual.
