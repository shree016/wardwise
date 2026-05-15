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

| Role          | URL             | Credentials                       |
| ------------- | --------------- | --------------------------------- |
| Citizen       | `/auth/sign-up` | Register with any email           |
| BBMP Official | `/bbmp-login`   | `bbmp@wardwise.com` / `BBMP@2024` |

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

| Layer               | Technologies                                                                                  |
| ------------------- | --------------------------------------------------------------------------------------------- |
| **Frontend**        | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Axios, Leaflet / react-leaflet |
| **Backend**         | Node.js, Express 5, CORS, dotenv                                                              |
| **Database & Auth** | Supabase (PostgreSQL + Auth)                                                                  |
| **AI**              | Google Gemini 2.5 Flash Lite (REST API)                                                       |
