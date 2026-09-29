#!/usr/bin/env bash
# Install this checkout's AI-DLC + Salesforce specialization in a fresh project.
set -euo pipefail

usage() {
  printf '%s\n' \
    'Usage: bash scripts/setup-salesforce-claude.sh /path/to/salesforce-project [standard|express]' \
    'Requires Git, Bun, and a Salesforce DX Git project.' \
    'Existing .claude or aidlc directories are refused; no files are overwritten.' \
    'Run from a checkout of the Salesforce-specialized AI-DLC fork.'
}
fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
if [[ ${1:-} == --help || ${1:-} == -h ]]; then usage; exit 0; fi
[[ $# == 1 || $# == 2 ]] || { usage >&2; exit 2; }
case ${2:-standard} in
  standard|express) export SALESFORCE_INSTALL_SCOPE="salesforce-sdlc-${2:-standard}" ;;
  *) fail 'Choose standard or express.' ;;
esac

SCRIPT_DIR=${BASH_SOURCE[0]%/*}
SOURCE_DIR=$(cd -- "$SCRIPT_DIR/.." && pwd -P)
[[ -d $1 ]] || fail "Project directory does not exist: $1"
PROJECT_DIR=$(cd -- "$1" && pwd -P)
[[ $PROJECT_DIR != "$SOURCE_DIR" ]] || fail 'Choose your Salesforce project, not the framework checkout.'
command -v git >/dev/null || fail 'Install Git and reopen Bash.'
# Support the WinGet Bun installation used by Git Bash on Windows.
if ! command -v bun >/dev/null && command -v cygpath >/dev/null && [[ -n ${LOCALAPPDATA:-} ]]; then
  export PATH="$(cygpath -u "$LOCALAPPDATA")/Microsoft/WinGet/Links:$PATH"
fi
command -v bun >/dev/null || fail 'Install Bun (https://bun.sh), then reopen Bash.'
[[ -f $PROJECT_DIR/sfdx-project.json ]] || fail 'Target must contain sfdx-project.json.'
git -C "$PROJECT_DIR" rev-parse --show-toplevel >/dev/null 2>&1 || fail 'Target must be a Git repository.'
for item in .claude aidlc; do
  [[ ! -e $PROJECT_DIR/$item && ! -L $PROJECT_DIR/$item ]] ||
    fail "$PROJECT_DIR/$item already exists. This installer handles fresh installs; merge an existing installation separately."
done
[[ ! -L $PROJECT_DIR/.gitignore ]] || fail '.gitignore must not be a symbolic link.'
[[ ! -e $PROJECT_DIR/.gitignore || -f $PROJECT_DIR/.gitignore ]] || fail '.gitignore must be a regular file.'
[[ -f $SOURCE_DIR/plugins/salesforce-sdlc/.aidlc-plugin/plugin.json ]] || fail 'Salesforce plugin source is missing from this checkout.'

printf 'Building from %s (commit %s)\n' "$SOURCE_DIR" "$(git -C "$SOURCE_DIR" rev-parse --short HEAD)"
(
  cd -- "$SOURCE_DIR"
  bun install --frozen-lockfile
  bun scripts/package.ts claude
)

printf 'Installing into %s\n' "$PROJECT_DIR"
cp -R -- "$SOURCE_DIR/dist/claude/.claude" "$PROJECT_DIR/.claude"
cp -R -- "$SOURCE_DIR/dist/claude/aidlc" "$PROJECT_DIR/aidlc"
# Preserve the project's existing MCP configuration. The stock AWS MCP file
# is deliberately not copied: org/tool configuration belongs to the project.
if [[ -f $PROJECT_DIR/.gitignore ]]; then
  printf '\n# Salesforce AI-DLC runtime ignore rules\n' >> "$PROJECT_DIR/.gitignore"
  cat "$SOURCE_DIR/dist/claude/.gitignore" >> "$PROJECT_DIR/.gitignore"
else
  cp -- "$SOURCE_DIR/dist/claude/.gitignore" "$PROJECT_DIR/.gitignore"
fi

# Native Windows Bun needs native paths when reading environment variables;
# Git Bash does not translate arbitrary environment variables automatically.
PLUGIN_DIR="$SOURCE_DIR/dist/plugins/salesforce-sdlc/claude"
NATIVE_PROJECT=$PROJECT_DIR
NATIVE_PLUGIN=$PLUGIN_DIR
if command -v cygpath >/dev/null; then
  NATIVE_PROJECT=$(cygpath -m "$PROJECT_DIR")
  NATIVE_PLUGIN=$(cygpath -m "$PLUGIN_DIR")
fi
(
  cd -- "$PROJECT_DIR"
  unset CLAUDE_PLUGIN_ROOT PLUGIN_ROOT CLAUDE_PROJECT_DIR AIDLC_COMPILED_EXECUTABLE
  export AIDLC_PROJECT_DIR="$NATIVE_PROJECT" AIDLC_PLUGIN_ROOT="$NATIVE_PLUGIN"
  export AIDLC_HARNESS_DIR=.claude AIDLC_HARNESS_NAME=claude
  bun "$PLUGIN_DIR/hooks/compose.ts"
  # Compose can report a dropped contribution without a failing exit status.
  # Verify the resulting graph, scope runner, and agent guidance explicitly.
  bun -e '
    const fs = require("node:fs");
    const scope = process.env.SALESFORCE_INSTALL_SCOPE;
    const grid = JSON.parse(fs.readFileSync(".claude/tools/data/scope-grid.json", "utf8"));
    const stages = Object.values(grid[scope]?.stages ?? {});
    const expected = scope === "salesforce-sdlc-express" ? grid.express?.stages : grid["salesforce-sdlc-standard"]?.stages;
    if (stages.length !== 33 || !expected || Object.keys(expected).some(k => grid[scope].stages[k] !== expected[k]))
      throw new Error("Salesforce scope stage membership is incorrect.");
    if (scope === "salesforce-sdlc-standard" && stages.some(s => s !== "EXECUTE"))
      throw new Error("Full Salesforce scope must include all stages.");
    if (!fs.existsSync(`.claude/skills/${scope}/SKILL.md`))
      throw new Error("Salesforce scope runner was not generated.");
    if (!fs.existsSync(".claude/knowledge/aidlc-developer-agent/salesforce-sdlc.md"))
      throw new Error("Salesforce developer guidance is missing.");
    const path = ".claude/settings.json";
    const settings = JSON.parse(fs.readFileSync(path, "utf8"));
    settings.env = { ...settings.env, AWS_AIDLC_DEFAULT_SCOPE: scope };
    fs.writeFileSync(path, JSON.stringify(settings, null, 2) + "\n");
    console.log(`Verified ${scope}: ${stages.filter(s => s === "EXECUTE").length} selected stages; runner and developer guidance present.`);
  '
)

printf '\n%s\n' \
  'Installed. Salesforce is now the default AI-DLC scope in this project.' \
  'This is a direct project install; no Claude marketplace registration is needed.' \
  'Keep Bun on PATH for the runtime hooks.' \
  'Your existing .mcp.json was preserved. Configure Salesforce DX MCP separately if needed.' \
  'Next: open Claude in the project, review project/hook trust, and run:' \
  '  /aidlc --doctor' \
  "  /aidlc --scope $SALESFORCE_INSTALL_SCOPE" \
  'The current plugin doctor checks Codex MCP config; its MCP advisory is not a Claude connectivity test.'
printf '\ncd %q\nclaude\n' "$PROJECT_DIR"
if ! command -v claude >/dev/null; then
  printf '\nClaude CLI is not on PATH. Install Claude Code before the final launch.\n'
fi
