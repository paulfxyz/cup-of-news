# 🍴 Open Source Core vs. Mobile App Fork

## This repository: `cup-of-news` (public, open source)

This is the **open source core** of Cup of News — a fully self-hostable AI news digest engine.

**Frozen at v4.6.0** as of June 25, 2026.

The open source version includes:
- Full AI digest pipeline (Gemini 2.5 Flash Image, 9 language editions)
- Twice-daily generation (6 AM + 4 PM GMT)
- Self-hosted deployment on Fly.io
- All image quality improvements (sanitizer, text detection, graceful degradation)
- Codemagic iOS/Android build scaffold

Licensed under MIT. Free to use, fork, and self-host forever.

---

## The fork: `cofn-app` (private)

Active development has moved to a private repository (`paulfxyz/cofn-app`) for the commercial mobile app release.

The private fork adds:
- **User accounts** — email/phone registration, guest mode
- **Preferences sync** — theme, language edition, reading history
- **Analytics** — reading time, story engagement, edition popularity
- **iOS + Android** — native builds via Codemagic CI/CD
- **Future:** personalised editorial, paywall, premium editions

This separation keeps the open source engine accessible to the community while allowing commercial development to proceed in a focused, confidential environment.

---

*Cup of News is built with [vibe coding](https://github.com/paulfxyz/cup-of-news#a-note-on-how-this-was-built) — entirely AI-assisted, by a non-developer who cares deeply about product quality.*
