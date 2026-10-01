# Salesforce Apex Guide

These rules are coding standards for every Apex class and trigger generated in a
Salesforce workflow. **MUST** rules are non-negotiable; the
`salesforce-apex-antipatterns` sensor checks several of them.

## Governor limits (per transaction; sync / async)

| Limit | Sync | Async |
|-------|------|-------|
| SOQL queries | 100 | 200 |
| Rows retrieved by SOQL | 50,000 | 50,000 |
| DML statements | 150 | 150 |
| Rows processed by DML | 10,000 | 10,000 |
| CPU time | 10,000 ms | 60,000 ms |
| Heap size | 6 MB | 12 MB |
| Callouts | 100 | 100 |
| Queueable jobs enqueued | 50 | 1 |
| SOSL queries | 20 | 20 |

Triggers receive records in chunks of up to **200**. All automation on the
object (flows, triggers, roll-ups, other packages) shares one transaction's
limits.

## MUST rules

1. **Bulkify.** Never put SOQL, DML, or `Database.*` calls inside a loop. Query
   once into a `Map<Id, SObject>`, collect changes into a `List`, and run one DML.
2. **One trigger per object.** The trigger body only delegates to a handler for
   every event, for example
   `trigger AccountTrigger on Account (before insert, before update, after insert, after update) { new AccountTriggerHandler().run(); }`.
   Handlers include a recursion guard and a bypass switch (Custom Metadata or a
   custom permission).
3. **Sharing declared.** Every non-test class declares `with sharing` (default),
   `inherited sharing` (utilities called from varied contexts), or
   `without sharing`. The last needs a justification recorded in the security
   model.
4. **User-mode data access** for user-facing paths: `[SELECT ... WITH USER_MODE]`,
   `Database.query(soql, AccessLevel.USER_MODE)`,
   `Database.insert(records, AccessLevel.USER_MODE)`, and
   `Security.stripInaccessible(AccessType.READABLE, records)` before returning
   data to an LWC.
5. **No hardcoded Ids, URLs, or secrets.** Use Custom Metadata Types, Custom
   Labels, `Schema.SObjectType.X.getRecordTypeInfosByDeveloperName()`, queries by
   `DeveloperName`, and Named Credentials.
6. **Safe dynamic SOQL.** Use bind variables (`Database.queryWithBinds`) and
   never concatenate user input.
7. **Never swallow exceptions.** Catch specific exceptions, log them, and
   rethrow a custom exception or use `addError` on the record or field.
   `@AuraEnabled` methods throw `AuraHandledException` with a user-safe message.

## Structure

- **Selector**: all SOQL for an object, with selective filters and only the
  fields needed.
- **Domain**: object behaviour (defaults, validation beyond validation rules,
  derived fields), invoked by the trigger handler.
- **Service**: transactional business operations called from LWC, Flow
  (`@InvocableMethod`), REST, batch, or the trigger handler. Services own the
  transaction boundary (`Savepoint` and rollback where partial failure must undo
  work).
- Follow the existing project convention (fflib Apex Enterprise Patterns or a
  lighter house style) found by Reverse Engineering.

## Asynchronous Apex

| Need | Use |
|------|-----|
| Post-commit work, callouts from triggers, and chaining | `Queueable` (`implements Database.AllowsCallouts`; attach a `Finalizer` for failure handling) |
| Millions of records | `Database.Batchable` with `Database.QueryLocator` (scope of 200 or less for complex logic) |
| Time-based work | `Schedulable` that enqueues a Queueable or Batch, or a Scheduled Flow |
| Decoupling or fan-out, survives rollback for logging | Platform Events (`EventBus.publish`) |
| Legacy only | `@future` (prefer Queueable in new code) |

## Callouts

Use `callout:<NamedCredential>/path` endpoints. Set timeouts (up to 120 s in
total per transaction) and handle non-2xx responses explicitly. Make no
callouts after uncommitted DML in the same transaction; move them to a
Queueable. Keep request and response wrapper classes (DTOs) separate from SObjects.

## Source format

Each class has `ClassName.cls` and `ClassName.cls-meta.xml`
(`<apiVersion>` = project `sourceApiVersion`, `<status>Active</status>`).
Triggers have `.trigger` and `.trigger-meta.xml`. Use PascalCase class names
with a suffix by role (`AccountService`, `AccountsSelector`,
`AccountTriggerHandler`, `AccountServiceTest`).
