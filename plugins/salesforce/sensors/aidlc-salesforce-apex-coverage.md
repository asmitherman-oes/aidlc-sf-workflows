---
id: salesforce-apex-coverage
kind: deterministic
command: bun {{HARNESS_DIR}}/tools/aidlc-sensor-salesforce-apex-coverage.ts
default_severity: advisory
description: Reports failing Apex tests and Apex coverage below target from salesforce-apex-test-results.json (salesforce plugin, advisory)
category: document-shape
matches: "**/{aidlc-docs,intents}/**"
input_schema:
  output_path: string
  stage_slug: string
output_schema:
  pass: boolean
  findings_count: integer
  failing: integer
  org_wide_coverage_pct: number
  classes_below_target: string[]
  targets: object
timeout_seconds: 5
---

# salesforce-apex-coverage sensor (salesforce)

ADVISORY. Reads the `salesforce-apex-test-results.json` side-input that
Salesforce Org Validation writes from the `run_apex_test` result. It reports:

- any failing Apex test (`summary.failing > 0`);
- org-wide coverage below `targets.org_wide` (default 85; never below the 75%
  platform deployment floor, even when the JSON asks for less);
- every class in `classes[]` below `targets.per_class` (default 75).

Any other write under the record dir is a clean pass-through. Findings are
reported, not enforced; the stage prose forbids lowering targets to pass.
