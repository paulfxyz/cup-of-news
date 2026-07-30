/**
 * AuthContext v6.1.0
 * - Token in localStorage (persistent across tabs/incognito/restart)
 * - Window focus re-validation (detects expired sessions after backgrounding)
 * - 401 dispatches "cofn:session-expired" event for UI recovery
 * - No guest mode, no duplicate hydration functions
 */
import {
  createContext, useContext, useEffect, useState,
  useCallback, useRef, type ReactNode,
} from "react";
import { useTheme } from "@/components/ThemeProvider";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string | null;
  displayName: string | null;
  timezone: string | null;
  credits: number;
  tier: "free" | "premium";
  themePreference: "dark" | "light";
  editionPreference: string;
  uiLanguage: string; // "auto" = follow OS/browser, or explicit edition code e.g. "en", "fr"
  pendingEmail: string | null;
  selectedEditorials: string[] | null;
  selectedSources: string[] | null;
  digestTimes: string[];  // ["HH:MM", "HH:MM"] — two daily delivery times
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  showOnboarding: boolean;
  authError: string | null;
  signOut: () => Promise<void>;
  updatePreferences: (prefs: Record<string, unknown>) => Promise<void>;
  updateProfile: (data: { displayName?: string; timezone?: string }) => void;
  generatePersonalDigest: (edition: string) => Promise<{ jobId: string; creditsRemaining: number }>;
  refresh: () => Promise<void>;
  continueAsGuest: () => void;
}

// ─── Token store (localStorage) ──────────────────────────────────────────────

const TOKEN_KEY = "cofn_token";

function readToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

function writeToken(t: string | null) {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch {}
}

let _token: string | null = readToken();

export function getSessionToken(): string | null { return _token ?? readToken(); }

export function setSessionToken(t: string | null) { _token = t; writeToken(t); }

export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const t = getSessionToken();
  return t ? { Authorization: `Bearer ${t}`, ...extra } : extra;
}

// ─── User mapping ─────────────────────────────────────────────────────────────

