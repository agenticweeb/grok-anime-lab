# PROJECT_CONTEXT.md — Grok Anime Lab / Lore Bridge
## Last Updated: 2026-07-02

---

## 1. PROJECT OVERVIEW

**What we're building:** **Lore Bridge** — a premium, immersive, AI-powered lore companion web app for anime/donghua fans. Users toggle between **Lord of the Mysteries (LoM)** and **Mushoku Tensei (MT)**, and switch between **Anime Watcher** (strict spoiler lock) and **Novel/LN Reader** (full lore access) modes. The oracle speaks as named in-universe fan personas (not a generic chatbot).

**Target user:** Anime-only viewers confused by dense lore; novel readers who want theory-crafting with spoiler boundaries respected.

**Live URL:** https://lore-bridge.vercel.app

**GitHub Repo:** https://github.com/agenticweeb/grok-anime-lab

**Tech stack:**
| Layer | Technology |
|---|---|
| Frontend | Pure HTML / CSS / Vanilla JS (ES modules), zero build step |
| CMS | `config.js` (headless config — personas, copy, progress options, easter eggs) |
| Immersion layer | `immersion.js` (session memory, metadata parsing, effects, theory cards) |
| Backend | Vercel serverless `api/chat.js` (Node.js 20, ESM) |
| AI primary | xAI Grok API (`grok-3-mini`, streaming SSE) |
| AI fallback | Groq API (`llama-3.1-8b-instant`) |
| Hosting | Vercel — GitHub auto-deploy, Root Directory: `tools/lore-bridge` |
| Monorepo root | Python venv + agent prompts + data scripts (not deployed) |

**Deployment model:** Push to `main` on GitHub → Vercel auto-deploys **only** `tools/lore-bridge/`. No CLI deploy. No `vercel.json` in lore-bridge (zero-config: static files + `/api` functions).

---

## 2. COMPLETE PROJECT STRUCTURE

```text
/home/thierry/grok-anime-lab/
├── .env                          # Root API keys (NEVER COMMIT)
├── .env.local                    # Local overrides (gitignored)
├── .gitignore
├── LICENSE
├── PROJECT_CONTEXT.md            # THIS FILE
├── README.md
├── requirements.txt              # Python deps (root venv)
├── vercel.json                   # Root-only config (ignored by lore-bridge Vercel project)
│
├── agents/                       # Grok custom agent prompt files
│   ├── loremaster-prompt.md
│   ├── vibecoder-prompt.md
│   ├── threadsmith-prompt.md
│   └── growthhacker-prompt.md
│
├── data/
│   └── trend-reports/
│       └── 2026-07-01-briefing.md
│
├── grok anime lab guide/         # Operational guides (setup, daily ops, calendar)
│   ├── 01-SETUP/
│   ├── 02-DAILY-OPS/
│   ├── 03-CONTENT-TYPES/
│   ├── 04-API-SCRIPTS/
│   ├── 05-PROFILE-BRANDING/
│   ├── 06-30DAY-CALENDAR/
│   └── 07-QUICK-REFERENCE/
│
├── sanity-studio/                # Accidental scaffold — NOT IN USE (untracked)
│
└── tools/
    └── lore-bridge/              # *** DEPLOYED APP — Vercel Root Directory ***
        ├── api/
        │   └── chat.js           # Serverless function: AI chat, personas, history
        ├── public/
        │   └── images/
        │       ├── lom-bg.jpg    # LoM 4K background (COMMIT after local edits!)
        │       ├── mt-bg.jpg     # MT 4K background (COMMIT after local edits!)
        │       ├── lom1-bg.jpg   # Local backup (untracked)
        │       └── mt1-bg.jpg    # Local backup (untracked)
        ├── config.js             # CMS: personas, progress, easter eggs, links
        ├── immersion.js          # Client: memory, veil, eggs, sounds, share cards
        ├── index.html            # Main UI (~1100 lines)
        ├── favicon.svg
        ├── package.json          # type: module for ESM API
        └── .gitignore            # .vercel, .env*
```

**Files created/modified in this conversation (2026-07-01 → 2026-07-02):**

