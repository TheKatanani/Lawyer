# Data Mapping, Privacy Governance & Retention Policy

**Legal Jurisdiction:** Kingdom of Saudi Arabia (KSA)  
**Regulatory Framework:** Saudi Personal Data Protection Law (PDPL - Royal Decree No. M/19) & Cross-Border Data Transfer Regulations  
**Last Updated:** 12 November 2026  

---

## 1. Personal Data Inventory & Processing Map

| Data Category | Specific Data Elements | Processing Purpose | Legal Basis | Third-Party Processors & Storage |
|---|---|---|---|---|
| **Client Inquiry Data** | Full Name, International Phone (E.164), Email (Optional), Company Name (Optional), Requested Service ID, General Inquiry Message, Privacy Notice Acknowledgment Timestamp. | Initial triage, assessment of conflict of interest, and establishing legitimate legal communication. | Consent & Pre-contractual consultation request. | Google Cloud Firestore (Server-only). Stored in encrypted database. |
| **Abuse & Security Telemetry** | Ephemeral SHA-256 salted hash of client network prefix, submission timestamp, honeypot telemetry. (Full raw IP addresses are **never** persisted in database records). | Distributed rate limiting, prevention of denial of service (DoS), spam form filtering. | Legitimate security interest. | In-memory cache / short-lived Redis / Firestore rate limit buckets (TTL ≤ 24 hours). |
| **Administrative Staff Data** | Firebase Auth UID, Corporate Email, Display Name, Assigned Role, MFA Enrollment Status, Last Sign-In Timestamp, Created At. | Access control, authentication, audit trail accountability, operational governance. | Contractual employment / firm administration. | Firebase Auth (Identity Platform) & Google Cloud Firestore. |
| **Audit Logs** | Staff UID, Action Type, Target Entity Type, Target Entity ID, Timestamp, Redacted Change Summary. | System integrity, forensic review, regulatory accountability. | Compliance with professional legal practice standards. | Google Cloud Firestore (`auditLogs` collection). |
| **Public Lawyer Media** | Professional portrait photographs, approved biographical background, educational credentials, bar admissions. | Public firm representation, lawyer directory, professional credentials transparency. | Explicit consent & professional representation. | Cloudinary CDN (Public delivery with optimized formats). |

---

## 2. Infrastructure Location & Cross-Border Transfer Controls

Under Saudi PDPL Cross-Border Transfer Regulations:
1. **Cloud Firestore Region:** Configured strictly to the Google Cloud `me-central1` (Dammam, Saudi Arabia) or nearest compliant GCC regional cluster.
2. **Cloudinary Asset Storage:** Public media only (firm imagery, public portraits). Zero client consultation documents or intake records may be uploaded to Cloudinary.
3. **No External Map or Tracking Scripts:** The website does not inject unvetted third-party mapping scripts (such as Google Maps iframes) or intrusive analytics tags that silently export visitor data overseas without explicit consent.

---

## 3. Data Retention Classes & Purging Rules

| Retention Class | Target Records | Retention Period | Automated Purge Status |
|---|---|---|---|
| `INQUIRY_ACTIVE` | Inquiries with status `new`, `triaged`, or `inProgress`. | 180 days from creation | Disabled until final company sign-off |
| `INQUIRY_CLOSED` | Inquiries resolved and transitioned to `closed`. | 365 days from closure | Disabled until final company sign-off |
| `INQUIRY_SPAM` | Submissions flagged as fraudulent or spam. | 30 days from marking | Automatic purge job candidate |
| `AUDIT_RECORD` | Security, publication, and administrative audit entries. | 730 days (2 years) | Retained for compliance |
| `MEDIA_STAGING` | Uploaded assets never referenced in any revision. | 14 days from upload | Automatic cleanup job |

> [!CAUTION]
> Automated deletion of personal inquiry data is technically suspended until the firm's legal counsel verifies the official retention window. Inquiries must not be purged while under active legal hold.

---

## 4. Data Subject Rights (DSAR) Protocol

In accordance with the Saudi PDPL, individuals possess the right to access, rectify, or request the destruction of their personal data.

1. **Request Channel:** Requests are submitted through verified written correspondence to the designated privacy contact (`privacy@rma-law.sa` / firm management).
2. **Identity Verification:** The intake team verifies the claimant's identity via two-factor phone confirmation using the E.164 phone number originally submitted.
3. **Execution:** The Super Admin role executes the verified redaction or deletion via the CMS or controlled server script, which logs the operation in `auditLogs`. No unauthenticated public "delete" endpoints exist.
