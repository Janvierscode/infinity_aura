# Infinity Aura Technologies

**Innovate. Build. Empower.**

A focused corporate website, Business Ideas community, and private lead CRM.

## Platform

- Next.js 16 App Router, React 19, strict TypeScript, and Geist typography
- Public Home, About, Services, Business Ideas, Contact, Privacy, and Terms routes
- Light, futuristic Dark, and System-aware public themes
- Supabase-backed services, business ideas, categories, member profiles, comments, votes, media, leads, and settings
- Google or email/password community accounts
- Reversible upvotes and downvotes on ideas and comments
- Sanitized Markdown idea publishing with investment and launch-time details
- Private single-administrator CRM protected by password authentication and mandatory TOTP MFA
- Secure contact persistence through a validated anonymous Supabase RPC

The CRM contains Overview, Ideas, Services, Leads, Media, and Settings. Ideas include comment moderation. Retired Phase 2 systems and the former Blog model are not part of the application.

## Local Setup

Requirements: Node.js 22 or later, npm, Docker Desktop, and network access for the first Supabase image download.

```bash
npm install
cp .env.example .env.local
npm run supabase:start
npm run supabase:reset
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Supabase Studio is available at [http://localhost:54323](http://localhost:54323).

## Environment

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

No service-role key is required by the application. Never store passwords, recovery links, OAuth secrets, access tokens, or MFA secrets in the repository.

## Business Ideas

Ideas are written in Markdown at `/admin/ideas`. Each idea has one category, an investment level, optional launch-time guidance, and an optional cover image. Draft and archived ideas are protected by row-level security.

Visitors can read published ideas and visible comments. Signed-in members can hold one reversible vote on each idea and comment, post flat comments, delete their own comments, and sign out. Individual vote records are private; only aggregate totals are public.

The administrator can publish or delete ideas, manage categories, and hide, restore, or permanently delete comments.

## Community Auth

Email/password sign-up uses a 12-character minimum and email confirmation. Google sign-in requires the Google provider to be enabled in Supabase Auth with its client ID and secret. All production domains must be listed as authorized callback origins in Google Cloud and as redirect URLs in Supabase.

Public member sessions do not grant CRM access. The CRM additionally requires the singleton `private.app_admin` binding and an AAL2 session established through TOTP.

## Leads

The contact form validates submissions and stores them in `contact_enquiries` through `submit_contact_enquiry`. Leads can be searched, filtered, updated, privately annotated, replied to, and permanently deleted.

Email notification delivery remains intentionally unconfigured. A saved lead still appears in the CRM with **Not configured** as its notification state.

## Themes

The public platform defaults to **System** and stores the browser-local preference under `infinity-aura-theme`. Light uses the minimal corporate presentation. Dark uses the branded navy, cyan, orbit, code-window, and glass visual language. The CRM remains light-only.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx supabase test db
npm run test:e2e
```

## Production

Primary deployment: [infinity-aura-technologies.vercel.app](https://infinity-aura-technologies.vercel.app)

Intended custom domain: [www.infinityaura.tech](https://www.infinityaura.tech)

## License

Copyright (c) 2026 Infinity Aura Technologies. All rights reserved.
