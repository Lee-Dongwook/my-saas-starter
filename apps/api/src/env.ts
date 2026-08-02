import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  // Core
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z.string().min(1).default("http://localhost:8000"),
  WEB_ORIGIN: z.string().min(1).default("http://localhost:3000"),
  PORT: z.coerce.number().default(8000),

  // OAuth (optional — providers are enabled only when both values are set)
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Stripe (optional — billing is enabled only when both values are set)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_PRO: z.string().optional(),

  // Email (optional — falls back to console logging in dev when unset)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("SaaS Starter <onboarding@resend.dev>"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
