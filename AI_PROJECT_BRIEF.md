# AI Project Brief

This file is for AI assistants taking over work on this project. Read it before editing.

## Project Purpose

This is a personal daily navigation/start-page site for bookmarks, search, quick links, wallpaper, and link status checks.

The user cares most about:
- Fast and stable first-screen loading.
- Reliable mobile Safari behavior, especially iPhone 15 Pro Max.
- Minimal disruption to PC layout when fixing mobile issues.
- Easy day-to-day maintenance of bookmarks and categories.
- Preserving Chinese comments and text without encoding corruption.

## Encoding Rule

Always read and write files as UTF-8. Many files contain Chinese comments and Chinese UI text.

On PowerShell, prefer:

```powershell
Get-Content -Encoding UTF8 -Path path\to\file
```

Use `apply_patch` for manual edits.

## Key Files

- `index.html`: main page structure, early iOS Safari height/keyboard setup, script/style loading.
- `css/style.css`: main desktop/base styles.
- `css/mobile.css`: mobile and iOS Safari overrides.
- `css/font.css`: icon font and optional MiSans font class.
- `js/main.js`: first-screen tasks, welcome toast, visitor badge, update check, category indicator, password-gated reward section.
- `js/set.js`: search engine settings, wallpaper settings, search suggestions, search UI interactions.
- `js/nav-render.js`: renders navigation cards from data.
- `js/status-dot.js`: manual link availability checks.
- `data/sites.js`: bookmark/category data source.
- `data/app-version.json`: visible app version used by update check.
- `sw.js`: service worker static cache.
- `api/check.js`: serverless link status check endpoint.
- `vercel.json`: Vercel cache headers and baseline security headers.
- `OPTIMIZATION_PLAN.md`: simple checklist of completed, pending, and not recommended optimization work.
- `scripts/check.js`: single local check command for day-to-day maintenance and pre-release checks.
- `scripts/preflight.js`: compatibility wrapper for the old pre-release check command.
- `scripts/validate-sites.js`: internal validator for `data/sites.js` structure and common maintenance mistakes.
- `scripts/update-version.js`: updates `data/app-version.json` and `sw.js` cache version together.

## Versioning

Do not manually edit only one of `data/app-version.json` or `sw.js`.

Use:

```powershell
node scripts\update-version.js YYYY.MM.DD.N
```

This updates:
- `data/app-version.json` -> `version`
- `sw.js` -> `CACHE_VERSION = "nav-cache-YYYY.MM.DD.N"`
- `index.html` -> footer `#app-version`

## Current Implementation Notes

