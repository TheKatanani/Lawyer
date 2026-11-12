# Project Brief: Riyadh Mohammed Alzahrani Saudi Legal Company

**Working Name (EN):** Riyadh Mohammed Alzahrani Saudi Legal Company  
**Working Name (AR):** شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية  
**Version:** 1.0.0  
**Date:** 12 November 2026  
**Document Status:** Baseline Planning Document  

---

## 1. Executive Summary & Purpose

The objective of this initiative is to engineer, deploy, and maintain a tier-one bilingual corporate web platform and bespoke headless Content Management System (CMS) for the Saudi legal practice of Riyadh Mohammed Alzahrani. 

The digital presence is engineered to serve both private individuals and corporate entities with equal architectural and visual prominence. Moving beyond standard static brochureware, the platform incorporates an editorial-grade design system ("Modern Prestige"), hardened server-mediated Firestore integration, fine-grained Role-Based Access Control (RBAC), end-to-end audit logging, and localized search engine optimization adhering strictly to Saudi legal advertising principles and the Saudi Personal Data Protection Law (PDPL).

---

## 2. Core Stakeholders & Audiences

| Audience Segment | Primary Objectives & Journeys | Key Platform Touchpoints |
|---|---|---|
| **Private Individuals** | Seeking authoritative guidance on personal legal matters (family wealth, estate, civil, advisory). Needs clear process explanation and fee transparency without false guarantees. | Homepage hero, Individuals service filter, Service detail with intake CTA, WhatsApp direct intent channel. |
| **Commercial / Enterprise** | Corporate leaders, SMEs, and general counsel seeking dispute resolution, regulatory compliance, corporate governance, contract advisory. | Homepage hero, Businesses service filter, Enterprise practice areas, Lawyer profile verification, Direct intake form. |
| **Search Visitors** | Organic landing traffic originating from specific legal terminology queries across the Kingdom. | Published legal insights, service landing pages, structured data (Organization, Person, Article), canonical reciprocal alternates. |
| **Authorized CMS Staff** | Firm lawyers, editorial staff, intake coordinators, and senior partners managing publications, inquiries, and media. | Protected `/admin` dashboard, revision compare/restore, paired-locale review workflow, inquiry management queue. |

---

## 3. Scope Boundaries

### In-Scope (Launch Baseline)
1. **Bilingual Public Web Experience:** Full RTL (Arabic default) and LTR (English) localization; deterministic `/` to `/ar` routing; responsive mobile-first architecture.
2. **Editorial Content Modules:** Homepage (Modern Prestige split hero), About Firm, Services directory & detail (Individuals/Businesses filters), Team directory & lawyer profiles, Legal Insights directory & reader, Contact hub, Legal Notice/Terms, and Privacy Policy.
3. **Custom Headless CMS Dashboard:** 11 dedicated administrative modules (Overview, Pages, Services, Team, Insights, Categories, Media, Inquiries, SEO & Redirects, Administrators, Settings, and Audit).
4. **Security & Session Architecture:** Server-mediated Cloud Firestore (browser access 100% blocked), Firebase Auth session cookie exchange (`__Host-` cookies, `HttpOnly`, `SameSite=Lax`), CSRF defenses, MFA enforcement, and 4 fixed RBAC roles (Super Admin, Admin, Editor, Inquiry Manager).
5. **Intake & Inquiry Operations:** Multi-step validated contact form, E.164 phone normalization, bot honeypots & rate limiting, idempotent persistence, and decoupled outbox notifications.
6. **Cloudinary Asset Management:** Restricted server-signed asset upload flow, secure delivery, responsive transforms, and orphan/deletion safeguards.
7. **SEO & International Routing:** Valid reciprocal `hreflang` / `x-default`, truthful sitemaps, structured JSON-LD schemas, and legacy 301/308 redirect mapping infrastructure.

### Explicitly Out-of-Scope (Baseline)
- Client portal for confidential case docket management.
- Direct payment gateway / retainer settlement processing.
- Real-time appointment scheduling / calendar booking integration.
- Automated legal advice chatbots or AI advice generators.
- Public user registration or unvetted account creation.
- Confidential legal document vault or unverified file attachment intake.

---

## 4. Architectural Invariants

- **No Browser Firestore Operations:** Zero client-side Firebase Firestore reads or writes. All database queries must be executed in server Node runtimes via the Firebase Admin SDK or authorized Data Access Layer (DAL).
- **Paired Bilingual Publication:** Content cannot be published in a single language. Launch rules mandate fully approved Arabic and English revisions before public projection.
- **Truthful Content Guarantee:** No bracketed placeholders, fictitious case victory metrics, fake lawyer credentials, or stock images masquerading as internal premises may ever be published to production.
