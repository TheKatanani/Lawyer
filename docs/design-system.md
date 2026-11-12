# Design System: Modern Prestige / Editorial Luxury

**Brand:** Riyadh Mohammed Alzahrani Saudi Legal Company  
**Aesthetic Character:** Restrained, Authoritative, Warm, Architectural, Editorial  
**Last Updated:** 12 November 2026  

---

## 1. Color System & Contrast Hierarchy

All colors are strictly governed by CSS custom properties and mapped to Tailwind configuration tokens.

| Token Name | Hex Code | Purpose & Application Rules | WCAG AA Ratio Verification |
|---|---|---|---|
| `--color-canvas` | `#F6F2EA` | Warm ivory background for all standard pages. | Base background |
| `--color-surface` | `#FFFDFA` | Elevated form cards, editorial surfaces, modals. | Elevated background |
| `--color-ink` | `#202522` | Primary headings, body copy, solid primary buttons. | **13.4:1** on canvas (Pass AAA) |
| `--color-muted` | `#555C56` | Secondary body text, dates, breadcrumbs, hints. | **5.8:1** on canvas (Pass AA) |
| `--color-gold` | `#A28248` | Decorative rules, borders, subtle accents. | Accent only (not for small text) |
| `--color-gold-ink` | `#725821` | High-contrast gold text for labels and active tabs. | **4.7:1** on canvas (Pass AA) |
| `--color-border` | `#DAD5CB` | Thin dividers, input borders, structural grids. | Component boundary |
| `--color-signature`| `#17241F` | Deep prestige forest charcoal for Values section. | Dark section background |
| `--color-on-dark` | `#FAF7F0` | High-contrast text rendered over signature dark. | **15.2:1** on signature (Pass AAA) |
| `--color-danger` | `#A12F2F` | Form errors, validation alerts, destructive actions. | **4.9:1** on surface (Pass AA) |
| `--color-success` | `#23613D` | Success confirmation alerts, approved state badges. | **5.1:1** on surface (Pass AA) |

> [!IMPORTANT]
> The primary Call to Action (CTA) button uses solid `--color-ink` fill with `--color-on-dark` text. Gold is strictly reserved as an accent and divider embellishment, never as small unreadable text.

---

## 2. Typography & Font Pipeline

### Font Selection & Roles
- **Arabic Editorial Headings:** `Noto Naskh Arabic` (Weights: 600 SemiBold, 700 Bold). Used for major headlines (H1, H2) to evoke scholarly legal dignity.
- **Arabic Body & Navigation:** `IBM Plex Sans Arabic` (Weights: 400 Regular, 500 Medium, 600 SemiBold). Used for paragraphs, buttons, forms, and the administrative CMS.
- **English Headings & Body:** `Manrope` (Weights: 400 Regular, 500 Medium, 600 SemiBold, 700 Bold). Modern geometric-grotesque sans providing editorial clarity.

### Typographic Scale & Fluid Clamps
- **Display / H1:** `clamp(2.25rem, 5vw, 3.75rem)` (36px mobile → 60px desktop).
- **H2 (Section Headings):** `clamp(1.75rem, 3.5vw, 2.75rem)` (28px mobile → 44px desktop).
- **H3 (Subheadings):** `clamp(1.25rem, 2vw, 1.75rem)` (20px mobile → 28px desktop).
- **Body Text:** `1.0625rem` (17px) desktop, `1rem` (16px) mobile. Line height: `1.8` for Arabic, `1.65` for English.

> [!CAUTION]
> Never apply artificial letter-spacing (`tracking-*`) or broken character animation to Arabic typography, as Arabic script requires continuous cursive ligatures.

---

## 3. Hero Specification: Split Architectural Composition

```text
+---------------------------------------------------------------------------------+
| DESKTOP (RTL / ARABIC):                                                         |
| [ Modern Saudi Architectural Visual - 45% ] | [ Editorial Text & CTAs - 55% ]  |
+---------------------------------------------------------------------------------+
| DESKTOP (LTR / ENGLISH):                                                         |
| [ Editorial Text & CTAs - 55% ]  | [ Modern Saudi Architectural Visual - 45% ]  |
+---------------------------------------------------------------------------------+
| MOBILE (BOTH LOCALES):                                                          |
| 1. Company Name Eyebrow                                                         |
| 2. Two-Line Master Headline                                                     |
| 3. Explanatory Context Copy                                                     |
| 4. Primary & Secondary CTA Group                                                |
| 5. Saudi Architectural Visual Crop                                              |
+---------------------------------------------------------------------------------+
```

- **Visual Asset Standard:** Clean geometric photographs of contemporary Saudi architecture (warm limestone, Riyadh sun angles, sharp structural planes).
- **Alt Text Requirement:** Localized descriptive alt text ("Modern Saudi architecture with limestone facade") clearly communicating brand mood, never claiming to represent the firm's private interior premises without verification.

---

## 4. Layout, Spacing & Container Hierarchy

- **Max Content Width:** `1280px` (`max-w-7xl`), centered with fluid gutters: `20px` mobile, `32px` tablet, `48px` desktop.
- **Section Spacing:** Fluid vertical cadence `clamp(3.5rem, 8vw, 7.5rem)` (56px to 120px) preventing visual clutter.
- **Interactive Targets:** All buttons, form elements, and navigation links maintain a minimum hit area of `48px` height.
- **Border Radii:** Restrained micro-radii `0px` to `6px` (`rounded-sm` / `rounded-md`). No bubbly or playful rounding.

---

## 5. Motion Specification & Accessibility

GSAP and CSS transitions are orchestrated to heighten prestige while preserving immediate accessibility.

| Component | Target Timing | Motion Behavior |
|---|---|---|
| **Hero Heading** | ~650ms | Subtle opacity fade with 16px upward translation. |
| **Hero Image Reveal** | ~850ms | Soft mask/scale reveal (1.04 → 1.00) without delaying LCP. |
| **Section Transitions** | ~500ms | One-time scroll trigger fade with 20px upward drift. |
| **Buttons & Links** | ~200ms | CSS background/border transition (`cubic-bezier(0.16, 1, 0.3, 1)`).|
| **Service Table Rows** | ~250ms | Gentle background tint and RTL-aware arrow translation. |

### Reduced Motion Invariants
Under `prefers-reduced-motion: reduce`:
- All transforms and vertical translations are completely disabled (`transform: none !important`).
- Fade transitions default to immediate or simple opacity transitions (<150ms).
- Content remains 100% visible in the initial SSR markup (never initialized to `opacity: 0`).
