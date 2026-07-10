import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getAccountProfile } from "@/lib/actions/account";
import { AccountClient } from "./account-client";

export const metadata: Metadata = {
  title: "Account | Admin",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const profile = await getAccountProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">
          Your account
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Update your profile and password. Changes apply to your login only.
        </p>
      </div>
      <AccountClient initialProfile={profile} />
    </div>
  );
}
