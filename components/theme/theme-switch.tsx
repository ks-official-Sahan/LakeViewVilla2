// components/theme/theme-switch.tsx
"use client";

import * as React from "react";
import { useMantineColorScheme } from "@mantine/core";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

const OPTIONS = [
  { key: "light" as const, icon: Sun, label: "Light" },
  { key: "system" as const, icon: Monitor, label: "System" },
  { key: "dark" as const, icon: Moon, label: "Dark" },
];

type ThemeKey = (typeof OPTIONS)[number]["key"];

export default function ThemeSwitch() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useTheme();
  const { setColorScheme } = useMantineColorScheme({ keepTransitions: true });
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const applyTheme = React.useCallback(
    (t: ThemeKey) => {
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
    } catch {
      /* ignore */
    }
    if (meta) meta.setAttribute("content", color);
  }, [mounted, theme, systemTheme, resolvedTheme]);

  const currentKey: ThemeKey = (theme as ThemeKey) ?? "system";

  if (!mounted) {
    return (
      <div
        aria-hidden
        className="inline-flex h-8 w-[5.5rem] items-center justify-center rounded-full opacity-40"
      >
        <Sun className="h-3.5 w-3.5" />
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex h-8 items-center gap-0.5 rounded-full p-0.5"
    >
      {OPTIONS.map(({ key, icon: Icon, label }) => {
        const checked = currentKey === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={`Use ${label} theme`}
            onClick={() => applyTheme(key)}
            title={label}
            className={[
              "relative grid h-7 w-7 place-items-center rounded-full outline-none transition-all duration-300",
              checked
                ? "bg-[var(--color-gold)]/20 text-[var(--color-gold)] shadow-[inset_0_0_0_1px_rgba(201,165,90,0.35)]"
                : "text-current/50 hover:text-current/85 hover:bg-white/[0.06]",
            ].join(" ")}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={checked ? 2.25 : 1.75} />
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
