# AI Project Brief

This document is for AI coding assistants working on this project.
Read this file before inspecting or modifying code.

---

# 1. Project Overview

## Purpose

This project is a personal daily navigation/start-page website.

Main features:

* Bookmark navigation
* Search engine switching
* Quick links
* Wallpaper system
* Link status checking
* Lightweight personalization settings

The project focuses on being fast, stable, and easy to maintain.

---

# 2. User Priorities

When making changes, prioritize in this order:

1. First-screen loading speed
2. Stability and compatibility
3. Mobile Safari experience (especially iPhone 15 Pro Max)
4. Desktop layout preservation
5. Lightweight animations and polished UX
6. Easy bookmark/category maintenance

Avoid changes that improve appearance but reduce performance.

---

# 3. Tech Stack

Frontend:

* HTML5
* CSS3
* Vanilla JavaScript
* jQuery (existing usage)

Deployment:

* Vercel
* Serverless Functions

Storage:

* Cookies
* LocalStorage

Assets:

* Local fonts
* Service Worker cache

---

# 4. Encoding Rules

Always read and write files using UTF-8.

Many files contain:

* Chinese comments
* Chinese UI text
* Chinese bookmark descriptions

Avoid encoding corruption.

PowerShell example:

```powershell
Get-Content -Encoding UTF8 -Path path\file
```

---

# 5. Project Structure

## Main Files

### index.html

Responsible for:

* Page structure
* Initial iOS Safari height handling
* Critical resource loading
* Boot initialization

### css/style.css

Responsible for:

* Desktop styles
* Mobile styles
* iOS Safari fixes
* Animations
* Icon/font mapping

### js/main.js

Responsible for:

* First-screen logic
* Toast system
* Navigation initialization
* Category interaction
* Version update check

### js/set.js

Responsible for:

* Settings panel
* Cookies
* Search configuration
* Wallpaper settings

### js/nav-render.js

Responsible for:

* Rendering navigation cards

### js/status-dot.js

Responsible for:

* Link status checking enhancement

### data/sites.js

Source of:

* Bookmark data
* Categories
* Navigation items

### api/check.js

Responsible for:

* Serverless link checking API

### sw.js

Responsible for:

* Static resource cache

---

# 6. Coding Rules

## Prefer

* Native JavaScript
* Existing project structure
* Small targeted changes
* CSS solutions before adding dependencies

## Avoid

Do not introduce:

* React
* Vue
* Large UI frameworks
* Heavy animation libraries
* Unnecessary npm packages

Do not rewrite working modules without a clear reason.

---

# 7. Change Workflow

Before modifying code:

1. Read related files.
2. Understand current implementation.
3. Explain planned changes briefly.
4. Check possible impact.

After modifying:

1. Run:

```powershell
node scripts\check.js
```

2. Report:

   * Modified files
   * Main changes
   * Possible risks

---

# 8. Important Constraints

## Performance

First screen should remain fast.

Target:

* Cached visits: under 500ms
* No unnecessary blocking requests

Do not block first-screen rendering with:

* Remote icons
* Status checking
* Visitor information
* Update checking

---

## Mobile / iOS Safari

Be careful with:

* Viewport height
* Safe area
* Keyboard opening/closing
* Wallpaper scaling
* Fixed elements

Do not change iOS Safari related code without testing.

Desktop layout must not be affected by mobile fixes.

Prefer:

```css
html.ios-safari
```

or mobile media queries.

---

# 9. Current Architecture Notes

## Bookmark Loading

Bookmarks are loaded from:

```
data/sites.js
```

Do not move bookmark data into another system without confirmation.

Hidden bookmark sections are intentionally separated.

---

## Version Management

Never update only one version file.

When releasing changes, keep synchronized:

* data/app-version.json
* sw.js cache version
* index.html footer version

Use:

```powershell
node scripts\update-version.js YYYY.MM.DD.N
```

---

## Font System

The project uses a local MiSans UI subset.

Do not replace it with the original large remote font.

Keep:

* Small file size
* UTF-8 character compatibility
* Existing build validation

---

# 10. Forbidden Changes

Do not:

* Remove iOS Safari compatibility code casually
* Restore removed duplicate CSS files
* Add unnecessary external requests
* Put status checking into first-screen loading
* Change desktop layout while fixing mobile
* Treat frontend hidden sections as real security

---

# 11. Current Status

Stable:

* First-screen loading
* Navigation rendering
* Mobile Safari layout
* Wallpaper system
* Search interaction
* Performance mode

Be careful when changing:

* Boot animation
* iOS height handling
* Wallpaper loading
* Category indicator animation

---

# 12. Recommended Future Improvements

Possible improvements:

* Better cache management
* More security protection
* Improved status API protection
* Further animation polish

These require evaluation before implementation.

---

# Final Rule For AI

Make the smallest correct change.

Preserve existing behavior unless the user explicitly requests a redesign.

Performance and stability are more important than adding features.
