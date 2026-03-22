# ☕ Espresso β

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Version](https://img.shields.io/badge/version-0.5.0-orange?style=for-the-badge)
![Status](https://img.shields.io/badge/status-beta-orange?style=for-the-badge)

**Your personal AI-powered morning news digest. Self-hosted. One API key. Inspired by The Economist Espresso.**

> ⚠️ **Beta.** Works end-to-end. Real-world QA ongoing. Feedback shapes v1.0.0.

🔴 **Live:** [news.paulfleury.com](https://news.paulfleury.com) · [paulflxyz-espresso.fly.dev](https://paulflxyz-espresso.fly.dev)

</div>

---

## 👨‍💻 The Story Behind This

I'm **Paul Fleury** — a French internet entrepreneur living in Lisbon. I consume a lot of internet. Reuters, FT, tech blogs, Substack, YouTube deep-dives — by the time I've had my first coffee I've usually spent 30 minutes just *finding* what's worth reading, and another 30 reading things that weren't.

I wanted something like **The Economist Espresso app** — that compact, curated, authoritative morning format — but fed by *my own* content diet rather than someone else's editorial team. Something I could throw links into all week and wake up to a proper briefing.

**This project was designed and built in collaboration with [Perplexity Computer](https://www.perplexity.ai/computer)** — from architecture to every line of code, from debugging the Fly.io volume mount issue to the Economist palette redesign.

---

## 🏗️ Architecture — How It Works

```
You submit links all week
       │
       ▼
POST /api/links          ← API or admin panel
       │
 SQLite DB (links table)  ← Every URL you've ever submitted
       │
 ── EVERY MORNING AT 6:00 AM GMT ──────────────────────────────
       │
       ├── User has ≥10 links? → use them (always priority)
       │
       └── User has <10 links? → fill from 25 RSS sources:
               Reuters · AP · AFP · BBC · Guardian · NYT · WSJ
               FT · Telegraph · Economist · Le Monde · Spiegel
               Euronews · Ars Technica · Wired · MIT Tech Review
               The Verge · Nature · Scientific American · Bloomberg
               Al Jazeera · SCMP · The Atlantic + more
       │
       ▼
Jina Reader (r.jina.ai)   ← Full text extraction, free, no key
       │
       ▼
OpenRouter (one LLM call) ← Rank top 10 + summarize + quote
       │
       ▼
SQLite (digests table)    ← Stored as structured JSON
       │
       ▼
Admin review → Publish → Public reader
```

### Why These Technology Choices

**SQLite over Postgres**
The temptation with every new project is to reach for Postgres. But Espresso is a single-user personal tool generating one digest per day and storing ~100 links per month. SQLite is zero-infrastructure (one file, no process, no connection pool), trivially backupable with `cp`, and perfectly capable at this scale. If Espresso ever grows to multi-user SaaS, swapping out the storage layer is straightforward — everything talks through the `IStorage` interface.

**OpenRouter over direct OpenAI/Anthropic**
I didn't want to be tied to one model provider, and I didn't want to manage multiple API keys. OpenRouter gives access to 400+ models through a single OpenAI-compatible endpoint. The whole pipeline costs less than $0.01 per daily digest at Gemini Flash rates. If the model quality isn't right, one line change switches to Claude or GPT-4o.

**Jina Reader over custom scraping**
The original plan was to use `@mozilla/readability` + `jsdom` for content extraction. This works, but it breaks on SPAs (TikTok, Twitter), fails on paywalls, and requires maintaining selectors per site. Jina Reader handles all of this — it's a free public API (`https://r.jina.ai/{url}`) that returns clean LLM-ready markdown for any URL. The trade-off is dependency on an external service, but for a personal tool this is fine.

**RSS fallback over a news API**
I evaluated NewsAPI.org, GDELT, and Bing News Search. All require API keys, have rate limits, and cost money at scale. Public RSS feeds from 25 trusted outlets cover the same ground for free — and I can inspect exactly which sources feed the AI. Transparency over convenience.

**Express + Vite over Next.js**
Next.js is excellent but heavy for this use case. The app is a simple backend API + a React SPA. Express handles the API routes, Vite serves the frontend with HMR in dev and builds to static files in prod. One port, one process, deployable anywhere Node runs. No framework magic to debug at 6am when the cron fails.

**Fly.io over Railway/Render for deployment**
Fly.io has persistent volumes for SQLite (one file, survives restarts and deploys), no cold starts on the always-on plan, and the machine runs in Paris (cdg) — close to Lisbon. Railway and Render would work but their free tiers don't provide persistent storage, which means the SQLite database disappears on every redeploy.

---

## 🚧 The Struggles

Building this exposed a few non-obvious problems:

**The Unsplash debacle.** The original fallback for missing OG images used `source.unsplash.com`. This service was quietly shut down by Unsplash in 2023. Every story without an image had a silent 404. Replaced with `picsum.photos/seed/{hash}` — deterministic (same story always gets the same placeholder image) and stable.

**The stale story reference bug.** The `swapStory` function captured `oldLinkId` *after* mutating the stories array. So when story at index 3 was replaced, `oldStory` was reading the *new* story's data. The replaced link was never freed back to the unprocessed pool. A classic mutation-before-capture mistake.

**Sequential vs parallel extraction.** The first version of trend extraction ran in a `for` loop — one Jina request at a time. With 20 trend items at ~5 seconds each = 100 seconds worst case. Fixed by chunking into batches of 4 parallel requests.

**RSS XML and ReDoS.** The XML parser used `[\s\S]*?` (greedy, crosses newlines) on unbounded feed XML. On a malformed 500KB feed from a misconfigured CMS, this pattern can catastrophically backtrack. Fixed with `MAX_FEED_BYTES = 100KB` slicing before regex, and switching to `[^<]*` (non-crossing) for tag content matching.

**Atom vs RSS link formats.** FT and The Economist use Atom-style `<link rel="alternate" href="..."/>` attribute syntax. Our first RSS parser only handled `<link>url</link>` text-node form. FT and Economist links were always empty strings. Required a dedicated `extractAtomLink()` fallback.

**The Fly.io app name mystery.** When connecting the GitHub repo to Fly.io through the dashboard, Fly auto-generates a random app name (`app-lively-haze-690`). The `fly.toml` we'd committed said `paulfxyz-espresso`. Name mismatch = `app not found` on every deploy attempt. Fixed by reading the actual app name from the Fly dashboard and updating `fly.toml`.

**The admin password that never was.** The first deploy set `ADMIN_KEY=espresso-admin` via CLI secrets. The setup endpoint then stored this in the SQLite DB. The frontend showed "default password: admin". But the DB had `espresso-admin`. Login with `admin` → 401. Fixed by resetting the live DB password to `admin` via the API and making the login hint always visible.

---

## ✨ Features

- **Feed it anything** — articles, YouTube, TikTok, tweets, Reddit, Substack, any URL
- **AI editorial pipeline** — OpenRouter selects top 10, writes 200-word summaries, generates closing quote
- **25 RSS sources** — auto-fills when you haven't submitted enough (Reuters, BBC, FT, NYT, Economist, AP, Guardian, Wired, Nature + 16 more)
- **72-hour deduplication** — same story won't repeat for 3 days
- **Swipeable card reader** — one story per screen, left/right navigation, touch support, grid overview
- **Economist red/black/white design** — 4px red rule, Cabinet Grotesk + Libre Baskerville, editorial typography
- **Admin auth** — password login, change password, log out
- **Story swapping** — replace any story with another from your pool (one click)
- **Dark/light mode** — system preference + manual toggle
- **REST API** — submit links from Apple Shortcuts, bots, scripts, automations
- **One paid service** — only OpenRouter (~$0.01/day at Gemini Flash rates)

---

## 🚀 Quick Start

```bash
git clone https://github.com/paulfxyz/espresso.git
cd espresso
npm install
npm run dev
# → http://localhost:5000
```

Visit `http://localhost:5000/#/setup` → enter your OpenRouter key.

Then `http://localhost:5000/#/admin` → password `admin` → Generate Today's Digest.

---

## 🔑 Default Password

The default admin password is **`admin`**.

Change it immediately: Admin panel → red toolbar → **"Change password"**.

---

## 📡 API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/digest/latest` | Public | Latest published digest |
| `POST` | `/api/links` | Admin | Submit URL(s) |
| `POST` | `/api/digest/generate` | Admin | Trigger pipeline |
| `POST` | `/api/digest/:id/publish` | Admin | Publish draft |
| `PATCH` | `/api/digest/:id/story/:id/swap` | Admin | Swap story |
| `POST` | `/api/admin/change-password` | Admin | Change password |
| `GET` | `/api/health` | Public | Health check |

Full API reference in [INSTALL.md](./INSTALL.md).

---

## ⏰ Daily Generation

GitHub Actions cron fires at **6:00 AM GMT** every day. Set two repo secrets:

| Secret | Value |
|--------|-------|
| `ESPRESSO_URL` | `https://your-app.fly.dev` |
| `ESPRESSO_ADMIN_KEY` | Your admin password |

---

## 🔧 Deployment

See [INSTALL.md](./INSTALL.md) for complete platform guides.

**Fly.io (recommended — persistent SQLite volume):**
```bash
fly launch
fly volumes create espresso_data --size 1
fly secrets set OPENROUTER_KEY=sk-or-... ADMIN_KEY=your-password
fly deploy
```

---

## 🛠️ Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Runtime | Node.js + Express | Runs anywhere, no cold-start surprises |
| Frontend | React + Vite + Tailwind + shadcn/ui | Fast, tree-shakeable, great DX |
| Database | SQLite (Drizzle ORM) | Zero infrastructure, one file, easy backup |
| AI | OpenRouter | 400+ models, one API key, $0.01/day |
| Content extraction | Jina Reader (free) | Handles paywalls, YouTube, TikTok, no key |
| Images | OG metadata from source URLs | Zero cost, always contextual |
| RSS fallback | 25 trusted sources | Free, transparent, no API key |
| Scheduling | GitHub Actions cron | Free, reliable |
| Hosting | Fly.io | Persistent volumes, Paris region, always-on |

---

## 📝 Changelog

Full history: **[CHANGELOG.md](./CHANGELOG.md)**

### v0.4.0 — 2026-03-22
- Swipeable card reader (left/right navigation, touch, grid overview)
- 25 RSS sources (up from 7)
- Admin login fix (default `admin` password, better hints)
- Rich README with engineering narrative

### v0.3.0 — 2026-03-22
- Economist red/black/white redesign
- Admin password auth + change password

### v0.2.0 — 2026-03-22
- Full audit: 10 bugs fixed, full documentation

### v0.1.0-beta — 2026-03-22
- Initial release

---

## 🤝 Contributing

Beta — contributions especially welcome. Ideas: email delivery, Telegram bot, browser extension, multi-channel feeds, PWA mode.

1. Fork → `git checkout -b feature/my-thing` → commit → PR

---

## 📜 License

MIT

---

## 👤 Author

Made with ❤️ by **Paul Fleury** · Built with **[Perplexity Computer](https://www.perplexity.ai/computer)**

- 🌐 [paulfleury.com](https://paulfleury.com)
- 🔗 [linkedin.com/in/paulfxyz](https://www.linkedin.com/in/paulfxyz/)
- 📧 [hello@paulfleury.com](mailto:hello@paulfleury.com)

---

⭐ **Star the repo if Espresso saves you time every morning.**