| File | Action |
|---|---|
| `tools/lore-bridge/vercel.json` | Created then **deleted** (CLI conflict fix) |
| `tools/lore-bridge/.vercel/` | **Deleted** (CLI unlink) |
| `tools/lore-bridge/package.json` | Modified (`private: true`, `type: module`) |
| `tools/lore-bridge/api/chat.js` | Rewritten multiple times: streaming, buffered fallback, personas, history |
| `tools/lore-bridge/index.html` | Major: Firefox fix, backgrounds, meta tags, full immersion UI |
| `tools/lore-bridge/config.js` | Expanded: personas, progress, easter eggs, memory config, image paths |
| `tools/lore-bridge/immersion.js` | **Created** — client immersion layer |
| `tools/lore-bridge/favicon.svg` | **Created** |
| `tools/lore-bridge/public/images/*.jpg` | Updated locally — must `git add` + push for Vercel |
| `PROJECT_CONTEXT.md` | This update |

---

## 3. COMPLETED MILESTONES

- [x] GitHub repo + `.env` security
- [x] Lore Bridge MVP backend (`api/chat.js`, xAI streaming + Groq fallback)
- [x] Lore Bridge MVP frontend (`index.html`, portal transitions, diegetic UI)
- [x] Headless CMS (`config.js`)
- [x] **Vercel GitHub deploy** (abandoned CLI; Root Directory `tools/lore-bridge`)
- [x] Removed conflicting `vercel.json` / `.vercel` CLI link
- [x] Firefox buffered chat fallback (Chrome/Brave/Safari stream; Firefox JSON)
- [x] Background images fix (`/public/images/` path + `#bg-layer` + lighter scrim)
- [x] OG/Twitter meta tags + favicon
- [x] **Full immersion upgrade:**
  - Named personas (Daly, Archivist, Rui, Elinalise)
  - Session memory via `sessionStorage` (no login)
  - Progress stamp via `localStorage`
  - Warmth/trust meter
  - Spoiler Veil UI + `⟦veil:...⟧` metadata
  - Fan receipts `📜` + MT anime-skipped panel `📺`
  - Easter eggs (`amen`, `muru muru`, etc.)
  - Ambient Web Audio on universe switch
  - Theory share cards (canvas PNG, reader mode)
  - About modal (replaces alert)
  - In-universe message styling per mode
  - Rich emoji-forward fan-voice prompts

---

## 4. CURRENT TASK — EXACTLY WHERE WE LEFT OFF

**Last action:** User updated `lom-bg.jpg` and `mt-bg.jpg` locally on PC but images did not appear on production.

**Root cause:** Vercel deploys from **GitHub**, not the local filesystem. Modified images were **not committed/pushed**. Local changes showed:
```
modified:   tools/lore-bridge/public/images/lom-bg.jpg  (29KB → 126KB)
modified:   tools/lore-bridge/public/images/mt-bg.jpg   (13KB → 304KB)
deleted:    tools/lore-bridge/public/images/ltm.jpg
untracked:  lom1-bg.jpg, mt1-bg.jpg (local backups)
```

**Fix in progress:** Stage images, add `?v=2` cache-bust to `config.js` image URLs, commit + push.

**After this commit:** Hard refresh production. Backgrounds should update. Bump `?v=N` in `config.js` whenever images change again.

---

## 5. KEY ARCHITECTURAL DECISIONS

### Deployment
- **Monorepo** with isolated Vercel project scoped to `tools/lore-bridge/`
- **No `vercel.json`** in lore-bridge — Vercel zero-config serves `index.html` + `api/*.js` + static files
- Root `grok-anime-lab/vercel.json` does NOT affect lore-bridge project
- **Static files path quirk:** Vercel serves `public/` literally at `/public/...` (NOT `/images/...`). Config uses `/public/images/lom-bg.jpg`

### No framework / no build
- Single `index.html` + ES module imports (`config.js`, `immersion.js`)
- `"type": "module"` in `package.json` enables ESM in `api/chat.js`

### AI architecture
- Primary: xAI `grok-3-mini` with `stream: true`
- Fallback: Groq `llama-3.1-8b-instant` if xAI fails
- Firefox desktop: `stream: false` (buffered JSON) — Firefox breaks SSE `fetch` ReadableStream
- Other browsers: SSE stream with auto-retry to buffered on failure

