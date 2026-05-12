# Claude Prototype Prompt — Way2B1 Mobile (Capital Calls)

## Goal
Build a **single-file React mobile prototype** (`App.tsx`) of the Way2B1 estate intelligence app focused on the Capital Calls / Decisions workflow. The prototype must feel like a native iOS finance app — clean, data-dense, premium. No external UI libraries. Tailwind CSS only. All state is local (no backend).

---

## Tech stack
- React 18 + TypeScript (TSX)
- Tailwind CSS v4 (inline `style={{}}` for dynamic values, Tailwind for layout/spacing/color utilities)
- Tabler Icons React (`@tabler/icons-react`) for all icons
- Single file: everything in one `App.tsx` export
- Google Fonts in `<head>`: Inter (300,400,500,600,700) + Space Grotesk (500,600,700)

---

## Design tokens — CSS variables (put in `<style>` tag inside the component or in index.html)

```css
:root {
  --color-white: #FFF;
  --color-black: #1C2024;
  --color-neutral-2: #F5F5F7;
  --color-neutral-3: #F0F0F3;
  --color-neutral-4: #E8E8EC;
  --color-neutral-5: #E0E1E6;
  --color-neutral-7: #A9AAB4;
  --color-neutral-8: #90A0B2;
  --color-neutral-9: #8B8D98;
  --color-neutral-10: #80838D;
  --color-neutral-11: #454950;
  --color-neutral-12: #1C2024;
  --color-accent-9: #005BE2;
  --color-accent-3: #EBF3FF;
  --color-blue-1: #EBF3FF;
  --color-red-9: #e5484d;
  --color-green-bright: #10B981;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 10px;
  --radius-xl: 14px;
  --radius-2xl: 20px;
  --radius-full: 9999px;
  --font-sans: 'Inter', -apple-system, sans-serif;
  --font-display: 'Space Grotesk', 'Inter', sans-serif;
}
```

**Typography rules:**
- Body text: Inter, 14px/500
- Labels / metadata: Inter, 11–12px/500, `var(--color-neutral-9)`
- Section labels: Inter, 11px/700, uppercase, tracking-[0.08em], `var(--color-neutral-9)`
- Card titles: Inter, 15–16px/700, `var(--color-black)`
- Large numbers / amounts: Space Grotesk or Inter, 22–28px/700, tracking-[-0.02em]
- Tab labels: 13px/600
- Buttons: 14px/600

---

## Data

Embed this data directly in the file:

```typescript
type DecisionStatus = 'pending' | 'approved' | 'flagged' | 'wire-ready' | 'completed'

interface ApprovalStep {
  id: string; role: string; name: string; initials: string;
  color: string; status: 'approved' | 'pending' | 'auto'; timestamp?: string
}

interface CapitalCallDecision {
  id: string; title: string; fund: string; entity: string; gp: string;
  amount: number; commitment: number; callNumber: number; totalCalls: number;
  drawnBefore: number; drawnAfter: number; dueDate: string; createdDate: string;
  status: DecisionStatus; approvals: ApprovalStep[];
  matchedInvestmentId: string; matchedInvestmentName: string; matchConfidence: number;
  priorCallsDrawn: number; pdfName: string; pdfPages: number; pdfSizeKb: number;
  wireInstructions: { beneficiary: string; bank: string; aba: string; account: string; swift: string; reference: string }
  activityLog: Array<{ time: string; actor: string; action: string; isAI?: boolean }>
}

const DECISIONS: CapitalCallDecision[] = [
  {
    id: 'CAPCAL-1', title: 'Capital call for $500k for eco companies',
    fund: 'Greentech Opportunities Fund III, L.P.', entity: 'Real Estate Holding LLC',
    gp: 'Meridian Capital Partners', amount: 500_000, commitment: 5_000_000,
    callNumber: 7, totalCalls: 12, drawnBefore: 0.42, drawnAfter: 0.52,
    dueDate: '2026-05-30', createdDate: '2026-05-08', status: 'approved',
    approvals: [
      { id: 'ap-1', role: 'Investment lead', name: 'Anastasiya Mudryk', initials: 'AM', color: '#0D9488', status: 'approved', timestamp: '3:59 PM' },
      { id: 'ap-2', role: 'CFO', name: 'Marcus Klein', initials: 'MK', color: '#0F766E', status: 'pending' },
      { id: 'ap-3', role: 'Compliance', name: 'Maya Mehta', initials: 'MM', color: '#2563EB', status: 'pending' },
    ],
    matchedInvestmentId: 'INV-2024-014', matchedInvestmentName: 'Greentech Opp. Fund III',
    matchConfidence: 98, priorCallsDrawn: 6,
    pdfName: 'Meridian_CapCall_07_RE-Holding.pdf', pdfPages: 4, pdfSizeKb: 218,
    wireInstructions: { beneficiary: 'Meridian Capital Partners III LP', bank: 'First Republic Bank, NY', aba: '021000128', account: '···· 4419', swift: 'FRBKUS00', reference: 'CAPCAL-1 / RE Holding LLC' },
    activityLog: [
      { time: '3:59 PM', actor: 'Anastasiya Mudryk', action: 'Approved · Default Approval' },
      { time: '3:58 PM', actor: 'Fojo Assistant', action: 'Matched to INV-2024-014 · 98% confidence', isAI: true },
      { time: '3:57 PM', actor: 'Anastasiya Mudryk', action: 'Set due date to May 30, 2026' },
      { time: '3:55 PM', actor: 'Anastasiya Mudryk', action: 'Created from Meridian_CapCall_07.pdf' },
    ],
  },
  {
    id: 'CAPCAL-2', title: 'Capital call — Q2 drawdown for infrastructure',
    fund: 'Whitmore Real Assets Fund III, L.P.', entity: 'Thornton Family Trust',
    gp: 'Whitmore Capital Group', amount: 875_000, commitment: 8_750_000,
    callNumber: 3, totalCalls: 8, drawnBefore: 0.22, drawnAfter: 0.32,
    dueDate: '2026-06-15', createdDate: '2026-05-10', status: 'pending',
    approvals: [
      { id: 'ap-4', role: 'Investment lead', name: 'Anastasiya Mudryk', initials: 'AM', color: '#0D9488', status: 'pending' },
      { id: 'ap-5', role: 'CFO', name: 'Marcus Klein', initials: 'MK', color: '#0F766E', status: 'pending' },
    ],
    matchedInvestmentId: 'INV-2023-007', matchedInvestmentName: 'Whitmore Real Assets III',
    matchConfidence: 94, priorCallsDrawn: 2,
    pdfName: 'Whitmore_CapCall_03_ThorntonTrust.pdf', pdfPages: 3, pdfSizeKb: 184,
    wireInstructions: { beneficiary: 'Whitmore Real Assets Fund III LP', bank: 'JPMorgan Chase, NY', aba: '021000021', account: '···· 7732', swift: 'CHASUS33', reference: 'CAPCAL-2 / Thornton Family Trust' },
    activityLog: [
      { time: '9:12 AM', actor: 'Fojo Assistant', action: 'Matched to INV-2023-007 · 94% confidence', isAI: true },
      { time: '9:10 AM', actor: 'Anastasiya Mudryk', action: 'Created from Whitmore_CapCall_03.pdf' },
    ],
  },
]
```

---

## Status badge config

```typescript
const STATUS = {
  pending:    { label: 'Pending',    dot: '#F59E0B', text: '#92400E', bg: '#FFFBEB' },
  approved:   { label: 'Approved',   dot: '#10B981', text: '#065F46', bg: '#ECFDF5' },
  flagged:    { label: 'Flagged',    dot: '#EF4444', text: '#991B1B', bg: '#FEF2F2' },
  'wire-ready': { label: 'Wire ready', dot: '#6366F1', text: '#3730A3', bg: '#EEF2FF' },
  completed:  { label: 'Completed',  dot: '#6B7280', text: '#374151', bg: '#F9FAFB' },
}
```

---

