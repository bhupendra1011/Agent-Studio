#!/usr/bin/env node
/**
 * Reads APP_MODE from .env.local (or env): DESIGN → mock + port 3000, CODE → plain dev.
 */
import { readFileSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const envLocal = resolve(root, ".env.local");

let mode = process.env.APP_MODE;
if (!mode && existsSync(envLocal)) {
  const raw = readFileSync(envLocal, "utf8");
  const m = raw.match(/^APP_MODE\s*=\s*['"]?(\w+)/m);
  if (m) mode = m[1];
}

const isDesign = (mode || "").trim().toUpperCase() === "DESIGN";

const env = {
  ...process.env,
  ...(isDesign
    ? {
        NEXT_PUBLIC_MOCK_ENABLED: "true",
        PORT: process.env.PORT || "3000",
      }
    : {}),
};

const args = isDesign
  ? ["next", "dev", "-p", env.PORT || "3000"]
  : ["next", "dev"];

console.log(
  `APP_MODE=${mode || "CODE (default)"} → pnpm exec ${args.join(" ")}`
);

const child = spawn("pnpm", ["exec", ...args], {
  cwd: root,
  env,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
