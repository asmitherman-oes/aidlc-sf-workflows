---
id: salesforce-apex-antipatterns
kind: deterministic
command: bun {{HARNESS_DIR}}/tools/aidlc-sensor-salesforce-apex-antipatterns.ts
default_severity: advisory
description: Reports Apex anti-patterns (SOQL/DML in loops, hardcoded Ids, missing sharing, SeeAllData, empty catch, trigger logic) in written .cls/.trigger files (salesforce plugin, advisory)
category: code-quality
matches: "**/*.{cls,trigger}"
input_schema:
  file_path: string
output_schema:
  pass: boolean
  errorCount: integer
  warningCount: integer
  violations:
    - file: string
      line: number
      rule: string
      severity: string
      message: string
timeout_seconds: 10
---

# salesforce-apex-antipatterns sensor (salesforce)

ADVISORY. Fires on every Apex class or trigger written while a stage that binds
it is active (Code Generation and Build and Test, through the salesforce
plugin's contributions). The scan is deterministic and dependency-free: comments
and string contents are blanked before matching, so commented-out code never
raises a finding.

| Rule | Severity | Detects |
|------|----------|---------|
| `soql-in-loop` | error | `[SELECT …]`, `Database.query…` inside a `for`/`while`/`do` body (a SOQL for-loop header is allowed) |
| `dml-in-loop` | error | `insert`/`update`/`upsert`/`delete`/`undelete`/`merge` or `Database.<dml>` inside a loop body |
| `hardcoded-id` | error | a string literal shaped like a 15/18-character record Id |
| `see-all-data` | error | `SeeAllData=true` |
| `missing-sharing` | error | a non-test top-level class with no `with`/`without`/`inherited sharing` |
| `without-sharing` | warning | `without sharing` (needs a recorded justification) |
| `empty-catch` | warning | `catch (…) {}` |
| `logic-in-trigger` | warning | a trigger body with queries, DML, or loops instead of handler delegation |

`pass` is false when any error-severity rule fires. The framework has no
blocking sensor severity, so findings are REPORTED, not enforced. The stage
prose requires fixing them. For full static analysis, run Salesforce Code
Analyzer in Salesforce Org Validation.
