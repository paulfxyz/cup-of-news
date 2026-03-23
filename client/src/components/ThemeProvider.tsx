import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: "dark", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // v3.0.0: dark mode is the default — it looks better with the black QuoteCard
    // and the red/black editorial palette. Users can toggle to light.
    try {
      const saved = localStorage.getItem("cup_theme");
      if (saved === "light" || saved === "dark") return saved as Theme;
    } catch {}
    return "dark"; // default: dark
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggle = () => setTheme(t => {
    const next = t === "dark" ? "light" : "dark";
    try { localStorage.setItem("cup_theme", next); } catch {}
    return next;
  });

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
