![1775192434934](image/AGENTS/1775192434934.png)<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Design system and Cursor rules

- **Full design doc**: [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) — typography, light/dark tokens (`--studio-*` + semantic), motion, where to add components.
- **Agent rules**: [.cursor/rules/](.cursor/rules/) — scoped `.mdc` files (Next App Router, components/shadcn, design tokens, repo conventions).
