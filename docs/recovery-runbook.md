# Disaster Recovery, Backup & Incident Runbook

**Practice:** Riyadh Mohammed Alzahrani Saudi Legal Company  
**Target RPO:** Inquiry Data ≤ 1 hour | Content/Website ≤ 24 hours  
**Target RTO:** Full System Restoration ≤ 4 hours  
**Last Updated:** 12 November 2026  

---

## 1. Backup Strategy & Data Retention Architecture

| Component | Backup Mechanism | Frequency | Storage Location | Retention Window |
|---|---|---|---|---|
| **Cloud Firestore (Live DB)** | Managed Point-In-Time Recovery (PITR) | Continuous (7-day window) | Google Cloud Storage (Encrypted) | 7 Days Rolling |
| **Firestore Scheduled Export** | Automated Cloud Functions snapshot export | Daily at 02:00 AST (`Asia/Riyadh`) | GCS Multi-Region Coldline Bucket | 90 Days Rolling |
| **Firebase Auth Accounts** | Automated CLI user snapshot (`auth:export`) | Weekly | Encrypted KMS-managed bucket | 30 Days |
| **Cloudinary Media Assets** | Cloudinary Cloud Backup (Original Assets) | Continuous on upload | Secondary Cloudinary AWS/GCP Bucket | Lifetime of Asset |
| **Application Source & Config** | Git Repository (GitHub / GitLab Enterprise) | Continuous upon merge | Immutable Git history | Indefinite |

---

## 2. Disaster Recovery Scenarios & Restoration Protocols

### Scenario A: Unintended Content Deletion or Revision Corruption
- **Context:** An authorized editor accidentally overwrites or requests deletion of a critical service or lawyer bio.
- **Remediation Procedure:**
  1. Access `/admin/services` or `/admin/team`.
  2. Open the entity editor and select **Revision History**.
  3. Identify the last verified timestamped revision.
  4. Click **Restore to Draft**.
  5. The system creates a new draft revision cloned from the historical record, ensuring zero audit log interruption.
  6. Submit for review and publish following the standard approval workflow.

### Scenario B: Catastrophic Database Failure or Regional Outage
- **Context:** Corrupted database state or cloud provider availability zone disruption.
- **Restoration Procedure:**
  1. Open Google Cloud Console (`gcloud` CLI).
  2. Initiate PITR restoration to an isolated recovery target database:
     ```bash
     gcloud firestore databases restore \
       --source-database='(default)' \
       --destination-database='rma-recovery-db' \
       --recovery-time='2026-11-12T14:00:00Z' \
       --project='rma-law-prod'
     ```
  3. Validate database integrity using the automated test suite:
     ```bash
     npm run test:db-integrity -- --db='rma-recovery-db'
     ```
  4. Reapply security rules and composite indexes:
     ```bash
     firebase deploy --only firestore:rules,firestore:indexes --project rma-law-prod
     ```
  5. Switch the server application environment `FIRESTORE_DATABASE_ID` to the restored instance and trigger edge revalidation.

### Scenario C: Break-Glass Super Admin Recovery
- **Context:** All active Super Admin credentials are compromised, lost, or the primary owner is locked out of MFA.
- **Recovery Procedure:**
  1. Requires dual-party authorization: Firm Managing Partner and Lead Technical Custodian.
  2. Access the isolated production server environment via Google Workload Identity / SSH.
  3. Execute the break-glass recovery utility:
     ```bash
     node scripts/break-glass-recovery.mjs \
       --emergencyToken="${EMERGENCY_KMS_TOKEN}" \
       --targetEmail="managing.partner@rma-law.sa"
     ```
  4. The utility resets the MFA requirement, issues an expiring single-use emergency credential, and logs an immutable critical security audit entry in `auditLogs`.

---

## 3. Worker Outbox Recovery & Dead Letter Queue

If outbound notifications experience upstream SMTP outages:
1. Inquiries remain safely persisted in the database; notification jobs remain in status `PENDING` or `FAILED`.
2. Outbox worker retries with exponential backoff (1m, 5m, 15m, 1h) up to 5 attempts before marking `DEAD_LETTER`.
3. To replay failed jobs post-outage:
   ```bash
   node scripts/retry-outbox.mjs --status=DEAD_LETTER --limit=50
   ```
