# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This repo contains two projects:

- **`myAlias/`** — Static web assets for a Hebrew word game ("משחק הסברים בעברית")
- **`myAlias-android/`** — Android WebView wrapper that bundles `myAlias/` into an APK

---

## myAlias (Hebrew Word Game — Vite + Base44)

### Commands
```bash
cd myAlias
npm install            # Install dependencies (Vite, Base44 SDK, vite-plugin-pwa)
npm run dev            # Start Vite dev server (game works without Base44 config)
npm run build          # Runs generate-icons.mjs, then vite build → ./dist/ with service worker
npm run preview        # Preview production build locally

deploy-prod.bat        # Build + `base44 site deploy` to production app (ID 69bb0f318b7ad64ca3b003e7)
deploy-debug.bat       # Swap .env + base44/.app.jsonc to debug app, build, deploy, restore prod config
```

### Versioning
Bump both on every deploy, kept in sync:
- `index.html:1234` — `const APP_VERSION = "x.y.z";`
- `public/version.json` — `{ "version": "x.y.z" }`

`version.json` is forced to **NetworkOnly** in `vite.config.js`'s Workbox config (never cached by the service worker) so the running app can detect new versions.

### Architecture

**Entry point** (`index.html`): Large single-file classic Alias game (CSS + inline `<script>` containing `APP_VERSION`, `WORDS`, and all core game logic). Vite processes the module script reference at the bottom; the inline game script is left unchanged.

**Key global**: The inline game script exposes `window.WORD_LISTS` so the ES module entry point can extend it without touching the inline game logic.

**Module entry** (`src/main.js`): Deferred module; runs after the inline game script. Calls Base44 to fetch custom word packs, then pushes them into `window.WORD_LISTS[language][difficulty]` before the first turn.

**Base44 client** (`src/base44.js`): Creates a Base44 SDK client using `VITE_BASE44_APP_ID`. Caches WordPack API results in `localStorage` for 24 h for offline use. Without an app ID, or when offline, the game runs entirely on built-in word lists.

**Ptakim multiplayer mode** (`src/ptakim.js`, `src/ptakim-api.js`, `src/ptakim.css`): Separate party-game mode ("פתקים") with rooms, teams, submitted notes, and rounds. Uses direct Base44 entity CRUD (no auth) via `@base44/sdk`; real-time sync via entity subscriptions. Privacy of notes is enforced in the UI (press-and-hold reveal), not server-side. Entities: `PtakimRoom`, `PtakimNote` (see `base44/entities/`). Optional server-side logic lives in `base44/functions/ptakim-*` (5 Cloud functions: create-room, join-room, action, get-note, submit-notes) — but the UI primarily talks to entities directly.

**Install prompt** (`src/install-prompt.js`): Shows a PWA install banner 1.5 s after load — native `beforeinstallprompt` flow on Android, manual instructions on iOS. Dismissal remembered for 7 days.

**Offline strategy**: `vite-plugin-pwa` (in `vite.config.js`) auto-generates a Workbox service worker at build time that pre-caches all JS/CSS/HTML/SVG/PNG/ICO/WOFF2. `clientsClaim` + `skipWaiting` so new SWs activate immediately. `version.json` is excluded via `navigateFallbackDenylist` + NetworkOnly `runtimeCaching`.

**Base44 schemas** (`base44/entities/*.jsonc`):
- `WordPack` — `language` (he/en/es), `difficulty` (1–6), `words` (string[]), `active` (boolean)
- `PtakimRoom`, `PtakimNote` — multiplayer state (see files for full schema)

Manage data via Base44 dashboard; `base44 entities push` to sync schema changes.

---

## myAlias-android (Android APK)

### Commands
```bash
cd myAlias-android
build-apk.bat             # Full build: runs npm install + build in ../myAlias/, copies dist/, then Gradle
node run-gradle.js        # Gradle build only (assembleDebug), skips web build
```

Output APK: `app/build/outputs/apk/debug/app-debug.apk`

### Architecture

- `build-apk.bat` runs `npm run build` in `../myAlias/`, then `xcopy`s **`../myAlias/dist/`** (Vite output) into `app/src/main/assets/` before each Gradle build
- `MainActivity.java` — Single-activity app; loads `file:///android_asset/index.html` in a full-screen WebView with JS, DOM storage, and media playback enabled; prevents external navigation
- All Android SDK, JDK 17, and Gradle distribution are vendored locally in `myAlias-android/` (no system installs needed). `run-gradle.js` sets `JAVA_HOME` and `ANDROID_HOME` before invoking `gradlew`.
- App ID: `com.myalias.app`, target SDK 34, min SDK 26
