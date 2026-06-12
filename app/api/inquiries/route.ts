// POST /api/inquiries — public contact & booking enquiry forms (Resend)

import { type NextRequest, NextResponse, after } from "next/server";
import { rateLimit } from "@/lib/cache";
import { sendEmail, escapeHtml } from "@/lib/email/send";
import { SITE_CONFIG } from "@/data/site";

export interface InquiryPayload {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  service?: string;
  inquiryType?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  source?: "visit" | "stays" | "contact" | "homepage" | string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(body: unknown): body is InquiryPayload {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.name === "string" &&
    b.name.trim().length >= 2 &&
    typeof b.email === "string" &&
    EMAIL_REGEX.test(b.email.trim())
  );
}

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

function buildSubject(inquiry: InquiryPayload): string {
  const source = inquiry.source ?? "unknown";
  if (source === "visit") return `Visit enquiry from ${inquiry.name}`;
  if (source === "stays") return `Stay enquiry from ${inquiry.name}`;
  return `New enquiry from ${inquiry.name}`;
}

function buildSourceUrl(inquiry: InquiryPayload): string | null {
  const base = SITE_CONFIG.primaryDomain.replace(/\/$/, "");
  if (inquiry.source === "visit") return `${base}/visit`;
  if (inquiry.source === "stays") return `${base}/stays`;
  if (inquiry.source === "contact") return `${base}/visit`;
  if (inquiry.source === "homepage") return `${base}/`;
  return null;
}

function buildHtml(inquiry: InquiryPayload, clientIp: string): string {
  const serviceLabel = inquiry.service ?? inquiry.inquiryType ?? "—";
  const safeName = escapeHtml(inquiry.name.trim());
  const safeEmail = escapeHtml(inquiry.email.trim());
  const safePhone = escapeHtml(inquiry.phone?.trim() ?? "—");
  const safeService = escapeHtml(serviceLabel);
  const safeSource = escapeHtml(inquiry.source ?? "unknown");
  const safeIp = escapeHtml(clientIp);
  const safeMessage = escapeHtml(inquiry.message?.trim() ?? "—").replace(
    /\n/g,
    "<br>",
  );
  const sourceUrl = buildSourceUrl(inquiry);

  const stayRows =
    inquiry.checkIn || inquiry.checkOut || inquiry.guests
      ? `
        ${inquiry.checkIn ? `<tr><td style="padding:8px 0; color:#6b7280;">Check-in</td><td style="padding:8px 0;">${escapeHtml(inquiry.checkIn)}</td></tr>` : ""}
        ${inquiry.checkOut ? `<tr><td style="padding:8px 0; color:#6b7280;">Check-out</td><td style="padding:8px 0;">${escapeHtml(inquiry.checkOut)}</td></tr>` : ""}
        ${typeof inquiry.guests === "number" ? `<tr><td style="padding:8px 0; color:#6b7280;">Guests</td><td style="padding:8px 0;">${inquiry.guests}</td></tr>` : ""}
      `
      : "";

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="margin: 0 0 24px; color: #0b2027;">New Enquiry — Lake View Villa</h2>
      <table style="width:100%; border-collapse: collapse;">
        <tr><td style="padding:8px 0; color:#6b7280; width:140px;">Name</td><td style="padding:8px 0; font-weight:600;">${safeName}</td></tr>
        <tr><td style="padding:8px 0; color:#6b7280;">Email</td><td style="padding:8px 0;"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
        <tr><td style="padding:8px 0; color:#6b7280;">Phone</td><td style="padding:8px 0;">${safePhone}</td></tr>
        <tr><td style="padding:8px 0; color:#6b7280;">Type</td><td style="padding:8px 0;">${safeService}</td></tr>
        ${stayRows}
        <tr><td style="padding:8px 0; color:#6b7280;">Source</td><td style="padding:8px 0;">${safeSource}</td></tr>
        ${sourceUrl ? `<tr><td style="padding:8px 0; color:#6b7280;">Page</td><td style="padding:8px 0;"><a href="${escapeHtml(sourceUrl)}">${escapeHtml(sourceUrl)}</a></td></tr>` : ""}
        <tr><td style="padding:8px 0; color:#6b7280;">IP</td><td style="padding:8px 0;">${safeIp}</td></tr>
        <tr><td style="padding:8px 0; color:#6b7280; vertical-align:top;">Message</td><td style="padding:8px 0;">${safeMessage}</td></tr>
      </table>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <p style="margin:0; color:#9ca3af; font-size:12px;">Received at ${new Date().toLocaleString("en-LK", { timeZone: "Asia/Colombo" })} (Sri Lanka time)</p>
    </div>
  `;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const clientIp = getClientIp(req);
  const { success: withinLimit } = await rateLimit(`inquiries:${clientIp}`);
  if (!withinLimit) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again shortly." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!validate(body)) {
    return NextResponse.json(
      { success: false, error: "Name and a valid email are required" },
      { status: 422 },
    );
  }

  const inquiry = body as InquiryPayload;

  console.log("[Inquiry Received]", {
    name: inquiry.name.trim(),
    email: inquiry.email.trim(),
    phone: inquiry.phone ?? "—",
    source: inquiry.source ?? "unknown",
    checkIn: inquiry.checkIn ?? "—",
    checkOut: inquiry.checkOut ?? "—",
    guests: inquiry.guests ?? "—",
    ipAddress: clientIp,
    receivedAt: new Date().toISOString(),
  });

  const result = await sendEmail({
    subject: buildSubject(inquiry),
    html: buildHtml(inquiry, clientIp),
    replyTo: inquiry.email.trim(),
  });

  if (!result.sent && result.reason === "not_configured") {
    console.warn("[Inquiries] Resend not configured — enquiry logged only");
    return NextResponse.json({ success: true, emailSent: false }, { status: 201 });
  }

  if (!result.sent) {
    after(() => {
      console.error("[Inquiries] Email delivery failed");
    });
    return NextResponse.json(
      { success: true, emailSent: false },
      { status: 201 },
    );
  }

  after(() => {
    console.log("[Inquiries] Email sent:", result.id ?? "ok");
  });

  return NextResponse.json({ success: true, emailSent: true }, { status: 201 });
}
