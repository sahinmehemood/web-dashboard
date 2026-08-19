# Hermes Command Dashboard — Agent Implementation Guide

## Overview

This is the **Hermes Command Dashboard** (`sahinmehemood/minimalist-web-style`) — an enterprise-grade, minimalist command dashboard for monitoring and controlling your Hermes AI agent system running on Android/Termux.

**Live URL:** https://sahinmehemood.github.io/web-dashboard/

## Architecture

```
minimalist-web-style/          ← Source repo
├── src/
│   ├── components/
│   │   ├── dashboard/         ← All dashboard components
│   │   │   ├── app-shell.tsx          — Layout shell (sidebar + header + outlet)
│   │   │   ├── app-sidebar.tsx        — Navigation sidebar
│   │   │   ├── dashboard-header.tsx   — Top header with breadcrumbs, clock, status
│   │   │   ├── command-panel.tsx      — ⌘K command palette
│   │   │   ├── keyboard-shortcuts-dialog.tsx — ? shortcut help
│   │   │   ├── stat-card.tsx          — Metric card with sparkline + progress ring
│   │   │   ├── metric-chart.tsx       — Recharts sparkline
│   │   │   ├── activity-feed.tsx      — Activity event list
│   │   │   ├── code-block.tsx         — Monospace code display
│   │   │   ├── page-header.tsx        — Page title + description + actions
│   │   │   ├── animated-counter.tsx   — Animated number counter
│   │   │   ├── progress-ring.tsx      — SVG circular progress + gauge
│   │   │   ├── system-topology.tsx    — SVG service dependency graph
│   │   │   ├── deployment-pipeline.tsx — Step-by-step deployment UI
│   │   │   ├── error-boundary.tsx     — Page-level error boundary
│   │   │   ├── feature-flags.tsx      — Feature flag system
│   │   │   └── skeleton.tsx           — Loading skeleton components
│   │   ├── ui/                ← shadcn/ui primitives
│   │   └── theme-provider.tsx ← Dark/light theme
│   ├── hooks/
│   │   ├── use-dashboard.ts   ← All Convex data hooks
│   │   ├── use-auth.ts        ← Auth hook
│   │   └── use-settings.ts    ← Settings + density hook
│   ├── lib/
│   │   ├── demo.ts            ← Demo data (DT, DC, DP, DDEV, etc.)
│   │   ├── env.ts             ← DEMO_MODE, CONVEX_URL
│   │   ├── status.tsx         ← toneForStatus, BadgeDot, tone colors
│   │   ├── formatters.ts      ← formatUptime, formatClock, formatMb, etc.
│   │   ├── history.ts         ← mockTelemetryHistory
│   │   └── vly-ai-integrations.ts ← VLY plugin (import.meta.env)
│   ├── pages/dashboard/       ← All page components
│   │   ├── overview.tsx       ← /dashboard (home)
│   │   ├── crown.tsx          ← /dashboard/crown
│   │   ├── providers.tsx      ← /dashboard/providers
│   │   ├── crons.tsx          ← /dashboard/crons
│   │   ├── activity.tsx       ← /dashboard/activity
│   │   ├── brain.tsx          ← /dashboard/brain
│   │   ├── console.tsx        ← /dashboard/console
│   │   ├── bots.tsx           ← /dashboard/bots
│   │   ├── agents.tsx         ← /dashboard/agents
│   │   ├── health.tsx         ← /dashboard/health
│   │   └── settings.tsx       ← /dashboard/settings
│   ├── convex/                ← Convex backend (stubs for demo)
│   ├── main.tsx               ← App entry + routing
│   └── index.css              ← Global styles + animations
├── isolate/                   ← Build artifacts (DO NOT MODIFY)
├── vite.config.ts             ← Vite config + VLY plugin
└── package.json
```

## Key Concepts

### Demo Mode
When `VITE_CONVEX_URL` is not set, the app runs in **demo mode** (`DEMO_MODE = true` in `src/lib/env.ts`). All data comes from `src/lib/demo.ts` with realistic mock data matching your actual system.

### Device Identity
- **DID** = `"hermes-primary"` — your device ID constant
- **DDEV** = device identity object (model, OS, arch, kernel, etc.)
- Both defined in `src/lib/demo.ts`

### Theme System
- Key: `hermes-theme` in localStorage
- Supports: `light`, `dark`, `system`
- CSS variables in `src/index.css` under `:root` and `.dark`

### Feature Flags
Control UI features via `src/components/dashboard/feature-flags.tsx`:
- `topologyMap` — System dependency graph
- `deploymentPipeline` — Deployment step visualization
- `progressRings` — Circular progress indicators
- `animatedCounters` — Animated number counting
- `quickStatusBar` — Header status bar
- `dependencyMap` — Service dependency grid
- `pageTransitions` — AnimatePresence page transitions
- `devicePanel` — Device identity panel on overview

Stored in localStorage under `hermes-feature-flags`.

### Animation System
- **Page transitions**: `AnimatePresence` with fade+slide
- **Staggered lists**: CSS `stagger-children` class
- **Micro-interactions**: CSS `:active` scale(0.97)
- **Reduced motion**: `MotionConfig reducedMotion="user"` — respects system preference
- **Shimmer skeletons**: `.shimmer` CSS class

