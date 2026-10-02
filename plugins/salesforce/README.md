# salesforce — AIDLC plugin for Salesforce application development

> An **AIDLC plugin** that turns the AI-DLC workflow into a Salesforce delivery
> lifecycle. It keeps AIDLC's own agents, hooks, and stage protocol, and has
> those agents do the underlying Salesforce work through **Salesforce's own
> tooling**:
>
> - the agent skills in [`forcedotcom/sf-skills`](https://github.com/forcedotcom/sf-skills);
> - the **Salesforce DX MCP server** ([`@salesforce/mcp`](https://github.com/salesforcecli/mcp)).
>
> A blocking gate checks the recorded tool calls. This plugin works with the
> **Salesforce-first core** of this fork. Mechanism:
> [`docs/reference/18-plugin-mechanism.md`](../../docs/reference/18-plugin-mechanism.md).

## 1. How the agents get Salesforce knowledge

The knowledge comes from Salesforce. The fork and plugin wire it in at four
points:

1. **The skills and MCP tools are the knowledge.**
   `core/knowledge/aidlc-shared/salesforce-tooling.md` maps each task to the
   required sf-skill or Salesforce DX MCP tool. For example, Apex maps to
   `platform-apex-generate` and `scan_apex_class_for_antipatterns`, and an LWC
   maps to `experience-lwc-generate` and `orchestrate_lwc_component_creation`.
   Every agent loads this shared knowledge file in every stage, so the engine
   lists it in each stage's required reading and in each dispatched agent's
   knowledge preflight.
2. **The existing AIDLC agents are told which tools they own.** Each core
   persona on the route (product, design, delivery, architect, developer,
   quality, devsecops, compliance, pipeline-deploy, and both reviewers) has a
   `## Salesforce Platform` section that names its required skills and MCP
   tools. The AWS/CDK duties were removed, and `aws-platform-agent` is no
   longer a support voice on any stage.
3. **Every stage step names the call it requires.** Plugin stages and the
   contributions to core stages state which skill or tool to run before
   writing anything. Code Generation plans name a skill per step.
4. **Calls are recorded, and missing ones block the gate.** The core
   `record-tool-calls` hook (Claude Code PostToolUse, matcher
   `mcp__.*|Skill|Read`) appends every MCP call, Skill call, and `SKILL.md`
   read to `<record>/.aidlc-engine/tool-calls/<stage>.jsonl`. Subagent calls
   are included. Before the approval gate opens, the **blocking**
   `salesforce-tool-usage` sensor checks the stage's required calls. Code
   Generation's requirements come from what the Unit's `source-manifest.json`
   says it wrote. A missing call keeps the gate closed until it is made, or
   until the human chooses **Override blocking sensors**, which is audited.

## 2. What it ships

| Surface | Content |
|---------|---------|
| **Workflow profile** | `salesforce-classic`: classic's ceremony re-routed for Salesforce. Runner: **`/salesforce-classic`** |
| **New stages** | Org Analysis, Solution Design, Data Model Design, and Security Model Design (Inception); Org Validation (Construction); Release Deployment (Operation). All are led by existing AIDLC agents |
| **Core-stage contributions** | 15 contributions add Salesforce steps, sections, and the gate to core stages, and put those stages on the route |
| **Sensors** | `salesforce-tool-usage` (blocking, gate-fired) and `salesforce-apex-coverage` (advisory, reads `run_apex_test` results) |
| **Doctor** | **Errors** when any of these is missing: the Salesforce DX MCP server or its required toolsets, the sf-skills, the `sf` CLI, the recording hook, or the routing knowledge |

## 3. Route and owners

| Stage | Lead | Support | Reviewer | Gate requires (any one per item) |
|-------|------|---------|----------|----------------------------------|
| Requirements Analysis, User Stories, Domain Design, Units, Contract, Delivery | core leads | core | core | – (steps require `platform-docs-get` / `platform-data-and-tooling-api-context-get` and other skills) |
| Refined Mockups | design | product | product-lead | `design-systems-slds-apply` / `guide_lbc_usage` / `explore_lbc_components` |
| **SF Org Analysis** | architect | developer, pipeline-deploy | – | `list_all_orgs`/`get_username`/`dx-org-analyze`; `run_soql_query`/`dx-org-analyze`/`platform-soql-query` |
| **SF Solution Design** | architect | developer, design, pipeline-deploy | architecture-reviewer | `platform-docs-get` / API-context skills |
| **SF Data Model Design** | architect | developer | architecture-reviewer | `platform-custom-object-generate`/`-field-generate`; a schema skill |
| **SF Security Model Design** | devsecops | architect, compliance | architecture-reviewer | `platform-sharing-*`; `platform-permission-set-generate` |
| Code Generation (per Unit) | developer | – | architecture-reviewer | derived from `source-manifest.json` (Apex, tests, LWC, CSS, Aura, objects, fields, flows, permission sets, pages, CMDT) |
| Build and Test | quality | devsecops | – | `run_code_analyzer` / `dx-code-analyzer-run` |
| **SF Org Validation** | quality | pipeline-deploy, devsecops | – | `deploy_metadata`/`platform-metadata-deploy`; `run_apex_test`/`platform-apex-test-run`; Code Analyzer |
| **SF Release Deployment** | pipeline-deploy | devsecops, quality | – | `deploy_metadata` / `platform-metadata-deploy` |

Infrastructure Design (AWS-led), Ideation, and the other core Operation stages
are skipped.

## 4. Install and use with Claude Code

```bash
# 1. Build this fork (Salesforce-first core + plugin projections)
bun install && bun scripts/package.ts

# 2. Install the core into your Salesforce DX project
cp -r dist/claude/.claude dist/claude/aidlc dist/claude/.mcp.json /path/to/your-sfdx-project/

# 3. Salesforce tooling in that project
cd /path/to/your-sfdx-project
npx skills add forcedotcom/sf-skills                 # official Salesforce agent skills
sf org login web --alias my-sandbox --instance-url https://test.salesforce.com
sf org login web --alias devhub --set-default-dev-hub
```

The shipped `.mcp.json` registers `salesforce-dx`, which runs
`npx -y @salesforce/mcp --orgs DEFAULT_TARGET_ORG,DEFAULT_TARGET_DEV_HUB --toolsets orgs,metadata,data,users,testing,code-analysis,lwc-experts,aura-experts,scale-products,experts-validation --allow-non-ga-tools`.

Then, in Claude Code:

```
/plugin marketplace add /path/to/aidlc-sf-workflows/dist/plugins/salesforce/claude
/plugin install aidlc-salesforce@aidlc-plugins
```

Restart Claude Code twice. The first start composes the plugin; the second
registers the new runners. Then:

```
/aidlc --doctor        # every "Plugin check (salesforce)" row must pass
/salesforce-classic Build an LWC that lets service agents bulk-escalate Cases with an Apex service
```

**Without the plugin store**, compose directly with
`CLAUDE_PLUGIN_ROOT=…/dist/plugins/salesforce/claude CLAUDE_PROJECT_DIR=<project> AIDLC_HARNESS_DIR=.claude bun …/hooks/compose.ts`.
Re-run it, or start a new session, after every engine upgrade.

## 5. Develop and test

```bash
bun dist/claude/.claude/tools/aidlc-plugin-validate.ts plugins/salesforce
bun test plugins/salesforce/tests/plugin.test.ts   # content, compose, hook, gate, doctor
bun dist/claude/.claude/tools/aidlc-plugin-test.ts plugins/salesforce --install <claude-project> --harness claude
```

**Other harnesses.** The tool-call ledger is recorded only on Claude Code, where
the hook is registered. On other harnesses the blocking gate has no ledger, so
it stays closed until the human overrides it.

## 6. Layout

```text
plugins/salesforce/
  .aidlc-plugin/plugin.json
  scopes/salesforce-classic.md
  stages/{inception,construction,operation}/salesforce-*.md
  contributions/{inception,construction}/<core-stage>.md
  sensors/aidlc-salesforce-tool-usage.md            # blocking gate
  sensors/aidlc-salesforce-apex-coverage.md         # advisory coverage
  tools/aidlc-sensor-salesforce-*.ts  tools/salesforce-doctor.ts
  tests/plugin.test.ts
# Salesforce-first core (this fork):
core/hooks/aidlc-record-tool-calls.ts               # MCP/skill call ledger
core/knowledge/aidlc-shared/salesforce-tooling.md   # task → skill/tool routing
core/agents/aidlc-*-agent.md                        # "## Salesforce Platform" sections
harness/claude/.mcp.json                            # salesforce-dx replaces the AWS servers
```
