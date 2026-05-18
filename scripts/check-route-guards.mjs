import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

const appPath = resolve("src/App.tsx");
const source = readFileSync(appPath, "utf8");
const sourceFile = ts.createSourceFile(appPath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

const protectedRouteRules = [
  { prefix: "/host", guard: "HostRouteGuard" },
  { prefix: "/admin_dashboard", guard: "AdminRouteGuard" },
  { prefix: "/booth-admin", guard: "BoothAdminRouteGuard" },
];

const violations = [];
const routesByPath = new Map();

function getAttribute(node, name) {
  return node.attributes.properties.find((property) => (
    ts.isJsxAttribute(property) && property.name.getText(sourceFile) === name
  ));
}

function getAttributeText(node, name) {
  const attribute = getAttribute(node, name);
  if (!attribute?.initializer) {
    return null;
  }

  if (ts.isStringLiteral(attribute.initializer)) {
    return attribute.initializer.text;
  }

  if (ts.isJsxExpression(attribute.initializer) && attribute.initializer.expression) {
    return attribute.initializer.expression.getText(sourceFile);
  }

  return null;
}

function getRouteNodes(node, routes = []) {
  const isRoute = (
    (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) &&
    node.tagName.getText(sourceFile) === "Route"
  );

  if (isRoute) {
    routes.push(node);
  }

  ts.forEachChild(node, (child) => getRouteNodes(child, routes));
  return routes;
}

for (const routeNode of getRouteNodes(sourceFile)) {
  const path = getAttributeText(routeNode, "path");
  if (!path) {
    continue;
  }

  const element = getAttributeText(routeNode, "element") ?? "";
  const line = sourceFile.getLineAndCharacterOfPosition(routeNode.getStart(sourceFile)).line + 1;

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
