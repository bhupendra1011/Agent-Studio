# Phone numbers (SIP) — `/dashboard/phone-numbers`

## Product scope

- **Outbound-only:** caller IDs + SIP trunk settings for campaigns and outbound APIs. No inbound calls, no “associated agent” column, no inbound agent bind flows in the UI.
- **API contract:** `CreateSipNumberRequest` / `UpdateSipNumberRequest` use `config.outbound_configs` only; see [`docs/White_label_api.md`](../White_label_api.md) §9. Inbound-related routes in [`api.text`](../api.text) are intentionally out of scope for this app’s BE handoff.

## Scope (shipped)

- **Route:** `app/(dashboard)/dashboard/phone-numbers/page.tsx` → `/dashboard/phone-numbers`.
- **Data:** Studio EN `axiosStudio` under `/sip-numbers` (list, create, update, delete, edit-status before delete). [`lib/types/api.ts`](../lib/types/api.ts) (SIP block), [`lib/services/sip-number.ts`](../lib/services/sip-number.ts), [`hooks/use-phone-numbers.ts`](../hooks/use-phone-numbers.ts).
- **UI:** Table (phone, display name, vendor, SIP domain, updated, actions) + add/edit sheet — [`components/phone-numbers/`](../components/phone-numbers/).
- **Mocks:** [`mocks/handlers/sip-number.ts`](../mocks/handlers/sip-number.ts), [`mocks/data/sip-numbers.ts`](../mocks/data/sip-numbers.ts).

## Reference

- **convo-ai-studio:** `/studio/mobile-numbers` was a richer parity reference; this app intentionally drops inbound/agent UX.
- **Backend contract:** [`docs/White_label_api.md`](../White_label_api.md) §9.

## Follow-ups

- Campaign UI: `phone_number_id` selector from this list.
- Optional: SIP call-history / analytics routes from `api.text` if product later needs reporting (still outbound-oriented).