## App structure

```
type Screen = 'home' | 'decisions' | 'detail'
type DetailTab = 'overview' | 'verify' | 'activity'
```

Root state in `App`:
```typescript
const [screen, setScreen] = useState<Screen>('decisions')
const [detailId, setDetailId] = useState<string | null>(null)
const [detailTab, setDetailTab] = useState<DetailTab>('overview')
```

---

## Mobile chrome

### Device frame (outer wrapper)
Render the app inside a centered phone frame on desktop so it looks like an iPhone mockup:

```
<div className="min-h-screen bg-[#F0F0F3] flex items-center justify-center p-8">
  <div className="w-[390px] h-[844px] bg-white rounded-[44px] overflow-hidden shadow-2xl relative flex flex-col"
       style={{ fontFamily: 'var(--font-sans)' }}>
    {/* Status bar */}
    {/* Screen content */}
    {/* Bottom navigation */}
  </div>
</div>
```

### Status bar (top, inside the frame)
```
height: 44px, bg: white, px: 24px
Left: "9:41" in 15px/700 Inter
Right: battery/signal icons (use simple SVG rectangles or Tabler icons)
```

### Bottom navigation bar
```
height: 83px (includes 34px safe area padding at bottom)
bg: white, border-top: 1px solid var(--color-neutral-4)
5 tabs: Home · Decisions · Documents · Tasks · More
Each tab: icon (20px) + label (10px/600) below it, centered
Active tab: icon + label in var(--color-accent-9)
Inactive: var(--color-neutral-8)
Active indicator: 2px top border on the tab in var(--color-accent-9)
Tap area: full tab width, touch target min 44px
```

Bottom nav items:
- Home: `IconHome`
- Decisions: `IconArrowRampRight` — add a badge showing count of pending decisions
- Documents: `IconFileText`
- Tasks: `IconCheckbox`
- More: `IconDots`

---

## Screen 1 — Decisions list (`screen === 'decisions'`)

### Layout
```
[Status bar 44px]
[Page header: sticky, bg white, border-bottom]
[KPI strip]
[Quick filter chips: horizontal scroll]
[Card list: scrollable]
[FAB: bottom-right, above bottom nav]
[Bottom nav 83px]
```

### Page header
```
px: 20px, py: 16px
Title: "Decisions" in 24px/700 Space Grotesk, color-black
Subtitle: "Investment Workflow" in 11px/600 uppercase tracking-wide neutral-9
Right: avatar circle "SW" 32px
```

### KPI strip
3 cards in a horizontal flex row, `px-4 pb-4 gap-3`, each card `flex-1 rounded-xl border border-neutral-4 bg-white px-3 py-3`:
- **Total pipeline** — `$1.38M` (sum of all amounts), "2 decisions" below in neutral-9
- **Awaiting approval** — `$875K` (sum of pending), "1 decision" in amber `#D97706` if > 0
- **Next due** — `May 30`, "18 days" below, amber if ≤ 14 days

Number: 20px/700 Space Grotesk
Label above: 10px/600 uppercase tracking-wide neutral-9
Sub below: 10px/500 neutral-9 (or amber)

### Quick filter chips
Horizontal scroll (`overflow-x-auto, flex gap-2, px-4, pb-3, no-scrollbar`), pill buttons `rounded-full px-3 py-1.5 text-[12px]/600 border`:
- All · Due soon · Pending · High value · Wire ready
- Active chip: `bg-[var(--color-blue-1)] border-[var(--color-accent-9)] text-[var(--color-accent-9)]`
- Alert chips (Due soon, Pending when count > 0): `bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]`

### Decision cards
Each card: `mx-4 mb-3 rounded-[14px] border border-neutral-4 bg-white overflow-hidden active:scale-[0.98] transition-transform`:

```
[4px color strip at top — status dot color]
[Card body px-4 py-4 flex flex-col gap-3]
  [Row 1: status badge (left) + call number "#7 of 12" (right, mono 11px neutral-8)]
  [Row 2: title 15px/700 line-clamp-2 + fund 11px neutral-9 mt-0.5]
  [Row 3: large amount (24px/700 Space Grotesk, left) + due date (right, 12px/600, amber if urgent)]
  [Row 4: progress bar + approvals row]
```

