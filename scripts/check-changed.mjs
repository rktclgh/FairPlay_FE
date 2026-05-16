import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const mode = process.argv[2] ?? "all";
const baseRef = process.env.GITHUB_BASE_REF || process.env.FAIRPLAY_CHECK_BASE || "develop";

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function resolveBase() {
  const refCandidates = baseRef.startsWith("origin/")
    ? [baseRef, "HEAD^"]
    : [`origin/${baseRef}`, baseRef, "HEAD^"];
  const candidates = process.env.GITHUB_EVENT_NAME === "push"
    ? ["HEAD^", ...refCandidates]
    : refCandidates;
  for (const candidate of candidates) {
    try {
      return git(["merge-base", candidate, "HEAD"]);
    } catch {
      // Try the next candidate. CI uses fetch-depth 0 so origin/base should exist.
    }
  }
  throw new Error(`Unable to resolve a diff base for ${baseRef}`);
}

function changedFiles() {
  const base = resolveBase();
  return git(["diff", "--name-only", "--diff-filter=ACMR", `${base}...HEAD`])
    .split("\n")
    .map((file) => file.trim())
    .filter(Boolean);
}

function run(command, args) {
  console.log(`$ ${command} ${args.join(" ")}`);
  execFileSync(command, args, { stdio: "inherit" });
}

const files = changedFiles();
const lintFiles = files.filter((file) => /\.(cjs|mjs|js|jsx|ts|tsx)$/.test(file));
const typecheckFiles = files.filter((file) => /\.(ts|tsx)$/.test(file));
const typecheckInputs = [...typecheckFiles];

if (typecheckFiles.length > 0 && existsSync("src/vite-env.d.ts") && !typecheckInputs.includes("src/vite-env.d.ts")) {
  typecheckInputs.unshift("src/vite-env.d.ts");
}

if ((mode === "lint" || mode === "all") && lintFiles.length > 0) {
  run("./node_modules/.bin/eslint", [...lintFiles]);
}

if ((mode === "typecheck" || mode === "all") && typecheckInputs.length > 0) {
  run("./node_modules/.bin/tsc", [
    "--noEmit",
    "--skipLibCheck",
    "--target",
    "ES2022",
    "--module",
    "ESNext",
    "--moduleResolution",
    "bundler",
    "--jsx",
    "react-jsx",
    "--strict",
    "--allowImportingTsExtensions",
    "--verbatimModuleSyntax",
    "false",
    "--noUnusedLocals",
    "false",
    "--noUnusedParameters",
    "false",
    ...typecheckInputs,
  ]);
}

if ((mode === "lint" && lintFiles.length === 0) || (mode === "typecheck" && typecheckFiles.length === 0)) {
  console.log(`No changed files for ${mode}.`);
}
