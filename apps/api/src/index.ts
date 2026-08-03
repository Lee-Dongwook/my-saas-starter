import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { auth } from "./auth";
import { env } from "./env";
import { configRoutes } from "./routes/config";

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: env.WEB_ORIGIN,
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.get("/api/health", (c) => c.json({ status: "ok" }));

// Which optional features are actually configured — the web app reads this to
// decide whether to render OAuth buttons, billing screens, and so on.
app.route("/api/config", configRoutes);

// Better Auth owns every /api/auth/** route (sign-in, sign-up, OAuth,
// organization, stripe webhooks, ...).
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`🚀 API listening on http://localhost:${info.port}`);
});
