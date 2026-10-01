---
target: code-generation
plugin: salesforce
adds:
  scopes:
    - salesforce-classic
  consumes:
    - artifact: salesforce-solution-blueprint
      required: false
    - artifact: salesforce-environment-strategy
      required: false
    - artifact: salesforce-data-dictionary
      required: false
    - artifact: salesforce-access-matrix
      required: false
  sensors:
    - salesforce-apex-antipatterns
    - salesforce-lwc-styling
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

- List every metadata file to create or change, with its source-format path
  under the Unit's package directory: Apex classes and triggers **with** their
  `-meta.xml` (at the project `sourceApiVersion`), LWC bundles (`.html`, `.js`,
  `.css`, `.js-meta.xml`, `__tests__/*.test.js`), object and field
  `*.object-meta.xml` and `*.field-meta.xml` files, flows, permission sets,
  custom labels, and custom metadata records.
- Order steps by deploy dependency: schema, then Apex domain and selector, then
  service, then trigger and handler, then LWC, then flows, then permission sets
  (field and class access), then tests.
- Include an Apex test class step for every Apex class, covering the
  single-record, bulk (200), negative, and `System.runAs` paths from
  `salesforce-access-matrix.md`, and a Jest test step for every LWC.
- State unit-scoped test commands in `unit-test-instructions.md`: for Apex,
  `sf apex run test --class-names <Unit test classes> --code-coverage --result-format json --target-org <validation org>`
  (executed in Build and Test when an org is authorized, otherwise in
  Salesforce Org Validation); for LWC,
  `npx sfdx-lwc-jest -- <Unit lwc paths>`.

## fragment: before-step:4

### Step 3a (salesforce): Salesforce delegation context

When the work targets Salesforce, add these to the Step 4 delegation prompt as
exact paths, without copying their prose into the brief:

- `{{HARNESS_DIR}}/knowledge/salesforce-developer-agent/salesforce-apex-guide.md`
- `{{HARNESS_DIR}}/knowledge/salesforce-developer-agent/salesforce-lwc-guide.md`
- `{{HARNESS_DIR}}/knowledge/salesforce-developer-agent/salesforce-dx-project-guide.md`
- `{{HARNESS_DIR}}/knowledge/salesforce-security-agent/salesforce-security-guide.md`
- `{{HARNESS_DIR}}/knowledge/salesforce-qa-agent/salesforce-testing-guide.md`
- this Unit's Salesforce design inputs: `salesforce-solution-blueprint.md`,
  `salesforce-data-dictionary.md`, and `salesforce-access-matrix.md` when
  produced

Also add these instructions:
- Read each listed guide before writing Salesforce source, and treat its MUST
  rules as coding standards.
- Use the Salesforce DX MCP `run_soql_query` (read-only) to confirm field API
  names in the analysed org when one is connected.
- Do NOT deploy, assign permissions, or delete orgs during Code Generation; org
  writes belong to Salesforce Org Validation.
- If the `salesforce-lwc-slds2` skill is available, use it for LWC markup and CSS.

## fragment: in:Sensors

The salesforce plugin wires two ADVISORY code sensors onto this stage:
`salesforce-apex-antipatterns` fires on each written `.cls`/`.trigger` file
(SOQL or DML in loops, hardcoded Ids, missing sharing declaration,
`SeeAllData=true`, empty catch blocks, logic in triggers), and
`salesforce-lwc-styling` fires on each written LWC `.css` file (hardcoded
colors, deprecated `--lwc-*`/`--sds-*`/`--slds-c-*` hooks, reassigned global
hooks, `!important`). They report; they do not block. Fix their findings
before the plan step is marked complete.
