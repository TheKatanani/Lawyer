# Decision & Unknowns Register: Riyadh Mohammed Alzahrani Legal Practice

**Last Updated:** 12 November 2026  
**Status:** Living Governance Document  
**Reference Specification:** RMA-Antigravity-Master-Plan.md  

---

## 1. Confirmed Architectural & Strategic Decisions

| Decision ID | Domain | Confirmed Standard / Choice | Rationale & Evidence |
|---|---|---|---|
| **DEC-001** | Framework | Next.js 14+ App Router & TypeScript | Strict server/client component boundary, robust static generation, and high-performance server runtime. |
| **DEC-002** | Styling | Tailwind CSS & CSS Custom Tokens | Predictable design token management, logical property integration, and zero runtime CSS overhead. |
| **DEC-003** | Localization | `next-intl` (Arabic default `/ar`, English `/en`) | True RTL/LTR layout management, deterministic language routing, no header-based diversion. |
| **DEC-004** | Authentication | Firebase Authentication + Server Sessions | Enterprise Identity Platform, TOTP MFA enforcement, and CSRF-protected session cookie exchange. |
| **DEC-005** | Database | Google Cloud Firestore (Server-only) | Managed document store with ACID transactions, collection groups, and outbox messaging support. |
| **DEC-006** | Browser Rules | Firestore rules `allow read, write: if false;` | Guarantees zero client-side direct access. All access mediated by server Data Access Layer (DAL). |
| **DEC-007** | Media Storage | Cloudinary CDN (Restricted Signed Uploads) | Secure signed preset upload flow, responsive image transforms, and zero public vault leaks. |
| **DEC-008** | CMS Strategy | Custom Tailored Headless Dashboard | Exact domain alignment, immutable revision logging, paired-language publication workflow. |
| **DEC-009** | Design Identity | Modern Prestige / Editorial Luxury | Charcoal, Ivory, Restrained Gold, Noto Naskh Arabic & IBM Plex Sans Arabic typography. |
| **DEC-010** | Publishing Rule | Mandatory Paired Bilingual Publishing | Prevents broken alternate language experiences, 404 hreflangs, or unvetted one-sided claims. |

---

## 2. Business Facts & Verification Register (Unknowns)

The following items are explicit placeholders. They **must not** be filled with unvetted assumptions or fabricated data. Until verified by authorized company counsel, development continues with marked nonproduction fixtures.

| Placeholder Key | Requirement Description | Verification Owner | Impact on Release | Current Status |
|---|---|---|---|---|
| `[LEGAL_NAME_AR]` | Exact registered commercial Arabic legal name | General Counsel / Owner | Blocks published identity and formal legal notices. | **BLOCKED (Fixture Active)** |
| `[LEGAL_NAME_EN]` | Official approved English transliteration / rendering | General Counsel / Owner | Blocks English header, meta tags, and schema. | **BLOCKED (Fixture Active)** |
| `[REGISTRATION_DETAILS]` | Commercial Registration (CR) number | Managing Partner | Omit claim from footer until certified. | **BLOCKED (Omitted)** |
| `[LICENSE_DETAILS]` | Ministry of Justice lawyer license number(s) | Managing Partner | Omit claims from bios/footer until certified. | **BLOCKED (Omitted)** |
| `[CURRENT_SITE_URL]` | Existing website URL (if any) | Technical PM | Determines whether URL migration mapping applies. | **PENDING AUDIT** |
| `[PRODUCTION_ORIGIN]` | Approved production domain (e.g. `https://rma-law.sa`) | Technical Owner | Blocks production canonicals and SSL cutover. | **PENDING ASSIGNMENT** |
| `[APPROVED_LOGO]` | Vector SVG/PNG master brand logos | Brand Director | Blocks final asset deployment (using SVG mark). | **FIXTURE ENGAGED** |
| `[VERIFIED_SERVICES]` | Final service catalog & audience taxonomy | Practice Lead | Blocks final service publishing in CMS. | **FIXTURES ENGAGED** |
| `[APPROVED_COMPANY_STORY]` | Verified history, founding year, milestone dates | Managing Partner | Omit timeline and legacy dates until verified. | **FIXTURES ENGAGED** |
| `[VERIFIED_TEAM]` | Real lawyer bios, photos, bar credentials | Individual Lawyers | Blocks public team directory publication. | **FIXTURES ENGAGED** |
| `[PHONE_E164]` | Verified business intake telephone number | Operations Lead | Blocks live telephone click-to-call link. | **MOCK ACTIVATED** |
| `[WHATSAPP_E164]` | Verified WhatsApp business API / contact number | Operations Lead | Blocks live WhatsApp button launcher. | **MOCK ACTIVATED** |
| `[PUBLIC_EMAIL]` | Approved contact/inquiry email address | IT Systems Admin | Blocks official email mailto/display. | **MOCK ACTIVATED** |
| `[OFFICE_ADDRESS]` | Physical office location, floor, building, city | Office Manager | Omit unconfirmed address from maps/footer. | **OMITTED** |
| `[CONTACT_WORKFLOW]` | Intake protocol, retention window, fee boundary | Practice Lead | Blocks final legal disclaimer text in forms. | **BASELINE ACTIVE** |
| `[PRIVACY_OWNER]` | Designated Data Protection Officer / Privacy Contact | General Counsel | Blocks production personal data intake. | **BASELINE ACTIVE** |
| `[RETENTION_POLICY]` | Specific inquiry retention timeframe (e.g. 180 days) | General Counsel | Automated intake purge suspended until set. | **MANUAL RETENTION** |
| `[ADMIN_ALLOWLIST]` | Authorized staff email list for initial bootstrapping | Managing Partner | Blocks production administrative account issuance.| **SEED SCRIPT READY** |
| `[NOTIFICATION_PROVIDER]`| Transactional email delivery service (SendGrid/Resend) | DevOps / Technical | Blocks automated email notifications for leads. | **LOG SINK FALLBACK** |
| `[ANALYTICS_PROVIDER]` | Approved analytics engine (Cookieless/Consent-gated) | Marketing / Legal | Analytics engine strictly disabled by default. | **DISABLED** |
