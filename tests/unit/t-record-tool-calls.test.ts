// covers: hook:aidlc-record-tool-calls
//
// The record-tool-calls hook builds the per-stage MCP/skill tool-call ledger the
// Salesforce gate sensor reads. It must classify only MCP tools, Skill calls,
// and SKILL.md reads, and it must never disturb the session (exit 0, no
// stdout) on any input.

import { describe, expect, test } from "bun:test";
import { classifyToolCall, run } from "../../core/hooks/aidlc-record-tool-calls.ts";

describe("record-tool-calls hook", () => {
  test("classifies MCP tool calls by server and tool", () => {
    expect(classifyToolCall("mcp__salesforce-dx__deploy_metadata", {})).toEqual({
      kind: "mcp",
      tool: "deploy_metadata",
      server: "salesforce-dx",
    });
  });

  test("classifies Skill calls, including plugin-qualified names", () => {
    expect(classifyToolCall("Skill", { skill: "platform-apex-generate" })).toEqual({
      kind: "skill",
      tool: "platform-apex-generate",
      server: null,
    });
    expect(classifyToolCall("Skill", { skill: "sf:experience-lwc-generate" })?.tool).toBe("experience-lwc-generate");
    expect(classifyToolCall("Skill", {})).toBeNull();
  });

  test("classifies only SKILL.md reads", () => {
    expect(classifyToolCall("Read", { file_path: "C:\\p\\.agents\\skills\\dx-code-analyzer-run\\SKILL.md" })?.tool).toBe(
      "dx-code-analyzer-run",
    );
    expect(classifyToolCall("Read", { file_path: "/p/src/index.ts" })).toBeNull();
    expect(classifyToolCall("Bash", { command: "ls" })).toBeNull();
  });

  test("is observe-only: malformed and unrelated payloads exit 0", async () => {
    expect(await run("not json")).toBe(0);
    expect(await run(JSON.stringify({ tool_name: "Write", tool_input: { file_path: "x" } }))).toBe(0);
  });
});
