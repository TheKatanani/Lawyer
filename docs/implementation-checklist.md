# Implementation Checklist & Phase Progress

**Project:** Riyadh Mohammed Alzahrani Saudi Legal Company Web & CMS Platform  
**Tracking Model:** Phased Milestone Delivery (Phases 0 through 8)  
**Last Updated:** 12 November 2026  

---

## Phase 0: Discovery & Governance Setup (Days 1–5)
- [x] Initialized project repository and structure.
- [x] Formulated comprehensive project brief (`docs/project-brief.md`).
- [x] Established living decision and unknowns register (`docs/decision-register.md`).
- [x] Defined core architectural boundaries and Firestore zero-trust policy (`docs/architecture.md`).
- [x] Cataloged domain scenarios and initial legacy URL redirect mapping (`docs/seo-migration.md`, `docs/legacy-url-map.csv`).
- [x] Defined Data Map, PDPL safeguards, and retention rules (`docs/data-map-and-retention.md`).

## Phase 1: Design System & Content Modeling (Days 6–11)
- [x] Formalized Modern Prestige design tokens, palette, and contrast rules (`docs/design-system.md`).
- [x] Specified Arabic (Noto Naskh / IBM Plex) and English (Manrope) typographic scale.
- [x] Defined split architectural hero composition and motion guidelines.
- [x] Detailed Firestore collections, schemas, and immutable revision models (`docs/content-model.md`).
- [x] Formulated paired bilingual publishing and claims verification gates (`docs/content-approval-register.md`).

## Phase 2: Foundation, Security & Authentication (Days 12–18)
- [x] Configure Next.js App Router, TypeScript, Tailwind CSS, and `next-intl`.
- [x] Formulate Firestore security rules (`allow read, write: if false;`).
- [x] Implement Server Data Access Layer (DAL) with RBAC assertion capabilities (`docs/rbac-matrix.md`).
- [x] Create session cookie exchange endpoint (`/api/auth/session`) and logout (`/api/auth/logout`).
- [x] Build owner bootstrap script and protection of last remaining Super Admin.
- [x] Setup unified Local/Emulator Mock Persistence Layer for local testing and CI independence.

## Phase 3: CMS Dashboard & Editorial Engine (Days 19–30)
- [x] Build CMS shell layout with role-aware navigation and localized UI preference.
- [x] Implement Pages module with structured block editor and revision history.
- [x] Implement Services module with audience tagging (`all`, `individual`, `business`).
- [x] Implement Team module with verified bar credential badges and bio editors.
- [x] Implement Insights module with category assignment and author attribution.
- [x] Implement Media module with Cloudinary signed upload integration.
- [x] Build atomic paired bilingual publication transaction and optimistic concurrency lock.
- [x] Implement revision compare and rollback-to-draft engine.

## Phase 4: Bilingual Public Web Experience (Days 31–40)
- [x] Implement deterministic `/` -> `/ar` routing and bidirectional language switcher.
- [x] Build Modern Prestige Homepage (Split Hero, About preview, Services directory, Signature Values, Client Journey, Insights, Footer).
- [x] Build About Firm template with verified leadership narrative.
- [x] Build Services directory and dynamic detail pages (`/[locale]/services/[slug]`) with audience filters.
- [x] Build Team directory and dynamic lawyer profile pages (`/[locale]/team/[slug]`).
- [x] Build Insights archive and dynamic article reader (`/[locale]/insights/[slug]`).
- [x] Build Legal Terms (`/terms`) and PDPL Privacy Notice (`/privacy`) templates.
- [x] Implement branded system error pages: 404 Not Found, 500 Server Error, Loading skeletons.
- [x] Implement accessible GSAP / CSS motion with `prefers-reduced-motion` compliance.

## Phase 5: Intake, Operations & Outbox (Days 41–46)
- [x] Implement multi-step contact form with audience selector and service dropdown.
- [x] Build server Zod validation and international E.164 phone normalization.
- [x] Integrate anti-bot honeypot and atomic rate limiting.
- [x] Enforce idempotent persistence in `contactRequests` and `idempotencyKeys`.
- [x] Create CMS Inquiries queue with cursor pagination, status transitions, and internal notes.
- [x] Build outbox job queue for decoupled notification dispatch.
- [x] Ensure notification failures never compromise stored inquiry integrity.

## Phase 6: SEO, Performance & Hardening (Days 47–53)
- [x] Formulate dynamic XML sitemap (`/sitemap.xml`) with canonical published URLs only.
- [x] Configure dynamic `robots.txt` honoring staging vs production environment flags.
- [x] Implement JSON-LD schemas (`LegalService`, `Person`, `Article`, `BreadcrumbList`).
- [x] Configure security response headers: CSP, HSTS, X-Content-Type-Options, Referrer-Policy.
- [x] Verify WCAG 2.2 AA accessibility (keyboard focus, screen reader landmarks, 48px touch targets).
- [x] Execute unit, integration, and security test suites.

## Phase 7: Launch Preparation & Operations Handover (Days 54–57)
- [x] Author comprehensive administrator manual (`docs/admin-guide.md`).
- [x] Formulate step-by-step production deployment runbook (`docs/deployment-runbook.md`).
- [x] Formulate disaster recovery and point-in-time restore guide (`docs/recovery-runbook.md`).
- [x] Formulate operating costs and cloud infrastructure budget (`docs/operating-costs.md`).
- [x] Complete Acceptance Criteria Report with explicit proof links (`docs/acceptance-report.md`).

## Phase 8: Post-Launch Stabilization (Ongoing)
- [ ] Monitor search engine indexing coverage and Google Search Console queries.
- [ ] Track inquiry intake health, false-positive rate limits, and worker outbox latency.
- [ ] Conduct weekly review of error logs, audit logs, and Cloudinary bandwidth quotas.
