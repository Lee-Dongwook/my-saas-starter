import { env } from "../env";

/** Minimal HTML escaping for values interpolated into the templates below. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface LayoutOptions {
  heading: string;
  body: string;
  action?: { label: string; url: string };
  footnote?: string;
}

/**
 * Shared shell for transactional email.
 *
 * Inline styles and a table-free single column: that is the subset of CSS every
 * mail client renders the same way. Colours are hard-coded rather than read
 * from the design tokens because email has no CSS custom properties.
 */
function layout({ heading, body, action, footnote }: LayoutOptions) {
  const button = action
    ? `<a href="${escapeHtml(action.url)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:10px 18px;border-radius:8px">${escapeHtml(action.label)}</a>
       <p style="margin:20px 0 0;font-size:12px;line-height:20px;color:#6b7280">
         Or paste this link into your browser:<br />
         <span style="color:#2563eb;word-break:break-all">${escapeHtml(action.url)}</span>
       </p>`
    : "";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px">
      <p style="margin:0 0 24px;font-size:14px;font-weight:600;color:#6b7280">${escapeHtml(env.APP_NAME)}</p>
      <h1 style="margin:0 0 12px;font-size:20px;line-height:28px">${escapeHtml(heading)}</h1>
      <p style="margin:0 0 24px;font-size:14px;line-height:22px;color:#374151">${body}</p>
      ${button}
      ${
        footnote
          ? `<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;line-height:20px;color:#6b7280">${escapeHtml(footnote)}</p>`
          : ""
      }
    </div>
  </body>
</html>`;
}

export interface EmailContent {
  subject: string;
  html: string;
}

export function verifyEmailTemplate(url: string): EmailContent {
  return {
    subject: `Verify your email for ${env.APP_NAME}`,
    html: layout({
      heading: "Confirm your email address",
      body: "Click the button below to verify your email and finish setting up your account.",
      action: { label: "Verify email", url },
      footnote: "If you didn't create this account, you can ignore this email.",
    }),
  };
}

export function resetPasswordTemplate(url: string): EmailContent {
  return {
    subject: `Reset your ${env.APP_NAME} password`,
    html: layout({
      heading: "Reset your password",
      body: "Use the button below to choose a new password. The link expires in one hour.",
      action: { label: "Reset password", url },
      footnote:
        "If you didn't request a password reset, no action is needed — your password stays the same.",
    }),
  };
}

export function organizationInvitationTemplate(options: {
  organizationName: string;
  inviterName: string;
  role: string;
  url: string;
}): EmailContent {
  const org = escapeHtml(options.organizationName);
  return {
    subject: `${options.inviterName} invited you to ${options.organizationName}`,
    html: layout({
      heading: `Join ${options.organizationName}`,
      body: `<strong>${escapeHtml(options.inviterName)}</strong> invited you to join <strong>${org}</strong> as ${escapeHtml(options.role)}.`,
      action: { label: "Accept invitation", url: options.url },
      footnote:
        "If you weren't expecting this invitation, you can safely ignore this email.",
    }),
  };
}