### Memory without login
| Data | Storage | Lifetime |
|---|---|---|
| Chat history (8 turns) | `sessionStorage` key `lore-bridge-session` | Until tab closes |
| Warmth + easter eggs found | `sessionStorage` | Until tab closes |
| Progress stamp ("Where are you?") | `localStorage` key `lore-bridge-progress` | Persists across refresh, same device |

History sent to API as `history` array. No server-side user DB.

### Persona / metadata protocol
AI appends hidden metadata tags on final line (parsed client-side, stripped from display):
- `⟦receipts:Ep 7|Vol 1 Ch 3⟧`
- `⟦skipped:anime cut this scene⟧` (MT watcher)
- `⟦veil:in-character refusal⟧` (triggers fog animation)

### Theming
- CSS variables + `theme-lom` / `theme-mt` body classes
- `#bg-layer` (image) + `#bg-scrim` (gradient overlay) — images NOT on `body` directly
- Portal overlay clip-path animation on universe switch
- Parallax SVG layers + particle system

### Environment variables (Vercel Dashboard)
- `XAI_API_KEY` — required
- `GROQ_API_KEY` — fallback

---

## 6. DEPENDENCIES

### Node (`tools/lore-bridge/package.json`)
```json
{
  "name": "lore-bridge",
  "version": "1.0.0",
  "private": true,
  "type": "module"
}
```
No npm dependencies installed. Vercel provides Node 20 runtime.

### Python (root `requirements.txt` / venv — not used by deployed app)
| Package | Version |
|---|---|
| xai-sdk | 1.17.0 |
| python-dotenv | 1.2.2 |
| requests | 2.34.2 |
| rich | 15.0.0 |
| typer | 0.26.8 |
| schedule | 1.2.2 |
| aiohttp | 3.14.1 |
| pydantic | 2.13.4 |

### Global tooling (developer machine)
- vercel-cli 54.15.1 (no longer used for deploy)
- git → GitHub → Vercel pipeline

---

## 7. KNOWN ISSUES / BLOCKERS

