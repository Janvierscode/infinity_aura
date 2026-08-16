# Infinity Aura Technologies

Infinity Aura is a Next.js and Supabase platform for publishing practical business ideas, operating a small corporate website, and managing incoming leads. Public pages support light, dark, and system themes. The administrator area remains light-only.

## Product Areas

- **Business ideas:** Public summaries and administrator-written previews are visible to everyone. Complete guides, comments, and voting require a free member account.
- **Corporate site:** Home, About, Services, Contact, Privacy, and Terms.
- **Admin:** Ideas, categories, services, leads, media, and company settings. The sole administrator must pass TOTP MFA at AAL2.
- **Members:** Email/password and optionally Google authentication, profile display-name management, password recovery, comments, and idea/comment votes.

## Local Setup

Requirements are Node.js 22 or newer, Docker Desktop, and Supabase CLI.

```bash
npm install
cp .env.example .env.local
npm run supabase:start
npm run supabase:reset
npm run dev
```

Required browser-safe environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=false
```

Never expose a Supabase secret or service-role key through a `NEXT_PUBLIC_` variable.

## Publishing Ideas

Each idea contains two distinct Markdown documents:

- **Public preview:** A useful introduction shown to visitors and search engines.
- **Member guide:** The complete guide, retrieved only after Supabase validates a signed-in member.

The full guide must never be copied into the public preview merely to create a visual blur. Anonymous database permissions deliberately exclude `body_markdown`, comments, and member profiles.

In Admin, open **Ideas**, select **New idea**, complete both Markdown fields, assign one category, and save a draft or publish. Publishing and deletion invalidate the homepage, idea library, detail route, and sitemap caches.

## Authentication

Email/password registration and recovery work through Supabase Auth. Account and authentication routes are excluded from search indexing.

To enable Google:

1. Create a Google OAuth Web client.
2. Add `https://nuxbdncbbtmnpycwlcow.supabase.co/auth/v1/callback` as the authorized redirect URI.
3. Add `https://www.infinityaura.tech` as an authorized JavaScript origin.
4. Configure the client ID and secret in Supabase Auth Providers.
5. Set the Supabase Site URL to `https://www.infinityaura.tech` and allow `/auth/callback` for production, controlled previews, and localhost development.
6. Set `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true` only after the provider is working.

Google secrets belong in Google Cloud and Supabase, never in this repository or Vercel browser-visible variables.

## Lead Management

Contact submissions are validated and stored privately in `contact_enquiries`. The admin can search, update, reply to, annotate, and delete leads. Transactional email notification delivery remains intentionally unconfigured and appears as **Not configured** in lead details.

## Quality Checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
PLAYWRIGHT_PORT=3100 npm run test:e2e
npx supabase test db
```

The database suite verifies published-content access, member-only content, lead privacy, administrator authorization, and AAL2 enforcement.

## Production Rollout

Production runs on Vercel in `lhr1` near the Supabase EU West project. Configure `NEXT_PUBLIC_SITE_URL=https://www.infinityaura.tech`; production builds reject a missing or localhost canonical URL.

The Phase 3.1 database rollout is deliberately ordered:

1. Export and validate a gitignored backup.
2. Apply the additive preview migration.
3. Deploy and verify the compatible application.
4. Apply the member-content protection migration.
5. Verify anonymous denial, authenticated access, route health, sitemap output, and runtime logs.

Do not apply the protection migration to an older application build because that build still requests anonymous full-row idea data.
