// NOTE: the file is still called `ses.ts` so existing imports keep working, but
// transactional email is sent through Resend (see sendEmail below), not AWS SES.
import { WHATSAPP_URL } from "@/lib/contact";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummyKeyForBuildTime");

const FROM_EMAIL = process.env.EMAIL_FROM || process.env.SES_FROM_EMAIL || "info@bookmyglobal.com";
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

// Brand palette (matches the Stitch design tokens)
const INK = "#141b2f";
const GOLD = "#e9a23b";
const TEAL = "#0e8f86";
const PAPER = "#fcf9f4";
const MUTED = "#5b6070";

/** Escape user-supplied text before it goes into an HTML email. */
export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripHtmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY is not defined. Simulating email sending.");
    console.log(`[SIMULATION] Email to: ${to}`);
    console.log(`[SIMULATION] Subject: ${subject}`);
    return;
  }

  const recipients = to.split(",").map((email) => email.trim()).filter(Boolean);

  const { error } = await resend.emails.send({
    from: `BookMyGlobal <${FROM_EMAIL}>`,
    to: recipients,
    replyTo: FROM_EMAIL,
    subject,
    html,
    text: stripHtmlToText(html),
  });

  if (error) {
    console.error("Resend email sending failed:", error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
}

function baseTemplate(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:${PAPER};font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:${INK};border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
        <div style="color:${GOLD};font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;">BookMyGlobal</div>
        <div style="color:#fff;font-size:20px;font-weight:700;font-family:Georgia,serif;">Your journey, sorted.</div>
      </td></tr>
      <tr><td style="background:#fff;padding:32px;border-left:1px solid #e7e2d8;border-right:1px solid #e7e2d8;">
        ${content}
      </td></tr>
      <tr><td style="background:${INK};border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
        <p style="color:rgba(255,255,255,.5);font-size:11px;margin:0;">
          © ${new Date().getFullYear()} BookMyGlobal. All rights reserved.<br/>
          <a href="${APP_URL}" style="color:rgba(255,255,255,.5);">${APP_URL}</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function ctaButton(href: string, text: string, color = INK): string {
  return `<a href="${href}" style="display:inline-block;background:${color};color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;margin:16px 0;">${text}</a>`;
}

function h2(text: string, color = INK): string {
  return `<h2 style="color:${color};font-size:22px;font-weight:700;margin:0 0 8px;font-family:Georgia,serif;">${text}</h2>`;
}

function row(label: string, value: string, first = false): string {
  return `<tr${first ? "" : ' style="border-top:1px solid #efeae0;"'}><td style="color:${MUTED};font-size:13px;">${label}</td><td style="font-weight:700;color:${INK};text-align:right;font-size:13px;">${value}</td></tr>`;
}

function card(rows: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};border-radius:12px;border:1px solid #e7e2d8;margin-bottom:24px;"><tr><td style="padding:20px 24px;"><table width="100%" cellpadding="6" cellspacing="0">${rows}</table></td></tr></table>`;
}

const SERVICE_LABELS: Record<string, string> = {
  VISA: "Visa assistance",
  ATTESTATION: "Document attestation",
  OTHER: "Other",
};
export function serviceLabel(productType: string): string {
  return SERVICE_LABELS[productType] || productType;
}

function refCode(id: string): string {
  return `#${id.slice(-8).toUpperCase()}`;
}

function money(currency: string, amount: number): string {
  return `${esc(currency)} ${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

// ── Shared types ─────────────────────────────────────────────────────────────
export type ApplicationData = {
  id: string;
  productType: string;
  finalAmount: number;
  currency: string;
  fullName: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  destinationCountry?: string | null;
  couponCode?: string | null;
  rejectionReason?: string | null;
};

// ── 1. Application received ─────────────────────────────────────────────────
export function applicationReceivedEmail(app: ApplicationData): string {
  const content = `
    ${h2("We've got your request")}
    <p style="color:${MUTED};margin:0 0 24px;">Hi ${esc(app.fullName)}, thanks for choosing BookMyGlobal. Your request is in and our team will look at it shortly.</p>
    ${card(
      row("Reference", refCode(app.id), true) +
        row("Service", esc(serviceLabel(app.productType))) +
        (app.destinationCountry ? row("Destination", esc(app.destinationCountry)) : "")
    )}
    <p style="color:#374151;font-size:14px;">Next, upload your documents from your dashboard so we can start. We'll tell you the fee before any payment is taken.</p>
    <div style="text-align:center;">${ctaButton(`${APP_URL}/dashboard/upload`, "Upload documents →", TEAL)}</div>
    <p style="color:#94a3b8;font-size:12px;margin-top:24px;">Questions? <a href="${WHATSAPP_URL}" style="color:${INK};">Chat with us on WhatsApp</a>.</p>
  `;
  return baseTemplate(content, "We've received your request");
}

// ── 2. Documents received ────────────────────────────────────────────────────
export function documentReceivedEmail(app: ApplicationData): string {
  const content = `
    ${h2("Documents received")}
    <p style="color:${MUTED};margin:0 0 24px;">Hi ${esc(app.fullName)}, we've received your documents for ${refCode(app.id)}.</p>
    <div style="background:#f0f9f8;border:1px solid #b9e2de;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="color:#0b6b64;font-weight:700;font-size:14px;margin:0 0 8px;">What happens next?</p>
      <p style="color:#0b6b64;font-size:13px;margin:0;">Our team will review them and get back to you. If anything is unclear we'll ask you here, so keep an eye on your inbox.</p>
    </div>
    <div style="text-align:center;">${ctaButton(`${APP_URL}/dashboard/applications`, "Track your request →")}</div>
  `;
  return baseTemplate(content, "Documents received");
}

// ── 3. Application approved / confirmed ─────────────────────────────────────
export function applicationApprovedEmail(app: ApplicationData, payLink?: string): string {
  const content = `
    ${h2("Your request is confirmed")}
    <p style="color:${MUTED};margin:0 0 24px;">Hi ${esc(app.fullName)}, good news: we've reviewed ${refCode(app.id)} and it's confirmed.</p>
    ${card(
      row("Reference", refCode(app.id), true) +
        row("Service", esc(serviceLabel(app.productType))) +
        (app.finalAmount > 0 ? row("Fee", `<span style="color:${INK};font-size:16px;">${money(app.currency, app.finalAmount)}</span>`) : "")
    )}
    ${
      payLink
        ? `<p style="color:#374151;font-size:14px;">To get started, please complete the payment securely from your dashboard.</p>
           <div style="text-align:center;">${ctaButton(payLink, "Pay securely →", TEAL)}</div>`
        : `<div style="text-align:center;">${ctaButton(`${APP_URL}/dashboard/applications`, "View your request →")}</div>`
    }
    <p style="color:#94a3b8;font-size:12px;margin-top:24px;">BookMyGlobal is a private assistance service, not a government body. Outcomes such as visa decisions rest with the issuing authority.</p>
  `;
  return baseTemplate(content, "Your request is confirmed");
}

// ── 4. Application rejected ──────────────────────────────────────────────────
export function applicationRejectedEmail(app: ApplicationData): string {
  const content = `
    ${h2("An update on your request", "#b91c1c")}
    <p style="color:${MUTED};margin:0 0 24px;">Hi ${esc(app.fullName)}, we're sorry, but we're not able to take ${refCode(app.id)} forward at this time.</p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="color:#b91c1c;font-weight:700;font-size:14px;margin:0 0 8px;">Reason</p>
      <p style="color:#7f1d1d;font-size:13px;margin:0;">${esc(app.rejectionReason || "Please contact support for more information.")}</p>
    </div>
    <p style="color:#374151;font-size:14px;">If you think this is a mistake, or want to try a different route, message us and we'll help.</p>
    <div style="text-align:center;">${ctaButton(WHATSAPP_URL, "Message us on WhatsApp", TEAL)}</div>
  `;
  return baseTemplate(content, "Update on your request");
}

// ── 5. Documents dispatched (courier) ───────────────────────────────────────
type ShipmentData = {
  awbNumber?: string | null;
  trackingUrl?: string | null;
  recipientName: string;
};

export function shippingDispatchedEmail(app: ApplicationData, shipment: ShipmentData): string {
  const content = `
    ${h2("Your documents are on the way")}
    <p style="color:${MUTED};margin:0 0 24px;">Hi ${esc(app.fullName)}, your documents for ${refCode(app.id)} have been dispatched.</p>
    ${card(
      row("Tracking / AWB", esc(shipment.awbNumber || "Pending"), true) +
        row("Ship to", esc(shipment.recipientName))
    )}
    ${shipment.trackingUrl ? `<div style="text-align:center;">${ctaButton(shipment.trackingUrl, "Track your shipment →")}</div>` : ""}
  `;
  return baseTemplate(content, "Your documents have been dispatched");
}

// ── 6. Partner welcome ───────────────────────────────────────────────────────
type PartnerData = { referralCode: string; commissionRate: number };
type UserData = { name?: string | null; email: string };

export function partnerWelcomeEmail(partner: PartnerData, user: UserData & { password?: string }): string {
  const content = `
    ${h2("Welcome to the partner programme")}
    <p style="color:${MUTED};margin:0 0 24px;">Hi ${esc(user.name || "Partner")}, you're now an approved BookMyGlobal partner.</p>
    <div style="background:${INK};border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;">
      <p style="color:rgba(255,255,255,.6);font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">Your referral code</p>
      <p style="color:${GOLD};font-size:36px;font-weight:800;letter-spacing:6px;margin:0 0 12px;">${esc(partner.referralCode)}</p>
      <p style="color:rgba(255,255,255,.7);font-size:13px;margin:0;">Commission: <strong style="color:#fff;">${esc(partner.commissionRate)}%</strong> per successful referral</p>
    </div>
    ${
      user.password
        ? `<p style="color:${MUTED};font-size:13px;margin:0 0 12px;">We created an account for you. Sign in with the details below and change the password from your account settings.</p>
           ${card(row("Login email", esc(user.email), true) + row("Temporary password", `<code>${esc(user.password)}</code>`))}`
        : ""
    }
    <div style="text-align:center;">${ctaButton(`${APP_URL}/partner`, "Open partner dashboard →")}</div>
  `;
  return baseTemplate(content, "Welcome to the partner programme");
}

export async function sendPartnerWelcomeEmail(
  partner: { referralCode: string; commissionRate: number },
  user: { name?: string | null; email: string },
  password?: string
): Promise<void> {
  const html = partnerWelcomeEmail(
    { referralCode: partner.referralCode, commissionRate: partner.commissionRate },
    { name: user.name, email: user.email, password }
  );
  await sendEmail(user.email, "Welcome to the BookMyGlobal partner programme", html);
}

// ── 7. Account credentials (created for guests) ─────────────────────────────
export function userCredentialsEmail(email: string, password: string): string {
  const content = `
    ${h2("Your BookMyGlobal account")}
    <p style="color:${MUTED};margin:0 0 24px;">We created an account for you so you can track your requests, upload documents and pay securely.</p>
    ${card(row("Login email", esc(email), true) + row("Temporary password", `<code>${esc(password)}</code>`))}
    <p style="color:#374151;font-size:14px;">Please sign in and change your password from your account settings.</p>
    <div style="text-align:center;">${ctaButton(`${APP_URL}/sign-in`, "Sign in →")}</div>
  `;
  return baseTemplate(content, "Your BookMyGlobal account");
}

// ── 8. Re-upload request ─────────────────────────────────────────────────────
export function reuploadRequestEmail(app: ApplicationData, docs: string[], notes?: string): string {
  const docListHtml = docs.map((d) => `<li><strong>${esc(d)}</strong></li>`).join("");
  const content = `
    ${h2("We need a document again")}
    <p style="color:${MUTED};margin:0 0 24px;">Hi ${esc(app.fullName)}, we reviewed ${refCode(app.id)} and need you to re-upload the following before we can continue:</p>
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <ul style="color:#78350f;font-size:13px;margin:0 0 ${notes ? "16px" : "0"};padding-left:20px;">${docListHtml}</ul>
      ${notes ? `<p style="color:#b45309;font-weight:700;font-size:13px;margin:12px 0 4px;">Note from our team</p><p style="color:#78350f;font-size:13px;margin:0;font-style:italic;">“${esc(notes)}”</p>` : ""}
    </div>
    <div style="text-align:center;">${ctaButton(`${APP_URL}/dashboard/upload`, "Re-upload documents →")}</div>
  `;
  return baseTemplate(content, "Action needed: re-upload documents");
}

export async function sendReuploadRequestEmail(app: ApplicationData, docs: string[], notes?: string): Promise<void> {
  await sendEmail(app.email, "Action needed: please re-upload a document", reuploadRequestEmail(app, docs, notes));
}

// ── 9. Edit request ──────────────────────────────────────────────────────────
export function formEditRequestEmail(app: ApplicationData, notes: string): string {
  const content = `
    ${h2("Please update your details")}
    <p style="color:${MUTED};margin:0 0 24px;">Hi ${esc(app.fullName)}, we reviewed ${refCode(app.id)} and a few details need correcting before we can continue.</p>
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="color:#b45309;font-weight:700;font-size:14px;margin:0 0 8px;">Note from our team</p>
      <p style="color:#78350f;font-size:13px;margin:0;font-style:italic;">“${esc(notes)}”</p>
    </div>
    <div style="text-align:center;">${ctaButton(`${APP_URL}/dashboard/applications/${encodeURIComponent(app.id)}/edit`, "Edit your details →")}</div>
  `;
  return baseTemplate(content, "Action needed: update your details");
}

export async function sendFormEditRequestEmail(app: ApplicationData, notes: string): Promise<void> {
  await sendEmail(app.email, "Action needed: please update your details", formEditRequestEmail(app, notes));
}

// ── 10. Payment receipt ──────────────────────────────────────────────────────
export function paymentReceiptEmail(app: ApplicationData, provider: string): string {
  const content = `
    ${h2("Payment received, thank you")}
    <p style="color:${MUTED};margin:0 0 24px;">Hi ${esc(app.fullName)}, we've received your payment for ${refCode(app.id)}.</p>
    ${card(
      row("Reference", refCode(app.id), true) +
        row("Service", esc(serviceLabel(app.productType))) +
        row("Paid via", esc(provider)) +
        row("Amount", `<span style="color:${INK};font-size:16px;">${money(app.currency, app.finalAmount)}</span>`)
    )}
    <div style="text-align:center;">${ctaButton(`${APP_URL}/dashboard/applications`, "View your request →", TEAL)}</div>
  `;
  return baseTemplate(content, "Payment received");
}

// ── 11. Admin: new application submitted ────────────────────────────────────
export function adminNewApplicationNotificationEmail(app: ApplicationData): string {
  const content = `
    ${h2("New request submitted")}
    <p style="color:${MUTED};margin:0 0 24px;">A customer has submitted a new request.</p>
    ${card(
      row("Name", esc(app.fullName), true) +
        row("Email", `<a href="mailto:${esc(app.email)}" style="color:${INK};">${esc(app.email)}</a>`) +
        row("Phone", esc(app.phone || "N/A")) +
        row("Lives in", esc(app.country || "N/A")) +
        row("Reference", refCode(app.id)) +
        row("Service", esc(serviceLabel(app.productType))) +
        row("Destination", esc(app.destinationCountry || "N/A"))
    )}
    <div style="text-align:center;">${ctaButton(`${APP_URL}/admin/applications`, "Open in admin →")}</div>
  `;
  return baseTemplate(content, "New request submitted");
}

function adminRecipients(): string[] {
  return (process.env.ADMIN_EMAIL || "info@bookmyglobal.com")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

export async function sendAdminNewApplicationNotificationEmail(app: ApplicationData): Promise<void> {
  const html = adminNewApplicationNotificationEmail(app);
  const subject = `[Admin] New request ${refCode(app.id)} from ${app.fullName}`;
  const results = await Promise.allSettled(adminRecipients().map((to) => sendEmail(to, subject, html)));
  results.forEach((r) => {
    if (r.status === "rejected") console.error("[Admin Notification] failed:", r.reason);
  });
}

export async function sendAdminPaymentNotificationEmail(app: ApplicationData, provider: string): Promise<void> {
  const html = baseTemplate(
    `${h2("Payment received")}
     ${card(
       row("Customer", esc(app.fullName), true) +
         row("Reference", refCode(app.id)) +
         row("Provider", esc(provider)) +
         row("Amount", money(app.currency, app.finalAmount)) +
         row("Coupon", esc(app.couponCode || "None"))
     )}
     <div style="text-align:center;">${ctaButton(`${APP_URL}/admin/payments`, "Open payments →")}</div>`,
    "Payment received"
  );
  const subject = `[Admin] Payment received ${refCode(app.id)} (${money(app.currency, app.finalAmount)})`;
  await Promise.allSettled(adminRecipients().map((to) => sendEmail(to, subject, html)));
}

// ── 12. Admin: new user registered ──────────────────────────────────────────
export function adminNewUserRegistrationNotificationEmail(user: {
  name?: string | null;
  email: string;
  phone?: string | null;
  country?: string | null;
}): string {
  const content = `
    ${h2("New user registered")}
    <p style="color:${MUTED};margin:0 0 24px;">A new account was created on the platform.</p>
    ${card(
      row("Name", esc(user.name || "N/A"), true) +
        row("Email", `<a href="mailto:${esc(user.email)}" style="color:${INK};">${esc(user.email)}</a>`) +
        row("Phone", esc(user.phone || "N/A")) +
        row("Country", esc(user.country || "N/A"))
    )}
    <div style="text-align:center;">${ctaButton(`${APP_URL}/admin/users`, "View users →")}</div>
  `;
  return baseTemplate(content, "New user registered");
}

export async function sendAdminNewUserRegistrationNotificationEmail(user: {
  name?: string | null;
  email: string;
  phone?: string | null;
  country?: string | null;
}): Promise<void> {
  const html = adminNewUserRegistrationNotificationEmail(user);
  await Promise.allSettled(
    adminRecipients().map((to) => sendEmail(to, `[Admin] New user: ${user.name || user.email}`, html))
  );
}
