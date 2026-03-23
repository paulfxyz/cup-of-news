# 📋 CHANGELOG — Cup of News

All notable changes documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) · Versioning: [SemVer](https://semver.org/)

---

## [Unreleased] — Roadmap for v2.0.0

- 📧 Email delivery — formatted HTML digest at 6 AM (Postmark / Resend / SMTP)
- 📱 Telegram bot — `/add <url>` to submit links, `/digest` to read
- 🔔 Push notifications — native Capacitor alerts at 6 AM
- 🗂️ Multiple channels — Tech / World / Finance with separate pools
- 🔖 Pocket / Readwise auto-import
- 🌐 Browser extension — one-click save from any page
- 🛡️ Rate limiting — built-in API protection for public deployments
- 👥 Multi-user — team digests, shared link pools

---

## [1.5.1] — 2026-03-23

**Direct OG image fallback, 34 RSS sources, 17/20 real photos.**

### Engineering notes — what broke and how we fixed it

**The image problem was deeper than we thought.**
v1.4.1 introduced `isValidOgImage()` to reject logos, SVGs, and tracking pixels — which
improved image quality but revealed a worse problem: 10 out of 20 stories were falling
back to editorial SVGs because *Jina Reader never found an OG image in the first place*.

The root cause: many high-quality RSS sources (AFP, WSJ, Bloomberg, Der Spiegel) don't
include `og:image` in their feed items, and Jina Reader only returns an image if it finds
one in the content it processes. For pure wire service articles (short, no embedded media),
Jina has nothing to return.

**The fix: a second-pass direct HTML fetch.**
After Jina extraction, if no valid OG image is found, we fetch the article URL directly —
but only the first 20KB using `Range: bytes=0-20000`. This is enough to get the `<head>`
section where `<meta property="og:image">` and `<meta name="twitter:image">` live. The
request is lightweight (20KB vs a full page download of 200-500KB), fires only when needed,
and catches the outlets that Jina misses.

Result: 17/20 stories now have real editorial photos. The 3 remaining SVG fallbacks are
genuinely image-free articles (wire service briefs, text-only posts).

**34 RSS sources — why we added these specific ones.**
The diversity problem was partly a content problem: if your source pool is 25 outlets
dominated by UK/US broadsheets, the AI can only pick from what it receives. We added:
- BBC Sport + ESPN → guaranteed sports content in every pool
- Japan Times + The Hindu → Asia-Pacific without SCMP (which had reliability issues)
- Latin American Herald Tribune + Merco Press → Latin America was a blind spot
- Rest of World → tech news from Africa/Asia/LatAm perspective (unique angle)
- New Scientist + Stat News → science and health with their own dedicated sources

### ✨ Changes
- `fetchOgImageDirect()` — second-pass HTML Range fetch for missing OG images
- Parses both `og:image` and `twitter:image` meta tags
- 34 RSS sources (up from 25): BBC Sport, ESPN, Japan Times, The Hindu, Latin American
  Herald Tribune, Merco Press, Rest of World, New Scientist, Stat News
- Real OG photo rate: 10/20 → 17/20 per digest

---

## [1.5.0] — 2026-03-23

**Sources modal per story, paragraph spacing, mandatory category coverage.**

### Engineering notes

**The "sources" terminology confusion.**
The header had an RSS icon for the global 34-source list. Each story card had a "Read full
story" plain link. Users were confused about what "sources" meant — the RSS feeds? The
original article? We disambiguated: the header RSS icon = global source list modal. Each
story card gets a "Read sources" button that opens a per-story modal with the original
article title, domain, and prominent CTA. Clear attribution at every level.

**Line spacing vs. line-height — the CSS confusion.**
`leading-[2.4]` (Tailwind's `line-height`) was already 240% of font size — very open.
But Libre Baskerville at `text-lg/xl/2xl` has tight internal font metrics, making even
high line-height feel compressed. The real fix required three properties working together:
`leading-[2.6]` (height between lines) + `word-spacing: 0.04em` (horizontal air between
words) + `letter-spacing: 0.01em` (horizontal air between characters). Together these
create the airy, print-magazine body text rhythm that line-height alone can't achieve.

**The Iran problem — third iteration of diversity rules.**
v1.4.0: "max 3 per region" → 7 Middle East stories (AI treated adjacent stories as different regions)
v1.4.3: "max 2 per conflict" → 5 Middle East stories (Sports and Culture still absent)
v1.5.0: mandatory slots. Required ≥1 Sports, ≥1 Culture, ≥1 Health/Environment, ≥1 story
each from Africa, Asia, Americas, Europe. Forcing the AI to actively seek non-dominant
content is far more robust than capping dominant content.

### ✨ Changes
- Per-story "Read sources" button → modal with original article, domain, full article CTA
- `leading-[2.6]` + `word-spacing: 0.04em` + `letter-spacing: 0.01em` on body text
- Mandatory: ≥1 Sports, ≥1 Culture, ≥1 Health/Environment per digest
- Mandatory: ≥1 story from Africa, Asia (ex-Middle East), Americas, Europe each
- Middle East/Iran/Israel cap: maximum 4 stories per digest

---

## [1.4.3] — 2026-03-23

**Hard diversity mandate.**

### Engineering notes

Previous diversity rules used "maximum" caps. The AI would include 3 World stories, then
fill the rest with more World stories just below the cap. The fix: specify both a maximum
AND a minimum for key categories. The minimum forces active seeking; the maximum prevents
domination. Together they create a genuine briefing rather than a regional report.

### ✨ Changes
- Max 2 stories per conflict/crisis (not 3)
- Max 2 stories per country
- Max 2 stories per protagonist (person, company, organisation)
- Required: ≥4 geographic regions, ≥1 Africa or Latin America
- "Would reader see the full world, or one corner?" added to AI prompt

---

## [1.4.2] — 2026-03-23

**Line height + landing page step 05.**

- Body summary: `leading-[2.4]`
- Landing page: Step 05 "Set your editorial voice" added to How it Works section

---

## [1.4.1] — 2026-03-23

**Editorial SVG fallbacks — why not AI image generation.**

### Engineering notes

We tried `google/gemini-3.1-flash-image-preview` via OpenRouter. The model exists, but
`response.choices[0].message.content` returns `null` when called via the standard chat
completions endpoint. OpenRouter's `/images/generations` endpoint redirects to their
website — not a real API endpoint. After two hours of testing, we concluded: image
generation via OpenRouter is not reliably accessible.

Rather than ship a broken feature that silently fails, we implemented `generateCategoryImage()`:
an inline SVG generator that creates a styled, coloured editorial card per category. Each
SVG has a colour palette derived from the category (Politics=red, Technology=blue, 
Business=amber, Science=green), a subtle grid texture, the category label, and the story
headline. It's instant, deterministic (same story always gets the same image), zero cost,
and looks like an intentional design choice — not a broken image.

The build initially failed with "Unterminated string literal" because the SVG was built
using nested template literals (backticks inside backticks). Fixed by building the SVG
as an array of strings joined with `.join("\n")` instead.

### ✨ Changes
- `isValidOgImage()` — rejects SVGs, tracking pixels, logo patterns, icon CDN paths
- `generateCategoryImage()` — editorial SVG per category with colour palette + headline
- `__GENERATE__:title:category` sentinel pattern for deferred generation
- Build error fix: nested template literals → array join

---

## [1.4.0] — 2026-03-23

**Smart images, diversity rules, sources modal.**

### ✨ Changes
- `isValidOgImage()` validator
- Anti-redundancy rules in AI prompt (max per region/country/protagonist)
- RSS icon in header opens 25-source modal (grouped by category, clickable links)
- SourcesModal component with flags, categories, all 25 sources

---

## [1.3.1] — 2026-03-23

**Line heights.**
- Headline: `leading-[1.15]` → `leading-[1.25]`
- Body: `leading-[2.0]` → `leading-[2.2]`
- Quote: `leading-[1.6]` → `leading-[1.75]`
- Grid cards: `leading-[1.4]`

---

## [1.3.0] — 2026-03-23

**Editorial Prompt — the personalisation layer.**

### Engineering notes

The most architecturally interesting feature of Cup of News. The editorial prompt is stored
in the `config` table under key `editorial_prompt`. At generation time, it's read and
injected into the AI system prompt as a "READER PROFILE & EDITORIAL LENS" section — marked
as high priority so the model genuinely uses it for selection, not just tone.

The key insight: a reader profile does two things simultaneously. It tells the AI what
to *prioritise* (AI startups, European politics, climate tech) AND what to *deprioritise*
(sports, celebrity, US domestic). Most personalisation systems only do the former.

We cap the prompt at 2000 characters — enough for a detailed profile without overloading
the system prompt context window. The admin UI includes an example prompt, character counter,
unsaved-changes indicator, and a "How it works" explanation.

### ✨ Changes
- `GET/POST/DELETE /api/admin/editorial-prompt` endpoints
- Editorial prompt stored in config table, injected at generation time
- New "Editorial" tab in admin panel — textarea, 2000 char limit, example, explainer
- `POST /api/admin/change-password` endpoint
- Landing page: Feature 5 updated to "Your editorial prompt"

---

## [1.2.0] — 2026-03-23

**Renamed to Cup of News. PWA. Capacitor. app.cupof.news.**

### Engineering notes

Renaming the project from "Espresso" to "Cup of News" required changes in:
package.json (name, version, homepage, repository), all TypeScript source files, 
the Fly.io app (old app destroyed, new one created), fly.toml, the GitHub repo,
the SQLite DB filename, and every `E` logo in the UI → `C`.

The Fly.io app name situation: the old app `paulflxyz-espresso` was destroyed and
`cup-of-news` was created fresh. Volume `cup_of_news_data` created in cdg (Paris).
This required re-configuring all secrets and re-running the setup API endpoint.

PWA implementation required: `manifest.json` with `display: standalone`, all Apple
meta tags (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`,
`apple-touch-icon`), `theme-color: #E3120B`, `viewport-fit=cover` for iPhone notch.

Capacitor config (`capacitor.config.ts`) sets `appId: news.cupof.app`, `webDir: dist/public`,
iOS minimum version 15.0, Android minimum SDK 24. Status bar and splash screen configured
to match the red/black design.

### ✨ Changes
- Full project rename: Espresso → Cup of News, all files updated
- Logo: E → C (red square)
- Old Fly app destroyed, new `cup-of-news` app created at app.cupof.news
- `manifest.json` — PWA installable from browser
- Full PWA meta tags — Apple, Android, Open Graph, Twitter Card
- `capacitor.config.ts` — Capacitor native config
- `NATIVE.md` — complete iOS/Android build guide
- Admin `/admin` link removed from all public pages
- `cupof.news` landing page designed and deployed via FTP

---

## [1.1.0] — 2026-03-23

**20 stories per digest. Complete documentation rewrite.**

### Engineering notes

The 10→20 story change required: updating `MIN_LINKS_BEFORE_TRENDS` (10→20),
changing the AI prompt from "select 10" to "select 20", raising `max_tokens` from
4096 to 8192 (20 × 200-word summaries easily exceed 4096 tokens), and updating the
`.slice(0, 10)` to `.slice(0, 20)` in the story assembly step.

The documentation rewrite was the main work of this version. The README was rebuilt
from scratch with: all 11 badges, full architecture diagram, "Technology Choices —
The Why" section explaining every stack decision, "The Bugs We Fixed" table with
10 real bugs and their root causes, complete API reference with curl examples,
Apple Shortcuts + bookmarklet submission guides, project structure tree.

### ✨ Changes
- 20 stories per digest (up from 10)
- `max_tokens` raised to 8192
- `MIN_LINKS_BEFORE_TRENDS` raised to 20
- README, INSTALL.md, CHANGELOG all complete rewrites

---

## [1.0.x] — 2026-03-22 to 2026-03-23

Patch series: line heights, version badges, logo text removal, quote card cleanup,
keyboard navigation, touch swipe, mobile-first type scale, custom domain.

Key changes across patches:
- `v0.5.0` → `v1.0.x`: keyboard arrows (`useEffect` + `keydown` listener),
  touch swipe (horizontal delta > vertical delta threshold), type scale upgrade
  (headlines text-3xl/4xl/5xl, body text-lg/xl/2xl)
- Line heights iterated multiple times: 1.8 → 2.0 → 2.2 → 2.4 → 2.6
- Logo text removed ("Espresso" hidden, only red C square shown)
- Quote card stripped of Admin link and attribution footer
- `news.paulfleury.com` → `app.cupof.news` in all URLs

---

## [0.5.x] — 2026-03-22

**Swipeable card reader. Keyboard navigation. news.paulfleury.com.**

### Engineering notes

The swipeable card reader replaced a static 3-column grid. The core design decision:
one story per screen, navigated like a mobile news app. This required:

- `cardIndex` state (0..stories.length, last = quote card)
- `useEffect` keyboard listener (`ArrowLeft/Right/Up/Down`) — must clean up on unmount
- `useCallback` on `goNext`/`goPrev` to prevent stale closures in the effect
- Touch swipe: track both X and Y on `touchStart`, only trigger if `|dx| > |dy|` AND
  `|dx| > 50px` — prevents accidental swipes during vertical scroll

The `news.paulfleury.com` custom domain was configured on the old Fly app before the
rename. DNS records: `A` + `AAAA` + `_fly-ownership TXT`. Certificate issued by Fly
via Let's Encrypt within ~15 seconds of DNS propagation.

---

## [0.4.0] — 2026-03-22

**Swipeable card reader. 25 RSS sources. Admin auth fixes.**

Key: admin default password confusion. The live Fly DB had `espresso-admin` set
during setup, while the UI showed "default: admin". Fixed by resetting the DB password
directly via the `/api/setup` endpoint using the old admin key.

---

## [0.3.0] — 2026-03-22

**Economist redesign. Admin password auth.**

The red/black/white Economist palette was derived from The Economist's actual brand:
`#E3120B` (their exact signature red), near-black (`#0f0f0f`) backgrounds, Cabinet
Grotesk for display text (editorial authority), Libre Baskerville for body (serif warmth).

The 4px red rule at the top of every page is The Economist's signature mark — instantly
recognisable and sets the editorial tone before a word is read.

Admin auth: `requireApiKey` middleware reads the DB on every request (not cached) so
password changes take effect immediately without restart. The login screen uses the
`/api/links` endpoint as an auth test — if it returns 200, the key is valid.

---

## [0.2.0] — 2026-03-22

**Internal audit. 10 bugs fixed. Full code documentation.**

This version was a pure quality pass — no new features. Every file received a full
JSDoc `@file` header with author, version, context, and design decisions. Every function
was documented with what it does, why it exists, and what changed.

The most impactful fixes: the Unsplash shutdown (#1), the stale variable in swapStory
(#4), and the sequential trend extraction (#5). Together these three fixes reduced
pipeline latency from ~100s to ~15s on a cold pool.

See the bug table in README.md for all 10 issues with root causes and fixes.

---

## [0.1.0-beta] — 2026-03-22

**Initial release. Full pipeline working end-to-end.**

Built in one session with Perplexity Computer. The initial architecture was correct
from day one: SQLite for storage, Jina for extraction, OpenRouter for AI, RSS for
fallback. The v0.1.0-beta bugs were all in the details — wrong model slugs, missing
exports, incorrect error handling. The core pipeline concept was sound.

First generation test: 10 stories in 10 seconds from 0 submitted links, using only
the 7 initial RSS fallback sources. The speed came from the single-call architecture.

---

## Versioning Philosophy

- **MAJOR** (x.0.0) — breaking API changes, complete architecture rewrite
- **MINOR** (x.x.0) — new features, integrations, UX improvements  
- **PATCH** (x.x.x) — bug fixes, performance, documentation
- **Pre-release** (x.x.x-beta) — functional but not production-hardened

---

*Built with [Perplexity Computer](https://www.perplexity.ai/computer)*
