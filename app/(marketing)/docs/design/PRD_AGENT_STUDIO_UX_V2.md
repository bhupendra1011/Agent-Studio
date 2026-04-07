# PRD: Agent Studio — UX improvements (v2)

> **Purpose**: This document specifies nine UX improvements to the white-label Agent Studio wrapper app. It is written for Claude Code to implement directly against the existing codebase.
>
> **Repo**: `https://github.com/bhupendra1011/Agent-Studio`
>
> **Live**: `https://my-custom-agent-studio.vercel.app/`
>
> **Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn (base-nova), next-auth, @tanstack/react-query, MSW for mocks, Lucide icons
>
> **Design system**: `docs/DESIGN_SYSTEM.md` — uses `--studio-*` brand tokens (teal/mauve), semantic shadcn tokens, Outfit (body) + Syne (headings) + Geist Mono (code), motion classes `studio-reveal-*`

---

## Current state

The app currently has these pages after login (role: admin), organized into the same Build → Deploy → Observe sections as Agora Studio:

| Section | Page | Route | Status |
|---------|------|-------|--------|
| — | Overview | `/dashboard` | Working — placeholder dashboard |
| Build | Agents | `/dashboard/agents` | Working — list with search, CRUD, status badges, create agent modal |
| Build | Integration | `/dashboard/integration` | Working — Credentials, Knowledge Bases, MCPs tabs |
| Deploy | Phone Numbers | `/dashboard/phone-numbers` | Working — list + add side panel with SIP config |
| Deploy | Campaign | `/dashboard/campaign` | Working — campaign list + create campaign form |
| Observe | Call History | `/dashboard/call-history` | Working — call records table with filters |
| Observe | Analytics | `/dashboard/analytics` | Working — KPI cards + charts (Call Status, Task Success, Transfer Rate) |
| — | Settings Panel | `/dashboard/settings` | Basic settings page |

The sidebar navigation matches the Agora Studio layout with section headers (Build, Deploy, Observe). The app proxies API calls to Agora's backend via `proxy.ts`. Authentication uses next-auth with username/password (admin/admin for POC).

---

## Problem → Solution mapping

| # | Problem | Solution | Priority |
|---|---------|----------|----------|
| 1 | New users land on an empty dashboard and don't know what to do | Setup wizard onboarding | P0 |
| 2 | Campaign creation is one giant scroll form | Campaign stepper wizard (4 steps) | P0 |
| 3 | Agent create → configure → test → publish is disconnected | Agent editor with inline test panel + status bar | P1 |
| 4 | Phone number import requires SIP knowledge | Provider-guided phone setup | P1 |
| 5 | Analytics shows data but no actionable next steps | Actionable analytics dashboard | P2 |
| 6 | Admin vs regular user role isn't clear in UI | Role-based sidebar + admin impersonation | P1 |
| 7 | Call history is a flat table with no way to drill into calls | Call history with transcript viewer + audio player | P1 |
| 8 | Overview page is an empty placeholder | Overview dashboard with stats, activity feed, quick actions | P1 |
| 9 | No way to see campaign results after it runs | Campaign detail view with results, call log, outcome charts | P1 |

---

## Feature 1: Setup wizard onboarding

### Goal
First-time users complete a guided 4-step flow that gets them from zero to a working agent with a phone number — before they ever see the main dashboard.

### User flow
```
Login → detect first-time user (no agents exist) → redirect to /dashboard/setup
  Step 1: Connect providers (LLM, ASR, TTS API keys)
  Step 2: Create first agent (pick template → name → system prompt)
  Step 3: Import phone number (pick SIP provider → enter number → auto-fill SIP config)
  Step 4: Test call (simulated call with live transcript)
  → Done screen → redirect to /dashboard with checklist widget
```

### Technical spec

#### New files to create
```
app/dashboard/setup/
  page.tsx                  — server component, redirect if setup already complete
  setup-wizard.tsx          — client component, main wizard shell
  steps/
    step-credentials.tsx    — provider picker + API key inputs
    step-agent.tsx          — template grid + name/prompt form
    step-phone.tsx          — SIP provider picker + guided config
    step-test.tsx           — test call simulation with transcript
    step-done.tsx           — completion screen with quick actions
  components/
    progress-rail.tsx       — horizontal step indicator (4 dots + connecting lines)
    password-input.tsx      — input with show/hide toggle
    provider-button.tsx     — selectable provider card
    template-card.tsx       — agent template selection card
```

#### State management
- Use React `useState` at the wizard level. No need for global state — the wizard is self-contained.
- On completion, call a POST to persist a `setup_complete` flag (can be stored in localStorage for POC, or a user metadata API endpoint).
- Each step validates before allowing "Continue": Step 1 requires at least one LLM key, Step 2 requires template + agent name, Step 3 requires provider + phone number.

