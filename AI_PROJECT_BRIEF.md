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

- `index.html`: main page structure, early iOS Safari height setup, script/style loading.
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
- Remote icons are initially rendered with a local fallback and loaded later for visible panels.
- Wallpaper selection is stored in a cookie named `bg_img`.
- Search engine preferences are stored in cookies.
- MiSans is loaded after idle on non-iOS Safari only. iOS Safari skips it to avoid first-screen font changes.
- iOS Safari gets `html.ios-safari` and `--app-height` early in `index.html`.
- Update detection fetches `data/app-version.json`, compares it numerically with the footer runtime version, and shows a footer refresh button only when the fetched version is newer.

## Important Cautions

- iOS Safari background fixes are sensitive. Avoid changing wallpaper `object-fit`, background image scale, or large safe-area extensions without user confirmation.
- The browser address bar itself is not webpage-renderable. The page can only control the document area, safe areas, and `theme-color`.
- PC layout should not be affected by mobile fixes. Prefer selectors scoped to `html.ios-safari` or mobile media queries.
- Service worker caching can make phone testing appear unchanged. Confirm the deployed version and cache state before assuming a CSS fix failed.
- `api/check.js` currently fetches arbitrary URLs from query input. Treat security hardening as a recommended future task.
- `js/main.js` contains a front-end password for a hidden section. This is only UI hiding, not real security.

## Recommended Backlog

High confidence:
- Add a small release checklist around `scripts/update-version.js`.
- Validate `data/sites.js` structure to catch missing category/icon/url fields before deploy.
- Improve iOS Safari background fallback without changing wallpaper crop.
- Add a setting to hide visitor badge or load it later.
- Clean more old/dead settings code after confirming behavior.

Needs user confirmation:
- Auto-refresh service worker cache when a new version is detected.
- Security hardening for `/api/check` with URL allow/deny rules.
- Moving search engine and wallpaper config out of `js/set.js`.
- Reworking iOS Safari fullscreen behavior or wallpaper positioning.
