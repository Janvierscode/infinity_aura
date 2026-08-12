# Infinity Aura Technologies

![Infinity Aura Technologies](public/brand/infinity-aura-logo.png)

**Innovate. Build. Empower.**

A dynamic corporate website and private content-management application for
**Infinity Aura Technologies**, a software development and digital solutions
company based in Harare, Zimbabwe.

## Phase 2 Application

The approved product and implementation blueprint is available in
[docs/PHASE_2_WEB_APPLICATION_PLAN.md](docs/PHASE_2_WEB_APPLICATION_PLAN.md).

The repository now contains the Phase 2 application foundation and core CMS:

- Next.js App Router application with strict TypeScript
- Responsive public website and mobile navigation
- Dynamic homepage sections, services, solutions, technologies, testimonials,
  navigation, social links, and company settings
- Supabase Postgres schema, seed data, Storage bucket, and row-level security
- Private CMS protected by Supabase Auth, mandatory TOTP MFA, database-level MFA
  policies, and a singleton administrator record
- Structured page and section editors, publication controls, media library,
  revision restoration, and destructive-action confirmations
- Private enquiry inbox, status workflow, content revisions, and audit history
- Contact persistence followed by automatic Resend notification delivery
- Dynamic metadata routes for sitemap and robots
- Responsive public and admin layouts with mobile browser acceptance tests

## Local Setup

Requirements: Node.js 22 or later, npm, Docker, and the Supabase CLI installed
through this project's development dependencies.

```bash
npm install
cp .env.example .env.local
npm run supabase:start
npm run supabase:reset
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Local Supabase Studio is
available at [http://localhost:54323](http://localhost:54323).

After Supabase starts, replace the placeholder values in `.env.local` with the
local API URL, publishable key, and secret key shown by the CLI.

## Sole Administrator

Public sign-up is disabled. Create the administrator in Supabase Auth, then bind
that user's UUID to the singleton authorization record:

```sql
insert into private.app_admin (user_id) values ('AUTH-USER-UUID');
```

The database primary key allows only one row. Admin routes also verify this row
after authentication; possessing a valid account alone does not grant CMS access.

## Contact Email Delivery

Contact enquiries are saved to Supabase before notification is attempted. Add a
Resend API key and verified sender to `.env.local` or the production environment:

```dotenv
RESEND_API_KEY=re_...
CONTACT_FROM_EMAIL=Infinity Aura Technologies <website@infinityaura.tech>
CONTACT_NOTIFICATION_EMAIL=iyakaremyejanvier@gmail.com
```

This sends the message automatically in the background flow. The visitor stays
on the website and no email composer opens. If email delivery fails, the enquiry
remains available in the admin inbox with a failed notification status.

## Live Website

Production domain: [www.infinityaura.tech](https://www.infinityaura.tech)

> The production link will work after the repository has been deployed and the
> domain has been connected to the selected hosting provider.

## Technology

| Layer | Technology |
| --- | --- |
| Application | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 and a custom design system |
| Database and auth | Supabase Postgres and Auth |
| Storage | Supabase Storage |
| Email delivery | Resend |
| Validation | Zod |
| Hosting | Vercel |

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Database migration and RLS tests require Docker to be running:

```bash
npm run supabase:start
npm run supabase:reset
npx supabase test db
```

The previous static `index.html`, `css/`, and `js/` implementation is retained as
a migration reference during Phase 2 and is not used by the Next.js runtime.

## License

Copyright © 2026 Infinity Aura Technologies. All rights reserved.

The source code and brand assets are proprietary unless Infinity Aura
Technologies provides separate written permission for reuse or redistribution.

## Contact

- Website: [www.infinityaura.tech](https://www.infinityaura.tech)
- Email: [info@infinityaura.tech](mailto:info@infinityaura.tech)
- Location: Harare, Zimbabwe
