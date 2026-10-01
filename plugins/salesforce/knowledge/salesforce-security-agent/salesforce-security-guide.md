# Salesforce Security Guide

## Record access layers (most to least restrictive first)

1. **Organization-Wide Defaults**: Private, Public Read Only, Public
   Read/Write, or Controlled by Parent. Separate internal and external defaults.
   Start from the most restrictive default the requirements allow.
2. **Role hierarchy**: managers inherit subordinates' access (Grant Access
   Using Hierarchies; standard objects always use it).
3. **Sharing rules**: owner-based or criteria-based, to roles, groups, or
   territories.
4. **Teams**: Account, Opportunity, and Case teams. **Territory management**
   for territory-based sales access.
5. **Manual and Apex managed sharing** (`<Object>__Share` with a custom
   `RowCause`) only when the rule cannot be expressed declaratively.
6. **Restriction rules / scoping rules** to narrow visibility.

Experience Cloud: separate external OWD, sharing sets, share groups, and
guest user sharing rules (guest access is read-only and must be minimal).

## Object and field access

- Use permission sets per job function, grouped into permission set groups per
  persona. Mute with a muting permission set inside the group.
- Custom permissions gate features in Apex (`FeatureManagement.checkPermission`),
  Flow, validation rules, and LWC (`@salesforce/customPermission/X`).
- `View All` / `Modify All` (object) and `View All Data` / `Modify All Data`
  (system) need a written justification.

## Secure Apex

- **Sharing**: `with sharing` by default. `inherited sharing` for utilities.
  `without sharing` only with a recorded reason, scoped to the smallest class.
- **CRUD/FLS**: `WITH USER_MODE` in SOQL; `Database.insert/update/...(records, AccessLevel.USER_MODE)`;
  `Security.stripInaccessible` for data returned to clients; and
  `Schema.sObjectType.X.isAccessible()`-style checks only in legacy code.
- **Injection**: bind variables, `Database.queryWithBinds`, and
  `String.escapeSingleQuotes` for any unavoidable dynamic fragment. Allowlist
  field and object names against `Schema` describes.
- **Entry points**: every `@AuraEnabled`, `@RestResource`, `@InvocableMethod`,
  and `webservice` method is a public API. Validate inputs and enforce access.
- **Secrets**: Named Credentials and External Credentials, and Protected Custom
  Metadata or Settings in managed packages. Never put secrets in code, labels,
  debug logs, or unprotected settings.
- **Logging**: never log full records with PII. Mask sensitive values.

## Secure LWC

- LWC Locker / Lightning Web Security isolate namespaces. Do not bypass them.
- No `innerHTML` or `lwc:dom="manual"` with untrusted content. Sanitize or render
  text.
- Load third-party libraries as static resources through
  `lightning/platformResourceLoader`. Do not load them from a CDN without
  allowlisting.

## Sensitive data

Classify fields (Data Classification metadata: compliance categorisation and
sensitivity level). Use Shield Platform Encryption for regulated data at rest
(note the functional limits on encrypted fields), Field Audit Trail for
retention, and Event Monitoring for access auditing.

## Verification

- `System.runAs(user)` tests per persona prove the access matrix, both positive
  (can) and negative (cannot).
- Salesforce Code Analyzer security rules (PMD `ApexCRUDViolation`,
  `ApexSharingViolations`, `ApexSOQLInjection`, `ApexOpenRedirect`,
  `ApexXSSFromURLParam`, …) are clean at severity 1–2.
- For AppExchange, plan for the Security Review (Code Analyzer reports and a
  DAST scan of external endpoints).
