# Phase 3 Platform

Phase 3 combines a professional corporate site, a focused Business Ideas community, and a lightweight lead CRM.

## Public Product

The primary public structure is Home, About, Services, Business Ideas, and Contact, with Privacy and Terms in the footer. Light, Dark, and System preferences render identical content and community behavior.

Business Ideas replaces the former editorial blog. The administrator publishes practical opportunities using Markdown, one category, an investment level, optional launch guidance, and optional imagery. Published ideas support category filtering, newest or top-voted ordering, public aggregate vote totals, and flat comments.

## Community

Members sign in with Google or a confirmed email/password account. They can upvote or downvote ideas and comments, change or remove each vote, post comments, and delete their own comments. Individual vote records are private and protected by owner-only row-level policies.

Comments are intentionally flat rather than deeply threaded. The sole administrator can hide, restore, or permanently delete comments from the Ideas area. This keeps moderation useful without turning the platform into a general social network.

## Administration

The private application contains Overview, Ideas, Services, Leads, Media, and Settings. Community sessions alone never grant CRM access. The singleton administrator record and mandatory TOTP AAL2 policies protect administrative data and mutations.

## Data And Security

Supabase stores services, business ideas, idea categories, member profiles, comments, private vote records, media metadata, contact leads, and settings. Anonymous visitors can only read published ideas, public categories, public profiles, and visible comments. Draft ideas, hidden comments, leads, and vote ownership remain non-public.

Contact submissions use a narrowly granted validated RPC and cannot read lead records. Media deletion is blocked while an asset is referenced by a service, idea cover, inline idea Markdown, or site setting.

## Deployment

Vercel hosts the Next.js application and Supabase is the system of record. Production requires the public Supabase URL, publishable key, and canonical site URL. Supabase Auth redirects and Google OAuth callback origins must cover the Vercel and active custom domains.
