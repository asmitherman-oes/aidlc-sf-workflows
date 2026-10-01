---
id: salesforce-lwc-styling
kind: deterministic
command: bun {{HARNESS_DIR}}/tools/aidlc-sensor-salesforce-lwc-styling.ts
default_severity: advisory
description: Reports SLDS 2 styling violations (hardcoded colors, reassigned or component-level hooks, deprecated tokens, !important) in written LWC .css files (salesforce plugin, advisory)
category: code-quality
matches: "**/lwc/**/*.css"
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

# salesforce-lwc-styling sensor (salesforce)

ADVISORY. Fires on every Lightning Web Component stylesheet written while Code
Generation is active. Checks the SLDS 2 styling rules:

| Rule | Severity | Detects |
|------|----------|---------|
| `hardcoded-color` | error | hex/`rgb()`/`hsl()` in a declaration value outside a `var()` fallback |
| `reassigned-hook` | error | a declaration that assigns `--slds-g-*` (hooks are referenced, never set) |
| `component-hook` | error | `--slds-c-*` (SLDS 1 component hooks, unsupported in SLDS 2) |
| `private-hook` | error | `--_slds-*` or `--slds-s-*` |
| `deprecated-token` | warning | a primary `var(--lwc-*)` or `var(--sds-*)` reference |
| `important` | warning | `!important` |
| `layer` | warning | `@layer` |

Colors and legacy tokens used as the fallback of a `var(--slds-g-*, …)`
are allowed, because that is the documented SLDS 1 to 2 migration pattern.
Findings are reported, not enforced.
