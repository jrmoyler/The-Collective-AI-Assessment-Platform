# The Collective AI Readiness Audit Platform

Production-ready AI readiness assessment platform for **Collective AI — The Collective** consulting division.

## Features

- Landing page with hero, stats, and trust signals
- 25-question multi-step audit (6 sections, localStorage persistence)
- Claude-powered instant assessment engine
- Results dashboard with Recharts visualizations
- Auto-prefill Calendly for high-score leads
- Admin CRM dashboard with filtering, sorting, and CSV export
- Supabase backend with RLS security

## Tech Stack

Next.js 14, Tailwind CSS, Recharts, Anthropic SDK, Supabase, Vercel

## Setup

1. Clone and install: `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in your keys
3. Run `supabase-schema.sql` in your Supabase SQL Editor
4. `npm run dev`

## Vercel Deployment

Import repo to Vercel, add all environment variables, deploy.

Required env vars:
- ANTHROPIC_API_KEY
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ADMIN_USERNAME
- ADMIN_PASSWORD
- NEXT_PUBLIC_CALENDLY_URL
- AIRTABLE_LEAD_WEBHOOK (sends every finished audit to the Collective AI Leads table as a The Collective lead)

The admin dashboard stays locked until ADMIN_USERNAME and ADMIN_PASSWORD are set; there is no default login.

Links to the main site, the Start here hub and the division sites are set in `lib/links.ts`.

## Routes

- `/` — Landing page
- `/audit` — 25-question audit
- `/results` — AI results dashboard
- `/dashboard` — Admin CRM

---
Collective AI. Columbus, Ohio. AI Strategy. Built to Last.
