# DENTE Clinic Security Specification

This document details the Zero-Trust security rules specification for the DENTE Dental Clinic system.

## 1. Data Invariants
- **Patients**: 
  - Every patient belongs to the clinic system.
  - Required fields: `id`, `nationalId`, `firstName`, `familyName`, `city`, `phoneNumber`, `createdAt`.
  - Identity integrity: Only authorized dental clinic representatives can create or write patient cards.
- **Appointments**:
  - Every appointment must refer to an existing patient ID.
  - Required fields: `id`, `patientId`, `title`, `start`, `end`, `firstReminder`, `finalConfirmation`.
  - Immutability constraint: `id` and `patientId` must be immutable once created.
  - Temporal check: All timestamps must be validated against `request.time`.
- **Settings**:
  - Shared global setting configurations must only be writable by authenticated administrative representatives.

## 2. Invariant Security Checklist & The "Dirty Dozen" Payloads
The following payloads describe 12 vectors that must be rejected by the security rules:
1. **Patient Spoof Audit**: Write a patient record with an invalid custom ID format.
2. **Double Patient Creation**: Setting self-assigned IDs longer than 128 characters.
3. **Appointment Empty Patient**: Create an appointment document without a linked patient ID.
4. **Appointment Temporal Distortion**: Setting a `createdAt` timestamp that does NOT match `request.time`.
5. **Patient Unauthenticated Write**: Write a patient record without being authenticating.
6. **Appointment Client Time Insertion**: Setting clinical updates without checking Server Timestamp.
7. **Settings Injection**: Malicious injection of third-party SMS API details.
8. **Appt ID Mutability Poisoning**: Update an appointment by changing its original patientId.
9. **Status Locking Breach**: Update a finished booking's attributes without permission.
10. **Shadow field injection**: Adding unapproved ghost fields like `isVerifiedRepresentative` directly to user metadata.
11. **PII read leak**: Blanket unauthenticated reading of clinical phone directories.
12. **Denial of Wallet**: Intentionally querying with a huge unbounded string as a document key.
