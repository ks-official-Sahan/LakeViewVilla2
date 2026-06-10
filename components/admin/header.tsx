"use client";

import { logoutAction } from "@/lib/admin/actions";
import type { Role } from "@prisma/client";
import { LogOut, Menu } from "lucide-react";

interface AdminHeaderProps {
  user: {
    name: string | null;
    email: string;
    role: Role;
    image?: string | null;
  };
  /** Opens the mobile navigation drawer (< md). */
  onOpenMobileNav?: () => void;
}

const ROLE_BADGE: Record<Role, { label: string; className: string }> = {
  DEVELOPER: {
    label: "Developer",
    className: "bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)] dark:bg-[var(--color-gold)]/20 dark:text-[var(--color-gold-light)]",
  },
  MANAGER: {
    label: "Manager",
    className: "bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:bg-[var(--color-primary)]/20 dark:text-[var(--color-primary)]",
  },
  EDITOR: {
    label: "Editor",
    className: "bg-[var(--color-muted)]/10 text-[var(--color-muted)] dark:bg-[var(--color-muted)]/20 dark:text-[var(--color-muted)]",
  },
};

export function AdminHeader({ user, onOpenMobileNav }: AdminHeaderProps) {
  const badge = ROLE_BADGE[user.role];

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 md:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="cursor-pointer rounded-lg p-2 text-[var(--color-muted)] transition-colors hover:bg-[var(--color-background)] md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden md:block" aria-hidden />

      {/* User info */}
      <div className="flex items-center gap-4">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}
        >
          {badge.label}
        </span>

        <div className="hidden text-right text-sm md:block">
          <p className="font-medium text-[var(--color-foreground)]">
            {user.name ?? user.email}
          </p>
          <p className="text-xs text-[var(--color-muted)]">{user.email}</p>
        </div>

        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-sm font-semibold text-[var(--color-primary)]">
          {(user.name ?? user.email).charAt(0).toUpperCase()}
        </div>

        <button
          onClick={async () => {
            await logoutAction();
          }}
          className="cursor-pointer rounded-lg p-2 text-[var(--color-muted)] transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
          aria-label="Sign out"
        >
          <LogOut className="h-4.5 w-4.5" />
        </button>
      </div>
    </header>
  );
}
