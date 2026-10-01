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

When the work targets Salesforce, read `salesforce-build-approach-matrix.md`,
`salesforce-solution-blueprint.md`, and `salesforce-data-dictionary.md` for
this Unit. Then add to `functional-spec.md`:

- `## Salesforce Automation Design`: per object event this Unit touches, the
  owning automation (trigger handler method or named Flow), entry criteria,
  before- or after-save placement, and where it sits in the platform order of
  execution (before-save flows, before triggers, validation rules, after
  triggers, after-save flows, assignment and escalation rules, roll-up
  summaries, post-commit logic). Include a recursion guard where an update can
  re-fire automation.
- `## Error Handling on Platform`: how failures surface to users (`addError` on
  the record or field vs thrown `AuraHandledException`), partial-success DML
  (`Database.insert(records, false)`) vs all-or-none, and what is logged.
- In `entities.md`, use the Salesforce field API names and types from the data
  dictionary, not platform-neutral types.
- In `rules.md`, mark each business rule's realisation: validation rule,
  formula, Flow decision, or Apex.

Methodology: `{{HARNESS_DIR}}/knowledge/salesforce-admin-agent/salesforce-declarative-guide.md`
and `{{HARNESS_DIR}}/knowledge/salesforce-developer-agent/salesforce-apex-guide.md`.
