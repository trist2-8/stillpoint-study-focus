# FOCUS FLOW � The Living Study Room

A React + TypeScript productivity app with Focus Timer, Tasks, and Insights.

## Run

Requires Node.js 22.12+ (validated with Node 24).

```sh
npm ci
npm run dev
```

Open http://localhost:5173. Production: `npm run build`; deploy `dist/` with SPA fallback to `index.html`. The included vercel.json configures Vercel.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

## Architecture

- `src/features/focus/domain/timer-engine.ts`: pure timestamp transitions and injectable clock.
- `src/stores/app-store.ts`: atomic completion recording, task integration, and settings.
- `src/services/storage.ts`: validated, versioned browser storage; v0 flat schema migration to the v1 envelope.
- `src/features/analytics/domain/analytics-calculations.ts`: local-date aggregation, ranges, and streaks.
- `src/components/ui.tsx`: shared buttons, cards, dialogs, and progress.
- `src/styles/`: centralized palette and responsive styling; Tailwind Vite integration.

Timer deadlines survive refresh. Reset/skip do not create completed records. Completion IDs prevent duplicate credit. Pause excludes paused time. The next session waits for explicit input unless auto-start is enabled. Restoring an overdue timer records one completed session; it does not fabricate a chain of unattended sessions.

Completed focus duration is allocated to the local completion date, saved on the record. Historical date keys stay stable after timezone changes. Breaks are recorded but excluded from focus metrics. Completing a Pomodoro increments task progress without completing the task.

Data stays in localStorage. Browser storage errors produce an in-app message. No accounts, cloud sync, or backend are included. Use one active tab: concurrent multi-tab editing is not coordinated. Backward clock jumps beyond the session window pause the timer; forward clock jumps are treated as elapsed wall time. Sound and browser notifications depend on browser permissions and autoplay policies.

## Validation record

- 21 Vitest/React Testing Library tests passed.
- 15 Chromium Playwright tests passed, including refresh/background completion, task lifecycle, keyboard dialog focus, settings, and themes.
- All three routes checked for horizontal overflow at 360, 375, 390, 430, 768, 1024, 1280, 1440, and 1920px in light and dark themes.
- TypeScript, ESLint, and production build passed.
- `npm audit --omit=dev`: zero vulnerabilities. Full audit: seven moderate findings in the development-only typescript-eslint/minimatch chain. Critical test-runner findings were resolved by upgrading Vitest.
- Firefox/WebKit, real OS notifications/audio, and a full screen-reader audit were not performed.

The original prototype, including the pre-existing modified HTML, is preserved in `legacy/`. The old root app.js/styles.css are retained but not loaded. Legacy demo statistics are not imported as real history.

## Living Study Room design

Original theme-aware SVG illustrations live in src/features/focus/illustrations. The Focus Orb reflects timer state without changing the timestamp engine. The optional cat sleeps, wakes during focus, celebrates completion briefly, and rests during breaks. Its visibility persists in settings; older saved settings remain compatible.

The study plant progresses at 1, 4, 12, and 30 completed focus sessions. Zero completed sessions show a seed. Breaks never contribute to growth. CSS ambient effects respect prefers-reduced-motion. Mobile artwork repositions the cat and plant to keep them visible. Shared morning/midnight environmental tokens and styles are in src/styles/living-room.css.

## Giao diện hiện tại

Toàn bộ giao diện sử dụng tiếng Việt, bao gồm Việc học, Cài đặt, thông báo và hộp thoại. Lịch học trên Focus và Tiến độ dùng chung số phiên tập trung hoàn tất; chọn một ô để xem chi tiết.

Cài đặt → Bảng màu có Hoa oải hương, Đêm xanh và Rừng yên tĩnh; mỗi bảng màu hỗ trợ sáng/tối và lưu lựa chọn trên trình duyệt. Mặc định người mới dùng giao diện tối. Cài đặt có thể mở cả từ thanh điều hướng di động.

Hướng thiết kế và các skill đã dùng được ghi trong DESIGN.md. Kiểm thử responsive bao phủ 320–1920px, ba trang, ba bảng màu và hai chế độ sáng/tối; có kiểm tra tỷ lệ tương phản chữ chú thích lịch học tối thiểu 4.5:1.
