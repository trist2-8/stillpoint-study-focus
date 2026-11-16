# FOCUS FLOW working instructions

## Product direction

Focus Flow is a private, local-first study desk for one person. The main job is to help the user decide what to study, start one focused session, leave a useful next step, and return to it later.

The current product model is Today / Study Worlds / Personal memory:

- Today is the primary route. Keep one unfinished study task, the timer, the current goal, the room atmosphere, and the next step visible together.
- Subjects are personal spaces such as English, programming, mathematics, or a thesis. Tasks, room preference, notes, and session history may be associated with a subject.
- Session journal stores what was completed, what remains difficult, the next step, and how the session felt. Drafts stay local; a journal becomes part of the weekly reflection after explicit save.
- Leave it for later captures distracting thoughts without interrupting the session.
- Reflection uses real completed sessions and saved journals from the local date range. It should explain observations rather than judge the user.

The app is not a social network, leaderboard, or generic SaaS dashboard. Do not add accounts, chat, XP, streak pressure, or collaboration unless explicitly requested.

## Study Worlds

Study Worlds is a presentation layer. It must never reset or mutate timer, task, journal, session, or analytics state.

Launch worlds:

- Lavender Dreamscape: default; soft lavender, cream, morning desk, books, plant, companion.
- Academia Library: wood, sage, cream paper, editorial study mood for reading, research, math, and programming.
- Forest Quietude: sage, olive, natural light, calm long sessions.
- Midnight Observatory: navy, plum, moonlight, quiet deep focus without neon.

- Rainy Cafe: amber lamps, rain on the window, a quiet personal table.
- Exam Sprint: precise lines, paper, distraction-free revision.

 A world must be chosen by the user; contextual suggestions may be offered but must never switch a running session automatically.

A world uses semantic CSS variables or a world data attribute. Do not create six separate applications or duplicate timer/task logic. Keep the current page usable when images fail by providing a safe solid-color fallback.

## Interaction and layout rules

- The active work is always the visual priority. The timer, current task, and next action must be readable without hunting.
- The complete selected world should remain visible on the focus route. A small thumbnail inside a card is not enough to communicate an atmosphere.
- On other routes, preserve a restrained world trace through the shell or header; do not hide all context when the user changes tabs.
- The docked/floating timer must show the countdown at every supported compact size. Never let a resize hide the timer. Fit the actual viewport without body min-width/min-height forcing overflow. The countdown takes priority over metadata and controls; verify 120x60, 160x70, 220x100 and normal sizes.
- A normal browser popup cannot be guaranteed always-on-top after the browser is minimized. The UI must say when it falls back to a normal popup and must keep the counter visible inside it.
- Mobile: one primary action per view, fixed navigation must not cover focused controls, no horizontal scroll.
- Desktop Desk view keeps the stable sidebar and task queue. Immersive view uses a compact top navigation and lower timer dock so the scene fills the viewport. Room view may hide study panels but must never hide the countdown or pause control.
- Any large illustration or image needs an overlay/surface that preserves text contrast. Do not put important copy directly on a busy image.
- Use visible focus-visible states and minimum touch targets of 44px for primary controls.
- Respect prefers-reduced-motion. Decorative animation cannot affect timer logic.

## Language and content

- Vietnamese is the default. English must cover navigation, settings, task flows, timer states, accessibility labels, dates, notifications, empty states, and errors.
- User-entered subject names, task titles, notes, and journal content are never translated.
- Use plain, calm, direct copy. Avoid generic marketing slogans and unexplained English fragments.

## Data rules

- Preserve existing localStorage data and migrate optional fields safely.
- Changing a subject after a session does not rewrite historical session subject/goal snapshots.
- Backup import validates structure, IDs, limits, and version before showing replacement confirmation. A running imported timer is restored paused.
- Cloud sync is opt-in. Do not upload local data automatically. Use per-user RLS, revision checks, and a conflict error instead of silent overwrite.
- Keep UI toast state out of portable backups.

## Required workflow for UI changes

1. Read the existing route, store, and styles before editing.
2. Use the existing React components and timer engine; avoid parallel implementations.
3. For a material layout change, inspect a real browser screenshot at 390px and 1440px, plus a populated state.
4. Run TypeScript, ESLint, unit tests, E2E tests, production build, and Design QA render audit. Report any skipped check honestly.
5. Add or update a focused test for each new user-facing behavior: state persistence, reload, keyboard focus, responsive reflow, and relevant empty/error/success states.
6. Do not claim an interface is finished from tests alone; review the rendered result.

## Current tooling skills

Use only skills relevant to the task. Available tools include a11y-audit, frontend-design, ui-design-system, webapp-ui-skill, design-critic-skill, design-qa, senior-frontend, senior-fullstack, and webapp-testing skills for future work. The PDF FOCUS_FLOW_Study_Worlds_Design_Spec.pdf is the product direction reference; its rules are summarized here so implementation can continue without copying another product.

## Do not copy references

External products such as Innook may inform broad interaction questions like persistent atmosphere, context, and compact timer presence. Do not copy their layout, names, assets, interaction choreography, or visual identity. Focus Flow must keep its own study desk, subjects, journals, worlds, and local-first behavior.

## Portable preferences for future projects

- Start from the user's screenshots and concrete criticism. Fix the real geometry, typography and interaction; do not answer visual feedback by adding more small cards.
- A meaningful new theme needs its own atmosphere and composition, not just a color swatch. Preserve a familiar baseline view.
- Keep Vietnamese and English complete and separate. Validate populated states and long labels in both languages.
- Be candid about failures, blocked reference access, unavailable image generation and tests not performed. Never promise zero possible bugs or 100% compliance.
- Install requested skills from inspectable sources; apply their relevant guidance rather than merely listing names.
- Continue authorized work, check the running result, and publish only within the user's existing authorization. Preserve unrelated local changes.

<!-- >>> fosta (script cài fosta ghi; chạy lại script sẽ thay khối này) -->
## Image generation on this machine

The built-in image_gen tool is unavailable here. For requested image generation or editing, use the pre-approved replacement:

    powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\Triet\.codex\fosta\imagegen.ps1" -Prompt "<prompt>" -Out <path\to\output.png> [-Size 1024x1024|1536x1024|1024x1536] [-Quality low|medium|high] [-Ref "a.png,b.png"]

- Pass reference/source images with -Ref. Use one call per image.
- It needs network access. Escalate only if the active permission policy supports it and requires approval.
- The script retries and can take six minutes. Wait for exit; do not interrupt it or run another copy.
- Do not use image_gen.py or ask for OPENAI_API_KEY.
- Inspect a saved result with view_image before reporting success.
- If it fails, report why. Do not fake generated results with PIL, SVG or canvas unless the user asks for that. Existing code-native scene components are not generated bitmap assets.
<!-- <<< fosta -->

## Corrections from the user on 16 November 2026

- Build an identity of our own. Reference screenshots communicate depth and atmosphere; never clone Innook or claim its live interactions were inspected when browser permissions blocked observation.
- A room gallery should let the user inspect substantial images. New artwork must be generated with the approved tool or delivered as exact prompts when generation fails. Do not disguise vector fallbacks as completed artwork.
- Keep a ready-to-use prompt pack and support importing personal room images locally. Describe image storage and backup limits.
- Browsing General study or another subject during a session must remain usable. Change the task filter without resetting the active timer or rewriting its subject/task snapshot. Goal changes prepare the next focus session.
- Provide multiple independently mixed study sounds. No autoplay on reload, a clear pause-all control, per-track volume, source attribution, failure feedback and continuity across internal routes.
