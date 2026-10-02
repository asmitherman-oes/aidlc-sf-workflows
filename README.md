# AI-DLC - one core, many harnesses

AI-DLC (AI-Driven Development Life Cycle) turns AI coding assistants into
structured, verifiable software-delivery workflows. One harness-neutral core
runs natively in Claude Code, Kiro CLI, Kiro IDE, Codex CLI, Cursor, opencode,
and GitHub Copilot.

![version](https://img.shields.io/badge/version-2.10.0-blue)
![license](https://img.shields.io/badge/license-MIT--0-green)

> **This is the Salesforce-first fork of AI-DLC.** To use it for Salesforce
> development, follow
> [Salesforce Edition: install and run](#salesforce-edition-install-and-run).
> The generic Quick Start further down installs the upstream AWS release, not
> this fork.

## Salesforce Edition: install and run

This fork adapts AI-DLC to Salesforce application development. The existing
AI-DLC agents do the Salesforce work through Salesforce's own tooling: the
official agent skills in
[`forcedotcom/sf-skills`](https://github.com/forcedotcom/sf-skills) and the
[Salesforce DX MCP server](https://github.com/salesforcecli/mcp). The
`salesforce` plugin adds the `salesforce-classic` workflow profile, Salesforce
design, validation, and release stages, and a gate that blocks a stage's
approval until the required Salesforce skills and MCP tools have actually
been called. Design details are in
[`plugins/salesforce/README.md`](plugins/salesforce/README.md).

There are three parts, and the setup needs all of them:

1. The fork's AI-DLC core, built from this repository and installed into your
   Salesforce DX project.
2. The `salesforce` plugin, installed into Claude Code.
3. Salesforce's tooling in your project: the sf-skills, the Salesforce CLI, and
   an authorized org.

### Prerequisites

Install these once on the machine:

| Tool | Why | Install |
|------|-----|---------|
| [Git](https://git-scm.com/) | Clone the fork | – |
| [Bun](https://bun.sh/) ≥ 1.3 | Builds the fork and runs AI-DLC | `curl -fsSL https://bun.sh/install \| bash` (Windows: `powershell -c "irm bun.sh/install.ps1 \| iex"`) |
| [Node.js](https://nodejs.org/) ≥ 20 (with `npx`) | Runs the Salesforce DX MCP server and the skills installer | – |
| [Salesforce CLI](https://developer.salesforce.com/tools/salesforcecli) (`sf`) | Org auth, deploys, tests | `npm install --global @salesforce/cli` |
| [Claude Code](https://code.claude.com/) | The harness | – |

You also need a Salesforce DX project (one with `sfdx-project.json`); create
one with `sf project generate --name my-project` if you don't have it. A Dev
Hub is optional, and only needed if you want scratch orgs.

### 1. Clone and build the fork

```bash
git clone -b dev/engage-aidlc https://github.com/asmitherman-oes/aidlc-sf-workflows.git
cd aidlc-sf-workflows
bun install
bun scripts/package.ts
```

`bun scripts/package.ts` writes the installable core to `dist-release/claude/`
and the Claude plugin to `dist/plugins/salesforce/claude/`. Re-run it after
every `git pull`.

### 2. Install the fork's core into your Salesforce DX project

Use the fork's own installer. It merges into an existing `.mcp.json` and
`.gitignore` instead of overwriting them.

macOS / Linux / WSL, from the `aidlc-sf-workflows` folder:

```bash
FORK="$PWD"
bun "$FORK/dist-release/claude/.claude/tools/aidlc.ts" config --harness claude \
  --from "$FORK/dist-release/claude" --project-dir /path/to/your-sfdx-project --mcp defaults --yes
```

Windows PowerShell, from the `aidlc-sf-workflows` folder:

```powershell
$FORK = (Get-Location).Path
bun "$FORK\dist-release\claude\.claude\tools\aidlc.ts" config --harness claude `
  --from "$FORK\dist-release\claude" --project-dir C:\path\to\your-sfdx-project --mcp defaults --yes
```

This adds `.claude/` (agents, stages, hooks, and the tool-call recorder) and
`aidlc/` to the project. It also registers the `salesforce-dx` MCP server in
`.mcp.json` with the toolsets the workflow requires (orgs, metadata, data, users,
testing, code-analysis, lwc-experts, aura-experts, scale-products,
experts-validation).

### 3. Add Salesforce's tooling to the project

Run these from your Salesforce DX project folder:

```bash
# Official Salesforce agent skills, installed for Claude Code (project level)
npx -y skills add forcedotcom/sf-skills --agent claude-code --skill '*' --yes --copy

# Authorize the org(s) the Salesforce DX MCP server will use
sf org login web --alias my-sandbox --instance-url https://test.salesforce.com --set-default
sf org login web --alias devhub --set-default-dev-hub    # optional: only for scratch orgs
```

The MCP server is configured with `--orgs DEFAULT_TARGET_ORG,DEFAULT_TARGET_DEV_HUB`,
so it works with whichever org you set as the default (`--set-default` /
`sf config set target-org <alias>`).

### 4. Install the plugin in Claude Code

Open Claude Code in your Salesforce DX project folder and run:

```
/plugin marketplace add /path/to/aidlc-sf-workflows/dist/plugins/salesforce/claude
/plugin install aidlc-salesforce@aidlc-plugins
```

On Windows use the full path, for example
`C:/Users/you/aidlc-sf-workflows/dist/plugins/salesforce/claude`.

**Restart Claude Code twice.** The first start composes the plugin into the
project. The second loads the newly added Salesforce stages and the
`/salesforce-classic` command. Approve the project hooks and the
`salesforce-dx` MCP server when Claude Code asks.

If you can't use the plugin store, compose the plugin directly from your
Salesforce DX project folder:

```bash
CLAUDE_PLUGIN_ROOT=/path/to/aidlc-sf-workflows/dist/plugins/salesforce/claude \
CLAUDE_PROJECT_DIR="$PWD" AIDLC_HARNESS_DIR=.claude \
  bun /path/to/aidlc-sf-workflows/dist/plugins/salesforce/claude/hooks/compose.ts
```

### 5. Verify and run

In Claude Code:

```
/aidlc --doctor
```

Every `Plugin check (salesforce)` row must be `ok`. Doctor reports a missing MCP
toolset, missing sf-skills, a missing `sf` CLI, or a missing recording hook as a
failure, and each failure prints the command that fixes it.

Then start a Salesforce workflow:

```
/salesforce-classic Build an LWC that lets service agents bulk-escalate Cases, backed by an Apex service
```

`/aidlc --scope salesforce-classic <request>` is equivalent. The workflow asks
for one approval per stage. Org Validation deploys only to a scratch org or
sandbox, and Release Deployment asks you to confirm the target org by name
before it writes to it.

### Updating

```bash
cd aidlc-sf-workflows && git pull && bun install && bun scripts/package.ts
```

Then re-run step 2 for each project, update the plugin from the `/plugin` menu in Claude Code (or
the direct compose command above). Restart Claude Code so the plugin
re-composes over the refreshed core.

## Quick Start (upstream AWS release)

The Quick Start below installs the latest stable upstream AI-DLC release, not
this Salesforce fork.

### 1. Install AI-DLC

macOS, Linux, or WSL:

```bash
curl -fsSL https://github.com/awslabs/aidlc-workflows/releases/latest/download/install.sh | sh
```

Windows PowerShell:

```powershell
irm https://github.com/awslabs/aidlc-workflows/releases/latest/download/install.ps1 | iex
```

The installer adds the native `aidlc` command and every harness runtime. Bun
and Node.js are not required. On Windows, it installs for the current account
and automatically registers the bin directory in User PATH. Run it from a normal
PowerShell window; one opened with "Run as administrator" gets a warning and a
prompt, since installing as administrator is less safe. Open a new terminal
if another session cannot find `aidlc`. To skip both persistent and
current-process PATH changes, use
[`-NoModifyPath`](docs/guide/18-install-and-lifecycle.md#windows-powershell).
Windows uninstall removes only the User PATH entry recorded as installer-owned.
On macOS, Linux, or WSL, follow the installer's PATH instruction if needed.

Cannot install a native executable, or prefer to manage the project files
manually? Install [Bun](https://bun.sh/), download
`aidlc-copy-runtime-X.Y.Z.tar.gz` from the
[release](https://github.com/awslabs/aidlc-workflows/releases/latest), and copy
the complete `runtime/<harness>/` directory into your project. This path does
not require the native `aidlc` command.

### 2. Configure a project

From the project root, select the harness you use:

```bash
cd /path/to/your-project
aidlc config --harness claude
aidlc doctor
```

Replace `claude` with `kiro`, `kiro-ide`, `codex`, `cursor`, `opencode`, or
`copilot`. Running `aidlc config` without `--harness` starts the interactive
setup when a terminal is available. If you use Kiro IDE's own terminal in a
project folder you have not trusted yet, Kiro first asks whether you trust it.
Choose **Trust Folder & Continue** only for your own project or one you have
checked, because trusting lets the folder's `.kiro` hooks run commands on your
machine; otherwise choose **Cancel** and review the folder first (see
[First run](docs/guide/harnesses/kiro-ide.md#first-run)).

### 3. Start a workflow

Open your harness in the configured project and describe the work:

```text
/aidlc Build a REST API for inventory management
```

Codex CLI uses `$aidlc` instead of `/aidlc`. In Kiro IDE, first choose **aidlc**
in the chat panel's agent picker. AI-DLC selects a workflow from the request,
asks for missing decisions, and stops at approval gates before moving forward.

For provider setup, trust prompts, and harness-specific prerequisites, use the
guide in the table below. The complete walkthrough is in
[Getting Started](docs/guide/01-getting-started.md).

## Pick your harness

| Harness | Configure | Open | Invoke | Guide |
| --- | --- | --- | --- | --- |
| Claude Code | `aidlc config --harness claude` | `claude` | `/aidlc` | [Getting Started](docs/guide/01-getting-started.md) |
| Kiro CLI >= 2.6 | `aidlc config --harness kiro` | `kiro-cli chat` | `/aidlc` | [Kiro CLI](docs/guide/harnesses/kiro-cli.md) |
| Kiro IDE 1.x / Kiro CLI v3 | `aidlc config --harness kiro-ide` | Open the project in Kiro IDE and choose **aidlc** in the chat panel's agent picker, or run `kiro-cli` | `/aidlc` | [Kiro IDE](docs/guide/harnesses/kiro-ide.md) |
| Codex CLI >= 0.145.0 | `aidlc config --harness codex` | `codex` | `$aidlc` | [Codex CLI](docs/guide/harnesses/codex-cli.md) |
| Cursor | `aidlc config --harness cursor` | Open Cursor or run `agent` | `/aidlc` | [Cursor](docs/guide/harnesses/cursor.md) |
| opencode >= 1.17 | `aidlc config --harness opencode` | `opencode` | `/aidlc` | [opencode](docs/guide/harnesses/opencode.md) |
| GitHub Copilot CLI >= 1.0.74 / VS Code >= 1.130 | `aidlc config --harness copilot` | Copilot CLI or VS Code | `/aidlc` | [GitHub Copilot](docs/guide/harnesses/copilot.md) |

Model-provider setup belongs to the harness. Shipped project configuration
keeps the provider and model already selected by the user. `aidlc config
providers` can apply Amazon Bedrock settings on supported project surfaces or
record manual setup for other harnesses. Kiro CLI and Kiro IDE need no provider
answer because model access comes with Kiro. The methodology itself is
provider-independent.

## Recommended Model

AI-DLC works best with capable reasoning models. The current recommended model
is Claude Opus 4.8.

## Why AI-DLC

Ad-hoc AI coding loses context as projects grow. AI-DLC keeps requirements,
decisions, implementation, tests, and operational work connected through one
audited lifecycle:

- 5 phases and 33 stages from initialization through operation
- 14 agents: 11 domain experts, 2 reviewers, and an adaptive composer
- 11 workflow profiles for features, bug fixes, infrastructure, security,
  proofs of concept, enterprise delivery, and other common work
- Human approval gates and source-bound review evidence
- 108-event audit trail plus persistent state, team knowledge, and learned rules
- The same deterministic engine across every supported harness

Start with [Workflow Profiles](docs/guide/workflow-profiles.md) to compare
Classic, Express, and the focused workflows. See the
[AI-DLC Workflows 2.0 Specification](assets/AI-DLC-Workflows-2.0-Specification.pdf)
for the architecture and methodology.

> [!IMPORTANT]
> Generative AI can make mistakes. Review generated output and costs before
> acting on them. See the [AWS Responsible AI Policy](https://aws.amazon.com/ai/responsible-ai/policy/).

## Documentation

| Guide | Use it when |
| --- | --- |
| [Getting Started](docs/guide/01-getting-started.md) | Installing, configuring, and running your first workflow |
| [User Guide](docs/guide/00-introduction.md) | Using workflows, profiles, agents, knowledge, and approval gates |
| [Harness guides](docs/guide/harnesses/README.md) | Handling provider, trust, and runtime differences |
| [Install and Lifecycle](docs/guide/18-install-and-lifecycle.md) | Updating, pinning, installing offline, using mirrors, or uninstalling |
| [Harness Engineer Guide](docs/harness-engineering/00-overview.md) | Reshaping stages, agents, rules, sensors, and knowledge |
| [Development and Releases](DEVELOPERS.md) | Taking a PR through AI review, preview testing, and stable publication |
| [Developer Reference](docs/reference/00-overview.md) | Changing the engine, hooks, packaging, or tests |

## Repository Layout

- `core/` - hand-authored, harness-neutral methodology and engine
- `core/tools/` - 82 aidlc-*.ts engine and authoring tools
- `harness/<name>/` - thin, harness-specific manifests and integrations
- `plugins/<name>/` - optional AIDLC plugins
- `scripts/` - packaging, binary, installer, and release tooling
- `tests/` - smoke, unit, integration, and end-to-end tests
- `docs/` - user, harness-engineering, and developer documentation
- `dist/` and `dist-release/` - generated, ignored local outputs

Edit `core/` or `harness/<name>/`, never generated `dist*` output.

## Development

Install dependencies and generate every harness:

```bash
bun install --frozen-lockfile
bun scripts/package.ts
```

Useful commands:

```bash
bun scripts/package.ts <name>     # generate one harness
bun scripts/package.ts --check    # determinism guard
bun tests/run-tests.ts --ci       # smoke, unit, and integration
bun tests/run-tests.ts --release  # full release acceptance
```

See the [Contributing Guide](docs/reference/11-contributing.md) for the complete
development workflow and [Porting to a New Harness](docs/harness-engineering/09-porting-to-a-new-harness.md)
to add another runtime.

## Troubleshooting

Run `aidlc doctor` from the project root first. Common fixes:

| Symptom | Fix |
| --- | --- |
| `aidlc` is not found | On Windows, open a new terminal or use the direct command printed with [`-NoModifyPath`](docs/guide/18-install-and-lifecycle.md#windows-powershell). On Unix, apply the installer's PATH instruction. |
| Project/runtime version skew | Finish the active workflow, then run `aidlc config` |
| Codex hooks do not run | Trust the project hooks as described in the [Codex guide](docs/guide/harnesses/codex-cli.md) |
| Bedrock access fails | Enable the configured models and verify AWS credentials and region |
| Plugin stages disappear after refresh | Run `/aidlc plugin sync` |
| Refreshed skills do not take effect | Start a new harness session |

See [Troubleshooting](docs/guide/15-troubleshooting.md) for diagnostic and
recovery procedures.

## References

- [AWS AI-DLC blog post](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/)
- [AI-DLC Method Definition Paper](https://prod.d13rzhkk8cj2z0.amplifyapp.com/)
- [Roadmap](https://awslabs.github.io/aidlc-workflows/roadmap.html)
- [License](LICENSE)
