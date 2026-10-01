# Salesforce Declarative Configuration Guide

## Flow types

| Flow type | Use for |
|-----------|---------|
| Record-triggered, **before-save** (fast field updates) | Updating fields on the triggering record. Many times faster than after-save; no DML on other records |
| Record-triggered, **after-save** | Creating or updating related records, sending notifications, calling subflows or actions, and async paths ("Run Asynchronously") for callouts |
| Scheduled-triggered | Batch-style periodic updates on a filtered record set |
| Screen | Guided user input (quick actions, Lightning pages, Experience Cloud) |
| Autolaunched | Reusable logic invoked from Apex, other flows, or REST |
| Platform event-triggered | Reacting to events |

## Flow best practices

- Write tight entry criteria ("only when updated to meet the condition") so the
  flow runs only when needed.
- Keep queries (Get Records) and DML out of loops: assign to a collection and
  run one Update Records after the loop. The same bulkification rules as Apex
  apply, since flows run in bulk for up to 200 records.
- Add fault paths on every DML or action element, and log to an error object or
  Platform Event.
- Avoid hardcoded Ids. Use Custom Metadata, Custom Labels, or Get Records by
  DeveloperName.
- Set trigger order with Flow Trigger Explorer when several flows run on one
  object and event. Prefer one flow per object and context with decision
  branches when practical.
- Use subflows for reuse. Version descriptions explain each change.
- Process Builder and Workflow Rules are retired for new work; migrate them with
  the Migrate to Flow tool.

## Validation rules and formulas

- Validation rules for data integrity that must hold for every entry point (UI,
  API, flows), with clear error messages placed on the relevant field.
- Add a bypass for data loads and integrations: a custom permission checked in
  the rule (`NOT($Permission.Bypass_Validation)`).
- Prefer `ISCHANGED`/`PRIORVALUE` checks to avoid blocking unrelated edits.

## Pages and UX

- Lightning record pages with Dynamic Forms (field sections with visibility
  rules) and Dynamic Actions instead of many page layouts.
- Use Path for stage-driven processes and in-app guidance for adoption.
- Use compact layouts for highlights and mobile.

## Access configuration

- Permission sets per job function, bundled into permission set groups per
  persona. Keep profiles minimal (login hours, IP ranges, defaults).
- Field-level security is granted in permission sets, never left to page
  layouts.
- Use queues and public groups for ownership and sharing targets, and keep them
  in source.

## Source discipline

Every declarative change is retrieved or authored as metadata in the Salesforce
DX project and deployed through the pipeline. Setup-only changes are drift.
