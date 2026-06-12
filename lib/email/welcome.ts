import { SITE_CONFIG } from "@/data/site";
import { escapeHtml, sendEmail } from "@/lib/email/send";
import type { Role } from "@prisma/client";

function resolveAdminLoginUrl(): string {
  const devSiteUrl = process.env.NEXT_PUBLIC_DEV_SITE_URL;
  if (process.env.NODE_ENV === "development") {
    return `${devSiteUrl}/admin/login`;
  }
  const base =
    // process.env.AUTH_URL?.replace(/\/$/, "") ??
    // process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    SITE_CONFIG.primaryDomain.replace(/\/$/, "");
  return `${base}/admin/login`;
}

export async function sendWelcomeEmail(opts: {
  email: string;
  name: string | null;
  role: Role;
  temporaryPassword: string;
}): Promise<{ sent: boolean }> {
  const loginUrl = resolveAdminLoginUrl();
  const displayName = opts.name?.trim() || opts.email;
  const safeName = escapeHtml(displayName);
  const safeEmail = escapeHtml(opts.email);
  const safeRole = escapeHtml(opts.role);
  const safeLoginUrl = escapeHtml(loginUrl);

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="margin: 0 0 8px; color: #0b2027;">Welcome to Lake View Villa Admin</h2>
      <p style="margin: 0 0 24px; color: #4b5563;">Hi ${safeName}, your admin account has been created.</p>
      <table style="width:100%; border-collapse: collapse;">
        <tr><td style="padding:8px 0; color:#6b7280; width:140px;">Email</td><td style="padding:8px 0; font-weight:600;">${safeEmail}</td></tr>
        <tr><td style="padding:8px 0; color:#6b7280;">Role</td><td style="padding:8px 0;">${safeRole}</td></tr>
        <tr><td style="padding:8px 0; color:#6b7280;">Admin panel</td><td style="padding:8px 0;"><a href="${safeLoginUrl}">${safeLoginUrl}</a></td></tr>
      </table>
      <div style="margin: 24px 0; padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
        <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Temporary password</p>
        <p style="margin: 0; font-family: monospace; font-size: 16px; color: #111827;">${escapeHtml(opts.temporaryPassword)}</p>
      </div>
      <p style="margin: 0 0 16px; color: #4b5563; font-size: 14px;">
        Sign in with the credentials above, then open <strong>Account</strong> in the admin sidebar to update your profile and set a new password.
      </p>
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        For security, delete this email after your first login. Never share your password.
      </p>
    </div>
  `;

  const result = await sendEmail({
    to: [opts.email],
    subject: "Your Lake View Villa admin account",
    html,
  });

  if (!result.sent) {
    console.warn("[welcome-email] Could not send welcome email:", result);
  }

  return { sent: result.sent };
}
