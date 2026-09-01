# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-09-01
- Primary product surfaces: `/` marketing landing page (desktop-first) and `/app/*` iPhone 17 mobile app demo — onboarding, MyData connection, current-card diagnosis, future-spend planning, result, evidence, confirm
- Evidence reviewed: `docs/knowledge-base/raw/CardFit_Deck_10min_v2-2.html` (top reference), `docs/knowledge-base/raw/카드핏.png`, user-provided diagnosis screenshot, `BankSalad_Home_0.jpeg`, `BankSalad_Home_1.jpeg`, `blueprint_v0.3.html`, `blueprint_v0.4_prompt.md`, `docs/ux/README.md`

## Brand
- Personality: calm, capable, transparent financial planner
- Trust signals: clear data source, explicit calculation scope, visible evidence, no forced card issuance
- Avoid: named-persona demos, exaggerated maximum-benefit claims, dark sales-heavy card-shopping UI

## Product goals
- Goals: connect current card data to future-spend planning in one continuous flow; help the user decide whether to maintain or change a card combination
- Non-goals: card cancellation agency, automatic application, real MyData integration in this prototype
- Success signals: the full flow is clickable; maintain/change branches are reproducible; calculation evidence is reachable

## Personas and jobs
- Primary personas: people with multiple cards and a near-term high-value spending change
- User jobs: understand current card use, add upcoming spending, compare combinations, verify the reason, decide the next action
- Key contexts of use: mobile, one-time event-driven review, five-minute decision

## Information architecture
- Primary navigation: landing page has a single `앱 데모 열기` entry; inside `/app/*` there is no tab navigation, one forward CTA per screen
- Core routes/screens: `/` landing → `/app` onboarding → `/app/connect` MyData example-data connection → `/app/summary` current-benefit summary → `/app/diagnosis` current-card diagnosis → `/app/plan` future spend → `/app/constraint` constraints → `/app/calculating` → `/app/result` → `/app/evidence` → `/app/confirm`
- Content hierarchy: benefit/decision first, supporting rules second

## Design principles
- Show the current state before asking for future input.
- Use BankSalad only for the first two diagnosis screens' information hierarchy; CardFit owns the future-state flow.
- Do not ask users to select a persona or life-event label.
- Prefer one primary action and progressive disclosure.

## Visual language
- Color: tokens in `docs/ux/README.md` 3절 are canonical — `--primary #2878FF`, `--ink #10182B`, `--muted #697386`, `--bg #F6F8FC`, `--surface #FFFFFF`, `--line #E3E8F2`, `--positive #087A55`, `--warning #9A6200`, `--banner #10182B`. The only dark area is the conclusion banner (T13)
- Typography: system Korean sans-serif, high-weight display titles, readable 16px minimum body at 1:1 mobile view
- Spacing/layout rhythm: 8px base; 16/24/32px content spacing
- Shape/radius/elevation: 16–28px cards, soft blue shadows, iPhone frame radius
- Motion: short opacity/translate transitions; respect reduced motion
- Imagery/iconography: use `카드핏.png` on onboarding; use simple semantic icons elsewhere

## Components
- Existing components to reuse: `src/components/ui.tsx` (PhoneShell, ScreenHeader, Panel, Notice, StatusChip, SampleBadge, CtaBar, Primary/Secondary CTA, KeyValue) and `src/components/result-blocks.tsx` (ConclusionBanner, CombinationList, AllocationTable, ReviewedAlternatives). Information hierarchy transferred from `blueprint_v0.3.html`; the HTML board itself is not shipped
- New/changed components: brand onboarding hero, MyData example-data notice, connection progress/success state
- Variants and states: default, connecting, connected, disabled, loading
- Token/component ownership: tokens live in `@theme` inside `src/app/globals.css`, mirroring `docs/ux/README.md` 3절. Components read tokens through Tailwind utilities, never raw hex values

## Accessibility
- Target standard: WCAG 2.2 AA where prototype technology permits
- Keyboard/focus behavior: buttons remain native and visible-focus capable
- Contrast/readability: do not place low-contrast gray copy on white
- Screen-reader semantics: meaningful button labels; decorative imagery has empty alt text
- Reduced motion and sensory considerations: disable smooth animation when `prefers-reduced-motion` is active

## Responsive behavior
- Supported breakpoints/devices: primary iPhone 17 logical viewport 402×874 CSS px; at ≥768px the `/app/*` phone frame is centred with a fixed 874px height, and the landing page expands to a 1080px content column
- Layout adaptations: phone content remains single-column at every width; landing sections collapse from 3–4 columns to one
- Touch/hover differences: 44px minimum primary touch targets; hover is supplementary

## Interaction states
- Loading: calculation checklist/progress screen
- Empty: no future-spend plan blocks result generation
- Error: prototype does not simulate network errors
- Success: example MyData loaded and combination confirmed
- Disabled: connection CTA disabled while loading
- Offline/slow network: out of prototype scope

## Content voice
- Tone: direct, reassuring, non-salesy
- Terminology: “앞으로 쓸 돈”, “예상 추가 혜택”, “현재 조합 유지”; technical terms only with one-line explanations
- Microcopy rules: state what data is used; never imply guaranteed benefit or delegated card application

## Implementation constraints
- Framework/styling system: Next.js App Router + TypeScript + Tailwind CSS v4, deployed to Vercel. **The deliverable is a running app, not a static HTML file** — `blueprint_v0.3.html` is a design reference, not the shipped artefact (T12)
- Design-token constraints: tokens are declared once in `src/app/globals.css` `@theme`; no new UI or state-management dependency
- Performance constraints: local assets only; no runtime external API and no server-side calculation
- Compatibility constraints: current Safari/Chrome; 402×874 primary viewport; 1440×900 secondary
- Test/screenshot expectations: Playwright drives both viewports (`e2e/happy-path.spec.ts`); presentation captures are taken from the running app, never redrawn by hand

## Open questions
- [ ] Replace Mock MyData with a real provider only after API authority and consent requirements are defined / Product & Engineering / post-prototype
