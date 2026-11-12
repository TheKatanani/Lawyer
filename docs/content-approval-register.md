# Content Approval & Verification Register

**Practice:** Riyadh Mohammed Alzahrani Saudi Legal Company  
**Framework:** Paired Bilingual Publication Governance  
**Policy Status:** Mandatory Launch Verification Gate  

---

## 1. Editorial Governance Principles

1. **Mandatory Bilingual Parity:** Content cannot go live in Arabic without a verified English equivalent (or vice versa). Both language revisions must attain `approved` status before publication.
2. **Strict Claims Verification:** 
   - Prohibited terms: "Leading", "Best", "Guaranteed Outcome", "100% Win Rate", "Free Consultation".
   - Licensing assertions (e.g. MOJ license numbers) require physical certification copies uploaded to internal evidence files before appearing in public bios.
3. **Immutability of Live Content:** Modifying a published entity creates a new draft revision. The live website continues serving the existing published projection until the new revision is reviewed, approved, and explicitly published.
4. **Separation of Duties:** Super Admin and Admin roles hold approval and publication rights. Editor roles may draft and submit for review only.

---

## 2. Core Page & Entity Approval Status

| Entity Type | Identifier / Title | AR Status | EN Status | Required Evidence | Release Gate |
|---|---|---|---|---|---|
| **Page** | `home` (Homepage) | Approved (Draft Copy) | Approved (Draft Copy) | Design sign-off; Hero architectural licensing verified. | Ready for Fixture Launch |
| **Page** | `about` (About Firm) | Pending Verification | Pending Verification | Formal corporate history and founding documents. | **BLOCKED (Requires Review)** |
| **Page** | `contact` (Contact Hub) | Approved (Baseline) | Approved (Baseline) | Phone numbers, WhatsApp line, legal disclaimer approval. | Ready for Fixture Launch |
| **Page** | `terms` (Website Terms) | Approved (Standard) | Approved (Standard) | General legal disclaimer and IP notice approval. | Ready for Fixture Launch |
| **Page** | `privacy` (Privacy Notice) | Approved (PDPL Draft) | Approved (PDPL Draft) | Compliance with Saudi PDPL & Transfer Regulations. | Ready for Fixture Launch |
| **Service** | `corporate-governance` | Fixture Active | Fixture Active | Commercial team review of exact scope & deliverables. | Staging Only |
| **Service** | `commercial-litigation` | Fixture Active | Fixture Active | Practice lead verification of court representation scope. | Staging Only |
| **Service** | `foreign-investment` | Fixture Active | Fixture Active | Advisory review for MISA licensing & regulatory guidance. | Staging Only |
| **Service** | `estate-family-wealth` | Fixture Active | Fixture Active | Private client lead review for Sharia & estate advisory. | Staging Only |
| **Service** | `labor-employment` | Fixture Active | Fixture Active | Labor law compliance service scope review. | Staging Only |
| **Team** | `founder-managing-partner`| Fixture Active | Fixture Active | Partner MOJ bar license, portrait consent & bio check. | Staging Only |
| **Team** | `senior-counsel` | Fixture Active | Fixture Active | Bar admission verification and professional portrait. | Staging Only |
| **Settings**| `identity` | Fixture Active | Fixture Active | Official Commercial Registration name confirmation. | **BLOCKED (Fixture Active)** |

---

## 3. Pre-Publication Checklist

Before any content is transitioned to `published` in the CMS, the platform executes automated validation:

- [ ] **Dual Locale Completion:** Both `ar` and `en` revisions exist and possess valid slugs, titles, and summaries.
- [ ] **Prohibited Content Scan:** Automated heuristic flags any banned promotional claims ("guarantee", "free consultation", "best in Riyadh").
- [ ] **Media Accessibility Check:** All linked images contain non-empty, localized `alt` descriptions.
- [ ] **Route Conflict Audit:** Slug does not collide with reserved application paths (`/services`, `/team`, `/admin`, `/api`) or existing entity slugs.
- [ ] **Evidence Reference Check:** High-risk legal claims have at least one internal evidence reference ID attached to the revision.
