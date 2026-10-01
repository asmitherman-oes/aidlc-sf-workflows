# salesforce — AIDLC plugin for Salesforce application development

> An **AIDLC plugin** that turns the AI-DLC workflow into a Salesforce delivery
> lifecycle. It adds the `salesforce-classic` workflow profile, Salesforce
> domain-expert and reviewer agents, Salesforce design, validation, and release
> stages, and Salesforce guidance in the core stages. Org work runs through the
> **Salesforce DX MCP server**. Mechanism:
> [`docs/reference/18-plugin-mechanism.md`](../../docs/reference/18-plugin-mechanism.md).

## 1. What you get

| Surface | What the plugin ships |
|---------|-----------------------|
| **Workflow profile** | `salesforce-classic`: classic's ceremony (Standard depth, one approval per stage, advisory reviews, Guard Policy off, Plan Approval on) re-routed for Salesforce. Generated runner: **`/salesforce-classic`**. |
| **Domain-expert agents** | `salesforce-architect-agent` (CTA), `salesforce-admin-agent` (declarative), `salesforce-developer-agent` (Apex/LWC), `salesforce-security-agent` (sharing/CRUD/FLS), `salesforce-qa-agent` (Apex/Jest testing), `salesforce-devops-agent` (sf CLI, orgs, deploys) |
| **Reviewer agent** | `salesforce-technical-reviewer-agent`: CTA review board for the Salesforce design stages |
| **New stages** | 4 Inception, 1 Construction, and 1 Operation (see §3) |
| **Core-stage enrichment** | 15 contributions add Salesforce questions, sections, consumes, and sensors to core stages and put them on the `salesforce-classic` route |
| **Core-agent knowledge** | `salesforce-platform-primer.md` for 12 core agents, so the core leads (product, architect, developer, quality, and so on) work as Salesforce practitioners in this scope |
| **Sensors** | `salesforce-apex-antipatterns`, `salesforce-lwc-styling`, and `salesforce-apex-coverage` (advisory) |
| **Doctor checks** | Composed files (error); `sf` CLI, `sfdx-project.json`, and Salesforce DX MCP configuration (advisory) |

## 2. The `salesforce-classic` route

```
Initialization  workspace-scaffold → workspace-detection → state-init
Inception       reverse-engineering* → practices-discovery* → requirements-analysis → user-stories*
                → refined-mockups* → domain-design* → units-generation → contract-design*
                → delivery-planning → salesforce-org-analysis* → salesforce-solution-design
                → salesforce-data-model-design* → salesforce-security-model-design*
Construction    (per Unit) functional-design* → nfr-requirements* → nfr-design* → code-generation
                → build-and-test → ci-pipeline* → salesforce-org-validation
Operation       salesforce-release-deployment*            (* = conditional, self-selects)
```

24 of the 39 composed stages. Infrastructure Design (AWS-led), Ideation, and the
other core Operation stages are skipped. The engine numbers plugin stages after
the core stages of their phase. That is why the Salesforce design stages close
Inception (after Units and the delivery plan are known, before any code) and Org
Validation closes Construction.

## 3. Stages

| Stage | Lead / support | Reviewer | Produces |
|-------|----------------|----------|----------|
| **Salesforce Org Analysis** (inception, conditional) | architect / admin, devops | – | `salesforce-org-profile`, `salesforce-org-impact-analysis` |
| **Salesforce Solution Design** (inception, always) | architect / admin, developer, devops | technical reviewer | `salesforce-solution-blueprint`, `salesforce-build-approach-matrix`, `salesforce-environment-strategy` |
| **Salesforce Data Model Design** (inception, conditional) | architect / admin, developer | technical reviewer | `salesforce-data-model`, `salesforce-data-dictionary` |
| **Salesforce Security Model Design** (inception, conditional) | security / architect, admin | technical reviewer | `salesforce-security-model`, `salesforce-access-matrix` |
| **Salesforce Org Validation** (construction, always) | devops / qa, security | – | `salesforce-org-validation-report`, `salesforce-apex-test-report` (+ `salesforce-apex-test-results.json` sensor input) |
| **Salesforce Release Deployment** (operation, conditional) | devops / security, qa | – | `salesforce-release-plan`, `salesforce-deployment-log`, `salesforce-post-deployment-verification` |

Each stage also gets a stage runner (`/salesforce-solution-design`, …) for
isolated runs.

## 4. Core stages it modifies (contribution seam)

All changes are additive. The plugin never edits `core/`.

| Core stage | Salesforce addition |
|------------|---------------------|
| reverse-engineering | SFDX metadata inventory and anti-pattern scan |
| requirements-analysis | Salesforce platform questions; `## Salesforce Platform Constraints` (`SFC-n`) in requirements.md |
| user-stories | `## Salesforce Persona Access` in personas.md; access- and bulk-aware acceptance criteria |
| refined-mockups | Lightning base components, SLDS 2 hooks, and App Builder targets |
| domain-design | `## Salesforce Object Mapping` (entities to SObjects, components to Apex/Flow/LWC) |
| units-generation | Units aligned to package directories and schema-first dependencies |
| contract-design | `@AuraEnabled`, invocable, REST, Platform Event, and Named Credential contracts |
| delivery-planning | Environments per Bolt, seasonal releases, and Salesforce dependencies |
| functional-design | `## Salesforce Automation Design` (order of execution, recursion) and platform error handling |
| nfr-requirements | Governor-limit budget, LDV, CRUD/FLS, and Apex coverage targets |
| nfr-design | Async, caching, selectivity, user-mode, and logging patterns |
| code-generation | Metadata-complete plans, Salesforce knowledge in the developer delegation, and Apex/LWC sensors |
| build-and-test | `sf` build checks; Apex execution deferred to Org Validation when no org is authorized |
| ci-pipeline | `sf` CLI, JWT auth, validate on PR, and quick deploy on merge |
| practices-discovery | Route membership only |

