# Campaign management

## Scope

- **List** — `/dashboard/campaign`: search, sort, status filter, row actions (view results, edit, delete, interrupt when running).
- **Create / edit** — `/dashboard/campaign/create`, `/dashboard/campaign/[id]/edit`: CSV upload, schedule, call window, hangup/switch/transfer/LLM evaluation settings; agent from deployed list, phone from SIP list.
- **Results** — `/dashboard/campaign/[id]`: summary metrics, donut chart, call history table with search/filter, downloads, redial modal → prefilled create.
- **Call detail** — Phase 1: modal with metadata + transcript + structured output from `GET /sip-numbers/call-history/:call_id`. Events/Latency via debugging APIs deferred.

## Backend contract

See [White_label_api.md](../White_label_api.md) — Campaign, deployed agents list, metadata/system-evaluations, SIP call-history detail.

## Implementation checklist

| Area | Location |
|------|----------|
| Types | `lib/types/api.ts` |
| HTTP | `lib/services/campaign.ts`, `metadata.ts`; extend `deployed-agent.ts`, `sip-number.ts` |
| Query | `lib/query-keys.ts`, `hooks/use-campaigns.ts`, `use-campaign-mutations.ts`, `use-campaign-details.ts`, `use-campaign-summary.ts`, `use-campaign-call-history.ts`, `use-deployed-agents-list.ts`, `use-system-evaluations.ts` |
| Context | `lib/contexts/redial-campaign-context.tsx`, wired in `components/providers/app-providers.tsx` |
| Utils | `lib/utils/campaign.ts`, `campaign-form-validation.ts`, `campaign-form-population.ts`, `campaign-details.ts`, `file-download.ts` |
| UI | `components/campaign/*`, `app/(dashboard)/dashboard/campaign/**` |
| Mocks | `mocks/handlers/campaign.ts`, `mocks/data/campaigns.ts`; sip handler extension for call detail |
| Nav | `components/dashboard-sidebar.tsx` |

## Product limits

CSV max size / row count: document in White-label; [Agora docs](https://docs.agora.io/en/conversational-ai/studio/deploy/campaign) cite 25 MB and 50,000 rows — backend may enforce a different cap.

## Parity vs convo-ai-studio

- **Call detail sheet:** Transcript (and metadata) via `GET /sip-numbers/call-history/:call_id`. **Events / Latency** tabs (debugging task APIs) are **not** implemented (phase 1).
- **Call analysis (redesign):** Post-call data extraction toggle, data points (`custom_evaluations` + system variables from `GET /metadata/system-evaluations`), and overall success criteria — see `components/campaign/campaign-call-analysis-card.tsx`. Convo-ai-studio used separate toggles; custom app follows the redesign mock.
- **List filters:** Search by keyword only in v1 (no advanced filter panel).
