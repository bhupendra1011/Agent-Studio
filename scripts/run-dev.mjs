#!/usr/bin/env node
/**
 * Runs Next.js dev (`pnpm exec next dev`).
 * Mock/MSW: set NEXT_PUBLIC_MOCK_ENABLED=true in .env.local — same env var as Vercel (no separate APP_MODE).
 * Optional: PORT (e.g. PORT=3000) to pass `-p` to next dev.
 */
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const port = process.env.PORT;
const args = ["next", "dev", ...(port ? ["-p", String(port)] : [])];

console.log(`→ pnpm exec ${args.join(" ")}`);

const child = spawn("pnpm", ["exec", ...args], {
  cwd: root,
  env: process.env,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));