# Focus Flow room direction — 16 November 2026

This change follows the user's correction: use the reference to understand an atmosphere-led personal study experience, never clone Innook. The website could not be observed because the saved browser policy still denied page reads, even after the user opened its room URL. The supplied screenshots are the visual evidence.

Our identity: private study rooms with a compact lower timer dock, personal task and subject management, local session notes and an individually mixed soundscape. No participant counts, join-room social language, public rooms, copied assets, neon gradients or imitation of reference names.

Room selection is a landscape image catalogue, with preview, favorites and a local custom-image input. Immersive mode gives the scene the full viewport; Desk mode preserves the existing working layout. All important text sits on solid surfaces. Scene selection is independent of task/session state.

Seven CC0/public-domain environmental recordings plus synthesized brown noise form the sound mixer. Audio starts only after a user action and survives internal navigation. Browser reload restores volume choices but pauses playback.

Browsing another subject during a running or paused timer changes only the task filter. The active session keeps its captured task and subject. Goal changes configure the next focus session rather than rewriting the current one.

Artwork is still a separate deliverable: Fosta currently reports a missing configuration key. No new bitmap is invented in code. Existing room photographs and original vector fallbacks remain until custom artwork is imported. public/world-image-prompts.md contains the six original scene briefs and exact integration steps.

## Verification

The room catalogue, sound mixer and immersive page were measured in both lighting modes at 320, 390 and 1440 CSS pixels; Room view was also measured with the 180-minute countdown. All 21 Design QA snapshots passed contrast, reflow, focus and target-size checks. This is a measured screen audit, not a claim of full accessibility conformance. Real audio decoding/playback, persistence without autoplay, file-load failure, local image import/cancel/reload, subject browsing during a session and quiet-view restoration have focused browser tests.

Final checks: TypeScript, ESLint and production build passed; 47 unit tests passed. The 60 browser cases passed after correcting a test that assumed no elapsed time during a reload; the revised check verifies the persisted timer deadline and pause stability. All seven bundled recordings decode successfully, and playback tests use the real audio elements.
