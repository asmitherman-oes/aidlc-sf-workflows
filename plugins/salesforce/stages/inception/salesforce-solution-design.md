---
slug: salesforce-solution-design
number: 2.21
name: Salesforce Solution Design
plugin: salesforce
phase: inception
execution: ALWAYS
condition: Always execute under a Salesforce scope. Every Salesforce change needs an explicit declarative-versus-programmatic decision, a metadata-to-Unit mapping, and an environment and packaging strategy before Construction.
lead_agent: salesforce-architect-agent
support_agents:
  - salesforce-admin-agent
  - salesforce-developer-agent
  - salesforce-devops-agent
mode: inline
reviewer: salesforce-technical-reviewer-agent
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
Apply each support agent's perspective: the admin for declarative feasibility,
the developer for code feasibility and limits, and DevOps for packaging and
environments.

## Steps

### Step 1: Load Prior Context

- Read `requirements.md`, including its `## Salesforce Platform Constraints` section.
- Read `stories.md`, `components.md` (including its `## Salesforce Object
  Mapping` section), `decisions.md`, `unit-of-work.md`,
  `unit-of-work-dependency.md`, and `contract-summary.md` when produced.
- Read `salesforce-org-profile.md` and `salesforce-org-impact-analysis.md` when
  Salesforce Org Analysis ran.
- Read the workspace `sfdx-project.json`, `.forceignore`, and
  `config/project-scratch-def.json` when present.

### Step 2: Create Design Plan with Questions

Create `salesforce-solution-design-questions.md` in this stage's record dir,
using the [Answer]: tag format. Cover:
- Packaging: org-based source deployment, unlocked packages, or 2GP managed
  packages (namespace?), and package directory boundaries
- Environment path: scratch orgs vs Developer sandboxes for development, plus
  the QA, UAT, Partial or Full Copy, and production promotion path
- Declarative-versus-code thresholds the team accepts (for example, Flows for
  simple field updates; Apex for complex, bulk, or callout logic)
- Standard objects and features or AppExchange products to reuse
- Integration style per external system (REST/SOAP, Platform Events, CDC,
  Pub/Sub API, Salesforce Connect) and its authentication
- Existing automation to retire or consolidate (Workflow Rules and Process
  Builder must migrate to Flow or Apex)

### Step 3: Collect and Analyze Answers

Collect answers following stage-protocol.md §3 question flow. Analyse the
answers for ambiguity and contradictions, and ask follow-up questions until none
remain.

### Step 4: Generate Artifacts

**`salesforce-build-approach-matrix.md`**: a `## Build Approach Matrix` table
with one row per requirement or story capability:
`| ID | Capability | Approach | Metadata | Rationale | Unit |`, where Approach is
one of `Standard`, `Declarative`, `Apex`, `LWC`, `Integration`, or `AppExchange`.
Follow it with `## Automation Ownership`: per object and event (before or after
insert, update, or delete), the one owning automation (trigger handler or
named flow) and how coexisting automation is ordered (Flow Trigger Explorer
order, or a single trigger handler).

**`salesforce-solution-blueprint.md`**: `## Architecture Overview` (a mermaid
diagram of org components, external systems, and data flows),
`## Metadata Inventory by Unit` (per Unit: package directory, objects/fields,
Apex classes and triggers, LWCs, flows, permission sets, labels, and custom
metadata types), `## Integration Design`, `## Governor Limit Hotspots` (each
heavy synchronous path with its SOQL, DML, and CPU estimate at 200 records and
its mitigation), `## Reuse and Standard Features`, and `## Decisions`
(ADR-style: Context, Decision, Consequences, Alternatives Rejected).

**`salesforce-environment-strategy.md`**: `## Project Layout`
(`sfdx-project.json` package directories and `sourceApiVersion`),
`## Scratch Org Definition` (edition, features, settings),
`## Environment Path` (orgs, refresh cadence, and data seeding),
`## Branching and Promotion`, and `## Test Levels` (local test level per
environment; `RunLocalTests` or `RunSpecifiedTests` for production).

Every requirement or story id must appear in the Build Approach Matrix.

### Step 5: Completion Handoff

Hand completion to `stage-protocol.md` via
`bun {{HARNESS_DIR}}/tools/aidlc-orchestrate.ts report --stage salesforce-solution-design --result <outcome>`.
That `report` call owns every lifecycle transition and advancement, including
the reviewer dispatch; never perform one in prose, and never narrate this
bookkeeping to the user.

### Step 6: Present Completion & Request Approval

Completion emoji: :cloud:
- Summary: counts by approach (Standard, Declarative, Apex, LWC, Integration,
  AppExchange), the packaging choice, and the environment path
- The reviewer findings the engine surfaces at the gate
- Review path: this stage's engine-resolved record dir
- Standard 2-option approval (Approve / Request Changes). STOP for the human response.

## Sensors

This stage's outputs are markdown artifacts under its record dir. The imported
`required-sections` and `upstream-coverage` sensors check those outputs.

Upstream targets: `requirements`, `stories`, `components`, `unit-of-work`,
`contract-summary`, `salesforce-org-impact-analysis`.

## Learn

When `directive.protocol_modules` lists `learnings`, follow
`stage-protocol-learnings.md`: keep the diary at `directive.memory_path` while
working and run the ritual before the approval gate. When the module is absent,
skip both the diary and the ritual.