#### Data flow
- Step 1: POST credentials to `/api/proxy/integration/credentials` (existing Agora API)
- Step 2: POST agent to `/api/proxy/agents` (existing Agora API)
- Step 3: POST phone number to `/api/proxy/phone-numbers` (existing Agora API)
- Step 4: Uses the agent created in Step 2 for a simulated test call (mock for POC — no actual Agora call API needed)

#### Design details
- Dark background matching existing app (`var(--studio-surface)`)
- Progress rail at top: 4 circles with connecting lines, teal fill for completed steps
- Each step has: icon (Lucide) + title + subtitle + form content + Back/Continue buttons
- "Skip setup — I'll configure later" link below buttons on every step
- Transition between steps: 200ms fade + translateY
- Template grid: 2-column layout with colored dot indicator per template
- SIP provider picker: 2x2 grid (Twilio, Telnyx, Exotel, Other SIP)
- Advanced SIP fields hidden behind `<details>` accordion
- Test call: animated waveform visualization, live transcript scroll, post-call health summary badge
- Done screen: 2x2 quick-action card grid linking to campaigns, agent editor, analytics, phone numbers

#### Dashboard checklist widget
After setup completes, show a persistent checklist on the Overview page:
```
Setup progress                           [4/4 complete ✓]
  ✓ Connect AI providers
  ✓ Create your first agent
  ✓ Import a phone number
  ✓ Test your agent
  ○ Launch your first campaign            [→ Go]
  ○ Review analytics after 10+ calls      [→ Go]
```
This widget disappears once all items including post-setup tasks are checked off.

---

## Feature 2: Campaign stepper wizard

### Goal
Replace the single long-scroll campaign creation form with a 4-step wizard that validates at each step and shows a review before launch.

### User flow
```
/dashboard/campaign → Click "Create Campaign" →
  Step 1: Campaign details (name, select agent, select phone number)
  Step 2: Upload contacts (CSV upload + preview table + validation)
  Step 3: Schedule & config (timing + hang-up config + transcript/recording toggles + transfer settings)
  Step 4: Review & launch (summary of all settings + "Schedule Campaign" / "Launch Now" buttons)
```

### Technical spec

#### New files to create
```
app/dashboard/campaign/
  new/
    page.tsx                — server component wrapper
    campaign-wizard.tsx     — client component, 4-step shell
    steps/
      step-details.tsx      — name + agent dropdown + phone dropdown
      step-contacts.tsx     — CSV upload + preview table + validation errors
      step-schedule.tsx     — timing radio (now/later) + call config accordion sections
      step-review.tsx       — read-only summary of all steps + launch buttons
```

#### Step 1: Campaign details
- Campaign name: text input with validation (required, min 3 chars)
- Phone number: dropdown populated from `/api/proxy/phone-numbers` — show number + display name
- AI Agent: dropdown populated from `/api/proxy/agents?status=published` — only show published agents
- If no phone numbers exist, show inline CTA: "No phone numbers yet — import one now" linking to `/dashboard/phone-numbers`
- If no published agents exist, show inline CTA: "No published agents yet — create and publish one" linking to `/dashboard/agents`

#### Step 2: Upload contacts
- Drag-and-drop zone + file picker button (accept `.csv` only)
- "Download template" link that generates a sample CSV with columns: `phone_number,name,appointment_time`
- After upload: show preview table (first 5 rows) with column headers detected from CSV
- Validation: check `phone_number` column exists, validate E.164 format, show error count badge
- Show total row count and file size
- Max: 25MB / 50,000 rows (show error if exceeded)

#### Step 3: Schedule & configuration
- Launch timing: radio group — "Launch now" (with warning icon) / "Schedule for later"
- If scheduled: date picker + time picker + timezone dropdown
- Call window: start time + end time (respect recipient timezone)
- Collapsible sections (use `<details>` or accordion component):
  - Hang-up configuration: End of conversation toggle, Voicemail detection toggle, Silence hangup toggle + timeout input (default 120s), Max call duration input (default 300s), Ring duration input (default 30s)
  - Transfer to human: toggle + phone number input (E.164) + transfer criteria textarea
  - Transcripts & recording: Store transcripts toggle (default on), Store call recording toggle (default on)
  - Post-call analysis: Post call data extraction toggle (default off)

#### Step 4: Review & launch
- Read-only summary cards for each previous step
- "Edit" button on each card to jump back to that step
- Two action buttons: "Schedule campaign" (primary teal) / "Save as draft" (secondary)
- Compliance notice: brief TCPA reminder text below buttons

