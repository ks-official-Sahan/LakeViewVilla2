/**
 * Resend email configuration.
 *
 * Required env vars:
 *   RESEND_API_KEY          — Resend API key
 *   RESEND_RECIPIENT_EMAILS — comma-separated notification recipients
 *
 * Optional env vars:
 *   RESEND_SENDER_EMAIL     — verified sender (default: onboarding@resend.dev)
 *   RESEND_SENDER_NAME      — From display name
 *   RESEND_CC_EMAILS        — comma-separated CC addresses
 *   RESEND_BCC_EMAILS       — comma-separated BCC addresses
 */

export type ResendConfig = {
  apiKey: string;
  senderEmail: string;
  senderName: string;
  recipientEmails: string[];
  ccEmails: string[];
  bccEmails: string[];
};

function parseEmailList(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

export function getResendConfig():
  | { ok: true; config: ResendConfig }
  | { ok: false; reason: "missing_api_key" | "missing_recipients" } {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, reason: "missing_api_key" };
  }

  const recipientEmails = parseEmailList(process.env.RESEND_RECIPIENT_EMAILS);
  if (recipientEmails.length === 0) {
    return { ok: false, reason: "missing_recipients" };
  }

  return {
    ok: true,
    config: {
      apiKey,
      senderEmail:
        process.env.RESEND_SENDER_EMAIL?.trim() ?? "onboarding@resend.dev",
      senderName:
        process.env.RESEND_SENDER_NAME?.trim() ?? "Lake View Villa Tangalle",
      recipientEmails,
      ccEmails: parseEmailList(process.env.RESEND_CC_EMAILS),
      bccEmails: parseEmailList(process.env.RESEND_BCC_EMAILS),
    },
  };
}

export function formatFromAddress(config: ResendConfig): string {
  return `${config.senderName} <${config.senderEmail}>`;
}
