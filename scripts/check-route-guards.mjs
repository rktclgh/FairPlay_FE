import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const appPath = resolve("src/App.tsx");
const source = readFileSync(appPath, "utf8");

const protectedRouteRules = [
  { prefix: "/host", guard: "HostRouteGuard" },
  { prefix: "/admin_dashboard", guard: "AdminRouteGuard" },
  { prefix: "/booth-admin", guard: "BoothAdminRouteGuard" },
];

const routePattern = /<Route\s+path="([^"]+)"\s+element=\{([^]*?)\}\s*\/>/g;
const violations = [];
const routesByPath = new Map();

for (const match of source.matchAll(routePattern)) {
  const [, path, element] = match;
  const line = source.slice(0, match.index).split("\n").length;

  if (!routesByPath.has(path)) {
    routesByPath.set(path, []);
  }
  routesByPath.get(path).push({ line, element });

  const rule = protectedRouteRules.find(({ prefix }) => (
    path === prefix || path.startsWith(`${prefix}/`)
  ));

  if (rule && !element.includes(rule.guard)) {
    violations.push(`${appPath}:${line} ${path} must be wrapped with ${rule.guard}`);
  }
}

for (const [path, routes] of routesByPath) {
  if (routes.length <= 1) {
    continue;
  }

  const rule = protectedRouteRules.find(({ prefix }) => (
    path === prefix || path.startsWith(`${prefix}/`)
  ));

  if (rule) {
    const lines = routes.map(({ line }) => line).join(", ");
    violations.push(`${appPath}:${lines} duplicate protected route declaration for ${path}`);
  }
}

if (violations.length > 0) {
  console.error("Route guard check failed:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("Route guard check passed.");