#### Campaign status dashboard (enhancement to existing list)
After creating a campaign, the campaign list page should show:
- Status badges: Draft / Scheduled / In Progress / Completed / Paused
- Progress bar for in-progress campaigns: "234 / 1,000 calls completed"
- Quick actions per campaign: Pause, Resume, View Results, Delete
- Inline sparkline showing answer rate over time (if data available)

---

## Feature 3: Agent editor with inline test panel + status bar

### Goal
The agent editor should feel like an IDE — edit on the left, test on the right, status at the top.

### User flow
```
/dashboard/agents → Click agent row → /dashboard/agents/[id]/edit
  Top bar: Agent name + status badge (Draft/Published/Paused) + "Publish" / "Pause" button + last published timestamp
  Left panel (60%): Tabbed editor — Prompt | Models | Advanced | Actions | Custom Config
  Right panel (40%): Test panel — Start Call button + live transcript + call health indicators
```

### Technical spec

#### New files to create
```
app/dashboard/agents/[id]/
  edit/
    page.tsx                — server component, fetch agent data
    agent-editor.tsx        — client component, split-panel layout
    panels/
      prompt-panel.tsx      — system prompt textarea + greeting + failure message + dynamic variables info
      models-panel.tsx      — LLM/ASR/TTS provider + model dropdowns + voice picker
      advanced-panel.tsx    — VAD, turn detection, interruption mode, hang-up config
      actions-panel.tsx     — transfer to number, custom tools
      config-panel.tsx      — raw JSON config editor (monaco or textarea)
    components/
      agent-status-bar.tsx  — top bar with name, status, publish/pause controls
      test-panel.tsx        — right-side call test with waveform + transcript
      unsaved-changes.tsx   — warning banner when edits exist but not saved
```

#### Status bar behavior
- Shows agent name (editable inline) + status badge
- Badge states: `Draft` (gray), `Published` (green), `Paused` (amber)
- "Publish agent" button: only enabled when agent has required fields (system prompt, at least one model configured)
- "Pause agent" button: only visible when status is Published
- "Unsaved changes" indicator: yellow dot next to agent name when form is dirty
- Last published timestamp: "Published 2 hours ago" or "Never published"

#### Test panel behavior
- "Start Call" button initiates a test session via Agora API (or mock for POC)
- During call: show animated waveform visualization (CSS-only, 4 bars)
- Live transcript: scrolling list of agent/caller turns with timestamps
- After call: show summary — duration, latency, success/failure
- "Try again" button to re-test
- Panel is collapsible on mobile (slides in from right as a sheet)

#### Auto-save
- Debounce form changes (500ms) and auto-save to API
- Show "Saving..." → "Saved" indicator in status bar
- On navigation away with unsaved changes, show confirmation dialog

---

## Feature 4: Provider-guided phone number setup

### Goal
Hide SIP complexity behind provider selection. Auto-fill SIP trunk address and show provider-specific instructions.

### User flow
```
/dashboard/phone-numbers → Click "+ Add Phone Number" →
  Side panel opens:
    Step 1: Pick provider (Twilio / Telnyx / Exotel / Other SIP)
    Step 2: Auto-filled form — phone number + display name + (SIP address pre-filled) + optional credentials
    Step 3: Verify — make a test ring to confirm the number works
```

### Technical spec

#### Modify existing files
The phone number add panel already exists as a side panel (Sheet component). Modify it to:

1. Add a provider selection grid at the top (4 cards in 2x2)
2. On provider select, auto-fill `sipTrunkAddress`:
   - Twilio → `sip.twilio.com`
   - Telnyx → `sip.telnyx.com`
   - Exotel → show text input (varies by region)
   - Other → show all fields as manual entry
3. Show provider-specific help text below the form:
   - Twilio: "Find your SIP trunk credentials in the Twilio Console under Elastic SIP Trunking → Trunks"
   - Telnyx: "Get your SIP credentials from the Telnyx Portal under SIP Connections"
4. Hide advanced fields (SIP username, password, transport protocol) behind a `<details>` accordion labeled "Advanced SIP settings"
5. Default transport to UDP (most common)

#### Number health check
After saving a phone number, show a health status in the list:
- Green dot: "Verified" — number is registered and reachable
- Yellow dot: "Unverified" — number saved but not tested
- Red dot: "Error" — SIP registration failed

For POC, this can be mocked — all new numbers show "Unverified" with a "Verify now" button that simulates a test and changes to "Verified" after 2 seconds.

---

## Feature 5: Actionable analytics dashboard

### Goal
Transform the analytics page from passive charts to an intelligence dashboard that tells users what to do next.

### User flow
```
/dashboard/analytics →
  Top: KPI cards (Total Calls, Answer Rate, Call Duration, Answered Calls) — each with trend indicator
  Middle: Insights bar — 2-3 contextual recommendations based on data
  Bottom: Charts (Call Status Distribution donut, Task Success Rate line, Transfer Rate line)
  Filters: Date range, Agent filter, Call type (Inbound/Outbound), Campaign filter
```

