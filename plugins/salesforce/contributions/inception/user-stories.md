---
target: user-stories
plugin: salesforce
adds:
  scopes:
    - salesforce-classic
fragments:
  - anchor: before-step:9
    order: 100
---

## fragment: before-step:9

### Step 8a (salesforce): Salesforce persona access and story criteria

When the work targets Salesforce:

- Add a `## Salesforce Persona Access` section to `personas.md`: per persona,
  the user license, the intended permission set group, the role in the
  hierarchy, and the records they must see or edit.
- Write acceptance criteria that Salesforce tests can check: name the object and
  field API names when known, the record access expected ("a Sales Rep cannot
  edit Closed Won opportunities they do not own"), bulk behaviour for data-load
  stories ("200 records in one transaction"), and the UI surface (record page,
  app page, Experience Cloud page).