Progress bar row:
```
Labels: "Drawn 42% → 52%" (10px neutral-9, left) + "1/3 approvals" (right)
Bar: h-1 rounded-full bg-neutral-3, filled dark blue + light blue
Approval avatars: 3 mini circles 14px stacked -space-x-1 with first-letter initials
```

Amount: `$500K` or `$0.88M` — format with `fmt()` helper.

### Upload FAB (Floating Action Button)
```
position: absolute, bottom: 100px (above bottom nav), right: 20px
w-14 h-14 rounded-full bg-[var(--color-accent-9)] shadow-lg
icon: IconPlus size=22 color white
On tap: open upload bottom sheet
```

### Empty state (when filter shows nothing)
Centered, "No decisions match" 14px neutral-9 + "Clear filters" link.

---

## Screen 2 — Capital call detail (`screen === 'detail'`)

### Layout
```
[Status bar 44px]
[Sticky top nav: back + title + actions]
[Meta strip: status badge + ID + call number]
[Tab bar: Overview · Verify · Activity]
[Scrollable tab content]
[Bottom nav 83px]
```

### Top navigation bar
```
height: 56px, bg white, px 16px, border-bottom
Left: IconChevronLeft 22px + "Decisions" 14px/600 neutral-10 → tap goes back to decisions
Center: decision title truncated 14px/700 (max-w ~200px)
Right: IconShare 20px + IconDotsVertical 20px, neutral-9
```

### Meta strip
```
px 16px, py 10px, bg neutral-2, border-bottom border-neutral-3
Flex row gap-2 items-center flex-wrap
Status badge (pill with dot): rounded-full px-2.5 py-1 text-[11px]/700
· (bullet separator)
ID in mono 11px neutral-8
·
"Call #7 of 12" 11px neutral-9
·
"Created May 8, 2026" 11px neutral-9
```

### Tab bar
```
px 16px, bg white, border-bottom border-neutral-4
3 tabs: Overview · Verify · Activity
Each: py-3 text-[13px]/600
Active: bottom border 2px accent-9, color accent-9
Inactive: color neutral-10
Verify tab: show "6/6" green pill badge when all match
```

### Tab body — OVERVIEW

Scrollable `px-4 py-4 gap-4 flex flex-col`:

**The numbers card** — `rounded-xl border border-neutral-4 bg-white p-4`
```
Title: "The numbers" 15px/700 mb-3
3 stacked rows (not columns — mobile is narrow):
  Row: label (10px uppercase neutral-9) + value (22px/700 Space Grotesk) + sub (11px neutral-9)
  1. Amount called / $500,000 / "10% of $5M commitment"
  2. Funding deadline / May 30, 2026 / "18 days · 5:00 PM ET"
  3. Drawn after this call / 52% / progress bar below (show 42%→52%)
```

**Approval workflow card** — same card style
```
Title: "Approval workflow" + "1 of 3 approvals" subtitle right
Each step as a row (py-3 border-b last:border-0):
  Avatar circle (32px, initials, colored) | name+role | status chip or "Approve" button
  Approved: green chip "Approved · 3:59 PM"
  Pending: amber "Pending" chip + "Approve →" button tap-able (changes state → approved)
```

**Match to investment card** — same card style
```
Title: "Matched investment" + confidence badge top-right
Confidence badge: purple "98%" pill (bg #F3E8FF, text #6D28D9)
Investment row: dark square avatar "G" + "Greentech Opp. Fund III" + "INV-2024-014"
"Open record →" link accent-9 11px/600 mt-2
```

### Tab body — VERIFY

Split into two sections (stacked on mobile, not side-by-side):

