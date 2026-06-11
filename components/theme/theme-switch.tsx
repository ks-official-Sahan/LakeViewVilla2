// components/theme/theme-switch.tsx
"use client";

import * as React from "react";
import { useMantineColorScheme } from "@mantine/core";
import { useTheme } from "next-themes";

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m12.72-12.72l-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

export default function ThemeSwitch() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useTheme();
  const { setColorScheme } = useMantineColorScheme({ keepTransitions: true });
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const toggleTheme = React.useCallback(() => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    setColorScheme(nextTheme);
  }, [resolvedTheme, setTheme, setColorScheme]);

  // Synchronize browser status bar theme-color meta tag
  React.useEffect(() => {
    if (!mounted) return;
    const currentEff = resolvedTheme ?? "dark";
    const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    const fallback = currentEff === "dark" ? "#0b2027" : "#f5f0e6";
    let color = fallback;
    try {
      const root = getComputedStyle(document.documentElement);
      const varHex = root.getPropertyValue("--color-background").trim();
      if (varHex) color = varHex;
    } catch {}
    if (meta) meta.setAttribute("content", color);
  }, [mounted, resolvedTheme]);

  if (!mounted) {
    return (
      <div 
        className="h-8 w-8 rounded-full bg-transparent border border-transparent"
        aria-hidden="true" 
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="relative flex h-8 w-8 items-center justify-center rounded-full text-foreground/70 dark:text-white/70 hover:text-foreground dark:hover:text-white hover:bg-foreground/[0.06] dark:hover:bg-white/10 transition-all duration-300 focus-visible:outline-none cursor-pointer"
      aria-label="Toggle theme mode"
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className="relative w-4.5 h-4.5 overflow-hidden">
        {/* Sun Icon */}
        <span className={`absolute inset-0 flex items-center justify-center transition-all duration-500 transform ${
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}>
          <SunIcon />
        </span>
        {/* Moon Icon */}
        <span className={`absolute inset-0 flex items-center justify-center transition-all duration-500 transform ${
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        }`}>
          <MoonIcon />
        </span>
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
