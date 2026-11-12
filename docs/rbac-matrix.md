# Role-Based Access Control (RBAC) & Authority Matrix

**System:** Riyadh Mohammed Alzahrani Legal CMS  
**Security Standard:** Strict Server DAL Enforcement & Zero-Trust Session Management  
**Last Updated:** 12 November 2026  

---

## 1. Fixed Administrative Roles

The platform defines four rigid, non-configurable administrative roles for initial launch:

1. **Super Admin (Managing Partner / Firm IT Lead):** Complete governance over identity, administrator accounts, exports, audit trails, and core publication.
2. **Admin (Senior Lawyer / Practice Manager):** Full content lifecycle control (edit, review, approve, publish, withdraw) and inquiry operational handling. Cannot manage administrator accounts or alter official firm identity.
3. **Editor (Staff Associate / Legal Copywriter):** Drafting and editing of pages, services, team bios, insights, and media uploads. Submits items for review. Cannot approve, publish, unpublish, or access client inquiries.
4. **Inquiry Manager (Intake Coordinator / Client Relations Officer):** Dedicated triage, note logging, and status transitions for incoming consultation requests. Zero access to content editing, website settings, or staff administration.

---

## 2. Granular Capability Enforcement Matrix

| Capability Key | Description | Super Admin | Admin | Editor | Inquiry Manager | Server Enforcement Layer |
|---|---|:---:|:---:|:---:|:---:|---|
| `content.edit` | Create and edit draft revisions | Yes | Yes | Yes | No | `assertCapability('content.edit')` |
| `content.review` | Submit content for review / reject drafts | Yes | Yes | Yes | No | `assertCapability('content.review')` |
| `content.publish` | Approve, publish, or withdraw live content | Yes | Yes | No | No | `assertCapability('content.publish')` |
| `media.upload` | Request signed upload URL & register asset | Yes | Yes | Yes | No | `assertCapability('media.upload')` |
| `media.delete` | Delete unreferenced media from registry | Yes | Yes | No | No | `assertCapability('media.delete')` |
| `settings.presentation`| Edit navigation menus, footer copy, layout | Yes | Yes | Draft Only| No | `assertCapability('settings.presentation')`|
| `settings.identity` | Modify official name, CR, VAT, phone, email | Yes | No | No | No | `assertCapability('settings.identity')` |
| `inquiries.read` | View inquiry queue and individual records | Yes | Yes | No | Yes | `assertCapability('inquiries.read')` |
| `inquiries.update` | Update intake status, assignee, and add notes| Yes | Yes | No | Yes | `assertCapability('inquiries.update')` |
| `inquiries.export` | Bulk CSV export of client consultation records | Yes (MFA Reauth) | No | No | No | `assertCapability('inquiries.export')` |
| `inquiries.purge` | Execute approved privacy retention erasure | Yes (MFA Reauth) | No | No | No | `assertCapability('inquiries.purge')` |
| `seo.edit` | Edit meta titles, descriptions, canonicals | Yes | Yes | Draft Only| No | `assertCapability('seo.edit')` |
| `redirects.approve`| Approve 301/308 legacy URL mapping rules | Yes | Yes | No | No | `assertCapability('redirects.approve')` |
| `admins.manage` | Invite, disable, or reassign admin accounts | Yes | No | No | No | `assertCapability('admins.manage')` |
| `audit.read` | Read system audit log and event history | Yes | Yes | No | No | `assertCapability('audit.read')` |

---

## 3. Session & Authentication Architecture

1. **Authentication:** Authenticates against Firebase Auth with mandatory TOTP MFA.
2. **Session Exchange (`/api/auth/session`):**
   - The browser exchanges a verified short-lived ID token for an encrypted, server-side session cookie.
   - Production Cookie: `__Host-rma_session`, `HttpOnly`, `Secure`, `SameSite=Lax`, Path `/`, 8-hour absolute maximum lifespan.
3. **Live Authoritative Verification:**
   - Custom claims on the JWT are treated merely as UI hints.
   - Every sensitive server operation performs a direct lookup against the authoritative document in `adminUsers/{uid}` to verify `isActive === true` and validate current role permissions.
   - Deactivating a user takes effect immediately across all active sessions.
4. **Last Super Admin Safeguard:**
   - The DAL programmatically denies any action that would delete, demote, or deactivate the last remaining active Super Admin account.
