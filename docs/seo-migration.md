# SEO Strategy, International Routing & Migration Framework

**Target Market:** Kingdom of Saudi Arabia & Regional GCC  
**Primary Language:** Arabic (`ar`) — Default Locale  
**Secondary Language:** English (`en`)  
**Specification:** RMA-Antigravity-Master-Plan.md (Section 12)  

---

## 1. Internationalization & Routing Architecture

### Route Structure
- Public Root: `/` executes a deterministic `308 Permanent Redirect` to `/ar`. Header-based automatic browser language diversion is disabled to maintain clean crawler indexing and deterministic caching.
- Arabic Public Namespace: `/ar/*` (`lang="ar" dir="rtl"`).
- English Public Namespace: `/en/*` (`lang="en" dir="ltr"`).
- Administrative Namespace: `/admin/*` (Isolated, non-indexed, private dashboard).

### Canonical & Alternate URLs (`hreflang`)
Every public page dynamically emits:
1. **Self-Canonical:** Explicit canonical URL matching the exact resolved locale route.
2. **Reciprocal Alternates:** Linked to the matching entity in the alternate locale.
3. **Default Fallback (`x-default`):** Points to the Arabic canonical route.

```html
<!-- Example rendered head on /ar/services/commercial-litigation -->
<link rel="canonical" href="https://rma-law.sa/ar/services/commercial-litigation" />
<link rel="alternate" hreflang="ar" href="https://rma-law.sa/ar/services/commercial-litigation" />
<link rel="alternate" hreflang="en" href="https://rma-law.sa/en/services/commercial-litigation" />
<link rel="alternate" hreflang="x-default" href="https://rma-law.sa/ar/services/commercial-litigation" />
```

> [!WARNING]
> English URLs must never serve Arabic body copy silently as a fallback. If an English translation does not exist, the URL responds with `404 Not Found` rather than creating duplicate or deceptive search index entries.

---

## 2. Structured Data (JSON-LD) Standards

All structured data is generated strictly from verified published projections:

- **Legal Practice / Organization (`schema.org/LegalService`):**
  - Name, verified description, logo, official telephone, approved practice areas.
  - License numbers, physical addresses, and opening hours are omitted until formally verified in `docs/decision-register.md`.
- **Lawyer Profiles (`schema.org/Person`):**
  - Professional title, spoken languages, verified qualifications, and professional headshot.
- **Legal Articles (`schema.org/Article`):**
  - Headline, datePublished, dateModified, author (linked to Person), publisher, and mainEntityOfPage.
- **Breadcrumbs (`schema.org/BreadcrumbList`):**
  - Hierarchical navigation path matching the public URL structure.

---

## 3. Domain Migration Decision Matrix

| Migration Scenario | Architectural Handling & Prerequisites | Execution Tasks |
|---|---|---|
| **Scenario A: Existing Domain Retained** | Maintain authority on current domain. Match high-performing URLs to new paths. | 1. Audit legacy URLs.<br>2. Build exact 301 map.<br>3. Preserve top landing pages. |
| **Scenario B: New Domain Selected** | Full domain migration with 301 redirects maintained on old domain for ≥ 12 months. | 1. Verify both Search Console properties.<br>2. Submit Change of Address.<br>3. Enforce 1-hop 301 redirects. |
| **Scenario C: Fresh Brand / No Existing Site** | Clean launch with pristine domain reputation. | 1. Initialize sitemap.xml & robots.txt.<br>2. Submit directly to Google & Bing.<br>3. Zero legacy redirects required. |
| **Scenario D: Status Undecided (Current)** | Development proceeds against baseline architecture. Final cutover blocked until chosen. | 1. Maintain mock redirect table (`legacy-url-map.csv`).<br>2. Keep domain configuration parameterized. |

---

## 4. Redirect Engine Rules

1. **Single-Hop Direct Routing:** Redirects must resolve directly to the destination canonical URL with `301 Moved Permanently` (or `308 Permanent Redirect`). No redirect chains (`A -> B -> C`).
2. **No Blanket Homepage Redirects:** Deleted legacy pages that have no logical equivalent on the new site return `410 Gone` or `404 Not Found`. Mass-redirecting legacy subpages to the homepage is prohibited as it causes soft 404 penalties.
3. **Open Redirect Prevention:** The redirect engine rejects any destination containing protocol prefixes (`http://`, `https://`) or double slashes (`//`) unless explicitly allowlisted in verified settings.
