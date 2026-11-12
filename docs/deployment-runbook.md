# Production Deployment & Operations Runbook

**System:** Riyadh Mohammed Alzahrani Saudi Legal Company Platform  
**Target Environments:** Staging (`staging.rma-law.sa`) & Production (`rma-law.sa`)  
**Deployment Infrastructure:** Next.js Serverless Runtime (Vercel / Node Server) + Google Cloud Platform (`me-central1`)  

---

## 1. Environment & Configuration Variables

The application enforces strict separation between public configuration and server secrets.

```bash
# Public / Client-Safe Configuration
NEXT_PUBLIC_APP_ENV="production"                # 'development' | 'staging' | 'production'
NEXT_PUBLIC_APP_ORIGIN="https://rma-law.sa"     # Validated production origin
NEXT_PUBLIC_DEFAULT_LOCALE="ar"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="rma-law"

# Server-Only Private Secrets (NEVER prefix with NEXT_PUBLIC_)
FIREBASE_PROJECT_ID="rma-law-prod"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@rma-law-prod.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
CLOUDINARY_API_KEY="987654321098765"
CLOUDINARY_API_SECRET="your_secure_cloudinary_secret"
CLOUDINARY_UPLOAD_PRESET="rma_signed_media"
SESSION_COOKIE_SECRET="cryptographically_random_32_byte_secret"
REVALIDATION_SECRET="high_entropy_token_for_outbox_worker"
NOTIFICATION_SMTP_HOST="smtp.provider.com"
NOTIFICATION_SMTP_PORT="587"
NOTIFICATION_SMTP_USER="apikey"
NOTIFICATION_SMTP_PASS="provider_api_key"
NOTIFICATION_RECIPIENTS="intake@rma-law.sa"
```

---

## 2. Pre-Deployment Deployment Gates

Before promoting any release to staging or production:

1. **Security & Type Check:**
   ```bash
   npm run lint
   npm run typecheck
   npm run test
   ```
2. **Build Verification:**
   ```bash
   npm run build
   ```
3. **Database Rules & Composite Indexes:**
   Deploy the zero-trust rules and composite index specifications to Google Cloud Firestore:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes --project rma-law-prod
   ```

---

## 3. Production Release & Cutover Execution

1. **Bootstrap Super Admin Account:**
   Execute the audited server bootstrapping script to initialize the first authorized owner:
   ```bash
   node scripts/bootstrap-owner.mjs --email="managing.partner@rma-law.sa" --name="Riyadh Alzahrani"
   ```
2. **Verify Staging Sanity:**
   - Log into `/admin/login` using the bootstrapped Super Admin credentials.
   - Verify that MFA TOTP prompts as required.
   - Test draft creation, dual-locale preview, and paired publication.
   - Submit a test consultation inquiry through the staging intake form and confirm outbox processing.
3. **DNS & TLS Cutover:**
   - Configure Apex `A` and `CNAME` records at the authoritative DNS provider to point to the production edge.
   - Verify issuance of managed Let's Encrypt / Cloudflare TLS certificate.
   - Verify that non-canonical requests (`http://`, `www.`) execute `301` redirect to `https://rma-law.sa`.
4. **Post-Deployment Smoke Test:**
   - Confirm `/` returns `308` redirect to `/ar`.
   - Confirm Arabic and English homepages render with valid status `200`.
   - Verify dynamic sitemap `/sitemap.xml` and `/robots.txt`.

---

## 4. Emergency Rollback Protocol

If a critical flaw, security regression, or data corruption is detected post-launch:

1. **Immediate CDN / Edge Rollback:**
   Trigger an instantaneous redeploy of the previous immutable release bundle via Vercel / CI deployment history.
2. **Database State Assessment:**
   Because content updates generate immutable new revisions, rolling back the frontend application code does not corrupt historical drafts. To withdraw any unapproved live content, execute:
   ```bash
   node scripts/emergency-withdraw.mjs --entityId="<corrupted-entity-id>"
   ```
3. **Cache Purge:**
   Execute a global cache revalidation call across all edge nodes via the `/api/internal/revalidate` endpoint using `REVALIDATION_SECRET`.