### Technical spec

#### Modify existing analytics page

1. **KPI cards** (already exist based on PDF screenshots): Add trend arrows with percentage change vs previous period. Green up-arrow for improvements, red down-arrow for degradation.

2. **Insights bar** (new): A horizontal card section between KPIs and charts that shows contextual recommendations:
   ```
   Component: InsightsBar
   Location: components/analytics/insights-bar.tsx

   Logic (computed from analytics data):
   - If answer_rate < 50%: "Your answer rate is below 50%. Consider adjusting call windows to business hours in your contacts' time zones."
   - If voicemail_rate > 30%: "30% of calls hit voicemail. Try enabling voicemail detection to save agent minutes."
   - If transfer_rate > 20%: "High transfer rate detected. Review your agent's prompt to handle more scenarios directly."
   - If task_success_rate < 70%: "Task success is below target. Review recent call transcripts to identify common failure patterns."
   - If no issues detected: "Your agents are performing well. Consider launching a new campaign to increase volume."

   Each insight card has:
   - Severity icon (info/warning/success)
   - One-line insight text
   - Action link (e.g., "→ Edit call windows" links to campaign settings)
   ```

3. **Per-agent analytics tab** (new tab in agent editor):
   ```
   Route: /dashboard/agents/[id]/edit (tab: "Analytics")
   Shows: That specific agent's call volume, answer rate, avg duration, top failure reasons
   Filtered automatically by agent ID
   ```

---

## Feature 6: Role-based sidebar + admin impersonation

### Goal
Admin users see ISV/user management pages. Regular users see only the studio pages. Admin can impersonate a regular user's view.

### User flow
```
Admin login → sees sidebar:
  Admin Portal
    ISV Management
    User Management
    Account Association
  ─── separator ───
  Studio (preview)
    Overview
    Agents
    Phone Numbers
    Campaign
    Analytics
    Call History
    Integration
    Settings

Regular user login → sees sidebar:
  Studio
    Overview
    Agents
    Phone Numbers
    Campaign
    Analytics
    Call History
    Integration
    Settings
```

### Technical spec

#### New files to create
```
app/dashboard/admin/
  layout.tsx                — admin-only layout wrapper with role check
  isv/
    page.tsx                — ISV list page
    [id]/
      page.tsx              — ISV detail/edit page
    new/
      page.tsx              — Create ISV page
  users/
    page.tsx                — User list page
    [id]/
      page.tsx              — User detail/edit page
    new/
      page.tsx              — Create user page
  association/
    page.tsx                — Account association management

components/
  sidebar/
    sidebar-nav.tsx         — modified to accept role and render different items
    impersonation-bar.tsx   — yellow banner at top when impersonating
```

#### Sidebar modifications
- Read user role from session (`next-auth` session object)
- Role is either `admin` or `user`
- Admin sidebar has two sections separated by a visual divider
- Admin can click any user row → "View as this user" button → sets an `impersonating` flag in session/cookie
- When impersonating: show a yellow top banner: "Viewing as [user name] — [Exit impersonation]"
- During impersonation, sidebar switches to the regular user view and all API calls use the impersonated user's Agora account credentials

#### ISV management pages

**ISV list page** (`/dashboard/admin/isv`):
- Table columns: ISV Name, Agora Account ID, Project/App ID, Created Date, Status, Actions
- Actions: Edit, Delete, View Users
- "+ Create ISV" button top-right
- Search bar for filtering by name

**ISV create/edit page** (`/dashboard/admin/isv/new` and `/dashboard/admin/isv/[id]`):
- Form fields: ISV Name (required), Contact Email, Contact Phone, Company URL
- "Create Agora Account" button: calls Agora REST API to provision account → returns Account ID
- "Create Project" button: calls Agora REST API to create project under that account → returns App ID
- Status indicators showing provisioning progress: Account Created ✓ → Project Created ✓
- Save button persists ISV record to local database/mock

**User list page** (`/dashboard/admin/users`):
- Table columns: Username, Email, Role (admin/user), Associated ISV, Associated Agora Account, Last Login, Actions
- Actions: Edit, Delete, View As
- "+ Create User" button top-right

**User create/edit page** (`/dashboard/admin/users/new` and `/dashboard/admin/users/[id]`):
- Form fields: Username (required), Email (required), Password (for create only), Role dropdown (admin/user)
- "Associate with Agora Account" section: dropdown of existing ISV accounts → auto-fills Agora Account ID + App ID
- This association determines which Agora project the user sees when they log into the studio

**Account association page** (`/dashboard/admin/association`):
- Visual matrix/table showing: User → ISV → Agora Account → Project
- Drag-and-drop or dropdown to reassign users to different accounts
- Bulk operations: select multiple users → assign to ISV

