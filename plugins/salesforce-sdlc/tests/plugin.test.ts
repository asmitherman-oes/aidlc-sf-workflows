import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  composePluginFixture,
  validatePluginContent,
  walkMarkdownFiles,
} from "../../../tests/harness/plugin-kit.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = join(HERE, "..");

describe("salesforce-sdlc plugin content", () => {
  test("passes the reusable plugin validator", () => {
    expect(validatePluginContent(PLUGIN_ROOT)).toEqual([]);
  });

  test("specializes core agents without shipping replacement agents", () => {
    expect(walkMarkdownFiles(join(PLUGIN_ROOT, "knowledge")).length).toBe(13);
    expect(walkMarkdownFiles(join(PLUGIN_ROOT, "agents"))).toEqual([]);
  });

  test("keeps the core graph and contributes to every non-initialization stage", () => {
    expect(walkMarkdownFiles(join(PLUGIN_ROOT, "stages"))).toEqual([]);
    expect(walkMarkdownFiles(join(PLUGIN_ROOT, "contributions")).length).toBe(30);
  });

  test("composes into Codex and writes its scope runner under .agents/skills", () => {
    const fixture = composePluginFixture({
      plugin: "salesforce-sdlc",
      harness: "codex",
    });
    try {
      expect(fixture.dropLogs).toBe("");
      const runner = join(
        fixture.projectDir,
        ".agents",
        "skills",
        "salesforce-sdlc-standard",
        "SKILL.md",
      );
      expect(existsSync(runner)).toBe(true);
      expect(readFileSync(runner, "utf-8")).toContain(
        "name: salesforce-sdlc-standard",
      );
      const scopeGrid = JSON.parse(
        readFileSync(
          join(fixture.projectDir, ".codex", "tools", "data", "scope-grid.json"),
          "utf-8",
        ),
      ) as Record<string, { stages?: Record<string, string> }>;
      const stages = scopeGrid["salesforce-sdlc-standard"]?.stages ?? {};
      expect(Object.keys(stages)).toHaveLength(33);
      expect(new Set(Object.values(stages))).toEqual(new Set(["EXECUTE"]));
    } finally {
      rmSync(dirname(fixture.projectDir), { recursive: true, force: true });
    }
  });
});
