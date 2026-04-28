# Project Overview
Pre-built React webphone UI widget for Wavoip devices.
Renders as an isolated Shadow DOM component; exposes a programmatic `window.wavoip` API after mounting.
Built on top of `@wavoip/wavoip-api`.

# Tech Stack

| Component | Technology |
|---|---|
| Language | TypeScript + React 18 |
| Build | Vite + vite-plugin-dts |
| Styling | Tailwind CSS v4 (prefixed `wv-`) |
| UI primitives | Radix UI |
| Icons | Phosphor Icons, Lucide |
| QR rendering | qrcode.react |
| Toasts | Sonner |

# Folder Structure
```
src/
├── assets/
│   ├── index.css          CSS variables + Tailwind base (light/dark themes)
│   └── sounds/            Audio files for ringtones, DTMF, etc.
├── components/            Shared UI components (not screens)
│   └── layout/            Status bar + settings modal
├── hooks/                 useCallManager, useDeviceManager
├── lib/
│   ├── device-settings.ts localStorage helpers for device token persistence
│   ├── picture-in-picture.ts PiP integration
│   └── webphone-api/
│       ├── WebphoneAPI.ts  Public WebphoneAPI type definitions
│       └── api.ts          APIProxy + mergeToAPI() — aggregates provider APIs
├── providers/             React context providers (Wavoip, Settings, Theme, etc.)
├── screens/               CallScreen, OutgoingScreen, KeyboardScreen
├── App.tsx                Root component wired to Shadow DOM
└── index.tsx              WebPhoneComponent class (render / destroy)
```

# Architecture Overview

## Public surface
- **`webphone` (default export)** — `WebPhoneComponent` with `render(config?)` and `destroy()`
- **`window.wavoip`** — `WebphoneAPI` available after `render()` resolves:
  - `call` — start, get active/outgoing/offers, set dial input
  - `device` — add, remove, enable, disable
  - `notifications` — add, remove, clear, read
  - `widget` — open, close, toggle, set button position
  - `theme` — get/set dark/light/system
  - `position` — get/set webphone position
  - `settings` — toggle UI controls visibility

## Isolation
The widget mounts inside a Shadow DOM (`mode: "closed"`) appended to `document.body`.
Tailwind styles are scoped with the `wv-` prefix to prevent bleed-in/bleed-out.

## API aggregation
`mergeToAPI()` in `api.ts` collects partial implementations from each provider.
When all required namespaces are registered, `webphoneAPIPromise` resolves and `window.wavoip` is set.

# CI/CD
After every change these commands must pass:
```
pnpm lint
pnpm build
```

# Documentation

Documentation lives in `docs/` and is formatted for GitBook (synced via Git). `.gitbook.yaml` at the repo root points GitBook at `./docs/`.

## GitBook file layout
```
docs/
  README.md          ← homepage
  SUMMARY.md         ← table of contents / sidebar
  getting-started/
    installation.md
    initialization.md
  api.md
  theming.md
```

## Key GitBook syntax rules
- **Frontmatter**: YAML block at the very top — `description:`, `icon:`, `hidden:`, `layout:` fields.
- **Hints**: `{% hint style="info|warning|danger|success" %}...{% endhint %}`
- **Tabs**: `{% tabs %}{% tab title="..." %}...{% endtab %}{% endtabs %}`
- **Stepper**: `{% stepper %}{% step %}## Title\ncontent{% endstep %}{% endstepper %}`
- **Expandable**: `<details><summary>Title</summary>content</details>`
- **Columns** (max 2): `{% columns %}{% column %}...{% endcolumn %}{% endcolumns %}`
- **Buttons**: `<a href="..." class="button primary">Label</a>`
- **Cards**: `<table data-view="cards">` with `<th data-card-target data-type="content-ref">`
- Internal links use relative `.md` paths: `[text](../theming.md)`
- Always close custom blocks exactly — mismatched tags silently break rendering.

## When to update docs
Update `docs/` whenever `WebphoneSettings`, `WebphoneAPI`, CSS variables, or the render/destroy interface change.
Keep `SUMMARY.md` in sync with the actual file structure.

## Language
All documentation in `docs/` must be written in **Portuguese (pt-BR)**.