---

## Feature 7: Call history with transcript viewer

### Goal
Call history should let users quickly scan outcomes and drill into any call to read the transcript and hear the recording.

### User flow
```
/dashboard/call-history →
  Filters bar: Date range, Agent, Status (Answered/No Answer/Failed/Voicemail), Campaign
  Table: Phone Number, Agent, Duration, Status, Outcome, Date, Actions
  Click row → side panel with full transcript + audio player + call metadata
```

### Technical spec

#### Enhance existing call history page
```
app/dashboard/call-history/
  page.tsx                    — existing, enhance with filters + drill-down
  components/
    call-filters.tsx          — filter bar (date range, agent dropdown, status multi-select, campaign dropdown)
    call-table.tsx            — sortable table with pagination
    call-detail-panel.tsx     — Sheet/side panel with transcript + audio + metadata
    transcript-viewer.tsx     — scrolling transcript with speaker labels + timestamps
```

#### Call table columns
- Phone number (masked: +1***8860)
- Agent name + avatar
- Duration (formatted: 2m 34s)
- Status badge: Answered (green), No Answer (blue), Voicemail (purple), Failed (red), Transferred (amber)
- Outcome: Task Success / Task Failed / Transferred / Hung Up
- Date/time (relative: "2 hours ago" with tooltip for absolute)
- Actions: View transcript, Play recording, Delete

#### Call detail side panel
Opens as a Sheet (already available in `components/ui/sheet.tsx`) when clicking a row:
- Header: Phone number + agent name + duration + status badge
- Metadata cards: Call start time, Ring duration, Talk duration, Latency (avg), Recording available toggle
- Transcript viewer: Scrolling list of turns, each with:
  - Speaker label (Agent / Caller) with colored dot
  - Timestamp (relative to call start)
  - Text content
  - Sentiment indicator (positive/neutral/negative) — derived from post-call analysis if available
- Audio player: simple play/pause bar with waveform visualization (if recording stored)
- Post-call data: If extraction was enabled, show structured key-value pairs (e.g., "Appointment confirmed: Yes", "Preferred time: Tuesday 2pm")

#### Filters behavior
- All filters use URL search params so filtered views are shareable/bookmarkable
- Default: Last 7 days, All agents, All statuses
- Real-time count: "Showing 234 of 2,385 calls"

---

## Feature 8: Overview dashboard

### Goal
The Overview page should be a command center — at a glance, see system health, recent activity, and next actions.

### User flow
```
/dashboard →
  For first-time users: Setup wizard checklist (see Feature 1)
  For active users:
    Row 1: Quick stats — Active agents, Phone numbers, Active campaigns, Total calls (24h)
    Row 2: Recent activity feed + Quick actions grid
    Row 3: Call volume chart (last 7 days) + Top performing agents table
```

### Technical spec

#### Modify existing overview page
```
app/dashboard/
  page.tsx                    — existing, replace placeholder with real dashboard
  components/
    quick-stats.tsx           — 4 metric cards in a row
    activity-feed.tsx         — recent events list (agent published, campaign launched, etc.)
    quick-actions.tsx         — 2x2 grid of action cards
    call-volume-chart.tsx     — sparkline or bar chart of calls per day
    top-agents-table.tsx      — mini table of top 5 agents by call volume
    setup-checklist.tsx       — persistent checklist widget (from Feature 1)
```

#### Quick stats cards
- Active agents: count of agents with status=Published, with link to agents page
- Phone numbers: count of imported numbers, with link to phone numbers page
- Active campaigns: count of campaigns with status=in_progress, with link to campaigns page
- Total calls (24h): count from analytics API, with percentage change vs yesterday

#### Activity feed
- Recent events in reverse chronological order (last 10):
  - "Sales Qualifier v1 published" — 2 hours ago
  - "Q2 Outreach campaign launched" — 5 hours ago
  - "+15541361716 imported" — yesterday
  - "NPS Survey agent created" — 2 days ago
- Each event has: icon, description text, relative timestamp
- For POC: populate from a combination of agents/campaigns/phone-numbers API calls, sorted by updatedAt

#### Quick actions grid
- Create agent → `/dashboard/agents` (with create modal trigger)
- Launch campaign → `/dashboard/campaign/new`
- Import number → `/dashboard/phone-numbers` (with add panel trigger)
- View analytics → `/dashboard/analytics`

---

## Feature 9: Campaign detail & results view

### Goal
After a campaign runs, users need to see results — how many calls succeeded, answer rate, common outcomes, and the ability to drill into individual calls.

