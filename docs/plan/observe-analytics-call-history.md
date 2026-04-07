# Observe: Analytics & Call history

Tracks implementation of the **Observe** area in custom-studio-app, aligned with [Agora Studio Observe](https://docs.agora.io/en/conversational-ai/studio/observe/analytics) and [Call history](https://docs.agora.io/en/conversational-ai/studio/observe/call-history).

## Backend contract

Documented under **§9 SIP** in [`../White_label_api.md`](../White_label_api.md):

- `GET /sip-numbers/all/call-history/overview`
- `GET /sip-numbers/all/call-history/analysis`
- `GET /sip-numbers/all/call-history`
- Existing `GET /sip-numbers/call-history/:call_id` for the detail sheet

## UI routes

| Route | Purpose |
|-------|---------|
| `/dashboard/analytics` | Filters, KPI cards, status donut, task success & transfer line charts |
| `/dashboard/call-history` | Searchable table; row opens call detail sheet; campaign column links to `/dashboard/campaign/[id]` |

## Phase 1 (shipped)

- MVP filters (period preset, agents, campaigns, inbound/outbound) on Analytics.
- Global call history: default 90-day window, search, direction, sort by timestamp/duration, pagination.
- MSW mocks for all three global SIP endpoints.

## Optional next steps

- Custom date range on Analytics (calendar).
- Call history: advanced filters / customise columns (parity with convo-ai-studio).
- URL-synced filter state on call history.
