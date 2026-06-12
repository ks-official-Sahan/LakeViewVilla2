import { Resend } from "resend";
import {
  formatFromAddress,
  getResendConfig,
  type ResendConfig,
} from "@/lib/email/config";

export type SendEmailInput = {
  to?: string[];
  subject: string;
  html: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
};

export type SendEmailResult =
  | { sent: true; id?: string }
  | { sent: false; reason: "not_configured" | "send_failed"; error?: string };

export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const resolved = getResendConfig();
  if (!resolved.ok) {
    return { sent: false, reason: "not_configured" };
  }

  const config = resolved.config;
  const to = input.to?.length ? input.to : config.recipientEmails;

  try {
    const resend = new Resend(config.apiKey);
    const { data, error } = await resend.emails.send({
      from: formatFromAddress(config),
      to,
      subject: input.subject,
      html: input.html,
      ...(input.replyTo && { replyTo: input.replyTo }),
      ...(mergeOptionalList(input.cc, config.ccEmails).length > 0 && {
        cc: mergeOptionalList(input.cc, config.ccEmails),
      }),
      ...(mergeOptionalList(input.bcc, config.bccEmails).length > 0 && {
        bcc: mergeOptionalList(input.bcc, config.bccEmails),
      }),
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return { sent: false, reason: "send_failed", error: error.message };
    }

    return { sent: true, id: data?.id };
  } catch (err) {
    console.error("[email] Unexpected error:", err);
    return {
      sent: false,
      reason: "send_failed",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

function mergeOptionalList(
  explicit: string[] | undefined,
  fromConfig: string[],
): string[] {
  if (explicit?.length) return explicit;
  return fromConfig;
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function getResendConfigForTemplates(): ResendConfig | null {
  const resolved = getResendConfig();
  return resolved.ok ? resolved.config : null;
}