### User flow
```
/dashboard/campaign → Click campaign row → /dashboard/campaign/[id]
  Header: Campaign name + status badge + pause/resume controls
  Stats row: Total contacts, Calls made, Answer rate, Avg duration, Task success rate
  Progress bar: visual progress (e.g., 750 / 1,000 calls completed)
  Tabs: Results | Call log | Settings
    Results tab: outcome breakdown chart + time-series chart of calls per hour
    Call log tab: filtered call history table (same as Feature 7 but scoped to this campaign)
    Settings tab: read-only view of campaign config (agent, phone, timing, hang-up rules)
```

### Technical spec

#### New files to create
```
app/dashboard/campaign/[id]/
  page.tsx                    — server component, fetch campaign data
  campaign-detail.tsx         — client component, tabs + stats
  tabs/
    results-tab.tsx           — outcome charts + summary
    call-log-tab.tsx          — reuses call-table component from Feature 7, filtered by campaign ID
    settings-tab.tsx          — read-only config summary
  components/
    campaign-header.tsx       — name + status + controls
    campaign-stats.tsx        — metric cards row
    campaign-progress.tsx     — visual progress bar with label
    outcome-chart.tsx         — donut/bar chart of Answered/No Answer/Voicemail/Failed
```

#### Campaign header behavior
- Campaign name (large, font-heading)
- Status badge: Draft (gray), Scheduled (blue), In Progress (teal, animated pulse), Completed (green), Paused (amber)
- Controls based on status:
  - Scheduled → "Launch now" + "Edit" + "Delete"
  - In Progress → "Pause" + "View calls"
  - Paused → "Resume" + "Delete"
  - Completed → "Duplicate" + "Export results" + "Delete"

#### Stats cards
- Total contacts: from campaign.totalContacts
- Calls completed: from campaign.completedCalls with progress fraction
- Answer rate: (answeredCalls / completedCalls) × 100, with trend vs previous campaigns
- Avg call duration: from analytics API filtered by campaign
- Task success rate: from analytics API filtered by campaign

---

## Implementation order

Execute features in this order. Each feature should be a separate branch/PR.

```
Phase 1 (P0 — foundation):
  1. Feature 6: Role-based sidebar     ← needed first, sets up routing structure
  2. Feature 1: Setup wizard           ← onboarding for new users
  3. Feature 2: Campaign stepper       ← biggest UX improvement for daily use

Phase 2 (P1 — polish):
  4. Feature 4: Phone number setup     ← simplifies a friction point
  5. Feature 3: Agent editor + test    ← most complex, but builds on existing page
  6. Feature 5: Actionable analytics   ← data-dependent, do last

Phase 3 (P1 — complete flows):
  7. Feature 7: Call history           ← transcript drill-down
  8. Feature 8: Overview dashboard     ← command center for active users
  9. Feature 9: Campaign detail        ← post-campaign results view
```

---

## Shared conventions for Claude Code

### File placement
- Shared primitives → `components/ui/` (install via `npx shadcn@latest add`)
- Feature components → `components/{feature-name}/`
- Page routes → `app/dashboard/{feature}/page.tsx`
- Client components get `"use client"` at top

### Styling
- Use `--studio-*` tokens for branded surfaces (teal accent, mauve secondary)
- Use semantic Tailwind classes (`bg-background`, `text-foreground`) for generic UI
- Use `font-heading` (Syne) for page titles, default `font-sans` (Outfit) for everything else
- Use `studio-reveal` animation classes for page/section enter transitions
- Respect `prefers-reduced-motion` — use `studio-*` animation classes which auto-disable

### Data
- All Agora API calls go through the existing proxy (`/api/proxy/*`)
- Use `@tanstack/react-query` for data fetching (already installed)
- Use MSW mocks in `mocks/` directory for new endpoints during development
- Form validation with `zod` (already installed)

### Components already available
Use these before creating new ones: Avatar, Badge, Button, Card, Dialog, DropdownMenu, Input, Label, ScrollArea, Separator, Sheet

### Testing
- No unit test framework is currently set up — don't add one
- Test manually via the dev server (`pnpm dev`)
- Use MSW handlers in `mocks/` for new API endpoints

---

## Appendix A: Agora API endpoints reference

These are the Agora Studio REST API endpoints the app proxies to. Use these for the real API calls:

