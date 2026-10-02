// PostToolUse hook (Claude Code; matcher `mcp__.*|Skill|Read`): record the
// platform-expert calls a stage makes into a per-stage tool-call ledger.
//
// Why. Stages require platform experts to do the underlying work - Salesforce
// DX MCP tools (`mcp__<server>__run_code_analyzer`, ...) and Salesforce agent
// skills (`platform-apex-generate`, ...). Prose alone cannot prove an agent
// used them. Claude Code reports every tool call (including subagent calls) to
// PostToolUse, so this hook writes a deterministic, agent-independent record
// that a gate-fired sensor can check before the approval gate opens.
//
// What is recorded, one JSON line per call, to
// `<record>/.aidlc-engine/tool-calls/<stage>.jsonl`:
//   - every MCP tool call (`kind: "mcp"`, `tool` = the name after the server);
//   - every Skill tool call (`kind: "skill"`, `tool` = the skill name);
//   - every Read of a `.../skills/<name>/SKILL.md` file (`kind: "skill"`), the
//     other way an agent loads a skill.
// Other Read calls return before any engine import, so the hook stays cheap.
//
// Contract. This hook OBSERVES only - it never alters Claude Code's flow,
// prints nothing on stdout, never throws, and exits 0 in every case.

import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

export interface ToolCallRecord {
  ts: string;
  stage: string;
  unit: string | null;
  kind: "mcp" | "skill";
  tool: string;
  server: string | null;
  session: string | null;
  agent: string | null;
}

const SKILL_FILE = /(?:^|[\\/])skills[\\/]([A-Za-z0-9._-]+)[\\/]SKILL\.md$/;

// Classify one PostToolUse payload. Returns null for calls this hook ignores.
export function classifyToolCall(
  toolName: string,
  toolInput: unknown,
): Pick<ToolCallRecord, "kind" | "tool" | "server"> | null {
  const mcp = /^mcp__(.+?)__(.+)$/.exec(toolName);
  if (mcp) return { kind: "mcp", tool: mcp[2], server: mcp[1] };
  const input = toolInput !== null && typeof toolInput === "object"
    ? (toolInput as Record<string, unknown>)
    : {};
  if (toolName === "Skill") {
    const skill = typeof input.skill === "string" ? input.skill
      : typeof input.name === "string" ? input.name : "";
    // Plugin-qualified skills arrive as `<plugin>:<skill>`; keep the skill name.
    const name = skill.split(":").pop()?.trim() ?? "";
    return name ? { kind: "skill", tool: name, server: null } : null;
  }
  if (toolName === "Read") {
    const path = typeof input.file_path === "string" ? input.file_path : "";
    const m = SKILL_FILE.exec(path);
    return m ? { kind: "skill", tool: m[1], server: null } : null;
  }
  return null;
}

export async function run(input: string): Promise<number> {
  try {
    let payload: Record<string, unknown>;
    try {
      const raw: unknown = JSON.parse(input);
      if (raw === null || typeof raw !== "object") return 0;
      payload = raw as Record<string, unknown>;
    } catch {
      return 0;
    }
    const toolName = typeof payload.tool_name === "string" ? payload.tool_name : "";
    const call = classifyToolCall(toolName, payload.tool_input);
    if (!call) return 0;

    const lib = await import("../tools/aidlc-lib.ts");
    const projectDir = lib.resolveProjectDirFromHook(import.meta.url);
    const workflow = lib.enterHookWorkflow(projectDir, payload.session_id);
    try {
      if (lib.hookStandsOutside(workflow)) return 0;
      if (!existsSync(lib.stateFilePath(projectDir))) return 0;
      const stateContent = lib.readStateFile(projectDir);
      const currentStage = lib.getField(stateContent, "Current Stage") ?? "";
      const marker = lib.readActiveDirectiveMarker(projectDir, stateContent);
      const stage = marker?.stage ?? currentStage;
      if (!stage || stage === "none") return 0;
      const record: ToolCallRecord = {
        ts: lib.isoTimestamp(),
        stage,
        unit: marker?.unit ?? null,
        ...call,
        session: typeof payload.session_id === "string" ? payload.session_id : null,
        agent: typeof payload.agent_id === "string" ? payload.agent_id : null,
      };
      const dir = join(lib.engineDir(projectDir), "tool-calls");
      mkdirSync(dir, { recursive: true });
      appendFileSync(join(dir, `${stage}.jsonl`), `${JSON.stringify(record)}\n`, "utf-8");
    } finally {
      workflow.restore();
    }
  } catch {
    // Observe-only: a recording failure must never disturb the session.
  }
  return 0;
}
