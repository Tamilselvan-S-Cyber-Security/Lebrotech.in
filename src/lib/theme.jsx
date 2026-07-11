import React, { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext(null);

/** Always apply light theme — dark mode is disabled. */
export function applyTheme() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark");
  root.style.colorScheme = "light";
  try {
    window.localStorage.removeItem("lerbo-theme");
  } catch (e) {
    /* ignore */
  }
}

export function getInitialTheme() {
  return "light";
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }) {
  useEffect(() => {
    applyTheme();
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: "light",
        setTheme: () => {},
        toggleTheme: () => {},
        isDark: false,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