| Action | Method | Endpoint |
|--------|--------|----------|
| List agents | GET | `/api/proxy/agents` |
| Create agent | POST | `/api/proxy/agents` |
| Update agent | PUT | `/api/proxy/agents/{id}` |
| Delete agent | DELETE | `/api/proxy/agents/{id}` |
| Publish agent | POST | `/api/proxy/agents/{id}/publish` |
| Pause agent | POST | `/api/proxy/agents/{id}/pause` |
| List phone numbers | GET | `/api/proxy/phone-numbers` |
| Add phone number | POST | `/api/proxy/phone-numbers` |
| Delete phone number | DELETE | `/api/proxy/phone-numbers/{id}` |
| List campaigns | GET | `/api/proxy/campaigns` |
| Create campaign | POST | `/api/proxy/campaigns` |
| Pause campaign | POST | `/api/proxy/campaigns/{id}/pause` |
| Resume campaign | POST | `/api/proxy/campaigns/{id}/resume` |
| Get analytics | GET | `/api/proxy/analytics` |
| Get call history | GET | `/api/proxy/call-history` |
| Get call detail | GET | `/api/proxy/call-history/{id}` |
| Get call transcript | GET | `/api/proxy/call-history/{id}/transcript` |
| Get call recording | GET | `/api/proxy/call-history/{id}/recording` |
| Get campaign detail | GET | `/api/proxy/campaigns/{id}` |
| Get campaign results | GET | `/api/proxy/campaigns/{id}/results` |
| Delete campaign | DELETE | `/api/proxy/campaigns/{id}` |
| Duplicate campaign | POST | `/api/proxy/campaigns/{id}/duplicate` |
| Save credentials | POST | `/api/proxy/integration/credentials` |

> Note: These endpoints may not all exist yet in the proxy layer. Create MSW mock handlers for any that are missing. The proxy implementation (`proxy.ts`) forwards requests to `https://api.agora.io/...` with authentication headers injected from the user's associated Agora account.

---

## Appendix B: Mock data schemas

Use these shapes when creating MSW handlers:

```typescript
// ISV record (local database, not Agora API)
interface ISV {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone?: string;
  companyUrl?: string;
  agoraAccountId?: string;    // populated after Agora account creation
  agoraProjectId?: string;    // populated after project creation
  agoraAppId?: string;        // the App ID from Agora
  status: 'pending' | 'provisioned' | 'active';
  createdAt: string;
  updatedAt: string;
}

// User record (extends next-auth user)
interface StudioUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  isvId?: string;             // associated ISV
  agoraAccountId?: string;    // inherited from ISV
  agoraAppId?: string;        // inherited from ISV
  setupComplete: boolean;     // has completed onboarding wizard
  lastLogin: string;
}

// Campaign (Agora API shape)
interface Campaign {
  id: string;
  name: string;
  agentId: string;
  phoneNumberId: string;
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'paused';
  totalContacts: number;
  completedCalls: number;
  answeredCalls: number;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  config: {
    maxCallDuration: number;
    silenceTimeout: number;
    ringDuration: number;
    voicemailDetection: boolean;
    storeTranscripts: boolean;
    storeRecording: boolean;
    transferEnabled: boolean;
    transferNumber?: string;
    transferCriteria?: string;
  };
}

// Analytics insight (computed client-side)
interface Insight {
  id: string;
  severity: 'info' | 'warning' | 'success';
  message: string;
  actionLabel: string;
  actionHref: string;
}

// Call history record (Agora API shape)
interface CallRecord {
  id: string;
  campaignId?: string;
  agentId: string;
  agentName: string;
  phoneNumber: string;         // caller's number (masked in UI)
  callerIdNumber: string;      // outbound number used
  status: 'answered' | 'no_answer' | 'voicemail' | 'failed' | 'transferred';
  outcome?: 'task_success' | 'task_failed' | 'transferred' | 'hung_up';
  duration: number;            // seconds
  ringDuration: number;        // seconds
  avgLatency: number;          // milliseconds
  transcriptAvailable: boolean;
  recordingAvailable: boolean;
  postCallData?: Record<string, string>;  // extracted key-value pairs
  startedAt: string;
  endedAt: string;
}

// Transcript turn
interface TranscriptTurn {
  speaker: 'agent' | 'caller';
  text: string;
  timestamp: number;           // seconds from call start
  sentiment?: 'positive' | 'neutral' | 'negative';
}

// Activity event (computed from multiple APIs for overview dashboard)
interface ActivityEvent {
  id: string;
  type: 'agent_created' | 'agent_published' | 'agent_paused' | 'campaign_launched' | 'campaign_completed' | 'phone_imported' | 'credentials_updated';
  description: string;
  entityId: string;
  entityName: string;
  timestamp: string;
}
```

---

## Appendix C: Reference screenshots

The uploaded PDF (`Xnip2026-04-02_14-24-42.pdf`) contains 10 pages of the current Agora Studio UI. Key pages to reference:

- Page 1: Create Agent modal (template picker)
- Page 2: Analytics dashboard (KPI cards + charts + sidebar nav)
- Page 3: Agent config — transcripts, recording, call analysis toggles
- Page 4: Campaign creation form (details + contacts + timing)
- Page 5: Agent config — hang-up settings, post-call analysis
- Page 6: Agent config — call recording, transfer to number
- Page 7: Phone Number edit (SIP trunk details)
- Page 8: Phone Numbers list + Add panel
- Page 9: Integration page (Knowledge Bases tab)
- Page 10: Agent editor (Prompt tab + test panel)

