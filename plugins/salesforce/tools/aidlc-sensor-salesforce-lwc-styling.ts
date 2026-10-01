// aidlc-sensor-salesforce-lwc-styling.ts — ADVISORY SLDS 2 styling check for
// Lightning Web Component CSS (salesforce plugin).
//
// Fires on each written LWC stylesheet (lwc/<bundle>/<bundle>.css) and reports
// styling that breaks under SLDS 2 / the Cosmos theme:
//   error   hardcoded-color      a hex/rgb/hsl color outside a var() fallback
//   error   reassigned-hook      a declaration that assigns --slds-g-* (reference, never assign)
//   error   component-hook       --slds-c-* (SLDS 1 component hooks; unsupported in SLDS 2)
//   error   private-hook         --_slds-* / --slds-s-* (private hooks)
//   warning deprecated-token     a primary var(--lwc-*) / var(--sds-*) reference
//   warning important            !important
//   warning layer                @layer in component CSS
// A color or deprecated token used as the FALLBACK of a var() is allowed: that
// is the documented SLDS 1 -> 2 migration pattern.
//
// Output: {"pass", "errorCount", "warningCount", "violations": [...]}.
import { existsSync, readFileSync } from "node:fs";

type Severity = "error" | "warning";

interface Violation {
  file: string;
  line: number;
  rule: string;
  severity: Severity;
  message: string;
}

function parseFilePath(argv: string[]): string | undefined {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--file-path" || argv[i] === "--output-path") return argv[i + 1];
  }
  return undefined;
}

function emit(file: string, violations: Violation[]): never {
  const errorCount = violations.filter((v) => v.severity === "error").length;
  process.stdout.write(
    `${JSON.stringify({ pass: errorCount === 0, errorCount, warningCount: violations.length - errorCount, violations, file })}\n`,
  );
  process.exit(0);
}

// Blank /* comments */ so they never raise findings; keep newlines.
function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
}

function lineOf(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text[i] === "\n") line++;
  return line;
}

// Replace the FALLBACK part of every var(--name, fallback) with spaces so
// colors and tokens used as fallbacks are ignored, while the primary custom
// property name stays visible. Nested var() inside a fallback are blanked too.
export function blankVarFallbacks(css: string): string {
  const out = css.split("");
  const re = /var\(/g;
  for (const m of css.matchAll(re)) {
    const start = (m.index ?? 0) + m[0].length;
    let depth = 1;
    let comma = -1;
    let i = start;
    for (; i < css.length && depth > 0; i++) {
      if (css[i] === "(") depth++;
      else if (css[i] === ")") depth--;
      else if (css[i] === "," && depth === 1 && comma === -1) comma = i;
    }
    const end = i - 1;
    if (comma !== -1) {
      for (let j = comma; j < end; j++) if (out[j] !== "\n") out[j] = " ";
    }
  }
  return out.join("");
}

export function scanCss(file: string, source: string): Violation[] {
  const css = stripComments(source);
  const visible = blankVarFallbacks(css);
  const violations: Violation[] = [];
  const add = (index: number, rule: string, severity: Severity, message: string): void => {
    violations.push({ file, line: lineOf(source, index), rule, severity, message });
  };

  for (const m of css.matchAll(/(^|[;{\s])(--slds-g-[\w-]+)\s*:/g)) {
    add((m.index ?? 0) + m[1].length, "reassigned-hook", "error", `${m[2]} is assigned; global styling hooks may only be referenced with var().`);
  }
  for (const m of css.matchAll(/--slds-c-[\w-]+/g)) {
    add(m.index ?? 0, "component-hook", "error", `${m[0]} is an SLDS 1 component-level hook, unsupported in SLDS 2; use a --slds-g-* global hook.`);
  }
  for (const m of css.matchAll(/--(?:_slds-|slds-s-)[\w-]+/g)) {
    add(m.index ?? 0, "private-hook", "error", `${m[0]} is a private hook; never reference or set it.`);
  }
  for (const m of visible.matchAll(/var\(\s*(--(?:lwc|sds)-[\w-]+)/g)) {
    add(m.index ?? 0, "deprecated-token", "warning", `${m[1]} is deprecated; reference a --slds-g-* hook and keep the old value as the fallback.`);
  }
  // Only inspect declaration values, never selectors (an id selector like #main
  // is not a color).
  for (const decl of visible.matchAll(/:([^;{}]*)(?=[;}])/g)) {
    const valueStart = (decl.index ?? 0) + 1;
    for (const m of decl[1].matchAll(/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\s*\(/g)) {
      add(valueStart + (m.index ?? 0), "hardcoded-color", "error", `Hardcoded color '${m[0].replace(/\s*\($/, "(")}'; use var(--slds-g-color-*, <fallback>).`);
    }
  }
  for (const m of css.matchAll(/!important/g)) {
    add(m.index ?? 0, "important", "warning", "!important overrides theme and density changes; restructure the selector instead.");
  }
  for (const m of css.matchAll(/@layer\b/g)) {
    add(m.index ?? 0, "layer", "warning", "@layer is not supported in LWC component CSS.");
  }
  return violations.sort((a, b) => a.line - b.line || a.rule.localeCompare(b.rule));
}

function main(): void {
  const file = parseFilePath(process.argv.slice(2));
  if (!file) {
    process.stderr.write("aidlc-sensor-salesforce-lwc-styling: --file-path is required\n");
    process.exit(1);
  }
  const normalized = file.replaceAll("\\", "/");
  if (!/\/lwc\/[^/]+\/[^/]+\.css$/i.test(normalized) || !existsSync(file)) emit(file, []);
  let source: string;
  try {
    source = readFileSync(file, "utf-8");
  } catch (err) {
    process.stderr.write(
      `aidlc-sensor-salesforce-lwc-styling: cannot read ${file}: ${err instanceof Error ? err.message : String(err)}\n`,
    );
    process.exit(1);
  }
  emit(file, scanCss(file, source));
}

if (import.meta.main) main();
