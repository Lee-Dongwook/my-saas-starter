# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **SaaS starter kit** — the goal is to provide every feature common to any SaaS (auth, orgs/RBAC, billing, email, i18n), not a single product. Treat additions as reusable building blocks.

## Changelog

`CHANGELOG.md` tracks progress ([Keep a Changelog](https://keepachangelog.com/) format). Update the `[Unreleased]` block **in the same commit** as the change — Added / Changed / Fixed, and move the item out of the `Roadmap` section at the bottom when it lands. Nothing is released yet; on the first release, move `[Unreleased]` under a version heading and open a fresh one.

## Repository layout

pnpm workspace (`pnpm@9.15.0`, enforced via `packageManager`). Globs are `apps/**` and `packages/**` (`packages/` doesn't exist yet).

- `apps/web` — Vite + React 19 SPA (`saas-web`), proxies `/api` → the API server
- `apps/api` — Hono backend (`saas-api`) on port **8000**; owns auth, DB access, billing
- `prisma/` — schema + seed, shared, run from the repo root
- Deps are owned by the workspace that uses them: DB/backend runtime at root + `apps/api`, frontend libs in `apps/web`. `vite` is a `apps/web` devDep.

## Commands

Always `pnpm`. Key root scripts:

- `pnpm dev` — runs web + api in parallel (`pnpm -r --parallel dev`); `dev:web` / `dev:api` for one
- `pnpm build` — `pnpm -r build` (api build is a `tsc --noEmit` gate; web is `vite build`)
- `pnpm typecheck` — root node-side `tsc` + each package's `tsc --noEmit`
- `pnpm lint` — **oxlint** (see toolchain note); `pnpm format` — Prettier
- `pnpm db:generate` / `db:migrate` / `db:seed` — Prisma; `postinstall` runs `prisma generate`

Servers run through **`tsx`**, not a compiled `dist/` (dev and `start` both). This deliberately avoids Node-ESM file-extension issues — don't switch `apps/api` to `node dist/…` without adding `.js` extensions to relative imports.

## Toolchain constraint (important)

TypeScript is **7.x — the native compiler**. Most tooling that reads the TS compiler API has not caught up:

- **Linter is `oxlint`** (Rust, no TS-API dependency). `typescript-eslint` hard-crashes on TS 7 — do not reintroduce it. Config: `.oxlintrc.json`. React 19 uses the automatic JSX runtime, so `react/react-in-jsx-scope` is off and no `React` import is needed.
- Same caution applies before adding ts-based tools (ts-jest, etc.) — prefer TS-7-agnostic tools (Vitest/esbuild, oxlint).

## Auth & backend (`apps/api`)

Hono server; **Better Auth** is the auth core (`src/auth.ts`). Everything under `/api/auth/**` is handled by `auth.handler` — don't hand-roll auth routes.

- **Prisma adapter** (`better-auth/adapters/prisma`, provider `postgresql`).
- Password hashing is overridden to **bcrypt** (via `emailAndPassword.password.hash/verify`) so it matches the seed and the pre-existing bcrypt choice — Better Auth's default is scrypt.
- **`organization` plugin** provides multi-tenancy: orgs, members, invitations, roles/RBAC.
- **`stripe` plugin** (`@better-auth/stripe`) provides subscriptions — enabled only when `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` are set.
- OAuth providers (GitHub/Google) enable only when both id+secret are present.
- Email (`src/email.ts`) uses Resend; **without `RESEND_API_KEY` it logs to the console** instead of sending.
- Env is validated by zod at boot (`src/env.ts`) — the process exits listing missing vars. See `.env.example`.

## Prisma (Prisma 7, driver-adapter)

- The schema (`prisma/schema.prisma`) is **owned by Better Auth's model conventions** — `user`/`session`/`account`/`verification` (core), `organization`/`member`/`invitation` (org plugin), `subscription` (stripe plugin), all `@@map`-ed to lowercase tables. Changing auth plugins means regenerating these models; keep field names aligned with what the plugins expect.
- `prisma.config.ts` is the config entrypoint — it loads `dotenv/config` and injects `datasource.url` from `DATABASE_URL`. The `datasource db` block has **no `url`** on purpose.
- Runtime builds the client via a `pg` `Pool` → `PrismaPg` adapter → `new PrismaClient({ adapter })` (see `apps/api/src/db.ts`, `prisma/seed.ts`).
- After changing the schema, run `pnpm db:generate`. Migrations/seed need a running Postgres (`DATABASE_URL`).

## Frontend (`apps/web`)

Vite config is `vite.config.mts`. Note: plugins (`react`, `legacy`, `viteCommonjs`) **must** stay in the `plugins` array (they were imported-but-unused before and JSX silently broke).

- Dev server port **3000**; `/api` proxied to `http://localhost:8000` (WS + cookie-domain rewrite).
- Env vars from `loadEnv` are exposed as `process.env.<KEY>` via `define`, **not** `import.meta.env`.
- Build output → `apps/web/build/`. Tailwind via PostCSS → `tailwind.config.ts` (`darkMode: "class"`).

Storybook 10 (`@storybook/react-vite`), config in `apps/web/.storybook/`:

- Stories: `apps/web/src/**/*.stories.tsx`. Reuses `vite.config.mts`.
- **MSW and `@storybook/addon-actions` are stubbed** to no-ops in `.storybook/stubs/` (aliased in `main.ts`). Story code can import them but they do nothing.
- Theming via `withThemeByClassName` (`light`/`dark`).

## Notable versions

Bleeding-edge majors — React 19, TypeScript 7 (native), Vite 8, Prisma 7, Hono 4, Better Auth 1.6, react-router 8, Storybook 10, zod 4. Trust these over older docs.
