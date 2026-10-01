---
target: refined-mockups
plugin: salesforce
adds:
  scopes:
    - salesforce-classic
fragments:
  - anchor: before-step:5
    order: 100
---

## fragment: before-step:5

### Step 4a (salesforce): Lightning and SLDS 2 mapping

When the work targets Salesforce, design the mockups for Lightning Experience
and SLDS 2 (Cosmos theme):

- Prefer configuration first: Lightning record pages with Dynamic Forms and
  Dynamic Actions, standard related lists, path, and quick actions. Mock a
  custom LWC only where configuration cannot meet the story.
- In `design-system-mapping.md`, map every UI element to a Lightning base
  component (`lightning-card`, `lightning-datatable`, `lightning-record-edit-form`,
  `lightning-input`, `lightning-button`, …) or an SLDS blueprint. Map custom
  styling only to SLDS 2 global styling hooks (`--slds-g-*`), never to
  hardcoded colors.
- Note the Lightning App Builder target (`lightning__RecordPage`,
  `lightning__AppPage`, `lightning__HomePage`, `lightningCommunity__Page`) for
  each custom component.
- The accessibility checklist follows SLDS guidance: base components provide
  keyboard and ARIA support; custom markup must add it.
- Methodology: `{{HARNESS_DIR}}/knowledge/salesforce-developer-agent/salesforce-lwc-guide.md`.
