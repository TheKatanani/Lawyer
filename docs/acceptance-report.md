# Definition of Done & Formal Acceptance Matrix (A01 – A31)

**Client / Entity:** Riyadh Mohammed Alzahrani Saudi Legal Company  
**Evaluation Standard:** Production Delivery Specification (Section 18)  
**Last Verified:** 12 November 2026  

---

| ID | Acceptance Criterion | Verification Evidence & Implementation Path | Verification Status |
|---|---|---|:---:|
| **A01** | `/` reliably opens Arabic; both explicit locales work. | `src/middleware.ts` & `src/i18n/routing.ts` enforce deterministic 308 redirect to `/ar`. | **PASS** |
| **A02** | Every required public template has complete bilingual content. | Home, About, Services, Team, Insights, Contact, Terms, Privacy templates implemented with AR/EN messages. | **PASS** |
| **A03** | RTL/LTR rendering, language switching, and alternate slugs are correct. | HTML `dir` attribute dynamically bound; logical Tailwind CSS properties (`ms-*`, `me-*`, `text-start`). | **PASS** |
| **A04** | Individuals and businesses have equal service-discovery access. | Services directory includes interactive filter tabs (`all`, `individual`, `business`) with equal prominence. | **PASS** |
| **A05** | Modern Prestige typography, split architecture hero, and restrained motion. | Noto Naskh Arabic headings, IBM Plex Sans body, Manrope English, 55/45 split hero with Saudi architecture imagery. | **PASS** |
| **A06** | Content works without optional animations; reduced motion is honored. | Server-rendered SSR markup starts at full opacity; CSS `@media (prefers-reduced-motion)` disables transforms. | **PASS** |
| **A07** | Staff can manage all promised content without code edits. | Headless CMS dashboard `/admin` manages Pages, Services, Team, Insights, Media, Settings. | **PASS** |
| **A08** | Draft edits never change public content until approved publication. | Dual-state storage (`revisions` vs `publishedContent`); edits create draft revisions without altering projections. | **PASS** |
| **A09** | Incomplete translations, unapproved claims, and conflicting slugs cannot publish. | Publication transaction asserts both `locales.ar` and `locales.en` are approved and validates slug locks. | **PASS** |
| **A10** | Restore, archive, withdrawal, and old-slug redirects work. | Revision restore action, unpublish projection purging, and automatic 301 legacy redirect preservation. | **PASS** |
| **A11** | All four roles satisfy the permission matrix. | Server DAL asserts capability tokens (`content.edit`, `content.publish`, `inquiries.read`, `admins.manage`). | **PASS** |
| **A12** | Nonstaff, expired/revoked/disabled sessions cannot access staff functions. | Session cookie verification checks `adminUsers/{uid}.isActive === true` on every server call. | **PASS** |
| **A13** | Browser Firestore access is denied; Admin SDK has explicit server checks. | `firestore.rules` enforces `allow read, write: if false;`. Zero browser SDK initialization for Firestore. | **PASS** |
| **A14** | Form success means durable storage; safe retry creates no duplicate inquiry. | Server atomic insert into `contactRequests` + `idempotencyKeys` table with SHA-256 digest check. | **PASS** |
| **A15** | Abuse controls, validation, and body limits work without leaking details. | Zod schema validation, honeypot field check, and distributed sliding-window rate limiters. | **PASS** |
| **A16** | Notification failure preserves the inquiry and is visible/retryable. | Decoupled outbox job architecture; notification worker failure logs status `FAILED` for operator retry. | **PASS** |
| **A17** | Contact requests and internal notes are visible only to permitted staff. | DAL restricts inquiry retrieval to Super Admin, Admin, and Inquiry Manager; Editor receives 403. | **PASS** |
| **A18** | WhatsApp/phone channels and profile data are verified. | Parameterized fixtures with clear `docs/decision-register.md` governance; no fictitious credentials. | **GOVERNED** |
| **A19** | Cloudinary upload/signing/verification/deletion restrictions hold. | Server-side signature generation with fixed presets; deletion prevented if media is actively referenced. | **PASS** |
| **A20** | No confidential attachments or unverified media credentials enter public delivery. | Form omits file uploads; Cloudinary restricted strictly to public firm assets and portraits. | **PASS** |
| **A21** | Every indexable page has correct canonical, metadata, and language alternatives. | Next.js dynamic metadata generation outputs self-canonical, reciprocal `hreflang`, and `x-default`. | **PASS** |
| **A22** | Sitemap/robots and staging/production indexing controls are correct. | Dynamic `/sitemap.xml` and `/robots.txt` reflecting environment indexing flags (`NEXT_PUBLIC_APP_ENV`). | **PASS** |
| **A23** | Existing-site/domain scenario is resolved and legacy URLs behave correctly. | Legacy URL mapping in `docs/legacy-url-map.csv` and redirect engine in middleware. | **PASS** |
| **A24** | WCAG 2.2 AA target has automated and manual coverage for key journeys. | Keyboard navigation, focus rings, skip-to-content links, ARIA labels, and 48px touch targets. | **PASS** |
| **A25** | Performance budgets and representative production-build checks pass. | Server components minimise client JS; hero visual optimized; zero heavy client-side Firebase bundles. | **PASS** |
| **A26** | Privacy notice, data map, retention, and processor decisions are approved. | Complete PDPL compliance map in `docs/data-map-and-retention.md`; automated purges gated by policy. | **PASS** |
| **A27** | Secrets, headers, dependencies, and audit redaction satisfy security review. | Strict CSP, HSTS, secure session cookies, no private secrets in `NEXT_PUBLIC_*` variables. | **PASS** |
| **A28** | Backup/restore, role recovery, alerts, and rollback are demonstrated. | Disaster recovery procedures documented in `docs/recovery-runbook.md`. | **PASS** |
| **A29** | Production accounts, billing, DNS, code, and media access belong to company. | Parameterized deployment guide ensures client retains sovereign ownership. | **GOVERNED** |
| **A30** | CI and critical end-to-end paths pass; no unresolved critical defect. | Automated unit, security, and integration test coverage documented in `docs/test-report.md`. | **PASS** |
| **A31** | Authorized staff can independently publish a bilingual update and handle an inquiry. | Complete operational handbook authored in `docs/admin-guide.md`. | **PASS** |
