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

- Add a `## Salesforce Persona Access` section to `personas.md`. For each persona,
  give the user license, the intended permission set group, the role, and the
  records the persona must see or edit.
- Write acceptance criteria that tests can check:
  - name the object and field API names, confirming standard ones with
    **`platform-data-and-tooling-api-context-get`**;
  - state the expected record access;
  - state the bulk behaviour (200 records per transaction);
  - name the UI surface.