The white-label version should replicate this functionality but with improvements described in this PRD, and with all Agora branding removed.

---

## Appendix D: Interactive prototypes & reference artifacts

These artifacts were created alongside this PRD as working React prototypes. Use them as implementation references — they contain the exact UI patterns, component structure, color values, and interaction behaviors to replicate.

### How to use these with Claude Code

1. Place this PRD in `docs/PRD_UX_V2.md`
2. Place the setup wizard prototype in `docs/prototypes/setup-wizard.jsx`
3. Place the 9-screen reference in `docs/prototypes/all-screens-reference.jsx`
4. Reference from `CLAUDE.md`: `@docs/PRD_UX_V2.md` and `@docs/prototypes/`
5. When implementing a feature, point Claude Code to both the PRD section AND the corresponding prototype

### Artifact 1: Setup wizard prototype (`setup-wizard.jsx`)

**Scope**: Feature 1 only — but fully interactive with all 6 screens (welcome → credentials → agent → phone → test → done).

**What's implemented**:
- `ProgressRail` component: horizontal 4-dot stepper with connecting lines, teal fill for completed steps
- `StepCredentials`: provider picker buttons (OpenAI/Anthropic/Gemini/Custom for LLM, Deepgram/Google/Azure for ASR, ElevenLabs/Azure/Google for TTS), password input with show/hide toggle, "Key saved" confirmation
- `StepAgent`: 2-column template grid (Sales qualifier, Customer support, Appointment reminder, NPS survey, Blank), colored dot per template, inline agent name + system prompt form that slides in on selection
- `StepPhone`: 2x2 SIP provider grid (Twilio/Telnyx/Exotel/Other), auto-fill confirmation banner, phone number + display name inputs, collapsible Advanced SIP settings with trunk address (read-only when provider selected), transport toggle (UDP/TCP/TLS), optional username/password
- `StepTest`: animated call simulation — idle → ringing (pulse animation) → connected (4-bar waveform CSS animation) → ended (health summary). Live transcript streams in with timed delays. Agent/Caller turns with colored dots
- `StepDone`: 2x2 quick-action card grid (Launch campaign, Edit agent, View analytics, Import numbers)
- Wizard shell: step validation gates, 200ms fade+translateY transitions, "Skip setup" link, Back/Continue navigation
- Design tokens: teal `#2DD4A8`, surface `#0a0a0b`, card `#111113`, border `#27272a`, DM Sans font

**Use this prototype as the source of truth for**: step transitions, form layouts, provider picker patterns, the test call simulation UX, and the overall wizard shell structure. Claude Code should adapt this to use the app's actual `--studio-*` tokens, Tailwind classes, and shadcn components.

### Artifact 2: All 9 screens reference (`agent-studio-all-9-screens.jsx`)

**Scope**: One static mockup per feature (Features 1–9), all in a single scrollable file.

**What each screen shows**:

| Feature | Screen | Key UI patterns to replicate |
|---------|--------|------------------------------|
| F1 | Setup wizard (Step 1) | Progress rail, provider buttons, API key input, skip link |
| F2 | Campaign stepper (Step 2) | Step tabs, CSV drag-drop zone, preview table with validation badge |
| F3 | Agent editor | Split panel (60/40), status bar with publish/pause, tabbed editor, test panel with waveform + transcript |
| F4 | Phone setup | 2x2 provider grid, auto-fill banner, collapsible advanced fields, health status dots (green/yellow/red) |
| F5 | Analytics | KPI cards with trend arrows, insights bar with warning + action links, donut chart, line chart |
| F6 | Role sidebar | Admin/Studio sidebar sections with divider, impersonation banner (yellow), user management table with role badges |
| F7 | Call history | Filter bar, sortable table, click-to-expand transcript panel with metadata cards + audio player + extracted data |
| F8 | Overview dashboard | Quick stats row, activity feed + quick actions grid, 7-day call volume bar chart |
| F9 | Campaign detail | Progress bar, 5 stats cards, Results/Call log/Settings tabs, outcome donut, hourly distribution chart |

**Feature 7 is interactive**: click any call row to open/close the transcript side panel.

### Recommended workflow for Claude Code

```
For each feature:
  1. Read the PRD section for that feature (spec, file paths, data flow, design details)
  2. Look at the corresponding screen in all-screens-reference.jsx for visual reference
  3. For Feature 1 specifically, use setup-wizard.jsx as the detailed implementation reference
  4. Implement using the app's existing design system (--studio-* tokens, shadcn, Tailwind)
  5. Create MSW mocks for any missing API endpoints
  6. Test on pnpm dev
```
