# Salesforce Architecture Guide

## Decision order for each capability

1. **Standard functionality.** Does a standard object, feature, or cloud
   capability do this (Opportunities, Cases, Entitlements, Approval Processes,
   Path, Assignment Rules, Omni-Channel)?
2. **AppExchange.** Is there a supported package that is cheaper over three
   years than building and maintaining the feature?
3. **Declarative configuration.** Flows, validation rules, formulas, roll-ups,
   Dynamic Forms. Choose this when the logic is simple, owned by admins, and
   within Flow limits.
4. **Programmatic.** Apex or LWC when you need complex logic, heavy bulk
   processing, callouts with error handling, reusable services, custom UI, or
   performance-critical paths.

Record the choice and the rejected alternatives per capability in the Build
Approach Matrix.

## Choosing between Flow and Apex

| Prefer Flow | Prefer Apex |
|-------------|-------------|
| Same-record field updates (before-save flow) | Complex cross-object logic, many objects per transaction |
| Simple related-record creation or update | LDV processing, or record counts above Flow element limits |
| Admin-maintained business rules | Callouts with retries, idempotency, or complex parsing |
| Guided screens | Logic that needs unit tests with mocks |
| Notifications and simple orchestration | Strict performance or CPU budgets |

Never mix trigger and record-triggered flow logic for the same object and event
unless their order is defined (Flow Trigger Explorer ordering plus a documented
trigger handler sequence).

## Order of execution (save)

1. Original record loaded, new values applied, and system validation (and
   layout-required fields for UI saves)
2. **Before-save** record-triggered flows
3. **Before** triggers
4. System validation again, then **custom validation rules**
5. Duplicate rules
6. Record saved (not committed)
7. **After** triggers
8. Assignment, auto-response, and workflow rules (a workflow field update
   re-runs update triggers once)
9. Escalation and entitlement rules
10. **After-save** record-triggered flows
11. Roll-up summary and cross-object formula updates on parents (the parent goes
    through its own save)
12. Criteria-based sharing recalculation
13. **Commit**, then post-commit logic: emails, async Apex enqueued, Platform
    Events published after commit, outbound messages

Design recursion guards for anything that updates the triggering record or a
parent in an after context.

## Multi-org and packaging

- Prefer a single org unless legal, regional, or business-unit separation
  requires multiple orgs. Multi-org needs an integration and identity strategy.
- Unlocked packages per domain give independent versioning and enforce
  dependency direction. Do not create circular package dependencies.
- Keep org-wide shared metadata (core objects, global value sets) in a base
  package or Unit that others depend on.

## Governor-limit hotspots to design out

- Cascading automation: an update triggers a parent roll-up, which triggers
  parent automation, which updates children.
- Data skew: more than 10,000 children per parent (account skew), more than
  10,000 records owned by one user (ownership skew), or lookup skew. These
  cause lock contention (`UNABLE_TO_LOCK_ROW`).
- Non-selective queries on objects with more than 200k rows
  (`QUERY_TIMEOUT`, non-selective query errors in triggers).
- Large synchronous callout chains. Move them to Queueable or Platform Events.
