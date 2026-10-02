---
slug: salesforce-solution-design
number: 2.21
name: Salesforce Solution Design
plugin: salesforce
phase: inception
execution: ALWAYS
condition: Always execute under a Salesforce scope. Every Salesforce change needs an explicit declarative-versus-programmatic decision, a metadata-to-Unit mapping, and an environment and packaging strategy before Construction.
lead_agent: aidlc-architect-agent
support_agents:
  - aidlc-developer-agent
  - aidlc-design-agent
  - aidlc-pipeline-deploy-agent
mode: inline
reviewer: aidlc-architecture-reviewer-agent
review_artifact: salesforce-solution-blueprint
reviewer_max_iterations: 2
review_class: advisory
produces:
  - salesforce-solution-blueprint
  - salesforce-build-approach-matrix
  - salesforce-environment-strategy
consumes:
  - artifact: requirements
    required: true
  - artifact: stories
    required: false
  - artifact: components
    required: false
  - artifact: decisions
    required: false
  - artifact: unit-of-work
    required: false
  - artifact: unit-of-work-dependency
    required: false
  - artifact: contract-summary
    required: false
  - artifact: salesforce-org-profile
    required: false
  - artifact: salesforce-org-impact-analysis
    required: false
requires_stage:
  - units-generation
  - salesforce-org-analysis
sensors:
  - required-sections
  - upstream-coverage
  - salesforce-tool-usage
scopes:
  - salesforce-classic
inputs: requirements.md, stories.md, components.md and decisions.md, the Unit of Work artifacts, contract-summary.md, and the Salesforce Org Analysis artifacts when produced
outputs: salesforce-solution-blueprint.md, salesforce-build-approach-matrix.md, and salesforce-environment-strategy.md under this stage's record dir (engine-resolved)
---

# Salesforce Solution Design

MANDATORY: Follow stage-protocol.md for approval gates, question format, and completion messages.

Turn the platform-neutral Inception outputs into a Salesforce solution: what is
configured, what is coded, which standard features are reused, how metadata maps
onto the Units already decomposed, and how changes move between environments.
Take every platform fact (limits, standard objects, metadata capabilities, and
feature availability) from Salesforce's tooling, not from memory. See
`{{HARNESS_DIR}}/knowledge/aidlc-shared/salesforce-tooling.md`.

## Steps

### Step 1: Load Prior Context

- Read `requirements.md`, including its `## Salesforce Platform Constraints` section.
- Read `stories.md`, `components.md` (including its `## Salesforce Object
  Mapping` section), `decisions.md`, `unit-of-work.md`,
  `unit-of-work-dependency.md`, and `contract-summary.md` when they were produced.
- Read `salesforce-org-profile.md` and `salesforce-org-impact-analysis.md` when
  Salesforce Org Analysis ran.
- Read the workspace `sfdx-project.json`, `.forceignore`, and
  `config/project-scratch-def.json` when present.

### Step 2: Consult Salesforce Sources

Before deciding anything, use:
- **`platform-docs-get`** for the governor limits, feature availability per
  edition, and platform behaviour the design depends on;
- **`platform-data-and-tooling-api-context-get`** to confirm which standard
  objects and fields already cover the entities;
- **`platform-metadata-api-context-get`** for the metadata types the solution
  will generate;
- **`integration-connectivity-generate`** guidance when external systems are
  involved.

Record each consultation, with a one-line takeaway, for the `## Sources` section.

### Step 3: Create the Design Plan with Questions

Create `salesforce-solution-design-questions.md` in this stage's record dir,
using the [Answer]: tag format. Cover:
- packaging: org-based source, unlocked packages, or 2GP;
- the environment path: scratch orgs or sandboxes;
- the declarative-versus-code thresholds;
- standard features and AppExchange products to reuse;
- the integration style and auth for each external system;
- existing automation to retire, since Workflow Rules and Process Builder
  migrate to Flow or Apex.

### Step 4: Collect and Analyze Answers

Collect answers following stage-protocol.md §3 question flow. Resolve every
ambiguity before generating artifacts.

### Step 5: Generate Artifacts

**`salesforce-build-approach-matrix.md`**:
- `## Build Approach Matrix`: one row per requirement or story capability,
  with columns `| ID | Capability | Approach | Salesforce Skill / Tool | Metadata | Rationale | Unit |`.
  The Approach is one of `Standard`, `Declarative`, `Apex`, `LWC`,
  `Integration`, or `AppExchange`. The Salesforce Skill / Tool column names the
  skill or MCP tool that Code Generation must use for that row, for example
  `platform-apex-generate`, `automation-flow-generate`, or
  `experience-lwc-generate`.
- `## Automation Ownership`: exactly one owning automation per object and event.

**`salesforce-solution-blueprint.md`**:
- `## Architecture Overview`: a mermaid diagram generated with
  **`external-diagram-mermaid-generate`**.
- `## Metadata Inventory by Unit`.
- `## Integration Design`.
- `## Governor Limit Hotspots`: limits cited from `platform-docs-get`.
- `## Reuse and Standard Features`.
- `## Decisions`: ADR-style entries.
- `## Sources`: the Salesforce skill and tool consultations from Step 2.

**`salesforce-environment-strategy.md`**:
- `## Project Layout`.
- `## Scratch Org Definition`.
- `## Environment Path`.
- `## Branching and Promotion`.
- `## Test Levels`.

Every requirement or story id must appear in the Build Approach Matrix.

### Step 6: Completion Handoff

Hand completion to `stage-protocol.md` via
`bun {{HARNESS_DIR}}/tools/aidlc-orchestrate.ts report --stage salesforce-solution-design --result <outcome>`.
That `report` call owns every lifecycle transition and advancement, including
the reviewer dispatch; never perform one in prose.

### Step 7: Present Completion & Request Approval

Completion emoji: :cloud:
- Summary: the count of capabilities per approach, the packaging choice, and the environment path
- The reviewer findings the engine surfaces at the gate
- Review path: this stage's engine-resolved record dir
- Standard 2-option approval (Approve / Request Changes). STOP for the human response.

## Sensors

`required-sections` and `upstream-coverage` check the markdown outputs.
`salesforce-tool-usage` (blocking, at the gate) requires a recorded
`platform-docs-get`, `platform-data-and-tooling-api-context-get`, or
`platform-metadata-api-context-get` call.

## Learn

When `directive.protocol_modules` lists `learnings`, follow
`stage-protocol-learnings.md`: keep the diary at `directive.memory_path` while
working and run the ritual before the approval gate. When the module is absent,
skip both the diary and the ritual.