**PDF preview card** — `rounded-xl border border-neutral-4 bg-white overflow-hidden mb-4`
```
Header row: PDF file icon (red) + filename + "4 pages · 218 KB" + "View ↗" button
Body: styled HTML mock of the PDF content (condensed, no iframe):
  - "MERIDIAN CAPITAL PARTNERS" header in small caps / bold, border-bottom
  - "CAPITAL CALL NOTICE" subtitle
  - Fund name, LP name, Amount in bold, Due date
  - Wire instructions table: Beneficiary / Bank / ABA / Account / SWIFT / Reference
  Render as a mini document with bg-[#FAFAF8] rounded inside the card
  Font: Georgia serif for the letterhead feel, 11px
  Max height: 220px, overflow-y: auto
```

**Verification fields** — `rounded-xl border border-neutral-4 bg-white overflow-hidden`
```
Header: "Field verification · 6/6 match" + Fojo AI chip (purple)
Each field row (py-3 px-4 border-b last:border-0 bg-[#EFF6FF]-on-hover):
  Label: 11px/600 uppercase neutral-9 (Fund/GP, LP, Amount, Call number, Deadline, Wire)
  Extracted value: 12px/600 purple #7C3AED (the AI-extracted value)
  Confidence %: 10px neutral-8 right
  MATCH badge: green pill "✓ MATCH"
```

**Footer — status-aware:**
- Default/Approved: "Flag for review" (ghost) + "Confirm & schedule wire →" (blue filled)
- Wire-ready: pulsing indigo dot + "Wire queued" message + "Execute wire →" (indigo filled)
- Completed: green success banner "✓ Wire executed · $500,000 sent to Meridian Capital Partners III LP"

State: `const [localStatus, setLocalStatus] = useState(decision.status)`
- "Confirm & schedule wire" → `setLocalStatus('wire-ready')`
- "Execute wire →" → `setLocalStatus('completed')`

### Tab body — ACTIVITY

`px-4 py-4`:

**Activity log** — timeline with connector line:
Each entry: left column (avatar 32px + vertical line) | right column (actor bold + AI chip if AI + time muted + action text)
AI entries: avatar is purple circle with robot icon
Human entries: avatar is teal circle with initials

**Call history table** — `mt-6 pt-6 border-t`:
Title: "Call history — Greentech Opp. Fund III"
Table: rounded-xl border overflow-hidden
Columns: Call # · Date · Amount · Status
Rows: calls 1-6 as "Completed", current call 7 highlighted with blue bg

---

## Upload Bottom Sheet

Triggered by FAB. Component: `UploadSheet`

```
Backdrop: fixed inset-0 bg-black/40, tap to dismiss
Sheet: fixed bottom-0 w-full bg-white rounded-t-[24px] shadow-2xl
  Drag handle: w-10 h-1 bg-neutral-4 rounded-full mx-auto mt-3 mb-4
  Header: "New capital call" 17px/700 + subtitle 12px neutral-9 + X button
  Body (px-4 pb-8):
```

**Phase 1 — Drop zone** (default):
```
Upload zone: rounded-xl border-2 dashed border-neutral-5 bg-neutral-2 py-8 text-center
  IconUpload 28px neutral-7
  "Drop a PDF or tap to browse" 14px/600 neutral-11
  "PDF only · max 50 MB" 11px neutral-9
Divider: "— or select from —"
Thornton Documents grid: 3 columns, each doc shows:
  PDF icon (72×88px macOS-style: gray border, red PDF badge, purple $ dot for capital call docs)
  filename 10px below, size 9px
Selected doc: blue border + selection ring + "Use this document" button appears
```

**Phase 2 — Extracting** (after file selected):
```
File row: PDF icon + filename + "Uploading…" / "Extraction complete"
Fojo extraction animation — fields appear one by one (500ms + 420ms each):
  Each field: label (11px neutral-9, 110px wide) | value in purple #7C3AED (12px/600) | confidence % right
  Fields: Fund/GP · LP · Amount · Call # · Due date · Wire instructions
After all fields: "Matched to investment · 98%" green banner appears
```

**Phase 3 — Done**:
```
Footer: "Cancel" ghost + "Create record →" blue filled
On "Create record →": close sheet, navigate to detail page of CAPCAL-1
```

