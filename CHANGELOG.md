# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Nothing has been released yet, so every entry below sits under `[Unreleased]`.
When the first version is cut, move that block under a `## [0.1.0] - YYYY-MM-DD`
heading and start a fresh `[Unreleased]` above it.

## [Unreleased]

### Added

**Design system** (`apps/web/src/components/ui`)

- HSL design tokens in `index.css` for light and `.dark`, wired into
  `tailwind.config.ts` via `hsl(var(--x) / <alpha-value>)` so opacity modifiers
  keep working, plus container, radius and animation scales.
- Primitives: `Button`, `Input`/`Textarea`/`Select`, `Label`, `Field` (label,
  hint and error wired together with ARIA), `Checkbox`, `PasswordInput`, `Card`,
  `Alert`, `Badge`, `Avatar`, `Separator`, `Skeleton`, `Spinner`, `Dialog`
  (native `<dialog>`), `DropdownMenu` and a `Toast` provider.
- Storybook stories for every primitive; `preview.ts` imports `index.css` so the
  tokens apply, and the theme switcher toggles `light`/`dark`.
- `@/*` → `src/*` path alias in both `tsconfig.json` and `vite.config.mts`.

**Authentication**

- `lib/auth-client.ts` — Better Auth React client with the organization and
  stripe plugins mirroring the server, exporting inferred `Session`,
  `Organization`, `Member` and `Invitation` types.
- `ThemeProvider` (class-based dark mode, follows the OS on `"system"`),
  `ConfigProvider` (fetches `/api/config`) and `ToastProvider`, composed in
  `AppProviders`.
- `RequireAuth` / `RequireGuest` guards that render a loader while the session
  resolves and preserve the intended destination through a same-site-only
  `?next=` parameter.
- Screens: sign-in, sign-up, forgot-password, reset-password, verify-email, 404.
- `GET /api/config` publishes which optional features are configured — OAuth
  providers, billing, app name — so the web app never renders UI it cannot use.

**Organizations**

- App shell: sidebar plus sticky top bar, drawer below `lg`, theme toggle and
  user menu.
- Organization switcher (list, switch, create) and an onboarding screen for
  users who belong to no organization yet.
- `RequireOrganization` gate: no organizations sends you to onboarding;
  organizations but none active activates the first — which also recovers when
  the session still points at an organization that was left or deleted.
- `/settings/organization` — rename, slug, leave and delete, with the last owner
  protected from removing themselves.
- `/settings/members` — role changes, member removal, invitations and
  cancellation of pending invites.
- `/accept-invitation/:invitationId`, reachable before you belong to any
  organization, warning when the invite was addressed to a different account.
- `lib/permissions.ts` mirrors Better Auth's default roles for rendering
  decisions only; the server re-checks every mutation.
- Transactional email templates (`apps/api/src/emails/templates.ts`) with a
  shared HTML layout and escaping, covering email verification, password reset
  and organization invitations.

**Billing**

- Plan catalogue (`apps/api/src/billing/plans.ts`) with display copy, feature
  lists and limits. A paid plan is offered only when its monthly `STRIPE_PRICE_*`
  id is set, so an unconfigured tier disappears from the UI entirely.
- Subscriptions are owned by organizations: `organization.enabled` gives each org
  its own Stripe customer, and `authorizeReference` keeps reads open to any
  member while restricting anything that moves money to owners and admins.
- `GET /api/billing/plans` resolves live amounts from Stripe behind a 5-minute
  in-process cache. Price ids never leave the server, and a bad id logs and
  renders the plan without an amount rather than failing the page.
- `/settings/billing` — current-plan card with status, renewal, trial and
  cancellation dates; plan grid with a monthly/annual toggle; checkout, billing
  portal and resume-after-cancel. Deployments without Stripe get a panel naming
  the missing env vars instead of dead buttons.

**Configuration**

- New env vars: `APP_NAME`, `STRIPE_PRICE_PRO_ANNUAL`, `STRIPE_PRICE_BUSINESS`,
  `STRIPE_PRICE_BUSINESS_ANNUAL`, and `VITE_API_URL` for the web app.
- Initial Prisma migration, generated against a local Postgres.

### Changed

- `apps/web/src/App.tsx` removed; routing moved to `src/routes` with layouts
  under `routes/auth` and `routes/app`.
- The Stripe client moved out of `auth.ts` into `apps/api/src/stripe.ts` so
  routes can share it.
- `/api/config` no longer returns a plan list — plan detail is served by
  `/api/billing/plans`.
- Password reset, email verification and invitation emails now use the shared
  templates instead of one-line `<p>` bodies.
- oxlint allows render-prop triggers
  (`react/no-unstable-nested-components` with `allowAsProps`).

### Fixed

- `Invitation.createdAt` was missing from the Prisma schema. The organization
  plugin writes it on every create, so `prisma.invitation.create()` failed with
  `Unknown argument 'createdAt'` — **invitations could never be created**.
- `Subscription` was missing the fields `@better-auth/stripe` writes:
  `updatedAt`, `cancelAt`, `canceledAt`, `endedAt`, `billingInterval`,
  `stripeScheduleId` and `createdAt`. Added, along with an index on
  `referenceId`; the unused `groupId` was dropped.

### Not yet verified

- Stripe Checkout and webhook round-trips have not been exercised — no test key
  was available. Verify with:

  ```sh
  stripe listen --forward-to localhost:8000/api/auth/stripe/webhook
  ```

## Roadmap

Planned, not yet implemented:

- Account settings — profile, password change, active sessions, linked OAuth
  accounts, account deletion.
- Internationalisation with react-intl (en/ko).
- API hardening — error middleware, request logging, rate limiting on auth
  endpoints, org-scoped resource routes.
- Testing — Vitest for both apps and a CI workflow running lint, typecheck, test
  and build.
