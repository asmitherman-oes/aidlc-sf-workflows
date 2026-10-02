# Salesforce Tooling — Required Skills and MCP Tools

This fork builds Salesforce applications. The Salesforce platform knowledge
comes from **Salesforce's own tooling**, not from memory:

1. **Salesforce agent skills** — [`forcedotcom/sf-skills`](https://github.com/forcedotcom/sf-skills),
   installed in the project with `npx skills add forcedotcom/sf-skills`.
   Invoke a skill with the Skill tool (or read its `SKILL.md`) and follow it.
2. **Salesforce DX MCP server** — `@salesforce/mcp`, registered as
   `salesforce-dx` in `.mcp.json`. Its tools appear as
   `mcp__salesforce-dx__<tool>`.

**Rules for every agent, every stage**

- When a task in the table below applies, you MUST use the named skill or MCP
  tool to do it and follow its instructions over your own recollection. Do not
  hand-write Salesforce metadata, Apex, LWC, Flows, or permissions when a
  Salesforce skill or tool exists for it.
- Whenever you load a metadata generator skill (`platform-*-generate`,
  `automation-flow-generate`), ALSO load `platform-metadata-api-context-get` in
  the same turn — the skills require it.
- Use AWS services, CDK, or AWS MCP servers only when a requirement explicitly
  integrates with AWS. They are never the platform for the Salesforce
  application itself.
- If a required skill or tool is unavailable, STOP and tell the human what to
  install (`npx skills add forcedotcom/sf-skills`, or the `salesforce-dx` MCP
  toolsets). Do not substitute a hand-rolled approach silently.
- Calls are recorded. The `record-tool-calls` hook writes every MCP and skill
  call to `<record>/.aidlc-engine/tool-calls/<stage>.jsonl`, and the
  `salesforce-tool-usage` gate sensor refuses the approval gate when a stage's
  required Salesforce calls are missing (the human may override).

## Task → required Salesforce skill / MCP tool

| Task | Salesforce skill (sf-skills) | Salesforce DX MCP tool |
|------|------------------------------|------------------------|
| Look up official Salesforce docs, limits, or behaviour | `platform-docs-get` | – |
| Standard object / field reference | `platform-data-and-tooling-api-context-get` | `run_soql_query` (Tooling API) |
| Metadata schema for any generated metadata | `platform-metadata-api-context-get` | – |
| Inventory or compare orgs | `dx-org-analyze` | `list_all_orgs`, `get_username`, `run_soql_query` |
| SOQL / SOSL authoring and selectivity | `platform-soql-query` | `run_soql_query` |
| Apex classes, triggers, services, async, REST | `platform-apex-generate` | `scan_apex_class_for_antipatterns` |
| Apex test classes | `platform-apex-test-generate` | – |
| Run Apex tests, coverage, fix loops | `platform-apex-test-run` | `run_apex_test` |
| Custom objects | `platform-custom-object-generate` | – |
| Custom fields, relationships, picklists | `platform-custom-field-generate` | – |
| Custom Metadata Types | `platform-custom-metadata-type-generate` | – |
| Validation rules | `platform-validation-rule-generate` | – |
| Flows | `automation-flow-generate` | – |
| Permission sets / FLS | `platform-permission-set-generate` | `assign_permission_set` |
| Org-wide defaults | `platform-sharing-owd-configure` | – |
| Sharing rules | `platform-sharing-rules-generate` | – |
| Lightning record / app pages | `platform-flexipage-generate` | – |
| Lightning Web Components | `experience-lwc-generate` | `orchestrate_lwc_component_creation`, `guide_lwc_development`, `guide_lwc_best_practices` |
| Base components and data access | – | `guide_lbc_usage`, `explore_lbc_components`, `guide_lds_development` |
| LWC Jest tests | `experience-lwc-generate` | `create_lwc_jest_tests`, `review_lwc_jest_tests` |
| LWC accessibility | `experience-lwc-accessibility-jest-run` | `guide_component_accessibility`, `run_lwc_accessibility_jest_tests` |
| LWC security (Lightning Web Security) | `experience-lwc-security-validate` | `guide_lws_security` |
| SLDS styling and blueprints | `design-systems-slds-apply`, `design-systems-slds-validate` | `guide_slds_styling`, `explore_slds_styling` |
| Aura → LWC migration | `experience-aura-lwc-migrate` | `orchestrate_aura_migration`, `verify_aura_migration_completeness` |
| Integrations (Named Credentials, callouts, events) | `integration-connectivity-generate` | – |
| Static analysis (PMD, ESLint, Flow, SFGE) | `dx-code-analyzer-run` | `run_code_analyzer`, `query_code_analyzer_results` |
| Apex performance antipatterns | `dx-apexguru-scan` | `scan_apex_class_for_antipatterns` |
| Validate and score generated work | – | `validate_and_optimize`, `score_issues` |
| Deploy / validate / quick deploy | `platform-metadata-deploy` | `deploy_metadata`, `resume_tool_operation` |
| Retrieve metadata | `platform-metadata-retrieve` | `retrieve_metadata` |
| Scratch orgs and org operations | `dx-org-manage` | `create_scratch_org`, `delete_org`, `open_org` |
| Assign permission sets | `dx-org-permission-set-assign` | `assign_permission_set` |
| Architecture / ERD diagrams | `external-diagram-mermaid-generate` | – |
| DevOps Center (when the team uses it) | `dx-devops-*` | `devops` toolset tools |

## Org safety (all agents)

- Echo the target org (alias, username, scratch / sandbox / production) before
  any org write: `deploy_metadata`, `assign_permission_set`,
  `create_scratch_org`, `delete_org`.
- Design and Code Generation stages are read-only against orgs.
- Production is written only in Salesforce Release Deployment, and only after a
  recorded human confirmation that names the org.
- `delete_org` only for a scratch org this workflow created, and only after
  asking.
