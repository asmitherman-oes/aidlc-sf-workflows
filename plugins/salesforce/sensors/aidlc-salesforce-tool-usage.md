---
id: salesforce-tool-usage
kind: deterministic
command: bun {{HARNESS_DIR}}/tools/aidlc-sensor-salesforce-tool-usage.ts
default_severity: blocking
fire_on: gate
description: Blocks the approval gate until the stage's required Salesforce skills (forcedotcom/sf-skills) and Salesforce DX MCP tools appear in the recorded tool-call ledger (salesforce plugin)
category: process
matches: "**/{aidlc-docs,intents}/**"
input_schema:
  output_path: string
  stage_slug: string
output_schema:
  pass: boolean
  findings_count: integer
  missing: object[]
  recorded: string[]
timeout_seconds: 30
---

# salesforce-tool-usage sensor (salesforce)

BLOCKING, gate-fired. Before a stage's approval gate opens, it reads the
tool-call ledger that the core `record-tool-calls` hook builds from Claude
Code's PostToolUse events (`<record>/.aidlc-engine/tool-calls/<stage>.jsonl`)
and checks the stage's required Salesforce calls. A skill counts when it was
invoked with the Skill tool or its `SKILL.md` was read; an MCP tool counts on
any server name.

| Stage | Required (any one per line) |
|-------|-----------------------------|
| Salesforce Org Analysis | `list_all_orgs` / `get_username` / `dx-org-analyze`; `run_soql_query` / `dx-org-analyze` / `platform-soql-query` |
| Salesforce Solution Design | `platform-docs-get` / `platform-data-and-tooling-api-context-get` / `platform-metadata-api-context-get` |
| Salesforce Data Model Design | `platform-custom-object-generate` / `platform-custom-field-generate`; a schema reference skill |
| Salesforce Security Model Design | `platform-sharing-owd-configure` / `platform-sharing-rules-generate`; `platform-permission-set-generate` |
| Refined Mockups | `design-systems-slds-apply` / `guide_lbc_usage` / `explore_lbc_components` |
| Code Generation (per Unit) | Derived from `source-manifest.json`: Apex → `platform-apex-generate` + `scan_apex_class_for_antipatterns`/`run_code_analyzer`; Apex tests → `platform-apex-test-generate`; LWC → LWC expert + Jest tool; LWC CSS → SLDS skill/tool; Aura → Aura migration; objects, fields, validation rules, flows, permission sets, pages, CMDT → the matching `platform-*`/`automation-flow-generate` skill plus `platform-metadata-api-context-get` |
| Build and Test | `run_code_analyzer` / `dx-code-analyzer-run` |
| Salesforce Org Validation | `deploy_metadata` / `platform-metadata-deploy`; `run_apex_test` / `platform-apex-test-run`; `run_code_analyzer` / `dx-code-analyzer-run` |
| Salesforce Release Deployment | `deploy_metadata` / `platform-metadata-deploy` |

A missing requirement keeps the gate closed. Make the call and retry, or the
human chooses **Override blocking sensors** at the gate (recorded in the
audit). The ledger exists only on Claude Code, where the hook is registered;
other harnesses will be blocked until overridden.
