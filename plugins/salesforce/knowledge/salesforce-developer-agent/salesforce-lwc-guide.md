# Lightning Web Components + SLDS 2 Guide

Standards for every LWC generated in a Salesforce workflow. The
`salesforce-lwc-styling` sensor checks the CSS rules. If the
`salesforce-lwc-slds2` skill is available in the session, invoke it before
writing component markup or CSS; it carries the current styling-hook index.

## Build in this order (stop at the first that works)

1. **Configuration**: Lightning record pages, Dynamic Forms and Dynamic
   Actions, standard related lists, and quick actions. No code.
2. **Lightning base components** (`lightning-card`, `lightning-datatable`,
   `lightning-record-edit-form`, `lightning-record-form`, `lightning-input`,
   `lightning-combobox`, `lightning-button`, `lightning-modal`, …). Configure
   them with attributes and variants first.
3. **SLDS component blueprints** when no base component fits. Blueprints have no
   behaviour, so you own keyboard and ARIA support.
4. **Custom markup** styled only with SLDS 2 global styling hooks.

## Styling (SLDS 2)

- Reference global hooks with a fallback:
  `color: var(--slds-g-color-on-surface-1, #2e2e2e);`.
- Never assign a global hook (`--slds-g-color-accent-1: red;`).
- Never use `--lwc-*`, `--sds-*`, `--slds-c-*` (SLDS 1 component hooks),
  `--_slds-*`/`--slds-s-*` (private), Aura tokens, `!important`, or `@layer`.
- No hardcoded hex, rgb, or hsl colors except as a `var()` fallback. Use
  spacing, radius, and font hooks (`--slds-g-spacing-*`, `--slds-g-radius-border-*`,
  `--slds-g-font-*`) instead of raw values.
- Don't reach into base component internals (shadow DOM). Style the host or
  your own markup.

## Data access

- Prefer Lightning Data Service: `@wire(getRecord, { recordId, fields })`,
  `getFieldValue`, `updateRecord`, `createRecord`, and
  `lightning-record-edit-form`. LDS enforces CRUD/FLS and sharing and caches
  data.
- Apex for reads: `@AuraEnabled(cacheable=true)` and `@wire`. For writes,
  call the method imperatively, then `refreshApex` or
  `notifyRecordUpdateAvailable`.
- Import schema references (`import NAME from '@salesforce/schema/Account.Name'`)
  so field renames break at deploy time, not at runtime.
- Labels come from `@salesforce/label/c.X`, never hardcoded user-facing text.

## Composition and events

- Data flows down through public `@api` properties. Communicate upward with
  `CustomEvent` (lowercase names, no `on` prefix; `bubbles`/`composed` only
  when needed).
- Use Lightning Message Service for cross-DOM or unrelated components.
- Use `NavigationMixin` for navigation; never build Lightning URLs by hand.
- Use the conditional directives `lwc:if` / `lwc:elseif` / `lwc:else` (not the
  legacy `if:true`).

## Accessibility

Use semantic elements, give every input a label, keep focus order and visible
focus, use ARIA only where native semantics are missing, never signal with color
alone, and meet 4.5:1 text contrast.

## Bundle and metadata

`lwc/myComponent/` contains `myComponent.html`, `myComponent.js`,
`myComponent.css` (optional), `myComponent.js-meta.xml`, and
`__tests__/myComponent.test.js`. In `js-meta.xml`: `<isExposed>true</isExposed>`
only when it is placed in App Builder or Experience Builder, explicit
`<targets>`, and `<targetConfigs>` for design attributes and supported objects.

## Jest

Use `@salesforce/sfdx-lwc-jest`. Create the element with `createElement`, append
it to `document.body`, and await `Promise.resolve()` for re-render. Mock wire
adapters with `@salesforce/wire-service-jest-util` or the jest mocks, and mock
Apex with `jest.mock('@salesforce/apex/Class.method', ...)`. Reset the DOM in
`afterEach`. Add `@sa11y/jest` `toBeAccessible()` assertions where available.
