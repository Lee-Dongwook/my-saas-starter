import { Resend } from "resend";

import { env } from "./env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends a transactional email. When RESEND_API_KEY is not configured (local
 * dev), the message is logged to the console instead of being sent.
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!resend) {
    console.log(`\n[email:dev] to=${to} subject="${subject}"\n${html}\n`);
    return;
  }

  await resend.emails.send({ from: env.EMAIL_FROM, to, subject, html });
}
