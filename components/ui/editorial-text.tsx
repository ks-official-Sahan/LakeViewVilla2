"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type EditorialRole = "display" | "h1" | "h2" | "h3" | "body" | "caption" | "eyebrow";
type EditorialColor = "foreground" | "muted" | "gold" | "white" | "inherit";

const roleStyles: Record<EditorialRole, string> = {
  display: "font-[var(--font-serif)] font-black leading-[0.95] tracking-tight",
  h1: "font-[var(--font-serif)] font-black leading-[1.05] tracking-tight",
  h2: "font-[var(--font-serif)] font-bold leading-[1.1] tracking-tight",
  h3: "font-[var(--font-serif)] font-semibold leading-[1.2] tracking-tight",
  body: "font-[var(--font-sans)] font-normal leading-relaxed",
  caption: "font-[var(--font-sans)] font-medium uppercase tracking-[0.2em]",
  eyebrow: "font-[var(--font-sans)] font-bold uppercase tracking-[0.25em] text-[var(--color-gold)]",
};

const sizeStyles: Record<EditorialRole, string> = {
  display: "text-[var(--text-editorial-display)]",
  h1: "text-[var(--text-editorial-h1)]",
  h2: "text-[var(--text-editorial-h2)]",
  h3: "text-[var(--text-editorial-h3)]",
  body: "text-[var(--text-editorial-body)]",
  caption: "text-[var(--text-editorial-caption)]",
  eyebrow: "text-[0.65rem]",
};

const colorStyles: Record<EditorialColor, string> = {
  foreground: "text-[var(--color-foreground)]",
  muted: "text-[var(--color-muted)]",
  gold: "text-[var(--color-gold)]",
  white: "text-white",
  inherit: "",
};

const roleToTag: Record<EditorialRole, "h1" | "h2" | "h3" | "p" | "span"> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  body: "p",
  caption: "span",
  eyebrow: "span",
};

export interface EditorialTextProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  role?: EditorialRole;
  color?: EditorialColor;
  italic?: boolean;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

const EditorialText = forwardRef<HTMLElement, EditorialTextProps>(
  ({ className, role = "body", color = "foreground", italic = false, as, children, ...props }, ref) => {
    const Tag = as || roleToTag[role] || "span";
    return (
      <Tag
        ref={ref as any}
        className={cn(
          "text-balance",
          roleStyles[role],
          sizeStyles[role],
          colorStyles[color],
          italic && "italic",
          className
        )}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);

EditorialText.displayName = "EditorialText";

export { EditorialText };
