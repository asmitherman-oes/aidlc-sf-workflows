# Salesforce SDLC specialization

This plugin keeps AI-DLC's five phases, 33 stages, scopes, approvals, and core
agent roster intact while specializing their behavior for Salesforce DX
projects. It contributes:

- a comprehensive `salesforce-sdlc-standard` scope covering every core stage;
- mandatory Salesforce methodology for the existing product, architecture,
  development, quality, security, delivery, and operations agents;
- stage-specific instructions at the decisions where Salesforce differs most
  from generic software development; and
- a read-only doctor check for Salesforce DX project, CLI, and Codex MCP setup.

The plugin intentionally ships no replacement stages or agents. Salesforce DX
MCP remains project configuration rather than a bundled authenticated service;
teams explicitly allow only the org aliases and toolsets needed by each repo.

## Install for Claude with Bash

Clone this fork at `feat/salesforce-specialization`, then run from its root:

```bash
bash scripts/setup-salesforce-claude.sh /absolute/path/to/salesforce-project
```

On Windows use Git Bash paths, for example `/d/Projects/MySalesforceProject`.
Quote paths containing spaces. The target must contain `sfdx-project.json` and
belong to a Git repository. Install Git and Bun first; Claude Code is required
to launch the workflow. Dependency installation requires network access.

The script builds this checkout, installs the Claude runtime, directly composes
the Salesforce extension, checks all 33 scope stages and the generated runner,
and sets Salesforce as the project default scope. No marketplace installation
is necessary. It preserves `.mcp.json`, appends runtime ignore rules, and refuses
existing `.claude` or `aidlc` paths. It is a fresh-install helper, not an updater;
if interrupted after copying, inspect the partial installation before retrying.
It does not authenticate to Salesforce or deploy metadata.

Open Claude in the target project, review project/hook trust, and run
`/aidlc --doctor`, then `/aidlc --scope salesforce-sdlc-standard`. Configure
Salesforce DX MCP separately. The current plugin doctor's MCP check is
Codex-specific; its advisory does not establish Claude MCP connectivity.

## Validate and build for Codex

From the AI-DLC repository root:

```powershell
bun core/tools/aidlc-plugin-validate.ts plugins/salesforce-sdlc
bun core/tools/aidlc-plugin-build.ts plugins/salesforce-sdlc codex
bun scripts/package.ts codex
```

The Codex plugin projection is written to
`plugins/salesforce-sdlc/dist/codex/`. The AI-DLC Codex runtime is written to
`dist/codex/`. Generated `dist/` trees are ignored and must not be edited.

## Test with Codex CLI

First configure the base AI-DLC Codex runtime in a Salesforce DX Git repository:

```powershell
Set-Location <salesforce-project>
aidlc config --harness codex
```

Then build and install this checkout's local plugin projection:

```powershell
Set-Location <aidlc-fork>
bun scripts/package.ts codex
codex plugin marketplace add .\dist\plugins\salesforce-sdlc\codex
codex plugin add aidlc-salesforce-sdlc@aidlc-plugins
```

Start a fresh `codex` session in the Salesforce repository and approve the
one-time project/plugin hook trust prompts. In Codex, run:

```text
$aidlc --doctor
$aidlc --scope salesforce-sdlc-standard
```

The doctor expects Salesforce CLI to be available and reports a missing
project-level `[mcp_servers.salesforce_dx]` table as advisory. Keep Salesforce
DX MCP org aliases and toolsets explicitly scoped to the sandboxes that the
repository is allowed to access.

## Initial safe test

Install the base runtime and this plugin into a disposable Salesforce DX Git
repository connected to a sandbox. Enable the `salesforce-sdlc-standard` scope
and begin with a read-only org/repository analysis. Do not grant production org
access during the initial validation.
