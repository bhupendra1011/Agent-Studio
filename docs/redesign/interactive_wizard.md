# PRD: Agent Studio — UX improvements (v2)

> **Purpose**: This document specifies six UX improvements to the white-label Agent Studio wrapper app. It is written for Claude Code to implement directly against the existing codebase.
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

The app currently has these pages after login (role: admin):

| Page | Route (assumed) | Status |
|------|----------------|--------|
| Overview | `/dashboard` | Placeholder — mostly empty |
| Agents | `/dashboard/agents` | Working — list with search, CRUD, status badges |
| Phone Numbers | `/dashboard/phone-numbers` | Working — list + add side panel |
| Integration | `/dashboard/integration` | Working — Credentials, KB, MCPs tabs |
| Profile | `/dashboard/profile` | Basic |
| Settings | `/dashboard/settings` | Basic |

The sidebar navigation matches the Agora Studio layout. The app proxies API calls to Agora's backend. Authentication uses next-auth with username/password (admin/admin for POC).

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