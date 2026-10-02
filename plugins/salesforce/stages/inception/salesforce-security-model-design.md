---
slug: salesforce-security-model-design
number: 2.23
name: Salesforce Security Model Design
plugin: salesforce
phase: inception
execution: CONDITIONAL
condition: Execute when the change adds objects or fields, new personas or user populations (including Experience Cloud or guest users), sensitive data, Apex entry points (AuraEnabled, REST, invocable), or integrations with their own users. Skip when access to every touched record and field is unchanged.
lead_agent: aidlc-devsecops-agent
support_agents:
  - aidlc-architect-agent
  - aidlc-compliance-agent
mode: inline
reviewer: aidlc-architecture-reviewer-agent
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
  - salesforce-tool-usage
scopes:
  - salesforce-classic
inputs: requirements.md, personas.md and stories.md when produced, the Salesforce Solution Design artifacts, and the Salesforce Data Model artifacts when produced
outputs: salesforce-security-model.md and salesforce-access-matrix.md under this stage's record dir (engine-resolved)
---

# Salesforce Security Model Design

MANDATORY: Follow stage-protocol.md for approval gates, question format, and completion messages.

Decide who can see and change which records and fields, and how code enforces
that. Design with Salesforce's sharing and permission skills, so Construction
can generate the permission sets and sharing metadata straight from this model.
See `{{HARNESS_DIR}}/knowledge/aidlc-shared/salesforce-tooling.md`.

## Steps

### Step 1: Load Prior Context

Read `requirements.md`, `personas.md` (`## Salesforce Persona Access`),
`stories.md`, `salesforce-solution-blueprint.md`, `salesforce-data-model.md`,
and `salesforce-data-dictionary.md` when produced.

### Step 2: Apply the Salesforce Sharing and Permission Skills

- **`platform-sharing-owd-configure`**: read the current org-wide defaults for
  the touched objects (retrieve mode, against the analysed org when one is
  connected) and decide the target defaults.
- **`platform-sharing-rules-generate`**: design criteria-based, owner-based,
  and guest sharing rules.
- **`platform-permission-set-generate`**: design permission sets and
  field-level security per persona, so the design matches what the skill will
  generate.
- **`platform-encryption-configure`**: for sensitive data that needs Shield
  Platform Encryption.
- The MCP tool `guide_lws_security`, or the
  **`experience-lwc-security-validate`** rules: for client-side constraints
  when LWCs expose data.

### Step 3: Create Security Questions

Create `salesforce-security-model-design-questions.md` in this stage's record
dir, using the [Answer]: tag format. Cover:
- personas and their licenses;
- org-wide defaults per object;
- reliance on the role hierarchy;
- sharing rules, teams, or Apex managed sharing;
- sensitive fields and encryption;
- external and guest access;
- integration user permissions;
- custom permissions.

### Step 4: Collect and Analyze Answers

Collect answers following stage-protocol.md §3 question flow. Resolve every
ambiguity before generating artifacts.

### Step 5: Generate Artifacts

**`salesforce-security-model.md`** has these sections:
- `## Organization-Wide Defaults`.
- `## Record Sharing`.
- `## Permission Set Design`.
- `## Code Enforcement Rules`: default `with sharing`, user-mode data access,
  and each `without sharing` exception with its justification.
- `## Sensitive Data`.
- `## External and Integration Access`.
- `## Sources`: the Salesforce skills used.

**`salesforce-access-matrix.md`** has two sections:
- `## Object Access`, with the columns
  `| Persona | Permission Set (Group) | Object | Create | Read | Edit | Delete | View All | Modify All |`.
- `## Field Access`, with the columns `| Persona | Object.Field | Read | Edit |`.

### Step 6: Completion Handoff

Hand completion to `stage-protocol.md` via
`bun {{HARNESS_DIR}}/tools/aidlc-orchestrate.ts report --stage salesforce-security-model-design --result <outcome>`.
That `report` call owns every lifecycle transition and advancement, including
the reviewer dispatch; never perform one in prose.

### Step 7: Present Completion & Request Approval

Completion emoji: :lock:
- Summary: OWD changes, the permission sets per persona, the sensitive fields, and every sharing elevation with its justification
- Review path: this stage's engine-resolved record dir
- Standard 2-option approval (Approve / Request Changes). STOP for the human response.

## Sensors

`required-sections` and `upstream-coverage` check the markdown outputs.
`salesforce-tool-usage` (blocking, at the gate) requires a recorded
`platform-sharing-owd-configure` or `platform-sharing-rules-generate` call,
plus a `platform-permission-set-generate` call.

## Learn

When `directive.protocol_modules` lists `learnings`, follow
`stage-protocol-learnings.md`: keep the diary at `directive.memory_path` while
working and run the ritual before the approval gate. When the module is absent,
skip both the diary and the ritual.
