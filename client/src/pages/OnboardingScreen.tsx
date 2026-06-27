/**
 * @file client/src/pages/OnboardingScreen.tsx
 * @author Paul Fleury <hello@paulfleury.com>
 * @version 5.1.0
 *
 * Cup of News — Onboarding Screen (v5.1.0 — Magic Link flow)
 *
 * Two-step magic link auth:
 *   Step 1 — Email input: user enters email, submits POST /api/auth/magic-link.
 *   Step 2 — Sent state: confirmation UI with resend countdown and "Open Mail App".
 *
 * Guest flow: POST /api/auth/guest → store { token, isGuest: true } → onComplete().
 *
 * Props:
 *   onComplete  — called after a token has been written to localStorage.
 *   authError   — optional error string from hash redirect (/#/auth/error?reason=X),
 *                 consumed once and shown as an inline banner at the top.
 */

import { useState, useEffect, useRef } from "react";
import { Loader2, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { EditionSelector, useEdition } from "@/components/EditionSelector";

const STORAGE_KEY = "cofn_auth";
const RESEND_COOLDOWN = 60; // seconds before "Resend link" appears

interface Props {
  /** Called after a token has been written to localStorage. */
  onComplete: () => void;
  /** Error string passed from an /#/auth/error hash redirect. */
  authError?: string | null;
}

function persist(blob: Record<string, unknown>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
  } catch {}
}

// ─── Envelope SVG ─────────────────────────────────────────────────────────────

function EnvelopeIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Envelope body */}
      <rect x="4" y="14" width="56" height="36" rx="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
      {/* Flap / chevron */}
      <path d="M4 18l28 20 28-20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingScreen({ onComplete, authError }: Props) {
  // "input" → user is on step 1; "sent" → step 2 (magic link dispatched)
  const { theme, toggle } = useTheme();
  const { edition, setEdition } = useEdition();
  const [step, setStep] = useState<"input" | "sent">("input");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Resend countdown: starts at RESEND_COOLDOWN, counts down to 0.
  const [resendCountdown, setResendCountdown] = useState(RESEND_COOLDOWN);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Countdown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== "sent") return;
    setResendCountdown(RESEND_COOLDOWN);
    countdownRef.current = setInterval(() => {
      setResendCountdown((s) => {
        if (s <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [step]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function sendMagicLink(emailAddr: string): Promise<boolean> {
    const res = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailAddr }),
    });
    return res.ok;
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setFormError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      const ok = await sendMagicLink(trimmed);
      if (!ok) {
        setFormError("Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      setStep("sent");
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    if (busy || resendCountdown > 0) return;
    setBusy(true);
    try {
      await sendMagicLink(email.trim());
      // Restart the countdown regardless of success — prevents spam
      setResendCountdown(RESEND_COOLDOWN);
      countdownRef.current = setInterval(() => {
        setResendCountdown((s) => {
          if (s <= 1) { clearInterval(countdownRef.current!); return 0; }
          return s - 1;
        });
      }, 1000);
    } catch {
      // Silent — user can try again
    } finally {
      setBusy(false);
    }
  }

  async function handleGuest() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      // Spec: store as cofn_auth = JSON.stringify({ token: guestToken, isGuest: true })
      persist({ token: data.guestToken ?? data.token, isGuest: true });
      onComplete();
    } catch {
      // Network failure: allow as local guest — never block reading.
      persist({ isGuest: true });
      onComplete();
    } finally {
      setBusy(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[100] bg-background text-foreground flex flex-col">
      {/* ── Top-right controls: language + theme ── */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <EditionSelector
          current={edition}
          onChange={setEdition}
        />
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
      {/* Economist signature red rule */}
      <div className="h-1.5 w-full bg-[#E3120B] flex-shrink-0" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm flex flex-col items-center">

          {/* ── Hash-redirect auth error banner ─────────────────────────── */}
          {authError && (
            <div
              role="alert"
              className="w-full mb-6 px-4 py-3 rounded-xl bg-[#E3120B]/10 border border-[#E3120B]/30 text-sm text-[#E3120B] font-ui leading-snug"
            >
              {authError}
            </div>
          )}

          {/* ── STEP 1: Email input ─────────────────────────────────────── */}
          {step === "input" && (
            <>
              {/* Logo */}
              <div className="flex flex-col items-center gap-4 mb-10">
                <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src="/logo.png" alt="Cup of News" className="w-full h-full object-cover" />
                </div>
                <p className="text-base text-muted-foreground font-ui tracking-wide">
                  Your world, distilled daily.
                </p>
              </div>

              {/* Email form */}
              <form onSubmit={handleEmailSubmit} className="w-full flex flex-col gap-3" noValidate>
                <input
                  type="email"
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFormError(null); }}
                  placeholder="your@email.com"
                  disabled={busy}
                  className="w-full min-h-[52px] px-4 rounded-xl bg-background border border-border text-foreground text-lg font-ui focus:outline-none focus:ring-2 focus:ring-[#E3120B] focus:border-transparent disabled:opacity-50"
                />

                {formError && (
                  <p role="alert" className="text-sm text-[#E3120B] font-ui -mt-1">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#E3120B] text-white font-semibold font-ui text-base transition-opacity hover:opacity-90 active:opacity-75 disabled:opacity-50"
                >
                  {busy ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "Continue with email →"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="w-full flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-ui">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Guest button */}
              <button
                type="button"
                onClick={handleGuest}
                disabled={busy}
                className="w-full h-11 flex items-center justify-center rounded-xl border border-border text-foreground font-semibold font-ui text-base transition-opacity hover:opacity-90 active:opacity-75 disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Continue as guest →"
                )}
              </button>
            </>
          )}

          {/* ── STEP 2: Sent state ──────────────────────────────────────── */}
          {step === "sent" && (
            <div className="w-full flex flex-col items-center text-center gap-5">
              {/* Envelope icon */}
              <div className="text-foreground/80 mb-2">
                <EnvelopeIcon />
              </div>

              <h1 className="text-2xl font-black font-display leading-tight">
                Check your inbox
              </h1>

              <p className="text-base text-muted-foreground font-ui leading-relaxed">
                We sent a sign-in link to{" "}
                <span className="font-semibold text-foreground">{email.trim()}</span>
              </p>

              {/* Open Mail App — mailto: works in Capacitor */}
              <a
                href="mailto:"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-[#E3120B] text-white font-semibold font-ui text-base transition-opacity hover:opacity-90 active:opacity-75"
              >
                Open Mail App
              </a>

              {/* Resend */}
              <div className="mt-1">
                {resendCountdown > 0 ? (
                  <p className="text-sm text-muted-foreground font-ui">
                    Resend available in{" "}
                    <span className="tabular-nums font-semibold text-foreground">
                      {resendCountdown}s
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={busy}
                    className="text-sm font-semibold font-ui text-[#E3120B] hover:underline underline-offset-2 disabled:opacity-50"
                  >
                    {busy ? "Sending…" : "Resend link"}
                  </button>
                )}
              </div>

              {/* Back to step 1 */}
              <button
                type="button"
                onClick={() => { setStep("input"); setFormError(null); }}
                className="text-sm text-muted-foreground font-ui hover:text-foreground transition-colors mt-2"
              >
                ← Use a different email
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
