# Study Worlds validation — 16 November 2026

Six worlds share one timer and task store. The gallery supports preview, cancel, favorites, lighting and reduced motion. Full scenes and the original desk view are both available. Floating timer digits take priority at compact sizes.

## Evidence

Final local run: TypeScript, ESLint and production build passed; 45 unit tests, 52 browser tests and one separate mocked cloud-sync browser test passed. The five-surface interaction state matrix is complete. Sixteen rendered Design QA snapshots report no blocking findings; native-modal background elements are excluded from the modal keyboard audit because they are inert.

- e2e/worlds.spec.ts: six worlds in both lighting modes at 320, 390, 768 and 1440px; preview/cancel/reload; focus and break state; task/settings drafts; analytics range; favorites; motion; real native Document Picture-in-Picture and fallback popup at 320×180, 280×140, 220×100, 160×70 and 120×60.
- src/features/worlds/worlds.test.ts: timer and data identity, manual world choice, corrupt optional theme fallback and semantic tokens.
- Existing suites cover automatic short/long break cycles, restoration, VI/EN, tasks, journals, backups, keyboard navigation and original desk geometry.
- Design QA rendered snapshots: all six worlds in both lighting modes at 1440px, 320px focus page and gallery in both modes. Contrast, keyboard indicators and reflow passed after removing color interpolation during theme changes. Modal snapshots scope to the active native dialog; its background is inert by browser behavior.
- Source accessibility scan reviewed: component files are incorrectly treated as entire pages. Main/nav/h1 are supplied by App and the route, not duplicated in each component. Added a page skip link and explicit aria-live to the empty-favorites status. This is not a full accessibility conformance claim.
- Finish lint found no blocking unfinished controls in world components. Its middle-dot copy warning is intentional status separation. State coverage is recorded in study-worlds-states.csv.

## Visual review and limits

Reviewed desktop library/observatory/café, mobile scenes, populated journal/task state and compact timer screenshots. Important text uses solid surfaces; the countdown has no blur or text shadow.

Innook was not inspected because saved application permissions blocked access. The supplied PDF informed the design with original scene composition. Fosta failed because its local configuration has no key. No generated bitmap is included; scenes are code-native vectors.

A normal fallback popup is not guaranteed always on top. Minimizing to the operating-system taskbar hides window contents; resizing the visible window preserves the countdown. Local data remains tied to the browser profile. Existing cloud synchronization is optional and has not been connected to a live Supabase project.
