# Oppniva

An AI-powered opportunity discovery platform for students — personalized competitions,
workshops, volunteering, communities, and career pathways.

This project integrates all three team contributions into one Next.js (App Router) app:

- **Member 2 — Frontend** (`app/OppnivaApp.tsx`, `app/data.ts`, `app/globals.css`, `app/layout.tsx`,
  `app/page.tsx`, config files) is the base project. UI and design are unchanged; the app now
  loads live data instead of static empty arrays.
- **Member 3 — Backend & data integration** lives under `app/api/*` (profile, opportunities,
  saved, pathway, recommendations) and `app/lib/store.ts` (the in-memory data store).
- **Member 1 — AI recommendation system** is ported from the original standalone Gemini Java
  sample into `app/lib/ai.ts` and wired into `POST /api/recommendations`.

## How data flows

```
Student completes onboarding
        ↓
POST /api/profile                  (backend.saveProfile)
        ↓
POST /api/recommendations          (app/lib/ai.ts calls Gemini, or falls back)
        ↓
Recommendations mapped to Opportunity[] and merged into the store
        ↓
Frontend (Dashboard / Discover) re-fetches via backend.getOpportunities()
        ↓
Student saves an opportunity → POST /api/saved
Student starts / updates an application → PATCH /api/saved/[id]
        ↓
Pathway stages in app/lib/store.ts advance automatically
```

`app/backend.ts` is the single file the frontend talks to — every function in it now calls
the real API routes with `fetch()` instead of returning mock data.

## Project structure

```
oppniva/
├── app/
│   ├── api/
│   │   ├── profile/route.ts          GET / POST student profile
│   │   ├── opportunities/route.ts    GET opportunity feed (category/format/q filters)
│   │   ├── opportunities/[id]/route.ts   GET a single opportunity
│   │   ├── saved/route.ts            GET dashboard snapshot, POST to save an opportunity
│   │   ├── saved/[id]/route.ts       DELETE to unsave, PATCH to update application status
│   │   ├── pathway/route.ts          GET current pathway stages
│   │   └── recommendations/route.ts  POST profile -> AI recommendations
│   ├── lib/
│   │   ├── store.ts                  In-memory data store + seed opportunities
│   │   └── ai.ts                     Gemini-backed recommendation engine (+ offline fallback)
│   ├── OppnivaApp.tsx                Main client component (all screens)
│   ├── backend.ts                    Frontend <-> API client (fetch wrappers)
│   ├── data.ts                       Shared TypeScript types + UI filter labels
│   ├── globals.css / layout.tsx / page.tsx
├── public/og.png
├── package.json / tsconfig.json / next.config.ts / eslint.config.mjs / postcss.config.mjs
├── .env.example
└── README.md
```

## Running locally

```bash
pnpm install
pnpm run dev
```

Open http://localhost:3000. The app works immediately with **no API key required** — signing
up and completing onboarding calls `/api/recommendations`, which uses a deterministic
keyword-matching fallback when `GEMINI_API_KEY` isn't set.

To enable real AI-generated recommendations, copy `.env.example` to `.env.local` and set:

```
GEMINI_API_KEY=your-key-here
```

## Notes on the data store

`app/lib/store.ts` uses simple in-memory state (module-scoped, shared across requests) so the
project runs with zero setup — no database required. It's seeded with six example
opportunities so the feed isn't empty on first load. Swap the functions in that one file for
Prisma/Supabase/etc. calls when you're ready for persistence; no other file needs to change.

## Files not included in this integration

Two uploaded files — `Team_builder_json.txt` and `Team_builder_typescript.txt` — describe a
**different application** (a hackathon teammate-matching tool: `User`, `TeamRequirement`,
`Alumni` records), not the Oppniva opportunity-discovery data model. They don't share any
types or fields with `Opportunity` / `StudentProfile`, so they were left out rather than
force-fit in. If that team-builder feature is actually meant to be part of Oppniva, it would
make sense as its own future module (e.g. `app/api/teams/*`) rather than folded into the
opportunity/pathway data — happy to build that out as a follow-up if you confirm it belongs here.