## 5. Salesforce DX MCP

Agents call the Salesforce DX MCP tools (`list_all_orgs`, `get_username`,
`run_soql_query`, `retrieve_metadata`, `deploy_metadata`, `run_apex_test`,
`assign_permission_set`, `create_scratch_org`, `delete_org`,
`resume_tool_operation`, and `run_code_analyzer` when enabled), with `sf` CLI
fallbacks. The operating reference and safety rules are in
[`knowledge/salesforce-devops-agent/salesforce-dx-mcp-tools.md`](knowledge/salesforce-devops-agent/salesforce-dx-mcp-tools.md):

- Design stages are **read-only** against orgs.
- Code Generation never deploys.
- Org Validation **refuses production**.
- Release Deployment needs a human confirmation that names the target org
  (twice for production: validate, then quick deploy).

Register the server once (the plugin does not auto-provision it):

```bash
sf org login web --alias my-sandbox --instance-url https://test.salesforce.com
claude mcp add salesforce-dx --scope project -- npx -y @salesforce/mcp --orgs DEFAULT_TARGET_ORG --toolsets all
```

If the `salesforce-lwc-slds2` Claude skill is installed, the developer and
design guidance tells agents to use it for LWC markup and CSS.

## 6. Install and use with Claude Code

```bash
# 1. Build the core runtime and the plugin projections from this repo
bun install
bun scripts/package.ts          # → dist/claude/ and dist/plugins/salesforce/claude/

# 2. Put AI-DLC core into your Salesforce DX project (copy channel), or use `aidlc config --harness claude`
cp -r dist/claude/.claude dist/claude/aidlc /path/to/your-sfdx-project/
```

In Claude Code, from the Salesforce DX project:

```
/plugin marketplace add /path/to/aidlc-sf-workflows/dist/plugins/salesforce/claude
/plugin install aidlc-salesforce@aidlc-plugins
```

Restart Claude Code. The SessionStart hook composes the plugin (stages, agents,
scope, runners, and contributions). Restart once more so Claude Code registers
the newly composed agents and `/salesforce-classic` skill. Then:

```
/aidlc --doctor                       # expect "Plugin check (salesforce)" rows and 0 failures
/salesforce-classic Build an LWC that lets service agents bulk-escalate Cases with an Apex service
/aidlc --scope salesforce-classic …    # equivalent
```

A freeform `/aidlc …` request that mentions Salesforce, Apex, LWC, SFDX, or a
scratch org proposes `salesforce-classic` by keyword.

**Without the plugin store**, compose directly:

```bash
CLAUDE_PLUGIN_ROOT=$PWD/dist/plugins/salesforce/claude CLAUDE_PROJECT_DIR=/path/to/project \
  AIDLC_HARNESS_DIR=.claude bun dist/plugins/salesforce/claude/hooks/compose.ts
```

Re-run compose (or start a new session) after every AIDLC engine upgrade:
`bun .claude/tools/aidlc-utility.ts plugin-sync`.

## 7. Develop and test

```bash
bun .claude/tools/aidlc-plugin-validate.ts plugins/salesforce        # or dist/claude/.claude/tools/…
bun test plugins/salesforce/tests/plugin.test.ts                       # content + compose + sensors
bun dist/claude/.claude/tools/aidlc-plugin-test.ts plugins/salesforce --install <claude-project> --harness claude
```

The tests validate the content with the framework validators, compose into a
real Claude install (no drops, route membership, stage order, spliced prose,
bound sensors), and exercise each sensor's rules.

### Other harnesses

The packager emits projections for every harness. `aidlc-plugin-test` composes
cleanly (0 drops, all 6 stages) on **Claude Code, Cursor, GitHub Copilot, and
opencode**. On **Codex, Kiro CLI, and Kiro IDE**, a stage with a `reviewer:`
needs a native dispatch surface for `salesforce-technical-reviewer-agent` (a
Codex agent TOML, a Kiro agent-v1 JSON plus `trustedAgents` registration, or
Kiro IDE `tools:`/`permissions.rules` frontmatter). Without one, compose drops
Solution, Data Model, and Security Model Design there (doc 18 §7). Hand-author
that surface in the install, then re-run compose.

## 8. Layout

```text
plugins/salesforce/
  .aidlc-plugin/plugin.json
  scopes/salesforce-classic.md
  agents/salesforce-*-agent.md                # 6 experts + 1 reviewer
  stages/{inception,construction,operation}/salesforce-*.md
  contributions/{inception,construction}/<core-stage>.md
  sensors/aidlc-salesforce-*.md               # 3 advisory sensors
  tools/aidlc-sensor-salesforce-*.ts          # sensor scripts (self-contained)
  tools/salesforce-doctor.ts                  # /aidlc --doctor checks
  knowledge/salesforce-*-agent/*.md           # Salesforce methodology per agent
  knowledge/aidlc-*-agent/salesforce-platform-primer.md   # Salesforce context for core agents
  tests/plugin.test.ts
```
