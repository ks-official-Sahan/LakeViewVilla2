"use client";

import { useMemo, useState } from "react";
import { updateUserRole, deleteUser, createUser, updateUserProfile, resetUserPassword } from "@/lib/actions/users";

// Keep Prisma off the client bundle — define Role locally as a union type
type Role = "DEVELOPER" | "MANAGER" | "EDITOR";
const ROLES: Role[] = ["DEVELOPER", "MANAGER", "EDITOR"];
import { Trash2, UserPlus, Download, Search, Key } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

type UserBasic = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: Date;
};

const ROLE_BADGE: Record<Role, string> = {
  DEVELOPER:
    "bg-violet-100 text-violet-800 ring-violet-500/20 dark:bg-violet-900/35 dark:text-violet-100 dark:ring-violet-400/20",
  MANAGER:
    "bg-sky-100 text-sky-900 ring-sky-500/20 dark:bg-sky-900/40 dark:text-sky-100 dark:ring-sky-400/20",
  EDITOR:
    "bg-emerald-100 text-emerald-900 ring-emerald-500/20 dark:bg-emerald-900/35 dark:text-emerald-100 dark:ring-emerald-400/20",
};

function escapeCsvCell(value: string): string {
  const s = value.replace(/"/g, '""');
  return `"${s}"`;
}

export function UsersClient({
  initialUsers,
  currentUserId,
}: {
  initialUsers: UserBasic[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState<UserBasic[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<Role>("EDITOR");
  const [creating, setCreating] = useState(false);

  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState("");
  const [resetting, setResetting] = useState(false);

  const handleRoleChange = async (id: string, newRole: Role) => {
    setLoading(id);
    try {
      const res = await updateUserRole({ id, role: newRole });
      if (res.success && res.data) {
        setUsers(users.map((u) => (u.id === id ? { ...u, role: res.data.role } : u)));
        toast.success("Role updated");
      } else {
        const msg =
          "error" in res && res.error
            ? String(res.error)
            : "errors" in res && res.errors
              ? "Validation failed"
              : "Failed to update role";
        toast.error(msg);
      }
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setLoading(deletingId);
    try {
      const res = await deleteUser(deletingId);
      if (res.success) {
        setUsers(users.filter((u) => u.id !== deletingId));
        toast.success("User removed");
      } else {
        toast.error(res.error || "Failed to delete user");
      }
    } finally {
      setLoading(null);
      setConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await createUser({
        email: newEmail,
        name: newName || undefined,
        password: newPassword,
        role: newRole,
      });
      if (res.success && res.data) {
        toast.success("User created");
        setUsers((prev) => [
          ...prev,
          {
            id: res.data.id,
            email: res.data.email,
            name: res.data.name,
            role: res.data.role,
            createdAt: res.data.createdAt,
          },
        ]);
        setNewEmail("");
        setNewName("");
        setNewPassword("");
        setNewRole("EDITOR");
      } else {
        toast.error("error" in res && res.error ? String(res.error) : "Could not create user");
      }
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.name ?? "").toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q),
    );
  }, [users, search]);

  const exportCsv = () => {
    const rows = [
      ["id", "email", "name", "role", "createdAt"],
      ...filteredUsers.map((u) => [
        u.id,
        u.email,
        u.name ?? "",
        u.role,
        new Date(u.createdAt).toISOString(),
      ]),
    ];
    const csv = rows.map((line) => line.map((c) => escapeCsvCell(String(c))).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded.");
  };

  const handleNameBlur = async (id: string, name: string, previous: string | null) => {
    const trimmed = name.trim();
    if (trimmed === (previous ?? "").trim()) return;
    const res = await updateUserProfile({ id, name: trimmed || null });
    if (res.success && res.data) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, name: res.data?.name ?? null } : u)),
      );
      toast.success("Name saved");
    } else {
      toast.error("Could not update name");
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreateUser}
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:p-6 shadow-sm space-y-4"
      >
        <div className="flex flex-wrap items-center gap-2">
          <UserPlus className="h-5 w-5 text-[var(--color-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Invite user</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Display name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
          />
          <input
            type="password"
            required
            placeholder="Password (min 8 chars)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}
              className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <Button type="submit" disabled={creating}>
              {creating ? "…" : "Create"}
            </Button>
          </div>
        </div>
      </form>

    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[var(--color-border)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative flex max-w-md flex-1 items-center gap-2">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-[var(--color-muted)]" />
          <input
            type="search"
            placeholder="Search name, email, role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] py-2 pl-9 pr-3 text-sm"
          />
        </label>
        <Button type="button" variant="outline" onClick={exportCsv} className="shrink-0 gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-muted)]/10 text-[var(--color-muted)]">
            <tr>
              <th className="p-4 font-medium">User</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Joined</th>
              <th className="p-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-[var(--color-muted)]/5 transition-colors">
                <td className="p-4">
                  <input
                    type="text"
                    defaultValue={user.name ?? ""}
                    placeholder="Display name"
                    disabled={loading === user.id}
                    onBlur={(e) => handleNameBlur(user.id, e.target.value, user.name)}
                    className="font-medium text-[var(--color-foreground)] w-full max-w-[14rem] rounded border border-transparent bg-transparent px-1 py-0.5 hover:border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none"
                  />
                  <div className="text-[var(--color-muted)] text-xs mt-1">{user.email}</div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${ROLE_BADGE[user.role]}`}
                    >
                      {user.role}
                    </span>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                      disabled={user.id === currentUserId || loading === user.id}
                      className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="p-4 text-[var(--color-muted)]">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={loading === user.id}
                      onClick={() => {
                        setResetPasswordUserId(user.id);
                        setResetPasswordVal("");
                      }}
                      title="Reset Password"
                      className="text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={user.id === currentUserId || loading === user.id}
                      onClick={() => handleDelete(user.id)}
                      title="Delete User"
                      className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-[var(--color-muted)]">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete User"
        description="Are you sure you want to delete this user permanently? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
      />

      {resetPasswordUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl animate-in fade-in duration-200">
            <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">Reset Password</h3>
            <p className="text-sm text-[var(--color-muted)] mb-4">
              Enter a new password for this user (minimum 8 characters).
            </p>
            <input
              type="password"
              placeholder="New password"
              value={resetPasswordVal}
              onChange={(e) => setResetPasswordVal(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm mb-4 text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setResetPasswordUserId(null);
                  setResetPasswordVal("");
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={resetPasswordVal.length < 8 || resetting}
                onClick={async () => {
                  setResetting(true);
                  try {
                    const res = await resetUserPassword({
                      id: resetPasswordUserId,
                      password: resetPasswordVal,
                    });
                    if (res.success) {
                      toast.success("Password reset successful");
                      setResetPasswordUserId(null);
                      setResetPasswordVal("");
                    } else {
                      toast.error("Failed to reset password");
                    }
                  } finally {
                    setResetting(false);
                  }
                }}
              >
                {resetting ? "Resetting..." : "Reset"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
