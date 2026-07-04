# Security Specification for Dvarix Realty Firestore

This document defines the security boundaries, data invariants, and the test payload specifications ("The Dirty Dozen") to verify our access controls.

## 1. Data Invariants

1. **Inquiries Integrity**:
   - Anyone can write an Inquiry (create), but they must verify their email or provide legitimate string fields.
   - Deletion and collection-wide reads are restricted to verified Administrators.
2. **Custom Requirement Protection**:
   - Anyone can register deep commercial or family residential checklists (create).
   - Only authenticated owners or verified Admins can read, update, or delete single custom requirements.
3. **Properties, Categories, Agents, Map Locations**:
   - Reads: Allow public access (`true` or `isSignedIn()`).
   - Writes (Create, Update, Delete): ONLY verified Administrators have write clearance.

---

## 2. The Dirty Dozen (Malicious Payloads)

1. **Spoofed Ownership Injection** (CustomRequirements): Adding a CustomRequirement with `ownerId` spoofed as another user.
2. **PII Data Scrape**: Unauthenticated query requesting all emails and mobile numbers from `/requirements`.
3. **Ghost Property Creation**: Unauthenticated user attempting to inject a malicious listing targeting `/properties`.
4. **Ad-hoc Admin Promotion**: Standard user profile updating their role to "Super Admin" via a custom profile field.
5. **Orphaned Inquiry**: Attempting to post an Inquiry targeting a non-existent property ID path.
6. **Negative Budget Injection**: Registering custom requirements with `minBudget: "-500,000"`.
7. **Junk Character Path/ID Poisoning**: Submitting document IDs containing special scripts or over 10KB.
8. **Malicious Key Bloat (Shadow fields)**: Posting a valid property document with an extra payload flag: `{ isApprovedByAdmin: true }`.
9. **Outcome Terminal State Skip**: Updating a negotiated custom requirement directly to "Archived" when permissions only allow "In Progress".
10. **Admin Bypass Spoof**: Authenticating as a user with an unverified email address claiming the Super Admin email.
11. **List Query Bypass**: Submitting a general list query targeting other people's requirements.
12. **Timestamp Forgery**: Submitting client system timestamps instead of the server's request timestamp.

---

## 3. Test Runner Design

The following rules will be fully verified against these vectors.
