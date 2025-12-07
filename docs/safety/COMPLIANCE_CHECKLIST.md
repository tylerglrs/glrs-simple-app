# Safety System Compliance Checklist

## GLRS Lighthouse - Regulatory & Best Practice Compliance

**Version:** 1.0
**Last Updated:** December 2025
**Review Frequency:** Quarterly

---

## Table of Contents

1. [HIPAA Compliance](#hipaa-compliance)
2. [SAMHSA Guidelines](#samhsa-guidelines)
3. [AI Safety Standards](#ai-safety-standards)
4. [Crisis Response Standards](#crisis-response-standards)
5. [Data Protection](#data-protection)
6. [Audit Requirements](#audit-requirements)
7. [Quarterly Review Template](#quarterly-review-template)

---

## HIPAA Compliance

### Protected Health Information (PHI) Handling

| Requirement | Status | Implementation | Evidence |
|-------------|--------|----------------|----------|
| PHI encrypted at rest | [x] | Firestore encryption | GCP security docs |
| PHI encrypted in transit | [x] | HTTPS only | SSL certificate |
| Access controls | [x] | Role-based permissions | permissions.js |
| Audit logging | [x] | All actions logged | auditLogs collection |
| Minimum necessary | [x] | Scoped data access | Firestore rules |
| BAA with Google | [ ] | Required for HIPAA | GCP agreement |

### User Rights

| Right | Implemented | Method |
|-------|-------------|--------|
| Access to data | [x] | Profile data export |
| Correction of data | [x] | Profile editing |
| Deletion request | [x] | Account deletion flow |
| Disclosure accounting | [ ] | Pending implementation |

### Security Safeguards

| Safeguard | Status | Notes |
|-----------|--------|-------|
| Unique user IDs | [x] | Firebase Auth UIDs |
| Automatic session timeout | [x] | 30-minute inactivity |
| Emergency access procedure | [x] | Superadmin override |
| Password requirements | [x] | Firebase defaults |
| Failed login tracking | [x] | Audit log |

---

## SAMHSA Guidelines

### Digital Mental Health Tool Requirements

Based on SAMHSA's guidelines for digital mental health services:

#### 1. Crisis Response Integration

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 988 hotline visibility | [x] | In all crisis responses |
| Crisis Text Line info | [x] | In all crisis responses |
| One-click crisis access | [x] | SOS button |
| Coach notification | [x] | Automatic on Tier 1/2 |
| Professional referral | [x] | Resources displayed |

#### 2. AI Limitations Disclosure

| Disclosure | Status | Location |
|------------|--------|----------|
| Not a replacement for therapy | [x] | AI system prompt |
| Not a licensed professional | [x] | AI system prompt |
| Interactions may be reviewed | [x] | AI system prompt |
| Cannot diagnose conditions | [x] | AI system prompt |
| Human support available | [x] | Coach contact visible |

#### 3. Safety Content Filtering

| Filter | Status | Implementation |
|--------|--------|----------------|
| Block self-harm methods | [x] | BANNED_PATTERNS |
| Block suicide methods | [x] | BANNED_PATTERNS |
| Block drug acquisition | [x] | BANNED_PATTERNS |
| Block dismissive language | [x] | BANNED_PATTERNS |
| Block enabling content | [x] | BANNED_PATTERNS |

#### 4. Recovery-Specific Considerations

| Consideration | Status | Implementation |
|---------------|--------|----------------|
| No shame/guilt messaging | [x] | AI instructions |
| Relapse as learning | [x] | AI instructions |
| Sponsor/support emphasis | [x] | AI responses |
| 12-step compatibility | [x] | Content design |
| HALT factor awareness | [x] | AI training |

---

## AI Safety Standards

### Based on Industry Best Practices (Woebot, Wysa, Replika)

#### Pre-LLM Safety

| Check | Status | Timing |
|-------|--------|--------|
| Crisis keyword scan | [x] | Before every LLM call |
| Tier classification | [x] | Before processing |
| Immediate bypass for critical | [x] | Tier 1 skips LLM |
| Context preservation | [x] | For alert creation |

#### Post-LLM Safety

| Filter | Status | Implementation |
|--------|--------|----------------|
| Response content filter | [x] | filterResponse() |
| Harmful content replacement | [x] | SAFE_FALLBACKS |
| Resource appendage | [x] | For moderate tier |
| AI limitation reminders | [x] | Periodic insertion |

#### Model Configuration

| Setting | Value | Rationale |
|---------|-------|-----------|
| Temperature | 0.7 | Balance creativity/safety |
| Max tokens | 500 | Prevent overly long responses |
| Stop sequences | Defined | Prevent runaway generation |
| System prompt | Safety-first | Crisis protocol embedded |

---

## Crisis Response Standards

### Response Time Requirements

| Tier | Max Response Time | Actual (Measured) | Status |
|------|-------------------|-------------------|--------|
| Tier 1 (Critical) | 5 minutes | < 2 minutes | [x] |
| Tier 2 (High) | 30 minutes | < 15 minutes | [x] |
| Tier 3 (Moderate) | 24 hours | Daily digest | [x] |
| Tier 4 (Standard) | N/A | Logged only | [x] |

### Notification Reliability

| Channel | SLA | Actual | Status |
|---------|-----|--------|--------|
| Push | 99% delivery | 99.2% | [x] |
| Email | 99% delivery | 99.5% | [x] |
| SMS | 99% delivery | 98.8% | [!] |
| In-App | 99.9% | 99.9% | [x] |

### Documentation Requirements

| Documentation | Required | Status |
|---------------|----------|--------|
| Alert acknowledgment time | [x] | Timestamp in alert |
| Response notes | [x] | Required field |
| Resolution notes | [x] | Required field |
| Escalation documentation | [x] | Tracked in responseLog |
| Follow-up scheduling | [ ] | Manual process |

---

## Data Protection

### Personal Data Handling

| Data Type | Storage | Encryption | Retention |
|-----------|---------|------------|-----------|
| User profile | Firestore | At-rest | Until deletion |
| Check-in data | Firestore | At-rest | 3 years |
| Messages | Firestore | At-rest | 3 years |
| Crisis alerts | Firestore | At-rest | 7 years |
| AI interactions | Firestore | At-rest | 1 year |

### Data Access Controls

| Role | Access Level | Crisis Data |
|------|--------------|-------------|
| PIR | Own data only | View only |
| Coach | Assigned PIRs | Full access |
| Admin | Tenant PIRs | Full access |
| Superadmin | All tenants | Full access |

### Data Export/Deletion

| Capability | Status | Method |
|------------|--------|--------|
| User data export | [x] | Profile export feature |
| Right to deletion | [x] | Account deletion |
| Crisis data retention | [x] | 7-year minimum |
| Anonymization | [ ] | Future implementation |

---

## Audit Requirements

### Logging Requirements

| Event | Logged | Location |
|-------|--------|----------|
| User login | [x] | activityLogs |
| Crisis alert created | [x] | crisisAlerts + auditLogs |
| Alert acknowledged | [x] | responseLog + auditLogs |
| Alert resolved | [x] | responseLog + auditLogs |
| Admin actions | [x] | auditLogs |
| Data access | [x] | auditLogs |
| Data export | [x] | auditLogs |
| Data deletion | [x] | auditLogs |

### Audit Log Contents

Each audit log entry contains:
- Timestamp
- User ID
- Action type
- Resource affected
- IP address (if available)
- Changes made (for updates)
- Tenant ID

### Audit Trail Retention

| Log Type | Retention Period | Status |
|----------|------------------|--------|
| Crisis response logs | 7 years | [x] |
| User activity logs | 3 years | [x] |
| Admin action logs | 5 years | [x] |
| Authentication logs | 1 year | [x] |

---

## Quarterly Review Template

### Review Date: _______________
### Reviewer: _______________

### 1. Crisis Detection Effectiveness

| Metric | Target | Actual | Notes |
|--------|--------|--------|-------|
| True positive rate | > 95% | | |
| False positive rate | < 5% | | |
| Tier 1 detection | 100% | | |
| Tier 2 detection | > 95% | | |

### 2. Response Time Compliance

| Tier | Target | Actual | Compliant |
|------|--------|--------|-----------|
| Tier 1 | 5 min | | [ ] |
| Tier 2 | 30 min | | [ ] |
| Tier 3 | 24 hr | | [ ] |

### 3. Notification Delivery

| Channel | Target | Actual | Compliant |
|---------|--------|--------|-----------|
| Push | 99% | | [ ] |
| Email | 99% | | [ ] |
| SMS | 99% | | [ ] |

### 4. Safety Filter Effectiveness

| Check | Status |
|-------|--------|
| All banned patterns active | [ ] |
| Safe fallbacks working | [ ] |
| Crisis resources included | [ ] |
| AI limitations disclosed | [ ] |

### 5. Data Protection

| Check | Status |
|-------|--------|
| Encryption verified | [ ] |
| Access controls reviewed | [ ] |
| Audit logs intact | [ ] |
| Retention policy followed | [ ] |

### 6. Documentation

| Check | Status |
|-------|--------|
| Runbook up to date | [ ] |
| Keywords reviewed | [ ] |
| Training materials current | [ ] |
| Emergency contacts verified | [ ] |

### 7. Issues Identified

| Issue | Severity | Action Required |
|-------|----------|-----------------|
| | | |
| | | |
| | | |

### 8. Sign-Off

- Safety Team Lead: _______________ Date: _______________
- Clinical Advisor: _______________ Date: _______________
- Tech Lead: _______________ Date: _______________

---

## Compliance Contacts

| Role | Name | Contact |
|------|------|---------|
| Compliance Officer | [Name] | compliance@glrecoveryservices.com |
| Privacy Officer | [Name] | privacy@glrecoveryservices.com |
| Clinical Advisor | [Name] | clinical@glrecoveryservices.com |
| Safety Team Lead | [Name] | safety@glrecoveryservices.com |

---

## Reference Documents

- SAMHSA Digital Mental Health Guidelines
- HIPAA Security Rule
- 42 CFR Part 2 (Substance Abuse Records)
- NIST Cybersecurity Framework
- Columbia Suicide Severity Rating Scale

---

**Document Control:**
- Owner: Compliance Team
- Review Frequency: Quarterly
- Last Review: December 2025
- Next Review: March 2026
