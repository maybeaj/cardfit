# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-09-01
- Primary product surfaces: iPhone 17 mobile prototype, onboarding, MyData connection, current-card diagnosis, future-spend planning, result and evidence
- Evidence reviewed: `docs/knowledge-base/raw/카드핏.png`, user-provided diagnosis screenshot, `BankSalad_Home_0.jpeg`, `BankSalad_Home_1.jpeg`, `blueprint_v0.3.html`, `blueprint_v0.4_prompt.md`, `docs/ux/README.md`

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
- Primary navigation: no tab navigation; one forward CTA per screen
- Core routes/screens: onboarding → MyData example-data connection → current-benefit summary → current-card diagnosis → future spend → constraints → result → evidence → apply
- Content hierarchy: benefit/decision first, supporting rules second

## Design principles
- Show the current state before asking for future input.
- Use BankSalad only for the first two diagnosis screens' information hierarchy; CardFit owns the future-state flow.
- Do not ask users to select a persona or life-event label.
- Prefer one primary action and progressive disclosure.

## Visual language
- Color: CardFit blue `#2F5BEA`, bright blue `#3F6FF7`, navy `#07194F`, white surfaces, muted gray text
- Typography: system Korean sans-serif, high-weight display titles, readable 16px minimum body at 1:1 mobile view
- Spacing/layout rhythm: 8px base; 16/24/32px content spacing
- Shape/radius/elevation: 16–28px cards, soft blue shadows, iPhone frame radius
- Motion: short opacity/translate transitions; respect reduced motion
- Imagery/iconography: use `카드핏.png` on onboarding; use simple semantic icons elsewhere

## Components
- Existing components to reuse: phone frame, status bar, primary CTA, card list, summary hero, input cards from `blueprint_v0.3.html`
- New/changed components: brand onboarding hero, MyData example-data notice, connection progress/success state
- Variants and states: default, connecting, connected, disabled, loading
- Token/component ownership: extend the prototype's existing CSS variables and component classes

## Accessibility
- Target standard: WCAG 2.2 AA where prototype technology permits
- Keyboard/focus behavior: buttons remain native and visible-focus capable
- Contrast/readability: do not place low-contrast gray copy on white
- Screen-reader semantics: meaningful button labels; decorative imagery has empty alt text
- Reduced motion and sensory considerations: disable smooth animation when `prefers-reduced-motion` is active

## Responsive behavior
- Supported breakpoints/devices: primary iPhone 17 logical viewport 402×874 CSS px; desktop blueprint board wraps the phone
- Layout adaptations: phone content remains single-column; board scrolls horizontally
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
- Framework/styling system: standalone HTML/CSS/JavaScript prototype
- Design-token constraints: extend existing CSS variables; no new dependency
- Performance constraints: local assets only
- Compatibility constraints: current Safari/Chrome; 402×874 primary viewport
- Test/screenshot expectations: capture each key state at 402×874; compare the diagnosis screen with the approved screenshot

## Open questions
- [ ] Replace Mock MyData with a real provider only after API authority and consent requirements are defined / Product & Engineering / post-prototype
