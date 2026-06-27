# Contributing to Cup of News

This document explains the relationship between the open-source core and the commercial product, and how to contribute pipeline improvements back to this repo.

---

## 1. Our open-source commitment

The digest pipeline is MIT, and it always will be. That means the RSS crawler, Jina extraction, AI curation, multi-language generation engine, image pipeline, SQLite storage layer, and the React digest reader — all of it — stays permanently open source here.

The commercial product ([read.cupof.news](https://read.cupof.news)) adds an auth system, credits, premium tier, and personalisation on top of this engine. That layer is private — not because we're hiding anything interesting, but because it funds continued development of the open core. Premium subscriptions pay for the engineering time that keeps the pipeline improving.

The pipeline improves over time — better prompts, better source diversity, better image quality — and those improvements benefit both self-hosters (via this repo) and subscribers (via the commercial product). Both sides benefit from shared work on the engine.

---

## 2. The two-repo model

```
paulfxyz/cup-of-news (MIT, public — this repo, frozen v4.6.0)
  └── digest pipeline (RSS → Jina → AI → SQLite → React reader)
      └── powers the commercial product at read.cupof.news
              ├── + auth layer (magic link, OTP, sessions)         [private]
              ├── + credits & tier system (free/premium)           [private]
              ├── + personalisation (editorials, custom sources)   [private]
              ├── + premium product (waitlist → subscriptions)     [private]
              ├── + full i18n (9 languages, 68 UI strings)         [private]
              └── + iOS & Android (Capacitor, in progress)         [private]
```

**This repo is frozen at v4.6.0.** It works in production — it's a complete, self-hostable digest pipeline. We don't actively develop new commercial features here, but we do:

- Accept pipeline improvements via pull request
- Backport our own engine improvements from the commercial product
- Review and merge new RSS sources, language editions, and prompt improvements

---

## 3. What we accept (backportable improvements)

### Safe to contribute

These are changes to the pipeline core with no commercial dependencies:

- **AI prompt improvements** — diversity rules, geographic spread, mandatory category slots, editorial tone
- **New RSS sources** — adding a new outlet to any edition's source list (`server/trends.ts`)
- **New language editions** — adding a 10th language (new entry in `shared/editions.ts` + source set)
- **Image pipeline improvements** — better OG extraction, fallback logic, `isValidOgImage()` validator, `sanitizeForImagePrompt()` pattern additions
- **Bug fixes in pipeline logic** — any fix to `server/pipeline.ts`, `server/trends.ts`, `server/storage.ts` that doesn't reference auth/credits/user identity
- **Performance improvements** — batch processing, caching, rate limiting, memory management
- **DigestView UI improvements** — reading experience, animation, card layout, typography
- **Pipeline configuration** — slot timing, story count, deduplication window

### Out of scope for this repo

The commercial layer stays private:

- Auth systems (magic link, OTP, sessions)
- Credits and tier gating
- User personalisation (per-user editorials, custom source pools)
- Premium billing
- i18n of account/auth pages

**When in doubt:** If the feature requires knowing who the current user is — it belongs in the commercial product, not here.

---

## 4. How to contribute

### Standard pull request flow

```bash
# Fork and clone
git clone https://github.com/your-username/cup-of-news.git
cd cup-of-news

# Create a branch
git checkout -b improve/rss-sources-turkish

# Make your changes
# ... edit server/trends.ts or wherever ...

# Commit with a clear message
git commit -m "improve: add 3 Turkish RSS sources (Medyascope, Gazete Duvar, diken.com)"

# Push and open a PR
git push origin improve/rss-sources-turkish
```

### Commit message format

```
improve: [short description]
fix: [short description]
feat: [short description]
```

Examples:
- `improve: add geographic diversity rule for African stories`
- `fix: sanitizeForImagePrompt missing Spanish conflict terms`
- `feat: add Italian regional edition (it-IT)`
- `improve: increase Jina retry backoff for 429 responses`

### What makes a good PR

- **Focused** — one logical change per PR. Don't bundle unrelated fixes.
- **Documented** — if you're changing pipeline behavior (prompt changes, new source logic), explain the before/after in the PR description.
- **Tested** — if possible, include a generation result that shows the improvement.
- **Clean** — no commercial code, no private env vars, no references to auth/credits.

---

## 5. Adding new RSS sources

The source lists live in `server/trends.ts`. Each edition has its own array of RSS feed objects:

```typescript
{
  url: "https://feeds.example.com/rss",
  name: "Example News",
  category: "news"  // news | sport | tech | culture | science | business
}
```

When adding sources:
1. **Verify the feed works** — paste the URL into an RSS reader first
2. **Check for paywalls** — Jina Reader can't extract from hard paywalls
3. **Respect editorial diversity** — for non-EN editions, prefer native-language sources over English wire services
4. **Avoid state media** — we exclude state-controlled outlets on editorial grounds (see Development Challenges in README)

---

## 6. Improving AI prompts

The curation prompt lives in `server/pipeline.ts`. The image prompt sanitizer is `sanitizeForImagePrompt()` in the same file.

If you're improving the curation prompt:
- Test across multiple editions, not just English
- Check that mandatory slots (Sport, Culture, Science/Health, geographic coverage) still fire correctly
- Test with a variety of editorial prompts (finance focus, tech focus, generalist)

If you're improving `sanitizeForImagePrompt()`:
- Add test cases to the PR description: input story title → expected rewrite
- Check for both English and non-English patterns if relevant

---

## 7. Questions?

Open an issue or contact **Paul Fleury** — [hello@paulfleury.com](mailto:hello@paulfleury.com) · [paulfleury.com](https://paulfleury.com)
