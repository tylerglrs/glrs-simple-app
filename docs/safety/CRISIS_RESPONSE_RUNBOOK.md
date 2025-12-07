# Crisis Response Runbook

## GLRS Lighthouse - Safety System Operations Guide

**Version:** 1.0
**Last Updated:** December 2025
**Phase:** 8F Documentation

---

## Table of Contents

1. [Overview](#overview)
2. [Alert Tiers](#alert-tiers)
3. [Response Procedures](#response-procedures)
4. [Notification Matrix](#notification-matrix)
5. [Escalation Paths](#escalation-paths)
6. [Dashboard Operations](#dashboard-operations)
7. [On-Call Procedures](#on-call-procedures)
8. [Troubleshooting](#troubleshooting)
9. [Emergency Contacts](#emergency-contacts)

---

## Overview

The GLRS Lighthouse Crisis Detection System monitors all user inputs (check-ins, messages, AI interactions) for crisis indicators. When triggered, alerts are created and notifications sent based on severity tier.

### System Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Crisis Keywords | `/functions/safety/crisisKeywords.js` | 169 keywords across 4 tiers |
| Detection Logic | `/functions/safety/detectCrisis.js` | Scanning and alert creation |
| Notifications | `/functions/safety/sendCrisisNotifications.js` | Multi-channel delivery |
| Daily Digest | `/functions/safety/dailyCrisisDigest.js` | Tier 3 summary emails |
| Admin Dashboard | `/admin/src/pages/alerts/` | Alert management UI |
| Client Filter | `/Index/pir-portal/src/lib/safetyFilter.ts` | Post-LLM response filtering |

### Data Flow

```
User Input -> Detection Function -> Alert Document -> Notifications
                                         |
                                         v
                                   Admin Dashboard
```

---

## Alert Tiers

### Tier 1: CRITICAL (Immediate Danger)

**Response Time:** Immediate (< 5 minutes)

**Indicators:**
- Active suicidal ideation ("I want to kill myself")
- Active self-harm ("I'm cutting myself")
- Access to lethal means ("I have a gun/pills")
- Active overdose ("I just overdosed")
- Imminent danger ("standing on the bridge")

**Keywords (47 total):**
- Suicide: 17 keywords
- Self-harm: 11 keywords
- Danger indicators: 11 keywords
- Substance crisis: 8 keywords

**Notifications:**
- Push notification (immediate)
- Email (immediate)
- SMS (immediate)
- In-app notification

### Tier 2: HIGH (Urgent Concern)

**Response Time:** Within 30 minutes

**Indicators:**
- Passive suicidal ideation ("I wish I was dead")
- Relapse crisis ("I'm about to use")
- Abuse indicators ("he hits me")
- Historical harm references
- Hopelessness expressions

**Keywords (55 total):**
- Passive suicidal: 12 keywords
- Historical harm: 10 keywords
- Hopelessness: 11 keywords
- Relapse crisis: 11 keywords
- Abuse indicators: 11 keywords

**Notifications:**
- Push notification (immediate)
- Email (immediate)
- In-app notification

### Tier 3: MODERATE (Concerning)

**Response Time:** Within 24 hours (daily digest)

**Indicators:**
- Strong cravings
- Anxiety/panic attacks
- Isolation/loneliness
- Persistent hopelessness
- Mental health concerns

**Keywords (43 total):**
- Concerning mood: 11 keywords
- Substance concerns: 11 keywords
- Support issues: 10 keywords
- Mental health: 11 keywords

**Notifications:**
- Daily digest email (6 AM local)
- In-app notification

### Tier 4: STANDARD (Monitoring)

**Response Time:** Routine review

**Indicators:**
- General stress
- Minor frustrations
- Work/family challenges
- Recovery progress notes

**Keywords (24 total):**
- General challenges: 12 keywords
- Positive indicators: 12 keywords

**Notifications:**
- Logged for analytics only

---

## Response Procedures

### Tier 1: Critical Response Protocol

```
1. ACKNOWLEDGE ALERT (within 2 minutes)
   - Click "Acknowledge" in dashboard
   - This starts the response timer

2. ATTEMPT CONTACT (within 5 minutes)
   - Call PIR's phone number
   - If no answer, text: "This is [Name] from GLRS. Please call me back ASAP - [phone]"
   - Try emergency contacts if no response

3. ASSESS SITUATION
   - Is PIR currently safe?
   - Are they alone?
   - Do they have access to means?
   - Are emergency services needed?

4. PROVIDE SUPPORT
   - Stay on line until stable
   - Review their safety plan
   - Connect with sponsor if available
   - Remind of 988 and crisis resources

5. ESCALATE IF NEEDED
   - Call 911 if imminent danger
   - Contact on-call supervisor
   - Document all actions

6. DOCUMENT & RESOLVE
   - Add detailed response notes
   - Mark as "Resolved" when stable
   - Schedule follow-up within 24 hours
```

### Tier 2: High Response Protocol

```
1. ACKNOWLEDGE ALERT (within 15 minutes)
   - Review full context and history

2. CONTACT PIR (within 30 minutes)
   - Phone call preferred
   - Text if no answer
   - Check recent activity in app

3. ASSESS & SUPPORT
   - Validate feelings
   - Review coping strategies
   - Encourage sponsor/support contact
   - Discuss professional resources if needed

4. DOCUMENT & SCHEDULE
   - Add response notes
   - Schedule check-in within 48 hours
   - Consider increased monitoring
```

### Tier 3: Moderate Response Protocol

```
1. REVIEW DAILY DIGEST (morning)
   - Check all Tier 3 alerts from past 24 hours

2. REACH OUT (within 24 hours)
   - Message in app or call
   - Check-in on how they're doing
   - Offer support without alarm

3. DOCUMENT
   - Add notes about conversation
   - Adjust care plan if needed
```

---

## Notification Matrix

| Channel | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---------|--------|--------|--------|--------|
| Push    | Immediate | Immediate | - | - |
| Email   | Immediate | Immediate | Digest | - |
| SMS     | Immediate | - | - | - |
| In-App  | Immediate | Immediate | Immediate | - |
| Log     | Yes | Yes | Yes | Yes |

### Notification Content

**Push Notification (Tier 1):**
```
CRITICAL ALERT: [PIR Name]
Immediate attention needed. Check admin portal.
```

**Push Notification (Tier 2):**
```
HIGH PRIORITY: [PIR Name]
Review needed. [Source] flagged concerning content.
```

**Email Subject Lines:**
- Tier 1: `URGENT: Crisis Alert for [PIR Name] - Immediate Action Required`
- Tier 2: `HIGH PRIORITY: [PIR Name] requires attention`
- Tier 3 Digest: `Daily Crisis Summary - [Date]`

**SMS (Tier 1 only):**
```
GLRS ALERT: [PIR Name] crisis detected. Login to admin portal now.
```

---

## Escalation Paths

### When to Escalate to Supervisor

- Unable to reach PIR for 30+ minutes (Tier 1)
- PIR expresses active plan with means
- PIR is intoxicated/impaired
- You are unsure how to proceed
- PIR threatens harm to others
- Multiple alerts from same PIR in 24 hours

### When to Involve Emergency Services (911)

- PIR has immediate access to lethal means AND intent
- PIR is unresponsive after known crisis
- PIR states they are in physical danger
- Active overdose symptoms reported
- Location is known and intervention is possible

### Supervisor Contact Protocol

1. Call supervisor (do not text for Tier 1)
2. Brief them on:
   - PIR name and situation
   - Actions taken so far
   - Current status of PIR
   - What you need help with
3. Document the escalation in alert notes

---

## Dashboard Operations

### Accessing the Crisis Dashboard

**URL:** `https://admin.glrecoveryservices.com/alerts`

**Required Role:** Coach, Admin, or Superadmin

### Dashboard Views

1. **List View** - Sortable table of all alerts
2. **Charts View** - Analytics and trends
3. **Calendar View** - Date-based alert overview

### Alert Actions

| Action | When to Use |
|--------|-------------|
| Acknowledge | You've seen the alert and are responding |
| Add Note | Document any communication or observations |
| Escalate | Hand off to supervisor or another team member |
| Resolve | PIR is stable and immediate crisis has passed |

### Filtering Alerts

- By Tier: Critical, High, Moderate, Standard
- By Source: SOS Button, AI Chat, Check-in
- By Status: Unread, Acknowledged, Responded, Escalated, Resolved
- By Date Range: Last 24h, 7 days, 30 days, custom
- By Coach: See only your assigned PIRs

---

## On-Call Procedures

### On-Call Schedule

- Maintained by Operations Manager
- Rotates weekly (Sunday to Saturday)
- Posted in Slack #on-call channel

### On-Call Responsibilities

1. **Monitor alerts** during off-hours (evenings, weekends)
2. **Respond to Tier 1** within 5 minutes
3. **Respond to Tier 2** within 30 minutes
4. **Escalate to Director** if needed
5. **Document all actions** in alert notes

### On-Call Toolkit

Keep accessible at all times:
- Admin portal access (laptop or phone)
- Emergency contact list
- Local crisis center numbers
- 988 and backup resources
- Supervisor phone number

### Handoff Protocol

**End of Shift:**
1. Review any open Tier 1/2 alerts
2. Brief incoming on-call about pending issues
3. Update Slack with status
4. Ensure notifications are forwarded

---

## Troubleshooting

### Alert Not Received

1. Check notification settings in admin profile
2. Verify FCM token is registered
3. Check spam folder for emails
4. Verify phone number for SMS
5. Contact tech support if persists

### False Positive Alert

1. Do NOT ignore - still respond
2. Document as false positive in notes
3. Report to Safety Team for keyword tuning
4. Add to false positive tracking spreadsheet

### System Down

If crisis dashboard is unavailable:

1. Check system status page
2. Use backup alert delivery (email to on-call)
3. Contact tech support immediately
4. Continue monitoring via backup channels
5. Document any missed alerts

### PIR Unreachable

Tier 1 Protocol:
1. Call 3 times, 5 minutes apart
2. Send text message with callback request
3. Call emergency contacts
4. Check last known location (if SOS)
5. Escalate to supervisor at 30 minutes
6. Consider wellness check with local authorities

---

## Emergency Contacts

### Internal Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| On-Call Supervisor | See schedule | - | oncall@glrecoveryservices.com |
| Director of Operations | [Name] | [Phone] | [email] |
| Tech Support | - | - | support@glrecoveryservices.com |

### External Crisis Resources

| Resource | Number | Notes |
|----------|--------|-------|
| 988 Suicide & Crisis Lifeline | 988 | Call or text, 24/7 |
| Crisis Text Line | Text HOME to 741741 | 24/7 |
| SAMHSA Helpline | 1-800-662-4357 | 24/7, treatment referrals |
| National Domestic Violence | 1-800-799-7233 | 24/7 |
| Veterans Crisis Line | 988, then Press 1 | 24/7 |

### Local Resources

[Add local crisis centers, hospitals, and emergency services here]

---

## Appendix: Quick Reference Cards

### Tier 1 Quick Response

```
IMMEDIATE DANGER DETECTED

1. Acknowledge in dashboard NOW
2. Call PIR within 5 minutes
3. Assess: Safe? Alone? Means?
4. Stay on line until stable
5. Call 911 if needed
6. Escalate to supervisor
7. Document everything
```

### Safe Messaging Guidelines

DO say:
- "I'm concerned about you"
- "You don't have to go through this alone"
- "Let's talk about your safety plan"
- "Can you tell me more about what's happening?"

DON'T say:
- "You're not really going to do that"
- "Just think positive"
- "Other people have it worse"
- "I know exactly how you feel"

### Post-Crisis Documentation

Required fields:
- Time of initial contact
- Method of contact (call/text/other)
- PIR's current status
- Actions taken
- Safety plan reviewed (yes/no)
- Follow-up scheduled (date/time)
- Escalation (if any)

---

**Document Control:**
- Owner: Safety Team
- Review Frequency: Quarterly
- Last Review: December 2025
- Next Review: March 2026
