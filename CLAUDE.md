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
npm install       # Install dependencies (Vite, Base44 SDK, vite-plugin-pwa)
npm run dev       # Start Vite dev server (game works without Base44 config)
npm run build     # Build to ./dist/ with service worker for offline use
npm run preview   # Preview production build locally
```

### Backend (Base44)
```bash
# After creating a Base44 app:
cp myAlias/.env.example myAlias/.env   # Add VITE_BASE44_APP_ID=<your-id>
base44 entities push                    # Push WordPack schema to Base44
base44 deploy                           # Deploy to Base44 hosting
```

### Architecture

**Entry point** (`index.html`): Large single-file game (CSS + JS inline). Vite processes the module script reference at the bottom; the inline game script is left unchanged.

**Base44 integration** (`src/`):
- `src/main.js` — Deferred module; runs after the inline game script. Calls Base44, then extends `window.WORD_LISTS` with custom word packs before the first turn.
- `src/base44.js` — Creates a Base44 SDK client using `VITE_BASE44_APP_ID`. Caches API results in `localStorage` for 24 h for offline use.

**Offline strategy**: `vite-plugin-pwa` (in `vite.config.js`) auto-generates a Workbox service worker at build time that pre-caches all assets. Without `VITE_BASE44_APP_ID`, or when offline, the game runs entirely on built-in word lists.

**Custom word packs** (`base44/entities/word_pack.jsonc`): `WordPack` entity with `language` (he/en/es), `difficulty` (1–6), `words` (string[]), `active` (boolean). Manage via Base44 dashboard; picked up on next load.

**Key global**: The inline game script exposes `window.WORD_LISTS` so the module script can extend it without touching the game logic.

---

## myAlias-android (Android APK)

### Commands
```bash
cd myAlias-android
build-apk.bat             # Full build: runs Vite build, copies dist/, then Gradle
node run-gradle.js        # Gradle build only (assembleDebug), skips web build
```

Output APK: `app/build/outputs/apk/debug/app-debug.apk`

### Architecture

- `build-apk.bat` runs `npm run build` in `../myAlias/`, then copies **`../myAlias/dist/`** (Vite output) into `app/src/main/assets/` before each Gradle build
- `MainActivity.java` — Single-activity app; loads `file:///android_asset/index.html` in a full-screen WebView with JS, DOM storage, and media playback enabled; prevents external navigation
- All Android SDK, JDK 17, and Gradle distribution are vendored locally in `myAlias-android/` (no system installs needed)
- App ID: `com.myalias.app`, target SDK 34, min SDK 26
