# Infrastructure Operating Costs & Resource Budgets

**Client:** Riyadh Mohammed Alzahrani Saudi Legal Company  
**Model:** Cloud Consumption & Managed Services Infrastructure  
**Last Updated:** 12 November 2026  

---

## 1. Cloud Provider Service Inventory & Pricing Tiers

The application architecture utilizes serverless, auto-scaling managed infrastructure. Operating costs scale predictably with real public traffic and administrative publication frequency.

| Service / Provider | Operational Function | Tier / Pricing Model | Estimated Free Tier Allowance | Escalation Triggers |
|---|---|---|---|---|
| **Vercel / Next.js Serverless** | Web runtime, Edge middleware, RSC rendering, SSL termination. | Pro Team Tier (~$20/seat/mo) | 1M Edge Requests / 1TB Bandwidth | Massive concurrent traffic spikes or large media downloads. |
| **Google Cloud Firestore (`me-central1`)** | Server-mediated database, immutable revisions, inquiry storage. | Consumption Pricing ($0.18/100K reads, $0.18/100K writes) | 50K Reads / 20K Writes per day | High-frequency crawling or un-cached dynamic queries. |
| **Firebase Auth with Identity Platform** | Administrator authentication, session cookies, TOTP MFA. | Free up to 50K MAUs (Standard Auth) / Tiered MFA SMS | 50,000 Monthly Active Users | SMS-based MFA usage (TOTP Authenticator apps incur $0). |
| **Cloudinary CDN** | Approved public brand imagery, lawyer portraits, responsive web transforms. | Plus / Advanced Tier (~$89–$99/mo) | 25 Monthly Credits (~25GB storage or bandwidth) | Heavy un-optimized 4K image uploads or hotlinking. |
| **Transactional Email (Resend / SendGrid)** | Secure staff intake notification dispatch with dashboard links. | Developer Tier ($0–$20/mo) | Up to 3,000 emails/mo | Surges in client consultation form volume. |
| **Bot Protection (Cloudflare Turnstile)** | Zero-friction invisible bot and spam challenge. | Free Tier ($0) | Unlimited challenges | None (Turnstile managed challenges are complimentary). |
| **Domain Registration (`.sa` / `.com.sa`)** | Saudi sovereign top-level legal domain. | Annual Fixed Fee (~$25–$50/yr) | N/A | Annual registry renewal via certified SaudiNIC registrar. |

---

## 2. Hard Cost Safeguards & Budget Ceilings

To prevent runaway billing or denial-of-wallet (DoW) attacks:

1. **Google Cloud Billing Alerts:**
   - Soft alerts configured at 50%, 80%, and 100% of the agreed monthly cloud budget ceiling ($100/mo baseline).
   - Automated Cloud Function budget alert webhook to notify the Lead Technical Custodian.
2. **Cloudinary Upload Caps:**
   - Media upload endpoint enforces hard 10MB file ceiling and restricts permitted MIME types to `image/jpeg`, `image/png`, and `image/webp`.
   - Asset transformation policies lock maximum width transforms to `1920px` to prevent arbitrary pixel multiplication.
3. **Application Intake Rate Limits:**
   - Server-side rate limiter enforces max 5 submissions per 10 minutes per hashed network signature.
   - Global daily intake cap set at 200 submissions per 24-hour cycle before alerting operations.
