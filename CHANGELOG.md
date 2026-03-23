# 📋 CHANGELOG — Espresso

All notable changes documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) · Versioning: [Semantic Versioning](https://semver.org/)

---

## [Unreleased] — Roadmap for v2.0.0

- 📧 **Email delivery** — formatted HTML digest at 6 AM via Postmark / Resend / SMTP
- 📱 **Telegram bot** — `/add <url>` to submit links, `/digest` to read today's edition
- 🔔 **Webhooks** — POST digest JSON to any URL on publish
- 🗂️ **Multiple channels** — separate Tech / World / Finance feeds with independent pools
- 🔖 **Pocket / Readwise** — auto-pull saved articles as link sources
- 🌐 **Browser extension** — one-click save from any page
- 📄 **PDF export** — print-ready digest download
- 🌍 **Multilingual** — generate summaries in user's preferred language
- 🛡️ **Rate limiting** — built-in API protection for public deployments
- 👥 **Multi-user** — team digests, shared link pools, per-user publish

---

## [1.1.0] — 2026-03-23

**20-story digest, full documentation overhaul, line height improvements.**

### ✨ Features

- **20 stories per digest** (up from 10) — the AI now selects and summarizes 20 stories per edition. `max_tokens` raised to 8192 to accommodate longer responses. `MIN_LINKS_BEFORE_TRENDS` raised to 20 accordingly. The digest is now a proper full briefing, not just a quick scan.
- **Increased line heights** — headline `leading-[1.15]`, body summary `leading-[2.0]`, quote `leading-[1.6]`, grid cards `leading-[1.4]`. Significantly more comfortable for longer reading sessions.

### 📝 Documentation — Complete Rewrite

- **README.md** — full rewrite with:
  - All version badges (version, status, license, Node, React, TypeScript, SQLite, Fly.io, self-hosted)
  - Complete architecture diagram
  - "Technology Choices — The Why" section explaining every stack decision with educational detail
  - "The Bugs We Fixed" table — 10 real bugs with symptom + fix
  - Full feature table
  - Complete API reference with curl examples
  - Apple Shortcuts + bookmarklet instructions
  - Full project structure tree
  - Stack table with cost/rationale
  - Version history table
  - Roadmap for v2.0.0
- **INSTALL.md** — complete rewrite with:
  - All platform guides: Fly.io, Railway, Render, VPS/systemd, Docker
  - Custom domain + SSL guide (Fly.io)
  - GitHub Actions cron setup
  - Link submission methods (API, Apple Shortcuts, bookmarklet)
  - AI model switching guide with cost comparison table
  - Security checklist
  - Complete troubleshooting section
- **CHANGELOG.md** — complete version history from v0.1.0-beta to v1.1.0

---

## [0.5.2] — 2026-03-23

**Line height pass.**

- Headline: `leading-tight` → `leading-[1.15]` (more breathing room at large sizes)
- Body summary: `leading-[1.8]` → `leading-[2.0]` (comfortable long-form reading)
- Quote blockquote: `leading-[1.4]` → `leading-[1.6]`
- Grid card titles: `leading-snug` → `leading-[1.4]`

---

## [0.5.1] — 2026-03-23

**Quote card cleanup + bigger desktop type.**

- Quote card: removed Admin link and "Built with Perplexity Computer" footer — just the quote and author, clean
- Quote text: `text-2xl sm:text-3xl` → `text-3xl sm:text-4xl lg:text-5xl`
- Quote container: `max-w-xl` → `max-w-2xl`
- Logo: removed "Espresso" text from header and empty view — red E square only
- Story headline: added `lg:text-5xl`
- Story summary: added `lg:text-2xl`, wider column on desktop (`lg:max-w-3xl`, `lg:px-12 lg:py-14`)

---

## [0.5.0] — 2026-03-23

**Keyboard navigation, mobile-first type scale, custom domain.**

### Features
- **Keyboard navigation** — `ArrowLeft`/`ArrowRight`/`ArrowUp`/`ArrowDown` work anywhere on the page. Implemented via `useEffect` + `window.addEventListener('keydown')`. Ignores keypresses when focus is inside `INPUT`/`TEXTAREA`. `goNext`/`goPrev` wrapped in `useCallback` to prevent stale closure in the effect.
- **Mobile-first type scale** — complete size overhaul:
  - Story headline: `text-xl sm:text-2xl` → `text-3xl sm:text-4xl` (`font-black`)
  - Body summary: default → `text-lg sm:text-xl` (Libre Baskerville serif)
  - Quote: `text-xl sm:text-2xl` → `text-2xl sm:text-3xl`
  - Navigation touch targets: min 44px (WCAG AA)
  - Red rule: `h-1` → `h-1.5`
- **Smarter touch swipe** — now tracks both X and Y on `touchStart`. Only triggers if horizontal delta > vertical delta (prevents accidental swipes while scrolling vertically).
- **Custom domain** — `news.paulfleury.com` configured on Fly.io with dedicated SSL cert via Let's Encrypt.

---

## [0.4.0] — 2026-03-22

**Swipeable card reader, 25 RSS sources, auth fixes.**

### Features
- **Swipeable card reader** — replaced static grid with full-screen carousel. One story per screen. Left/right arrow navigation. Touch swipe. Progress dots in header (clickable). Grid overview overlay (⊞) to scan all stories. Final card: closing quote in editorial inverted-colour style.
- **25 RSS fallback sources** — expanded from 7. Added: AFP, The Guardian, The Telegraph, The Independent, Economist Finance, Le Monde (EN), Der Spiegel (EN), Euronews, MIT Tech Review, The Verge, Nature, Scientific American, Bloomberg, Al Jazeera, South China Morning Post, The Atlantic.
- **Logo click** — resets to first story card.

### Fixed
- Live Fly.io DB had `espresso-admin` as password while UI showed "default: admin". Reset live password to `admin`.
- Login: empty field now defaults to `admin`. Clearer 401 error message. Always-visible default hint.
- Duplicate `formatDate` function in DigestView (TypeScript warning).

### Documentation
- README rewritten with "The Struggles" section documenting all bugs found and fixed during development.

---

## [0.3.0] — 2026-03-22

**Economist redesign, admin auth, password management.**

### Features
- **Economist red/black/white palette** — complete redesign. `#E3120B` accent (Economist red). 4px red rule at top of every page (signature Economist mark). Cabinet Grotesk display + Libre Baskerville body serif. Square corners. Near-black dark mode, clean white light mode. Category labels: red uppercase tracking. Hero date strip: inverted black/white section header. Closing quote: 2px red rule, Baskerville italic.
- **Admin login screen** — full-page password gate before any admin content. Default: `admin`.
- **Change password** — red toolbar at top of admin panel. Modal with confirmation. Updates immediately. New password takes effect on next login.
- **Log out** — session clears from toolbar.
- **`POST /api/admin/change-password`** — new endpoint, requires current password.

### Fixed
- `requireApiKey` now accepts `"admin"` as default when no key is configured. Fresh deploys were inaccessible.

---

## [0.2.0] — 2026-03-22

**Internal audit — 10 bugs fixed, every file documented.**

### Audit Findings Fixed

| # | Issue | Fix |
|---|-------|-----|
| 1 | `source.unsplash.com` shut down 2023 — broken images | → `picsum.photos/seed/{hash}` — deterministic, stable |
| 2 | Double HTTP fetch per link (Jina + raw HTML) | Parse OG image from Jina markdown header instead |
| 3 | Trend URL-only dedup — same wire story on Reuters + AP | Added normalized title-prefix similarity pass |
| 4 | `swapStory` captured `oldLinkId` after array mutation | Capture before mutation — old link now freed to pool |
| 5 | Sequential trend extraction — up to 100s with 20 items | Batched parallel (4 concurrent), same as user links |
| 6 | No OpenRouter retry — one 503 = dead generation | Single retry with 2s backoff on 429/5xx |
| 7 | ReDoS risk in RSS XML parser | `MAX_FEED_BYTES=100KB` guard + non-crossing `[^<]*` regex |
| 8 | FT + Economist links empty (Atom `href=` format) | Added `extractAtomLink()` + `atomStyle` flag on sources |
| 9 | AI `idx` out-of-bounds → undefined story entries | Null guard + warning log |
| 10 | Trend pool dominated by one source | Round-robin interleave across all sources before truncation |

### Improvements
- SQLite indexes: `idx_links_processed`, `idx_digests_date`, `idx_digests_status`
- `foreign_keys = ON` pragma
- URL validation on `POST /api/links`
- 409 Conflict (not 500) when today's digest is already published
- `max_tokens: 4096` on OpenRouter call
- `sourceType` detection expanded: reddit, substack
- `swapStory` now frees old link back to unprocessed pool

### Documentation
- Full JSDoc `@file` header on every server file and `shared/schema.ts`
- Every function documented with context, design decisions, audit notes
- `AUDIT.md` — 10-item finding log

---

## [0.1.0-beta] — 2026-03-22

**Initial release. Full pipeline working end-to-end.**

### Added
- Full AI generation pipeline: Jina Reader → OpenRouter → digest
- RSS trend fallback from 7 trusted sources (Reuters, BBC, FT, NYT, Economist, WSJ, AP)
- Link submission via admin panel and API (`POST /api/links`)
- 72-hour deduplication — same story won't repeat for 3 days
- Story swapping — replace any story from unused link pool
- Story editing — manual title/summary/category changes
- Story reordering
- SQLite storage via Drizzle ORM — auto-migrates on boot
- React + Vite + Tailwind CSS + shadcn/ui frontend
- Dark mode — system preference + manual toggle
- Admin panel — Overview / Links / Digest tabs
- GitHub Actions cron at 6:00 AM GMT
- Dockerfile — multi-stage build, persistent `/data` volume
- README, INSTALL, CHANGELOG

### Fixed (during beta session)
- `PerplexityAttribution` missing `default` export → Vite build failure
- `throwIfResNotOk` throwing on 404/401 → React crash on empty digest state
- `DigestView` crash on undefined `digest.stories.length`
- Trend pipeline erroring instead of using stub text when Jina fails
- Empty `allProcessed` guard checked too early (before trend merge)

---

## Versioning

- **MAJOR** (x.0.0) — breaking API changes or complete architecture rewrites
- **MINOR** (x.x.0) — new features, integrations, UX improvements
- **PATCH** (x.x.x) — bug fixes, performance, documentation

---

*Built with [Perplexity Computer](https://www.perplexity.ai/computer)*
