// aidlc-sensor-salesforce-apex-antipatterns.ts — ADVISORY Apex anti-pattern
// scan (salesforce plugin).
//
// Fires on each written Apex class (.cls) or trigger (.trigger) and reports the
// platform anti-patterns that most often break in production: SOQL or DML
// inside loops, hardcoded record Ids, SeeAllData=true, a class with no sharing
// declaration, `without sharing`, empty catch blocks, and logic written
// directly in a trigger body. Deterministic and dependency-free: comments and
// string literals are blanked (line numbers preserved) before matching, so
// commented-out code and string contents never raise findings.
//
// Output: {"pass", "errorCount", "warningCount", "violations": [{file, line,
// rule, severity, message}]}. pass = errorCount === 0. Exit 0 for pass or
// fail; exit 1 only when the input cannot be read.
import { existsSync, readFileSync } from "node:fs";

type Severity = "error" | "warning";

interface Violation {
  file: string;
  line: number;
  rule: string;
  severity: Severity;
  message: string;
}

interface StringLiteral {
  value: string;
  index: number;
}

interface Stripped {
  code: string;
  strings: StringLiteral[];
}

function parseFilePath(argv: string[]): string | undefined {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--file-path" || argv[i] === "--output-path") return argv[i + 1];
  }
  return undefined;
}

function emit(file: string, violations: Violation[]): never {
  const errorCount = violations.filter((v) => v.severity === "error").length;
  const warningCount = violations.length - errorCount;
  process.stdout.write(
    `${JSON.stringify({ pass: errorCount === 0, errorCount, warningCount, violations, file })}\n`,
  );
  process.exit(0);
}

// Blank comments and string literal contents with spaces (newlines kept) so
// offsets and line numbers still line up with the original source.
export function stripApex(source: string): Stripped {
  const out = source.split("");
  const strings: StringLiteral[] = [];
  let i = 0;
  while (i < source.length) {
    const c = source[i];
    const next = source[i + 1];
    if (c === "/" && next === "/") {
      while (i < source.length && source[i] !== "\n") out[i++] = " ";
    } else if (c === "/" && next === "*") {
      while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) {
        if (source[i] !== "\n") out[i] = " ";
        i++;
      }
      if (i < source.length) {
        out[i] = " ";
        out[i + 1] = " ";
        i += 2;
      }
    } else if (c === "'") {
      const start = i;
      let value = "";
      i++;
      while (i < source.length && source[i] !== "'" && source[i] !== "\n") {
        if (source[i] === "\\" && i + 1 < source.length) {
          value += source[i + 1];
          out[i] = " ";
          out[i + 1] = " ";
          i += 2;
          continue;
        }
        value += source[i];
        out[i] = " ";
        i++;
      }
      strings.push({ value, index: start });
      i++;
    } else {
      i++;
    }
  }
  return { code: out.join(""), strings };
}

function lineOf(source: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < source.length; i++) if (source[i] === "\n") line++;
  return line;
}

