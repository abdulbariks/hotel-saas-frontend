"use client";

import * as React from "react";

export type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
}

const STORAGE_KEY = "theme";
const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined,
);

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? "dark" : "light";
}

function applyResolvedTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

function suppressTransitions() {
  const style = document.createElement("style");
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}",
    ),
  );
  document.head.appendChild(style);

  return () => {
    window.getComputedStyle(document.body);
    window.setTimeout(() => {
      document.head.removeChild(style);
    }, 1);
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializers read the persisted theme on the first
  // client render. The rendered output never depends on
  // these values, so this cannot cause a hydration mismatch.
  const [theme, setThemeState] = React.useState<Theme>(() =>
    typeof window === "undefined" ? "system" : getStoredTheme(),
  );
  const [systemTheme, setSystemTheme] = React.useState<ResolvedTheme>(
    () => (typeof window === "undefined" ? "light" : getSystemTheme()),
  );

  React.useEffect(() => {
    applyResolvedTheme(theme === "system" ? systemTheme : theme);

    const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);

    // State updates only happen inside this event callback,
    // never synchronously in the effect body.
    const handleSystemThemeChange = () => {
      setSystemTheme(getSystemTheme());
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () =>
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [theme, systemTheme]);

  const setTheme = React.useCallback((nextTheme: Theme) => {
    const restoreTransitions = suppressTransitions();

    setThemeState(nextTheme);
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // ignore quota / privacy-mode errors
    }

    restoreTransitions();
  }, []);

  const resolvedTheme: ResolvedTheme =
    theme === "system" ? systemTheme : theme;

  const value = React.useMemo(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
