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
  for (const harness of ["claude", "codex"] as const) {
    test(`Express composes with core Express membership and demo guidance in ${harness}`, () => {
      const fixture = composePluginFixture({ plugin: "salesforce-sdlc", harness });
      try {
        expect(fixture.dropLogs).toBe("");
        const root = join(fixture.projectDir, `.${harness}`);
        const grid = JSON.parse(readFileSync(join(root, "tools/data/scope-grid.json"), "utf8"));
        expect(grid["salesforce-sdlc-express"].stages).toEqual(grid.express.stages);
        expect(Object.values(grid["salesforce-sdlc-express"].stages).filter(s => s === "EXECUTE")).toHaveLength(10);
        const skills = harness === "codex" ? join(fixture.projectDir, ".agents/skills") : join(root, "skills");
        expect(existsSync(join(skills, "salesforce-sdlc-express/SKILL.md"))).toBe(true);
        const stage = readFileSync(join(root, "aidlc-common/stages/construction/code-generation.md"), "utf8");
        expect(stage).toContain("or `salesforce-sdlc-express`");
        expect(stage).toContain("Do not require artifacts from skipped design");
      } finally {
        rmSync(dirname(fixture.projectDir), { recursive: true, force: true });
      }
    });
  }
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
