# شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية
# Riyadh Mohammed Alzahrani Saudi Legal Company (RMA Legal)

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Saudi PDPL Compliant](https://img.shields.io/badge/Compliance-Saudi%20PDPL-emerald)](https://sdaia.gov.sa/)
[![Cloudinary](https://img.shields.io/badge/CDN-Cloudinary-3448c5?logo=cloudinary)](https://cloudinary.com/)
[![Firebase](https://img.shields.io/badge/Auth%20%26%20Backend-Google%20Firebase-ffca28?logo=firebase)](https://firebase.google.com/)

A production-grade, bilingual (Arabic default, English secondary) corporate website and custom headless Content Management System (CMS) built specifically for **Riyadh Mohammed Alzahrani Saudi Legal Company** (`شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية`), catering to corporate enterprises, government entities, and private individuals across the Kingdom of Saudi Arabia.

---

## 🏛️ Key Features

- **Bilingual Parity (`next-intl`):**
  - Arabic (`/ar`) as primary default with authentic typography (Noto Naskh Arabic & IBM Plex Sans Arabic).
  - English (`/en`) with Manrope typography.
  - Full RTL/LTR bidirectional support.
  - Deterministic root `/` to `/ar` 308 redirect (no browser-language diversion).
- **Modern Prestige Visual Identity:**
  - Executive editorial styling: Charcoal ink (`#202522`), warm ivory canvas (`#F6F2EA`), and restrained prestige gold (`#B89758`).
  - WCAG 2.2 AA accessibility with 48px touch targets and full keyboard navigation.
- **Security & Regulatory Compliance:**
  - **Saudi Personal Data Protection Law (PDPL):** Aligned with Royal Decree No. M/19 and SDAIA / NDMO regulatory guidelines.
  - **Zero Browser-side Firestore Access:** All database queries and writes are strictly mediated by server-side actions and the Data Access Layer (DAL).
  - Multi-step client intake form with E.164 phone normalization, bot honeypot, sliding-window rate limiting, and idempotency protection.
- **Custom Administrative CMS (`/admin`):**
  - Role-Based Access Control (RBAC): `super_admin`, `admin`, `editor`, `inquiry_manager`.
  - Mandatory paired bilingual publishing (both Arabic and English revisions must be reviewed and approved before live publication).
  - Secure intake triage and assignment system with export options (CSV/JSON) sanitizing spreadsheet formulas against CSV injection.
  - Comprehensive audit logging for all publishing, authentication, and editorial events.
- **Media CDN Integration (Cloudinary):**
  - Server-signed direct CDN uploads ensuring credentials never leak to the client.
  - Enforced bilingual alternative text (Arabic & English) for every uploaded asset.
  - Fast global CDN delivery with responsive WebP image optimization.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ or 20+
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/TheKatanani/Lawyer.git
cd Lawyer
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Firebase web app configuration and Cloudinary credentials in `.env.local`.

### 4. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the website.
- Arabic Homepage: [http://localhost:3000/ar](http://localhost:3000/ar)
- English Homepage: [http://localhost:3000/en](http://localhost:3000/en)
- Admin Portal: [http://localhost:3000/admin](http://localhost:3000/admin)

### 5. Running tests and production build
```bash
# Run unit & integration tests (Vitest)
npm test

# Run production build (Next.js SSG / Dynamic)
npm run build
```

---

## 💳 Moyasar Payment Gateway (Test → Live Go-Live Checklist)

Online payments stay **disabled by default** (`PAYMENTS_ENABLED="false"`). Every key and activation flag is resolved dynamically from environment variables:

| Environment Variable | Test / Staging Value | Production Live Go-Live Value |
| :--- | :--- | :--- |
| `PAYMENTS_ENABLED` | `"false"` (or `"true"` when testing) | `"true"` |
| `NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY` | `pk_test_...` | `pk_live_...` |
| `MOYASAR_SECRET_KEY` | `sk_test_...` | `sk_live_...` |
| `MOYASAR_WEBHOOK_SECRET` | Staging webhook secret | Production Moyasar dashboard webhook secret |

When the real Moyasar merchant account is approved, replace the test values in Vercel (`Settings → Environment Variables`) with `pk_live_...`, `sk_live_...`, the live `MOYASAR_WEBHOOK_SECRET`, and `PAYMENTS_ENABLED=true`, then trigger a **Redeploy**.

---

## 📁 Project Architecture

```
rma-legal/
├── docs/                   # 17 Architectural and regulatory deliverables
│   ├── project-brief.md
│   ├── decision-register.md
│   ├── architecture.md
│   ├── design-system.md
│   ├── rbac-matrix.md
│   ├── data-map-and-retention.md
│   └── ...
├── src/
│   ├── app/
│   │   ├── [locale]/       # Bilingual Public Routes (Home, About, Services, Team, Insights, Contact)
│   │   ├── admin/          # Custom Protected Headless CMS
│   │   ├── api/            # Server Route Handlers (Auth, Inquiries, Media, Publish, Outbox)
│   │   ├── globals.css     # Design tokens & typography
│   │   ├── robots.ts       # Dynamic robots.txt
│   │   └── sitemap.ts      # Automated XML sitemap
│   ├── components/         # Shared UI, Layout, Navigation, and Admin Managers
│   ├── i18n/               # next-intl configuration & routing
│   ├── lib/                # Client Firebase SDK integration
│   ├── messages/           # Bilingual dictionary translations (ar.json, en.json)
│   └── server/             # Secure Data Access Layer (DAL), RBAC, Auth Sessions, Store
└── tests/                  # Vitest unit & integration test suites
```

---

## 🔒 Security & Privacy Notice
This repository contains the application codebase. Sensitive secrets, private cryptographic keys, and environment files (`.env*.local`) are excluded by `.gitignore` and must never be committed to source control.

---

## 📄 License
All rights reserved © 2026 Riyadh Mohammed Alzahrani Saudi Legal Company (`شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية`).