function matchingClose(code: string, openIndex: number, open: string, close: string): number {
  let depth = 0;
  for (let i = openIndex; i < code.length; i++) {
    if (code[i] === open) depth++;
    else if (code[i] === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return code.length - 1;
}

function skipSpace(code: string, from: number): number {
  let i = from;
  while (i < code.length && /\s/.test(code[i])) i++;
  return i;
}

// Body ranges of every for / while / do loop. A loop header's parentheses are
// excluded, so a SOQL for-loop (`for (Account a : [SELECT ...])`) is not
// reported — that is the recommended pattern.
export function loopBodies(code: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  const keyword = /\b(for|while|do)\b/gi;
  for (const m of code.matchAll(keyword)) {
    const kw = m[1].toLowerCase();
    let i = skipSpace(code, (m.index ?? 0) + m[0].length);
    if (kw !== "do") {
      if (code[i] !== "(") continue;
      i = skipSpace(code, matchingClose(code, i, "(", ")") + 1);
    }
    if (code[i] === "{") {
      ranges.push([i, matchingClose(code, i, "{", "}")]);
    } else if (kw !== "do") {
      const end = code.indexOf(";", i);
      if (end !== -1) ranges.push([i, end]);
    }
  }
  return ranges;
}

const SOQL = /\[\s*(SELECT|FIND)\b/gi;
const DML_STATEMENT = /\b(insert|update|upsert|delete|undelete|merge)\s+(?!into\b)[A-Za-z_[(]/gi;
const DATABASE_CALL = /\bDatabase\s*\.\s*(insert|update|upsert|delete|undelete|merge|query|queryWithBinds|countQuery|getQueryLocator)\s*\(/gi;
const SALESFORCE_ID = /^[a-zA-Z0-9]{15}(?:[a-zA-Z0-9]{3})?$/;

export function looksLikeRecordId(value: string): boolean {
  if (!SALESFORCE_ID.test(value)) return false;
  // Key prefixes are 3 chars and real Ids carry many digits (pod, reserved,
  // and sequence characters); words and API names do not.
  const digits = value.replace(/[^0-9]/g, "").length;
  return /^[0a][0-9A-Za-z]{2}/.test(value) && digits >= 5;
}

export function scanApex(file: string, source: string): Violation[] {
  const { code, strings } = stripApex(source);
  const isTrigger = file.toLowerCase().endsWith(".trigger");
  const violations: Violation[] = [];
  const add = (index: number, rule: string, severity: Severity, message: string): void => {
    violations.push({ file, line: lineOf(source, index), rule, severity, message });
  };
  const loops = loopBodies(code);
  const inLoop = (index: number): boolean => loops.some(([s, e]) => index > s && index < e);

  for (const m of code.matchAll(SOQL)) {
    if (inLoop(m.index ?? 0)) {
      add(m.index ?? 0, "soql-in-loop", "error", "SOQL query inside a loop; query once before the loop and use a Map keyed by Id.");
    }
  }
  for (const m of code.matchAll(DML_STATEMENT)) {
    if (inLoop(m.index ?? 0)) {
      add(m.index ?? 0, "dml-in-loop", "error", `DML '${m[1]}' inside a loop; collect records in a List and run one DML after the loop.`);
    }
  }
  for (const m of code.matchAll(DATABASE_CALL)) {
    if (inLoop(m.index ?? 0)) {
      const isQuery = /query|locator/i.test(m[1]);
      add(
        m.index ?? 0,
        isQuery ? "soql-in-loop" : "dml-in-loop",
        "error",
        `Database.${m[1]} inside a loop; bulkify by moving it outside the loop.`,
      );
    }
  }
  for (const s of strings) {
    if (looksLikeRecordId(s.value)) {
      add(s.index, "hardcoded-id", "error", `Hardcoded record Id '${s.value}'; use Custom Metadata, a query by DeveloperName, or Schema describe.`);
    }
  }
  for (const m of code.matchAll(/SeeAllData\s*=\s*true/gi)) {
    add(m.index ?? 0, "see-all-data", "error", "@IsTest(SeeAllData=true) makes tests depend on org data; create test data with a factory.");
  }
  for (const m of code.matchAll(/catch\s*\([^)]*\)\s*\{\s*\}/g)) {
    add(m.index ?? 0, "empty-catch", "warning", "Empty catch block swallows the exception; log it, rethrow, or surface it with addError.");
  }

  if (!isTrigger) {
    const decl = /\b(class|interface|enum)\s+\w+/i.exec(code);
    if (decl && decl[1].toLowerCase() === "class") {
      const before = code.slice(0, decl.index);
      const lineStart = before.lastIndexOf("\n") + 1;
      const prefix = code.slice(lineStart, decl.index);
      const isTest = /@IsTest\b/i.test(before);
      if (!isTest && !/\bsharing\b/i.test(prefix)) {
        add(decl.index, "missing-sharing", "error", "Class has no sharing declaration; declare 'with sharing' (or 'inherited sharing' with a reason).");
      }
    }
    for (const m of code.matchAll(/\bwithout\s+sharing\b/gi)) {
      add(m.index ?? 0, "without-sharing", "warning", "'without sharing' bypasses record access; record the justification in the security model.");
    }
  } else {
    const hasLogic = /\[\s*SELECT\b/i.test(code) || DML_STATEMENT.test(code) || /\bfor\s*\(/i.test(code);
    DML_STATEMENT.lastIndex = 0;
    if (hasLogic) {
      add(0, "logic-in-trigger", "warning", "Trigger contains queries, DML, or loops; delegate to a handler class (one trigger per object).");
    }
  }
  return violations.sort((a, b) => a.line - b.line || a.rule.localeCompare(b.rule));
}

function main(): void {
  const file = parseFilePath(process.argv.slice(2));
  if (!file) {
    process.stderr.write("aidlc-sensor-salesforce-apex-antipatterns: --file-path is required\n");
    process.exit(1);
  }
  const lower = file.toLowerCase();
  if (!(lower.endsWith(".cls") || lower.endsWith(".trigger")) || !existsSync(file)) emit(file, []);
  let source: string;
  try {
    source = readFileSync(file, "utf-8");
  } catch (err) {
    process.stderr.write(
      `aidlc-sensor-salesforce-apex-antipatterns: cannot read ${file}: ${err instanceof Error ? err.message : String(err)}\n`,
    );
    process.exit(1);
  }
  emit(file, scanApex(file, source));
}

if (import.meta.main) main();
