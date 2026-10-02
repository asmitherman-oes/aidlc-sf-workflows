---
target: code-generation
plugin: salesforce
adds:
  scopes:
    - salesforce-classic
  consumes:
    - artifact: salesforce-solution-blueprint
      required: false
    - artifact: salesforce-build-approach-matrix
      required: false
    - artifact: salesforce-environment-strategy
      required: false
    - artifact: salesforce-data-dictionary
      required: false
    - artifact: salesforce-access-matrix
      required: false
  sensors:
    - salesforce-tool-usage
fragments:
  - anchor: before-step:3
    order: 100
  - anchor: before-step:4
    order: 100
  - anchor: in:Sensors
    order: 100
---

## fragment: before-step:3

### Step 2a (salesforce): Salesforce plan content

When the work targets Salesforce, the code generation plan for this Unit must:

- Name the Salesforce skill or MCP tool for every plan step, taken from the
  Unit's rows in `salesforce-build-approach-matrix.md` and from
  `{{HARNESS_DIR}}/knowledge/aidlc-shared/salesforce-tooling.md`:
  - Apex: `platform-apex-generate`.
  - Apex tests: `platform-apex-test-generate`.
  - LWC: `experience-lwc-generate` with the MCP `orchestrate_lwc_component_creation`.
  - Objects and fields: `platform-custom-object-generate` / `platform-custom-field-generate`.
  - Flows: `automation-flow-generate`.
  - Permission sets: `platform-permission-set-generate`.
  - Lightning pages: `platform-flexipage-generate`.
  - Validation rules: `platform-validation-rule-generate`.
  - Custom Metadata Types: `platform-custom-metadata-type-generate`.
  - Every metadata generator: also `platform-metadata-api-context-get`.
- Order the steps by deploy dependency: schema, then Apex, then LWC, then Flows,
  then permission sets, then tests.
- End with a verification step:
  - MCP `scan_apex_class_for_antipatterns` and `run_code_analyzer` on all Apex;
  - `design-systems-slds-validate` and `experience-lwc-security-validate` on
    LWCs;
  - MCP `create_lwc_jest_tests` / `review_lwc_jest_tests` for the LWC Jest tests.
- List every written path in `source-manifest.json`. The salesforce gate derives
  this Unit's required Salesforce calls from that list.

## fragment: before-step:4

### Step 3a (salesforce): Salesforce delegation context

When the work targets Salesforce, add these instructions to the Step 4
delegation prompt. Give file paths only; do not copy their prose into the
prompt.

- Read `{{HARNESS_DIR}}/knowledge/aidlc-shared/salesforce-tooling.md`, then
  invoke the Salesforce skill or MCP tool that the plan names for each step
  **before** writing that step's files, and follow it. Do not hand-write
  Salesforce metadata, Apex, LWC, or Flows when a Salesforce skill exists for
  them.
- Pass this Unit's Salesforce design inputs as paths:
  `salesforce-build-approach-matrix.md`, `salesforce-solution-blueprint.md`,
  `salesforce-data-dictionary.md`, and `salesforce-access-matrix.md`, when they
  were produced.
- Run the verification step's analyzers on everything written, and fix any
  severity 1–2 findings.
- Do NOT deploy, assign permissions, or delete orgs. Org writes belong to
  Salesforce Org Validation.

## fragment: in:Sensors

The salesforce plugin binds the BLOCKING `salesforce-tool-usage` gate sensor to
this stage. Before the approval gate opens, it reads the tool-call ledger
recorded by the `record-tool-calls` hook. It then requires the Salesforce calls
that match what this Unit's `source-manifest.json` says was written:

- Apex: `platform-apex-generate`, plus `scan_apex_class_for_antipatterns`,
  `run_code_analyzer`, or `dx-code-analyzer-run`.
- Apex tests: `platform-apex-test-generate`.
- LWC: an LWC expert tool or skill, plus a Jest tool.
- LWC CSS: an SLDS skill.
- Aura: the Aura migration tooling.
- Metadata: the matching `platform-*` or `automation-flow-generate` skill, plus
  `platform-metadata-api-context-get`.

Any missing call keeps the gate closed until it is made, or until the human
overrides.
