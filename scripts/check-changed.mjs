import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const mode = process.argv[2] ?? "all";
const baseRef = process.env.GITHUB_BASE_REF || process.env.FAIRPLAY_CHECK_BASE || "develop";
const isPushEvent = process.env.GITHUB_EVENT_NAME === "push";
const isPullRequestEvent = process.env.GITHUB_EVENT_NAME === "pull_request";

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function refExists(ref) {
  try {
    execFileSync("git", ["rev-parse", "--verify", "--quiet", ref], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function resolveBase() {
  const baseCandidates = baseRef.startsWith("origin/")
    ? [baseRef]
    : [`origin/${baseRef}`, baseRef];
  const fallbackBranchCandidates = unique([
    "origin/develop",
    "develop",
    "origin/main",
    "main",
  ]).filter((candidate) => !baseCandidates.includes(candidate));
  const candidates = unique([
    ...(isPushEvent ? ["HEAD^"] : []),
    ...baseCandidates,
    ...fallbackBranchCandidates,
    ...(!isPullRequestEvent ? ["HEAD^"] : []),
  ]);

  for (const candidate of candidates) {
    try {
      if (!refExists(candidate)) {
        continue;
      }
      const base = git(["merge-base", candidate, "HEAD"]);
      console.log(`Using changed-file base ${candidate} (${base.slice(0, 12)})`);
      return base;
    } catch {
      // Try the next candidate.
    }
  }

  if (isPullRequestEvent) {
    throw new Error(`Unable to resolve PR diff base for ${baseRef}. Ensure actions/checkout uses fetch-depth: 0.`);
  }

  for (const candidate of ["HEAD^"]) {
    try {
      if (!refExists(candidate)) {
        continue;
      }
      return git(["merge-base", candidate, "HEAD"]);
    } catch {
      // Try the next fallback.
    }
  }

  throw new Error(`Unable to resolve a diff base for ${baseRef}`);
}

function changedFiles() {
  const base = resolveBase();
  const committed = git(["diff", "--name-only", "--diff-filter=ACMR", `${base}...HEAD`]);
  const staged = git(["diff", "--cached", "--name-only", "--diff-filter=ACMR"]);
  const workingTree = git(["diff", "--name-only", "--diff-filter=ACMR"]);
  return [...new Set([committed, staged, workingTree]
    .join("\n")
    .split("\n")
    .map((file) => file.trim())
    .filter(Boolean))];
}

function run(command, args) {
  console.log(`$ ${command} ${args.join(" ")}`);
  execFileSync(command, args, { stdio: "inherit" });
}

function normalizePath(file) {
  return file.replace(/\\/g, "/").replace(/^\.\//, "");
}

function runTypecheck(command, args, changedFileSet) {
  console.log(`$ ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, { encoding: "utf8" });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (result.status === 0) {
    if (output) process.stdout.write(output);
    return;
  }

  const diagnosticPattern = /^(.+?\.(?:cjs|mjs|js|jsx|ts|tsx))\(\d+,\d+\): error TS\d+:/;
  const diagnosticLines = output.split(/\r?\n/).filter((line) => diagnosticPattern.test(line));
  const changedDiagnostics = diagnosticLines.filter((line) => {
    const match = line.match(diagnosticPattern);
    return match ? changedFileSet.has(normalizePath(match[1])) : false;
  });

  if (changedDiagnostics.length > 0 || diagnosticLines.length === 0) {
    if (output) process.stdout.write(output);
    process.exit(result.status ?? 1);
  }

  const externalFiles = [...new Set(diagnosticLines.map((line) => (
    normalizePath(line.match(diagnosticPattern)?.[1] ?? "")
  )).filter(Boolean))].sort();

  console.warn(`Typecheck reported ${diagnosticLines.length} diagnostics outside changed files; changed-file gate passed.`);
  for (const file of externalFiles.slice(0, 30)) {
    console.warn(`- ${file}`);
  }
  if (externalFiles.length > 30) {
    console.warn(`...and ${externalFiles.length - 30} more files.`);
  }
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
  runTypecheck("./node_modules/.bin/tsc", [
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
    "false",
    "--strictNullChecks",
    "false",
    "--noImplicitAny",
    "false",
    "--allowImportingTsExtensions",
    "--verbatimModuleSyntax",
    "false",
    "--noUnusedLocals",
    "false",
    "--noUnusedParameters",
    "false",
    ...typecheckInputs,
  ], new Set(typecheckFiles.map(normalizePath)));
}

if ((mode === "lint" && lintFiles.length === 0) || (mode === "typecheck" && typecheckFiles.length === 0)) {
  console.log(`No changed files for ${mode}.`);
}
