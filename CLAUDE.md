# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Early-stage scaffold. The root `package.json` defines **no scripts**, `apps/web` has no `src/` yet, and there is no test runner wired up (despite `tsconfig.json` listing `jest` in `types`). Expect to create structure rather than discover it. When adding tooling, prefer defining scripts in the relevant `package.json` over documenting ad-hoc commands here.

## Repository layout

pnpm workspace (`pnpm@9.15.0`, enforced via `packageManager`). Workspace globs in `pnpm-workspace.yaml` are `apps/**` and `packages/**` — the `packages/` dir does not exist yet.

- `apps/web` — Vite + React 19 frontend (`saas-web`)
- `prisma/` — shared Prisma schema and seed, used from the repo root
- Root `package.json` holds most runtime deps; `apps/web/package.json` holds only build/Storybook tooling. New frontend runtime deps may land in either — check both before assuming a package is missing.

## Commands

Always use `pnpm`. Run app-scoped commands with `pnpm --filter saas-web <cmd>` or from `apps/web`.

Prisma (run from repo root; Prisma resolves `prisma/schema.prisma` automatically):

- `pnpm prisma generate` — regenerate the client
- `pnpm prisma migrate dev` — create/apply a migration against `DATABASE_URL`
- `pnpm tsx prisma/seed.ts` (or `node --loader`/`ts-node`) — run the seeder. It is **not** registered as `prisma db seed`, so `prisma db seed` will not pick it up until a `prisma.seed` entry is added.

## Prisma setup (non-standard, v7)

This uses Prisma 7 with the **driver-adapter** pattern, not the built-in engine connection:

- `prisma.config.ts` (root) is the config entrypoint — it loads `dotenv/config` and injects `datasource.url` from `process.env.DATABASE_URL`. The `datasource db` block in `schema.prisma` deliberately has **no `url`**; it lives in the config file instead.
- Runtime code constructs the client via a `pg` `Pool` wrapped in `@prisma/adapter-pg` (`PrismaPg`), then `new PrismaClient({ adapter })` — see `prisma/seed.ts`. Always disconnect the client _and_ `pool.end()`.
- `DATABASE_URL` is required (a Postgres connection string). `.env` is gitignored.

## Frontend (apps/web)

Vite config is `vite.config.mts` (note `.mts`). Key behaviors:

- Dev server on port **3000**; `/api` is proxied to `http://localhost:8000` (the expected backend) with WS and cookie-domain rewriting.
- Env vars from `loadEnv` are exposed to client code as `process.env.<KEY>` (rewritten via `define`), not the usual `import.meta.env`.
- Build output goes to `apps/web/build/`.
- Tailwind is wired through PostCSS pointing at `apps/web/tailwind.config.ts` — **this file does not exist yet** and must be created before Tailwind will work.

Storybook 10 (`@storybook/react-vite`), config in `apps/web/.storybook/`:

- Stories are `apps/web/src/**/*.stories.tsx`.
- Reuses the app's `vite.config.mts`.
- **MSW is stubbed out** — `msw/browser` and `msw/core/http` alias to no-op stubs in `.storybook/stubs/`, and `msw`/`@vitest/mocker` are excluded from `optimizeDeps`. Story code can import MSW APIs but they do nothing under Storybook.
- Theming via `withThemeByClassName` with `light`/`dark` classes.

## Notable version choices

The stack pins bleeding-edge major versions — React 19, TypeScript 7, Vite 8, Prisma 7, `react-router` 8 / `react-router-dom` 7, Storybook 10. When APIs differ from older docs, trust these versions.
