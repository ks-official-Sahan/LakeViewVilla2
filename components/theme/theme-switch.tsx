// components/theme/theme-switch.tsx
"use client";

import * as React from "react";
import { useMantineColorScheme } from "@mantine/core";
import { useTheme } from "next-themes";

/* ---------- custom inline SVGs ---------- */
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m12.72-12.72l-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

const MonitorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" aria-hidden="true">
    <rect x="2" y="3" width="20" height="13" rx="0.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 20h8m-4-3v3" />
  </svg>
);

const OPTIONS = [
  { key: "light", icon: SunIcon, label: "Light" },
  { key: "system", icon: MonitorIcon, label: "System" },
  { key: "dark", icon: MoonIcon, label: "Dark" },
] as const;

type Key = (typeof OPTIONS)[number]["key"];

export default function ThemeSwitch() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useTheme();
  const { setColorScheme } = useMantineColorScheme({ keepTransitions: true });
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const applyTheme = React.useCallback(
    (t: Key) => {
      setTheme(t);
      setColorScheme(t === "system" ? "auto" : t);
    },
    [setTheme, setColorScheme]
  );

  React.useEffect(() => {
    if (!mounted) return;
    const eff: "light" | "dark" =
      (theme === "system"
        ? (systemTheme as "light" | "dark" | undefined)
        : (resolvedTheme as "light" | "dark" | undefined)) ?? "dark";

    const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    const fallback = eff === "dark" ? "#0b2027" : "#f5f0e6";
    let color = fallback;
    try {
      const root = getComputedStyle(document.documentElement);
      const varHex = root.getPropertyValue("--color-background").trim();
      if (varHex) color = varHex;
    } catch {}
    if (meta) meta.setAttribute("content", color);
  }, [mounted, theme, systemTheme, resolvedTheme]);

  const btnRefs = React.useRef<HTMLButtonElement[]>([]);
  const setRef = React.useCallback(
    (el: HTMLButtonElement | null, i: number) => {
      if (el) btnRefs.current[i] = el;
    },
    []
  );

  const currentKey: Key = (theme as Key) ?? "system";

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const idx = OPTIONS.findIndex((o) => o.key === currentKey);
      if (idx < 0) return;

      const move = (nextIdx: number) => {
        const target = (nextIdx + OPTIONS.length) % OPTIONS.length;
        btnRefs.current[target]?.focus();
        applyTheme(OPTIONS[target].key);
      };

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          move(idx + 1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          move(idx - 1);
          break;
        case "Home":
          e.preventDefault();
          move(0);
          break;
        case "End":
          e.preventDefault();
          move(OPTIONS.length - 1);
          break;
      }
    },
    [currentKey, applyTheme]
  );

  if (!mounted) {
    return (
      <div
        aria-hidden
        role="presentation"
        className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border/60 bg-card/65 px-1.5 py-1 backdrop-blur-sm"
        data-mounted="false"
      >
        <div className="grid size-7 place-items-center opacity-40">
          <SunIcon />
        </div>
        <div className="grid size-7 place-items-center opacity-40">
          <MonitorIcon />
        </div>
        <div className="grid size-7 place-items-center opacity-40">
          <MoonIcon />
        </div>
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      onKeyDown={onKeyDown}
      className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border/60 bg-card/65 px-1.5 py-1 backdrop-blur-sm"
      data-mounted="true"
    >
      {OPTIONS.map(({ key, icon: Icon, label }, i) => {
        const checked = currentKey === key;
        return (
          <button
            key={key}
            ref={(el) => setRef(el, i)}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={`Use ${label} theme`}
            tabIndex={checked ? 0 : -1}
            onClick={() => applyTheme(key)}
            title={label}
            className={[
              "relative grid size-7 place-items-center rounded-sm outline-none transition-all duration-300",
              checked
                ? "bg-accent/15 border border-accent/30 text-accent font-bold shadow-sm"
                : "bg-transparent text-foreground/60 border border-transparent hover:bg-foreground/5 hover:text-foreground",
            ].join(" ")}
            data-state={checked ? "checked" : "unchecked"}
          >
            <Icon />
            <span className="sr-only">{label}</span>
          </button>
        );
      })}

      <span className="sr-only" aria-live="polite" role="status">
        Theme set to {theme}.
      </span>
    </div>
  );
}