- Bookmarks are rendered from `window.NAV_SITES` in `data/sites.js`.
- Current bookmark tabs are `常用`, `影音`, `工具`, `收藏`, `装机`, and password-gated `奖励`. Keep public tabs grouped by short categories and keep descriptions brief.
- Do not move `奖励` items into public tabs unless the user explicitly confirms it; it is only front-end hidden, but the current UX treats it as a private group.
- Run `node scripts\check.js` for the single normal local check command. It includes bookmark validation and syntax checks.
- Remote icons are initially rendered with a local fallback and loaded later for visible panels.
- First-screen target is 0.5 seconds for assembled page structure on both PC and mobile. Time/search/layout should be ready quickly; remote icons, visitor badge, update check, and status checks must not block that window.
- `js/main.js` records `window.__sksirFirstScreenMs` after first paint for local debugging.
- Visitor badge, welcome toast, update check, service worker registration, and MiSans loading are intentionally delayed beyond the critical first-screen window.
- First-screen boot mask lives in `css/style.css`: `html.is-booting` shows a lightweight overlay/spinner, then `js/main.js` adds `is-first-screen-ready` and removes it after fade-out. It hides page assembly and waits briefly for wallpaper readiness, but must not wait for icons, visitor badge, update check, or status checks.
- Wallpaper selection is stored in a cookie named `bg_img`. `js/set.js` starts wallpaper loading right after first paint, updates `window.__sksirWallpaperState`, and dispatches `sksir-wallpaper-ready` on `load`, `error`, or empty source so the boot mask does not fade before the wallpaper is ready unless the wait times out.
- Search engine preferences are stored in cookies.
- Performance mode is stored in `localStorage` under `sksir-performance-mode`: `auto`, `full`, or `lite`.
- The early script in `index.html` applies `html.perf-lite` before CSS loads. Auto mode enables it for `prefers-reduced-motion`, `navigator.connection.saveData`, very low `navigator.deviceMemory`, or conservative non-iOS low hardware signals.
- The settings panel has a `性能模式` tab. `js/set.js` initializes and updates it without requiring a page refresh.
- MiSans is loaded after idle on non-iOS Safari only. iOS Safari skips it to avoid first-screen font changes.
- iOS Safari gets `html.ios-safari` and `--app-height` early in `index.html`. `css/mobile.css` extends `.bg-all` beyond the visible viewport and makes `#bg` / `.cover` absolute inside it, so the wallpaper covers safe areas and Safari toolbar height changes without changing PC behavior.
- While a form control is focused, the iOS height updater locks page height and waits for the keyboard close animation to settle before writing a new `--app-height`; this avoids the mobile search box close flow shrinking and expanding the first screen.
- The footer is a compact daily-quote band. `js/main.js` sets `#daily-quote` from a local quote list using the current date, so it is stable within a day and does not add a network request.
- Keep the footer `#app-version` span even if it is visually subdued because update detection reads it as the runtime version.
- Keep the hidden `.footer-separator` immediately before `#update-check`; `showUpdateButton` reveals that previous sibling when an update is available.
- Category tabs use an injected `.category-anim-bg` indicator. `js/main.js` computes its position from the active item's `offsetLeft` and also writes `--category-indicator-x`; mobile CSS moves the indicator with `transform` to avoid creating extra horizontal scroll width.
- Update detection fetches `data/app-version.json`, compares it numerically with the footer runtime version, and shows a footer refresh button only when the fetched version is newer. Do not reintroduce `localStorage` as the current-version source.
- `/api/check` is CommonJS so local `node --check api/check.js` works. It loads allowed hosts from `data/sites.js`, rejects non-navigation hosts, blocks local/private/metadata targets, checks DNS-resolved addresses, does not follow redirects, and uses an 8 second timeout.
- `vercel.json` sets no-store/no-cache headers for `data/app-version.json`, `sw.js`, and `/api/check`, plus baseline security headers. It intentionally does not set a strict CSP yet.

## Important Cautions

- iOS Safari background fixes are sensitive. Avoid changing wallpaper `object-fit`, background image scale, or large safe-area extensions without user confirmation.
- iOS Safari keyboard fixes are also sensitive. Avoid writing intermediate `visualViewport.height` values during focus/blur because it can cause the page to shrink and expand when the keyboard closes.
- The browser address bar itself is not webpage-renderable. The page can only control the document area, safe areas, and `theme-color`.
- PC layout should not be affected by mobile fixes. Prefer selectors scoped to `html.ios-safari` or mobile media queries.
- High-end devices should keep full visuals by default. Put low-performance visual reductions under `html.perf-lite` instead of removing effects globally.
- Do not classify iOS devices as low performance from `navigator.hardwareConcurrency` alone; Safari may report privacy-limited or non-representative hardware values.
- Do not re-enable mobile `.category-row::before` hover shine or scrollbar styling without testing on touch devices; it can create phantom horizontal blank space and break the active indicator position.
- Service worker caching can make phone testing appear unchanged. Confirm the deployed version and cache state before assuming a CSS fix failed.
- `/api/check` is not a full rate-limited service. If abuse appears in Vercel logs, add external rate limiting or disable the public status endpoint.
- `js/main.js` contains a front-end password for a hidden section. This is only UI hiding, not real security.

## Recommended Backlog

High confidence:
- Add a small release checklist around `scripts/update-version.js`.
- Run `scripts/check.js` as part of the normal pre-release check.
- Improve iOS Safari background fallback without changing wallpaper crop.
- Add a setting to hide visitor badge.
- Clean more old/dead settings code after confirming behavior.

Needs user confirmation:
- Auto-refresh service worker cache when a new version is detected.
- External rate limiting for `/api/check` if public traffic becomes noisy.
- Moving search engine and wallpaper config out of `js/set.js`.
- Reworking iOS Safari fullscreen behavior or wallpaper positioning.
