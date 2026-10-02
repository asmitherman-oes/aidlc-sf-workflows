---
target: functional-design
plugin: salesforce
adds:
  scopes:
    - salesforce-classic
  consumes:
    - artifact: salesforce-solution-blueprint
      required: false
    - artifact: salesforce-build-approach-matrix
      required: false
    - artifact: salesforce-data-dictionary
      required: false
fragments:
  - anchor: before-step:5
    order: 100
---

## fragment: before-step:5

### Step 4a (salesforce): Salesforce automation design

When the work targets Salesforce, first read this Unit's rows in
`salesforce-build-approach-matrix.md`, `salesforce-solution-blueprint.md`, and
`salesforce-data-dictionary.md`. Then add the following:

- **`## Salesforce Automation Design` in `functional-spec.md`.** For each object
  event the Unit touches, give:
  - the owning automation: a trigger handler method or a named Flow;
  - its entry criteria and whether it runs before-save or after-save;
  - where it sits in the save order of execution;
  - its recursion guard.

  Take the order of execution and Flow capabilities from **`platform-docs-get`**
  and **`automation-flow-generate`**, and Apex trigger patterns from
  **`platform-apex-generate`**.
- **`## Error Handling on Platform`.** Cover `addError` versus
  `AuraHandledException`, partial-success DML, and logging.
- **`entities.md`.** Use the field API names and types from the data dictionary.
- **`rules.md`.** Mark how each business rule is realised: validation rule
  (**`platform-validation-rule-generate`**), formula, Flow, or Apex.
