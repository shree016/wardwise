# NammaMarg — AI-Powered Civic Infrastructure Platform

**BMSCE Hackathon · Team IPv8 · Urban City Track**

NammaMarg ("Our Road" in Kannada) is a full-stack civic intelligence platform built for Bangalore. Citizens photograph infrastructure problems; **Google Gemini** classifies them automatically; BBMP officials track, assign, and resolve them on a live dashboard; and the community verifies fixes on the ground using geo-fencing and multi-citizen confirmation.

---

## Table of Contents

- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Reference](#api-reference)
- [User Roles](#user-roles)
- [How It Works](#how-it-works)
- [Screenshots](#screenshots)

---

## Live Demo

| Role | URL | Credentials |
|------|-----|-------------|
| Citizen | `/auth/sign-up` | Register with any email |
| BBMP Official | `/bbmp-login` | `bbmp@wardwise.com` / `BBMP@2024` |

---

## Features

### For Citizens
- **Photo-based reporting** — Snap a photo of a pothole, garbage dump, broken streetlight, waterlogging, or more. Gemini auto-fills the issue type, severity score (1–10), and a description.
- **Smart deduplication** — Duplicate reports within ~50 m of an existing open issue increment `reported_count` instead of cluttering the map.
- **Live issue map** — Mapbox GL JS map showing all reported issues with color-coded status (red = open, yellow = fixed, green = verified) and size-coded severity.
- **Fix verification** — Citizens within 500 m of a "fixed" issue can submit an after-photo; AI compares it against the original to confirm the fix.
- **Ward leaderboard** — See how your ward ranks against others by open vs. resolved issues.

### For BBMP Officials
- **Unified dashboard** — All open issues across Bangalore with priority sorting, ward filters, and analytics.
- **Contractor management** — Assign issues to contractors, track reliability scores, flag corruption complaints, blacklist bad actors.
- **Tender system** — Create and manage tenders for large-scale work, track bidding and award status.
- **Work progress tracking** — Log progress updates with photos; close issues with before/after evidence.
- **Inspection scheduling** — Schedule and record on-site inspections tied to specific issues.
- **Analytics** — Issue trends, resolution rates, average fix time, ward-level heatmaps.

### Platform
- **Multi-verifier trust** — Configurable `verification_needed` (default: 2 citizens) before an issue is marked `verified`.
- **Corruption reporting** — Citizens can flag suspicious contractor activity directly on an issue.
- **Dark / Light theme** — Full theme toggle on every page.
- **Responsive UI** — Works on mobile for field reporting and on desktop for the BBMP dashboard.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Framework** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS 3, shadcn/ui, Radix UI, Framer Motion |
| **Map** | Mapbox GL JS v3 (GeoJSON layers, dynamic import / SSR-safe) |
| **Database & Auth** | Supabase (PostgreSQL + Row Level Security + Auth) |
| **AI** | Google Gemini 2.5 Flash Lite — image classification & fix verification |
| **Forms** | React Hook Form + Zod validation |
| **Data fetching** | Axios, TanStack Query |
| **Notifications** | Sonner toast |
| **Icons** | Lucide React |

---

## Project Structure

```
NammaMarg/
├── src/
│   ├── app/
│   │   ├── (marketing)/          # Landing, pricing, terms, privacy pages
│   │   ├── (main)/
│   │   │   └── dashboard/        # BBMP official dashboard
│   │   ├── api/                  # Next.js API routes
│   │   │   ├── classify/         # POST — Gemini image classification
│   │   │   ├── issues/           # GET list, POST create, PATCH update
│   │   │   ├── issues/[id]/
│   │   │   │   ├── fix/          # POST — mark issue as fixed
│   │   │   │   └── full/         # GET — full issue detail with relations
│   │   │   ├── verify/[id]/      # POST — submit citizen fix verification
│   │   │   ├── contractors/      # GET list of contractors
│   │   │   ├── tenders/          # GET/POST tenders
│   │   │   ├── work-progress/    # POST progress updates
│   │   │   ├── inspections/      # POST inspection records
│   │   │   ├── analytics/        # GET aggregated stats
│   │   │   ├── corruption/[id]/  # POST corruption complaint
│   │   │   └── wards/            # GET all wards
│   │   ├── auth/
│   │   │   ├── sign-in/          # Citizen login
│   │   │   ├── sign-up/          # Citizen registration
│   │   │   └── auth-callback/    # Supabase OAuth callback
│   │   ├── bbmp-login/           # BBMP officials portal
│   │   ├── citizen/              # Citizen home — my reports
│   │   ├── map/                  # Live Mapbox issues map
│   │   ├── report/               # Submit a new issue
│   │   ├── verify/[id]/          # Verify a fixed issue
│   │   ├── wards/                # Ward leaderboard
│   │   ├── issues/[id]/          # Issue detail page
│   │   └── architecture/         # System architecture diagram
│   ├── components/
│   │   ├── auth/                 # SignIn / SignUp forms
│   │   ├── navigation/           # Navbar, Footer, MobileNavbar
│   │   ├── providers/            # ThemeProvider, AuthProvider, QueryProvider
│   │   └── ui/                   # shadcn/ui component library
│   ├── lib/
│   │   ├── supabase.ts           # Server-side Supabase client (SSR)
│   │   ├── supabase-client.ts    # Browser-side Supabase client
│   │   └── gemini.ts             # Gemini API helpers
│   ├── styles/
│   │   └── globals.css           # Tailwind base + Mapbox CSS + theme tokens
│   └── utils/
│       └── constants/            # Nav links, misc config
├── scripts/
│   ├── seed-contractors.mjs      # Seed 7 contractors to DB
│   └── seed-wards.mjs            # Seed 10 Bangalore wards to DB
├── supabase-schema.sql           # Full DB schema (run once in SQL Editor)
├── next.config.mjs               # Webpack fallbacks for Mapbox GL
└── .env.local                    # Environment variables (see below)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Mapbox](https://mapbox.com) account (free tier works)
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-org/nammaarg.git
cd NammaMarg

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in the values (see Environment Variables section)

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Setup

1. Open the [Supabase SQL Editor](https://supabase.com/dashboard) for your project.
2. Paste and run the full schema from `supabase-schema.sql` — this creates all tables, indexes, and RLS policies.
3. Seed the wards and contractors:

```bash
node scripts/seed-wards.mjs
node scripts/seed-contractors.mjs
```

---

## Environment Variables

Create a `.env.local` file at the project root:

```env
# App
NEXT_PUBLIC_APP_DOMAIN=localhost:3000
NEXT_PUBLIC_APP_NAME=NammaMarg

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.<your-mapbox-token>

# Google Gemini
GEMINI_API_KEY=<your-gemini-api-key>
```

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | mapbox.com → Account → Access Tokens |
| `GEMINI_API_KEY` | aistudio.google.com → Get API Key |

---

## Database Setup

### Tables

| Table | Purpose |
|-------|---------|
| `issues` | Core issue records — type, severity, location, status, reporter |
| `wards` | Bangalore ward metadata — number, name, area, population, center coordinates |
| `contractors` | Contractor profiles — specializations, reliability score, blacklist status |
| `tenders` | Work tenders issued for large repairs |
| `work_progress` | Progress log entries tied to issues |
| `inspections` | On-site inspection records |
| `verifications` | Citizen fix-verification submissions |
| `corruption_reports` | Corruption complaints against contractors |

### Issue Status Flow

```
open  →  fixed (by BBMP official)  →  verified (by 2+ citizens on-site)
```

### Severity Scale

| Score | Level | Color |
|-------|-------|-------|
| 1–3 | Low | Green |
| 4–6 | Medium | Yellow |
| 7–10 | High | Red |

---

## API Reference

All routes are under `/api/`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/classify` | Upload an image; returns `{ issue_type, severity, severity_score, description, confidence }` |
| `GET` | `/api/issues` | List all issues with optional `?ward=`, `?status=`, `?type=` filters |
| `POST` | `/api/issues` | Create a new issue |
| `GET` | `/api/issues/[id]` | Get a single issue |
| `GET` | `/api/issues/[id]/full` | Get issue with contractor, verifications, progress logs |
| `POST` | `/api/issues/[id]/fix` | Mark issue as fixed (BBMP only) |
| `POST` | `/api/verify/[id]` | Submit citizen verification with after-photo |
| `GET` | `/api/contractors` | List contractors with scores |
| `GET/POST` | `/api/tenders` | List or create tenders |
| `GET/PATCH` | `/api/tenders/[id]` | Get or update a tender |
| `POST` | `/api/work-progress/[id]` | Log a work progress update |
| `POST` | `/api/inspections/[id]` | Record an inspection |
| `POST` | `/api/corruption/[id]` | File a corruption complaint |
| `GET` | `/api/analytics` | Aggregated stats: counts by status, type, ward |
| `GET` | `/api/wards` | List all 10 Bangalore wards |

---

## User Roles

### Citizen
- Sign up at `/auth/sign-up` with email + password
- Report issues at `/report` — photo upload triggers AI classification
- View all issues on the live map at `/map`
- Verify fixed issues at `/verify/[id]` (must be within 500 m)
- Track personal reports at `/citizen`

### BBMP Official
- Login at `/bbmp-login` — credentials are pre-filled for demo
- Access the full dashboard at `/dashboard`
- Assign contractors, mark issues fixed, create tenders, review analytics

---

## How It Works

### Issue Reporting Flow

```
Citizen uploads photo
      ↓
POST /api/classify → Gemini Vision API
      ↓
Returns: issue_type, severity_score, description, confidence
      ↓
Citizen confirms + selects ward + location
      ↓
POST /api/issues
      ↓
Deduplication check: is there an open issue within 50m of same type?
  YES → increment reported_count on existing issue
  NO  → create new issue record
```

### Fix Verification Flow

```
BBMP official marks issue "fixed" with after-photo
      ↓
Status → "fixed", visible on map in yellow
      ↓
Citizens near the location (<500m) see "Verify Fix" button
      ↓
Citizen submits after-photo
      ↓
POST /api/verify/[id] → Gemini compares before/after images
      ↓
verification_count increments
      ↓
When verification_count >= verification_needed (default: 2)
      ↓
Status → "verified", marker turns green on map
```

### AI Classification (Gemini)

The `/api/classify` route sends the image to Gemini 2.5 Flash Lite with a structured prompt. The model returns a JSON payload:

```json
{
  "issue_type": "pothole",
  "severity": "high",
  "severity_score": 8,
  "description": "Large pothole approximately 60cm wide on main road surface...",
  "confidence": 0.94
}
```

Supported issue types: `pothole`, `garbage_dump`, `broken_streetlight`, `waterlogging`, `road_crack`, `sewage_overflow`, `fallen_tree`, `damaged_footpath`, `drainage`, `other`.

---

## Screenshots

| Page | Description |
|------|-------------|
| `/` | Landing page — hero, features, ward leaderboard preview |
| `/map` | Live Mapbox map with issue sidebar and detail panel |
| `/report` | Photo upload + AI classification + issue form |
| `/dashboard` | BBMP analytics dashboard with issue management |
| `/wards` | Ward accountability leaderboard |
| `/verify/[id]` | Citizen geo-fenced fix verification |

---

## Contributing

This project was built during the BMSCE Hackathon (Urban City track) by **Team IPv8**. For issues or suggestions, open a GitHub issue.

---

## License

MIT
