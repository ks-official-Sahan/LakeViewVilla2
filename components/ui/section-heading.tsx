"use client";

import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps extends HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  children,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "relative",
        align === "center" && "text-center mx-auto max-w-3xl",
        className
      )}
      {...props}
    >
      {eyebrow && (
        <p className="flex items-center gap-3 mb-4 justify-center">
          <span className="h-px w-8 bg-[var(--color-gold)]" />
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-[var(--color-gold)]">
            {eyebrow}
          </span>
          <span className="h-px w-8 bg-[var(--color-gold)]" />
        </p>
      )}

      <h2
        className="font-[var(--font-serif)] font-black leading-[1.08] tracking-tight text-[var(--color-foreground)]"
        style={{ fontSize: "var(--text-editorial-h2)" }}
      >
        {title}
      </h2>

      {description && (
        <p className="mt-6 max-w-xl text-[var(--color-muted)] leading-relaxed text-[var(--text-editorial-body)]">
          {description}
        </p>
      )}

      {children}
    </div>
  );
}