## Build & Deploy

### Prerequisites
- Node.js v24+ (Termux: `pkg install nodejs`)
- npm (comes with nodejs)

### Commands
```bash
# Install dependencies
npm install

# Type check
node node_modules/typescript/bin/tsc -b

# Build
node node_modules/vite/bin/vite.js build

# Preview locally
node node_modules/vite/bin/vite.js preview --port 4173
```

### GitHub Pages Deployment
The deploy workflow:
1. Build in `minimalist-web-style`
2. Sync source to `sahinmehemood/web-dashboard` main branch
3. Copy `dist/` to `web-dashboard` gh-pages branch
4. Push gh-pages

```bash
# Automated deploy (run from minimalist-web-style/)
./deploy.sh
# Or manually:
git add -A && git commit -m "message" && git push origin main
tar --exclude='./node_modules' --exclude='./dist' --exclude='./isolate' --exclude='./.git' --exclude='./src/convex/_generated' -cf /tmp/sync.tar .
cd ../web-dashboard && tar --exclude='./.git' --exclude='./isolate' -xf /tmp/sync.tar
git add -A && git commit -m "Sync" && git push origin main
git checkout gh-pages && git rm -rf . && cp -r ../minimalist-web-style/dist/. . && printf '' > .nojekyll
git add -A && git commit -m "Rebuild" && git push -f origin gh-pages
git checkout main
```

## Your System Architecture

The dashboard monitors this setup:

### Crown Services (pm2-like)
| Service | Role | Port |
|---------|------|------|
| `bot` | Main Telegram gateway | — |
| `bot2` | Second Telegram gateway | — |
| `web` | Dashboard UI server | :9119 |
| `tunnel` | Serveo SSH tunnel | :2222 → :9119 |
| `proxy` | Dashboard proxy | :9120 → :9119 |
| `search` | SearXNG search engine | :8888 |
| `scraper` | Web scraper | — |

### Telegram Bots
| Bot | Role |
|-----|------|
| `sahinworkbot` | Main Hermes gateway |
| `mysecondbot` | Second gateway |
| `alerts_bot` | Alert notifications |
| `legacy_hermes_bot` | Legacy gateway |

### Model Providers
| Provider | Model | Status |
|----------|-------|--------|
| Kilocode (OpenCode) | azure_openai/gpt-5.1-codex | active |
| OpenRouter | minimax-m1 | active |
| NVIDIA | moonshotai/kimi-k2.5 | active |
| OpenCode Zen | mimo-v2.5-free | active |
| Z.AI | glm-5 | active |
| Google Gemini | gemini-3-flash-preview | active |
| Ollama (local) | qwen3.5:9b | active |

### Cron Jobs
| Job | Schedule | Purpose |
|-----|----------|---------|
| `gov` | Weekly | Governance checks |
| `health` | 30 min | System health scan |
| `brain-git` | 6 hours | Git push vault |
| `brain-autosave` | 30 min | Auto-save vault |
| `brain-ingest` | 6 hours | Process inbox |
| `brain-safety-net` | 30 min | Backup vault |

### Device
- **Model:** Google Pixel 7
- **OS:** Android 16 (BP2A.250605.031.A3)
- **Kernel:** 5.10.237-android14-11
- **Arch:** aarch64
- **Termux:** 0.118.1
- **Battery:** Adaptive, 59%, charging via USB

## Updating the Dashboard

### To add a new page:
1. Create `src/pages/dashboard/newpage.tsx`
2. Add route in `src/main.tsx` inside the `<Route path="/dashboard">` block
3. Add nav item in `src/components/dashboard/app-sidebar.tsx`
4. Add title mapping in `src/components/dashboard/dashboard-header.tsx` TITLES object
5. Add keyboard shortcut in `src/components/dashboard/app-shell.tsx` NAV_KEYS

### To add a new component:
1. Create in `src/components/dashboard/`
2. Import in the relevant page
3. Follow existing patterns: use `cn()` for classes, `toneText`/`toneBg` for colors

### To modify demo data:
Edit `src/lib/demo.ts` — all mock data is defined there.

### To add new Convex queries:
1. Add query in `src/convex/` (e.g., `dashboard.ts`)
2. Add hook in `src/hooks/use-dashboard.ts`
3. Add demo fallback in `src/lib/demo.ts`
4. The hook pattern: `{ data: live ?? DEMO_FALLBACK, isDemo: live == null }`

## Important Notes

- **DO NOT** modify `src/convex/_generated/` — it's gitignored and auto-generated
- **DO NOT** modify `src/convex/auth.ts`, `src/convex/auth.config.ts`, `src/convex/auth/emailOtp.ts`
- **DO NOT** modify `isolate/` — it's a committed build artifact
- `vite.config.ts` uses `process.env.VITE_BASE ?? "/web-dashboard/"` for base path
- `vly-ai-integrations.ts` uses `import.meta.env` (NOT `process.env`)
- TypeScript errors won't block build but will show in IDE — always run `tsc -b` before committing
