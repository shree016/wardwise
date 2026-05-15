# WardWise — Municipal Intelligence Platform

**NammaMarg** · BMSCE Hackathon · Team IPv8

WardWise is an AI-powered civic issue reporting platform built for Bangalore. Citizens photograph potholes, garbage dumps, broken streetlights, and similar problems; **Google Gemini** classifies each image automatically; officials track issues on a live dashboard and map; and the community **verifies fixes** on-site with geo-fencing and multi-citizen confirmation.

---

## Features

| Area | Capability |
|------|------------|
| **AI classification** | Upload a photo → Gemini detects issue type, severity (1–10), description, and confidence |
| **Smart deduplication** | Duplicate reports within ~50 m of an open issue increment `reported_count` instead of creating clutter |
| **Live map** | Leaflet map of all issues with status-based markers |
| **BBMP dashboard** | Officials filter issues, view ward stats, and mark items as fixed with after photos |
| **Citizen verification** | Locals confirm fixes within 500 m; AI compares before/after images |
| **Multi-verifier trust** | Configurable `verification_needed` (default 2) before status becomes `verified` |
| **Ward accountability** | Ward leaderboard scores areas by open vs resolved issues |
| **Auth** | Supabase email/password; role routing for citizens vs BBMP |

---

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Axios, Leaflet / react-leaflet |
| **Backend** | Node.js, Express 5, CORS, dotenv |
| **Database & Auth** | Supabase (PostgreSQL + Auth) |
| **AI** | Google Gemini 2.5 Flash Lite (REST API) |