function mapUser(raw: Record<string, unknown>): User {
  return {
    id:                (raw.id ?? raw.userId ?? 0) as number,
    email:             (raw.email ?? null) as string | null,
    displayName:       (raw.displayName ?? null) as string | null,
    timezone:          (raw.timezone ?? "UTC") as string,
    credits:           (raw.credits ?? 3) as number,
    tier:              (raw.tier === "premium" ? "premium" : "free"),
    themePreference:   (raw.themePreference === "light" ? "light" : "dark"),
    editionPreference: (raw.editionPreference ?? "en") as string,
    uiLanguage:        (raw.uiLanguage ?? "auto") as string,
    pendingEmail:      (raw.pendingEmail ?? null) as string | null,
    selectedEditorials:(raw.selectedEditorials ?? null) as string[] | null,
    selectedSources:   (raw.selectedSources ?? null) as string[] | null,
    digestTimes:       Array.isArray(raw.digestTimes) ? raw.digestTimes as string[] : ["06:00", "16:00"],
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null, isAuthenticated: false, isGuest: false, isLoading: true,
  showOnboarding: false, authError: null,
  signOut: async () => {}, updatePreferences: async () => {},
  updateProfile: () => {}, generatePersonalDigest: async () => ({ jobId: "", creditsRemaining: 0 }),
  refresh: async () => {},
  continueAsGuest: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setThemeExternal } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // ── Hydration ──────────────────────────────────────────────────────────────
  const hydrate = useCallback(async (applyTheme = true) => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        headers: authHeaders(),
      });
      const raw = await res.json().catch(() => null);
      if (!raw || raw.isGuest) {
        setUser(null);
        return;
      }
      if (typeof raw.token === "string") setSessionToken(raw.token);
      const data = mapUser(raw);
      setUser(data);
      // Always apply the server's saved theme preference.
      // The server is the source of truth — local toggle state is irrelevant.
      if (applyTheme) {
        setThemeExternal(data.themePreference);
      }
    } catch {
      // Network error — preserve current state
    } finally {
      setIsLoading(false);
    }
  }, [setThemeExternal]);

  // ── Magic link hash callback ────────────────────────────────────────────────
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#/auth/success")) {
      const params = new URLSearchParams(hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : "");
      const token = params.get("token") ?? params.get("session");
      if (token) setSessionToken(token);
      window.location.hash = "/";
      void hydrate(true);
    } else if (hash.startsWith("#/auth/error")) {
      const params = new URLSearchParams(hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : "");
      setAuthError(decodeURIComponent(params.get("reason") ?? "Authentication failed."));
      window.location.hash = "/";
      setIsLoading(false);
    } else {
      // If cofn_logged_in cookie exists but localStorage token is gone (Safari PWA wipe),
      // keep isLoading=true (shows splash) while we re-hydrate from the HttpOnly cookie.
      // The server will authenticate via cookie and restore the session silently.
      void hydrate(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => hydrate(false), [hydrate]);

  // Allow OnboardingScreen to set guest mode without a server session
  // isGuest is ephemeral — cleared on sign-out or successful login
  const continueAsGuest = useCallback(() => {
    setIsGuest(true);
    setIsLoading(false);
  }, []);

  // ── Window focus re-validation ─────────────────────────────────────────────
  // Silently re-checks session when user returns to the app after backgrounding.
  // KEY FIX: do NOT gate on getSessionToken() — Safari PWA wipes localStorage
  // so the token may be gone while the HttpOnly cookie is still valid.
  // Always attempt re-hydration; the server authenticates via cookie.
  useEffect(() => {
    let lastCheck = 0;
    const check = () => {
      // 5-min debounce to avoid hammering the server on rapid focus events
      if (Date.now() - lastCheck < 5 * 60 * 1000) return;
      lastCheck = Date.now();
      void hydrate(true);
    };
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) check(); });
    return () => {
      window.removeEventListener("focus", check);
    };
  }, [hydrate]);

  // ── signOut ────────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST", credentials: "include",
        headers: authHeaders(),
      });
    } catch {}
    setSessionToken(null);
    setUser(null);
    setIsGuest(false);
  }, []);

  // ── updatePreferences ─────────────────────────────────────────────────────
  const updatePreferences = useCallback(async (prefs: Record<string, unknown>) => {
    if (prefs.themePreference) {
      setThemeExternal(prefs.themePreference as "dark" | "light");
    }
    setUser(prev => prev ? { ...prev, ...prefs } as User : prev);
    try {
      const res = await fetch("/api/auth/preferences", {
        method: "PATCH", credentials: "include",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(prefs),
      });
      if (!res.ok) console.warn("[prefs] server error:", res.status);
    } catch (e) { console.warn("[prefs] network error:", e); }
  }, [setThemeExternal]);

  // ── updateProfile ─────────────────────────────────────────────────────────
  const updateProfile = useCallback((data: { displayName?: string; timezone?: string }) => {
    setUser(prev => prev ? { ...prev, ...data } : prev);
  }, []);

  // ── generatePersonalDigest ─────────────────────────────────────────────────
  const generatePersonalDigest = useCallback(async (edition: string) => {
    setUser(prev => prev ? { ...prev, credits: Math.max(0, prev.credits - 1) } : prev);
    try {
      const res = await fetch("/api/digest/generate-personal", {
        method: "POST", credentials: "include",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ edition }),
      });
      if (!res.ok) {
        setUser(prev => prev ? { ...prev, credits: prev.credits + 1 } : prev);
        const e = await res.json().catch(() => ({}));
        throw new Error((e as { error?: string }).error ?? `Error ${res.status}`);
      }
      const data = await res.json() as { jobId: string; creditsRemaining: number };
      setUser(prev => prev ? { ...prev, credits: data.creditsRemaining } : prev);
      return data;
    } catch (e) {
      setUser(prev => prev ? { ...prev, credits: prev.credits + 1 } : prev);
      throw e;
    }
  }, []);

  const showOnboarding = !isLoading && !user && !isGuest;

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, isGuest, isLoading, showOnboarding, authError,
      signOut, updatePreferences, updateProfile, generatePersonalDigest, refresh, continueAsGuest,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