Animation for extraction fields: use `useState(visibleCount)`, setTimeout array with cleanup on unmount.

---

## Component helpers to define

```typescript
// Format money
function fmt(v: number): string {
  if (v >= 1_000_000) return `$${(v/1_000_000).toFixed(2)}M`
  if (v >= 1_000) return `$${(v/1_000).toFixed(0)}K`
  return `$${v.toLocaleString()}`
}

// Days until ISO date
function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

// Format date short
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Status badge component
function StatusBadge({ status }: { status: DecisionStatus }) {
  const s = STATUS[status]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: s.bg, color: s.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {s.label}
    </span>
  )
}

// Avatar circle
function Avatar({ initials, color, size = 32 }: { initials: string; color: string; size?: number }) {
  return (
    <div className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
         style={{ width: size, height: size, background: color, fontSize: size * 0.33 }}>
      {initials}
    </div>
  )
}

// Drawn progress bar (dual fill: previous drawn + this call)
function DrawnBar({ before, after }: { before: number; after: number }) {
  return (
    <div className="h-1.5 rounded-full bg-[var(--color-neutral-3)] overflow-hidden flex">
      <div style={{ width: `${before * 100}%`, background: '#005BE2' }} className="h-full" />
      <div style={{ width: `${(after - before) * 100}%`, background: '#93C5FD' }} className="h-full" />
    </div>
  )
}
```

---

## Interaction notes

- All navigation is local React state — no router
- "Approve" button in approval workflow: updates local approvals state
- "Confirm & schedule wire" + "Execute wire": updates `localStatus` state
- Status badge in header reacts to `localStatus`
- Upload sheet: phases driven by `useState<'drop'|'extracting'|'done'>`
- Extraction animation: `useRef<ReturnType<typeof setTimeout>[]>([])` + cleanup in `useEffect`
- Tap on any decision card → `setDetailId(id); setScreen('detail')`
- Back button in detail → `setScreen('decisions')`
- Bottom nav tap → `setScreen(...)`, detail always resets to overview tab

---

## Visual polish checklist

- Cards: `active:scale-[0.98] transition-transform duration-100` for tap feedback
- All interactive elements: min touch target `min-h-[44px]`
- Scrollable areas: `overflow-y-auto` with `scroll-smooth`, no visible scrollbar (`[&::-webkit-scrollbar]:hidden`)
- Sticky headers use `sticky top-0 z-10`
- Bottom sheet animation: slide up (`translate-y-0` when open, `translate-y-full` when closed) with `transition-transform duration-300 ease-out`
- Bottom nav: `backdrop-blur-sm` if content scrolls behind it
- No `outline` on buttons: `outline-none focus:outline-none`
- Hover states on desktop: `hover:bg-[var(--color-neutral-2)]` for rows, `hover:shadow-md` for cards
- Fonts loaded: add `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">` to the component's effect or inline style injection

---

## What NOT to do

- Do not use any CSS library other than Tailwind
- Do not use react-router, redux, or any state management library
- Do not use real PDF rendering (iframe, react-pdf) — use styled HTML mock
- Do not add `console.log` or debug code
- Do not add placeholder images from external URLs
- Do not write comments explaining what the code does — only write comments for non-obvious logic
- Do not add skeleton loaders — data is always available (it's mock data)
- Do not use `setTimeout` without cleanup in useEffect
- Do not use `any` type — keep TypeScript strict

---

## Delivery

Output a single complete `App.tsx` file. It must:
1. Compile without TypeScript errors
2. Render a 390×844px phone frame with all 3 screens navigable
3. Show both CAPCAL-1 and CAPCAL-2 on the Decisions screen
4. Open CAPCAL-1 detail with fully working tabs (Overview / Verify / Activity)
5. Wire flow: Verify tab → "Confirm & schedule wire" → "Execute wire →" → completed state
6. Approval: tapping "Approve →" on a pending step marks it approved
7. Upload FAB opens bottom sheet with Thornton Documents grid + extraction animation