| Issue | Status | Notes |
|---|---|---|
| **Firefox chat** | Mitigated | Buffered JSON path; user retesting later |
| **Background images not updating** | Fixing now | Must commit + push binary JPGs to GitHub |
| **Vercel/CDN image cache** | Mitigated | `?v=2` query param on image URLs in config |
| **No cross-device memory** | By design | No login; sessionStorage is per-tab |
| **API abuse / rate limiting** | Open | No throttle yet — risk before viral launch |
| **buyMeACoffee placeholder** | Partial | Points to GitHub repo until real BMC link added |
| **sanity-studio/** | Ignore | Untracked accident in monorepo |
| **ltm.jpg** | Removed | Orphan file deleted from repo |
| **lom1-bg.jpg / mt1-bg.jpg** | Local only | Untracked backups on dev machine |

---

## 8. NEXT STEPS

### Immediate (after image push)
1. Verify backgrounds on https://lore-bridge.vercel.app after deploy
2. Hard refresh (Ctrl+Shift+R) or private window
3. Test immersion: progress picker, warmth dots, easter egg `amen`, spoiler veil as watcher

### Pre-launch (recommended, not yet done)
1. **API rate limiting** — protect xAI/Groq credits before X campaign
2. Real **Buy Me a Coffee** link in `config.js`
3. Firefox final verification
4. Execute Day 1/Day 2 X threads per `grok anime lab guide/06-30DAY-CALENDAR/`

### Future enhancements (discussed, not built)
- Optional GitHub login for cross-device memory
- Live X discourse pulse (curated JSON)
- Voice oracle (browser TTS per universe)
- Watch party timestamp sync

---

## 9. CURRENT STATE OF KEY FILES

> Full code lives in repo. Reference paths below. Do NOT duplicate full file contents here.

### `tools/lore-bridge/api/chat.js`
- Vercel serverless handler (ESM `export default`)
- `buildSystemPrompt()` — persona voice, emoji rules, warmth, progress, metadata tag instructions
- `buildMessages()` — system + `history` (last 16 turns) + user message
- `callAiProvider()` — xAI → Groq fallback
- Streaming via `pipeStreamToClient()` SSE
- Buffered via `stream: false` → `{ content }` JSON
- Accepts: `message, series, audience, progress, warmth, nickname, history, stream`
- Max message length: 800 chars
- `export const config = { maxDuration: 30 }`

### `tools/lore-bridge/config.js`
- `siteConfig` export: `personal`, `memory`, `lom`, `mt`, `about`
- Personas: Daly/Archivist (LoM), Rui/Elinalise (MT)
- `progressOptions` per universe × audience
- `easterEggs` arrays per universe
- `backgroundImage` paths: `/public/images/lom-bg.jpg?v=2`, `/public/images/mt-bg.jpg?v=2`
- `messageStyle`: nighthawk | tarot | guild | journal

### `tools/lore-bridge/immersion.js`
- `loadSession` / `saveSession` — sessionStorage
- `loadProgress` / `saveProgress` — localStorage
- `parseMetadata()` — strips `⟦receipts⟧`, `⟦skipped⟧`, `⟦veil⟧`
- `checkEasterEgg()`, `triggerSpoilerVeil()`, `triggerEggEffect()`
- `playUniverseSound()` — Web Audio API
- `generateTheoryCard()` — canvas PNG for share
- `getMessageStyleClass()`, `getPersonaLabel()`, `getNickname()`

### `tools/lore-bridge/index.html`
- ~1100 lines: full UI + inline CSS + module script
- Imports `config.js` + `immersion.js`
- UI: top bar, universe/audience toggles, **mode status bar**, **progress picker**, **warmth dots**, chat, input, side menu, about modal
- `#bg-layer` + `#bg-scrim` background system
- `handleSend()` — easter eggs, history payload, stream/buffered chat, session save
- `renderAiMessage()` — persona label, receipts, skipped panel, veil, share button
- `prefersBufferedChat()` — Firefox detection
- OG/Twitter meta + favicon in `<head>`

### `tools/lore-bridge/package.json`
- `type: module`, `private: true`, no dependencies

### `tools/lore-bridge/favicon.svg`
- SVG oracle/bridge icon

### `tools/lore-bridge/public/images/`
- `lom-bg.jpg` — LoM background (large, ~126KB after user update)
- `mt-bg.jpg` — MT background (large, ~304KB after user update)

### Root `vercel.json` (does NOT affect lore-bridge deploy)
```json
{ "framework": null, "buildCommand": null, "outputDirectory": ".", "cleanUrls": true }
```

---

## 10. GIT / DEPLOY WORKFLOW (CRITICAL)

```bash
cd /home/thierry/grok-anime-lab

# After ANY local change (especially images):
git add tools/lore-bridge/
git commit -m "describe change"
git push origin main

# Vercel auto-deploys from GitHub (1-2 min)
# Verify: https://lore-bridge.vercel.app
```

**Image update checklist:**
1. Replace files in `tools/lore-bridge/public/images/`
2. Bump `?v=N` in `config.js` `backgroundImage` URLs
3. `git add` the binary `.jpg` files (git status must show them staged)
4. `git push`
5. Hard refresh browser

---

## 11. VERCEL DASHBOARD SETTINGS

| Setting | Value |
|---|---|
| Project | `lore-bridge` (separate from repo-root project) |
| Git Repo | `agenticweeb/grok-anime-lab` |
| Root Directory | `tools/lore-bridge` |
| Framework | Other |
| Build Command | *(empty)* |
| Output Directory | *(empty)* |
| Node.js Version | 20.x |
| Env Vars | `XAI_API_KEY`, `GROQ_API_KEY` |

---

## 12. RECENT GIT COMMITS (reference)

```
1fefb9a feat(lore-bridge): full immersion — personas, memory, veil, easter eggs
4d9419d fix(lore-bridge): show background images, add social meta and favicon
1906d10 fix(lore-bridge): route all Firefox browsers to buffered chat
54c94d2 fix(lore-bridge): fix PC fetch failures with buffered chat fallback
1894228 fix(lore-bridge): remove vercel.json override for GitHub auto-deploy
```

---

## 13. EASTER EGGS (for testing)

| Universe | Phrase | Effect |
|---|---|---|
| LoM | `amen` | Fog pulse + oracle line |
| LoM | `above the fog` | Fog effect |
| LoM | `klein moretti` | Pulse |
| MT | `muru muru` | Warm brighten |
| MT | `sylphietta` | Warm |
| MT | `fit to be tied` | Pulse |

---

*End of PROJECT_CONTEXT.md — another AI can resume from Section 4 (image commit push) or Section 8 (next steps).*