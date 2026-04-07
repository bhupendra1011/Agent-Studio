# Plans

This folder holds **design and implementation plans** for custom-studio-app so we can reuse them when spinning up similar white-label or parity projects.

- Add new plans here as self-contained Markdown files (one feature or epic per file when practical).
- **Before iterating on a plan in chat**, create or update the corresponding file here so the repo stays the source of truth for “what we decided.”
- Reference code in **convo-ai-studio** only as a source to copy patterns from; **all shipped changes for this app live under `custom-studio-app/`**.

## Index

| Document | Summary |
|----------|---------|
| [White_label_api.md](../White_label_api.md) | **BE contract** for white-label / micro-SaaS: logical APIs per screen, payloads, planned Campaign/SIP — complements `api.text` |
| [custom-studio-agents-parity.md](./custom-studio-agents-parity.md) | Agents tab: MergedAgent parity, MSW mock mode, env-driven Studio API base, Create Agent POST — standalone port from convo-ai-studio patterns |
| [agent-editor-page.md](./agent-editor-page.md) | Agent editor: `/dashboard/agents/[pipelineId]/edit`, tabs (Prompt / Models / Advanced / Actions / Code), Test sheet, Deploy dialog, types and services |
| [integration-tab.md](./integration-tab.md) | Integration hub + Credentials / Knowledge bases / MCP servers: Studio EN APIs, React Query, MSW, dashboard routes |
| [phone-numbers.md](./phone-numbers.md) | Phone numbers (SIP): outbound-only `/dashboard/phone-numbers`, no inbound/agent column, White_label §9 |
