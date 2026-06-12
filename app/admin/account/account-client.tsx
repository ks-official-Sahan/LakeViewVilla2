"use client";

import { useState } from "react";
import type { Role } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  changeAccountPassword,
  updateAccountProfile,
} from "@/lib/actions/account";

type Profile = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};

const ROLE_LABEL: Record<Role, string> = {
  DEVELOPER: "Developer",
  MANAGER: "Manager",
  EDITOR: "Editor",
};

export function AccountClient({ initialProfile }: { initialProfile: Profile }) {
  const [name, setName] = useState(initialProfile.name ?? "");
  const [email, setEmail] = useState(initialProfile.email);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await updateAccountProfile({
        name: name.trim() || null,
        email: email.trim(),
      });
      if (res.success) {
        toast.success("Profile updated");
        if (res.data.email !== initialProfile.email) {
          toast.message("Email changed — sign in again on your next session.");
        }
      } else {
        toast.error("error" in res && res.error ? res.error : "Update failed");
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await changeAccountPassword({
        currentPassword,
        newPassword,
      });
      if (res.success) {
        toast.success("Password updated");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error("error" in res && res.error ? res.error : "Update failed");
      }
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        onSubmit={handleProfileSave}
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm space-y-4"
      >
        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
          Profile
        </h2>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--color-muted)]">
            Display name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--color-muted)]">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted)]">
          <span className="rounded-full bg-[var(--color-muted)]/10 px-2.5 py-0.5 text-xs font-semibold">
            {ROLE_LABEL[initialProfile.role]}
          </span>
          <span>
            Member since{" "}
            {new Date(initialProfile.createdAt).toLocaleDateString()}
          </span>
        </div>
        <Button type="submit" disabled={savingProfile}>
          {savingProfile ? "Saving…" : "Save profile"}
        </Button>
      </form>

      <form
        onSubmit={handlePasswordSave}
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm space-y-4"
      >
        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
          Password
        </h2>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--color-muted)]">
            Current password
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--color-muted)]">
            New password
          </label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--color-muted)]">
            Confirm new password
          </label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
          />
        </div>
        <Button type="submit" disabled={savingPassword}>
          {savingPassword ? "Updating…" : "Change password"}
        </Button>
      </form>
    </div>
  );
}
