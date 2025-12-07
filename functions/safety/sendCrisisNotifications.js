/**
 * Crisis Notification System
 * Phase 8C-1: Multi-channel crisis notification delivery
 *
 * Implements notification matrix from Phase 8A Section 5:
 * - CRITICAL: Push + Email + SMS (< 2 sec)
 * - HIGH: Push + Email (< 5 min)
 * - MODERATE: Daily digest only (8 PM PT)
 * - STANDARD: Log only
 *
 * @module safety/sendCrisisNotifications
 */

const admin = require('firebase-admin')
const { sendNotification } = require('../notifications/helpers/sendNotification')
const { sendEmail } = require('../notifications/email/sendEmail')
const { crisisAlertTemplate } = require('../notifications/email/templates/crisisAlert')

// Lazy-load SMS module (only for CRITICAL tier)
let sendSMS = null
const getSendSMS = () => {
  if (!sendSMS) {
    sendSMS = require('../notifications/sms/sendSMS').sendSMS
  }
  return sendSMS
}

const db = admin.firestore()

// =============================================================================
// NOTIFICATION CHANNEL MATRIX
// =============================================================================

const NOTIFICATION_MATRIX = {
  critical: {
    push: true,
    email: true,
    sms: true,
    timing: 'immediate',
    maxDelay: 2000, // 2 seconds
  },
  high: {
    push: true,
    email: true,
    sms: false,
    timing: 'immediate',
    maxDelay: 300000, // 5 minutes
  },
  moderate: {
    push: false,
    email: false, // Handled by daily digest
    sms: false,
    timing: 'digest',
    maxDelay: null,
  },
  standard: {
    push: false,
    email: false,
    sms: false,
    timing: 'log-only',
    maxDelay: null,
  },
}

// =============================================================================
// MAIN NOTIFICATION FUNCTION
// =============================================================================

/**
 * Send crisis notifications to the assigned coach
 * Implements multi-channel delivery based on tier
 *
 * @param {Object} params - Notification parameters
 * @param {string} params.alertId - The crisis alert document ID
 * @param {string} params.pirId - The PIR (user) ID
 * @param {string} params.pirName - The PIR's display name
 * @param {string} params.tier - Crisis tier (critical, high, moderate, standard)
 * @param {string} params.source - Source of detection (check-in, reflection, chat, etc.)
 * @param {string} params.triggeredBy - What triggered the alert (keyword, sentiment, etc.)
 * @param {string} params.flaggedContent - The content that triggered the alert
 * @param {string} [params.coachId] - Optional coach ID (will fetch from PIR if not provided)
 * @returns {Promise<Object>} Result with notification statuses
 */
async function sendCrisisNotifications({
  alertId,
  pirId,
  pirName,
  tier,
  source,
  triggeredBy,
  flaggedContent,
  coachId = null,
}) {
  const startTime = Date.now()
  const results = {
    success: false,
    alertId,
    tier,
    notifications: {
      push: { sent: false, error: null },
      email: { sent: false, error: null },
      sms: { sent: false, error: null },
    },
    coachId: null,
    coachEmail: null,
    coachPhone: null,
    timing: null,
  }

  try {
    // Get notification config for this tier
    const config = NOTIFICATION_MATRIX[tier.toLowerCase()]
    if (!config) {
      throw new Error(`Invalid crisis tier: ${tier}`)
    }

    // Skip notifications for log-only tiers
    if (config.timing === 'log-only') {
      console.log(`[CrisisNotify] Tier ${tier} is log-only, skipping notifications`)
      results.success = true
      results.timing = Date.now() - startTime
      return results
    }

    // Skip immediate notifications for digest tiers
    if (config.timing === 'digest') {
      console.log(`[CrisisNotify] Tier ${tier} uses daily digest, skipping immediate notifications`)
      results.success = true
      results.timing = Date.now() - startTime
      return results
    }

    // Get coach info
    const coach = await getCoachInfo(pirId, coachId)
    if (!coach) {
      throw new Error(`No coach found for PIR: ${pirId}`)
    }

    results.coachId = coach.id
    results.coachEmail = coach.email
    results.coachPhone = coach.phone

    // Prepare notification content
    const content = buildNotificationContent({
      pirName,
      tier,
      source,
      triggeredBy,
      flaggedContent,
      alertId,
    })

    // Send notifications in parallel for speed
    const promises = []

    // Push notification
    if (config.push) {
      promises.push(
        sendPushNotification(coach.id, content, tier, alertId)
          .then((result) => {
            results.notifications.push = { sent: true, ...result }
          })
          .catch((error) => {
            console.error('[CrisisNotify] Push failed:', error)
            results.notifications.push = { sent: false, error: error.message }
          })
      )
    }

    // Email notification
    if (config.email) {
      promises.push(
        sendEmailNotification(coach.email, content, tier, pirId)
          .then((result) => {
            results.notifications.email = { sent: true, ...result }
          })
          .catch((error) => {
            console.error('[CrisisNotify] Email failed:', error)
            results.notifications.email = { sent: false, error: error.message }
          })
      )
    }

    // SMS notification (CRITICAL only)
    if (config.sms && coach.phone) {
      promises.push(
        sendSMSNotification(coach.phone, content, pirName)
          .then((result) => {
            results.notifications.sms = { sent: true, ...result }
          })
          .catch((error) => {
            console.error('[CrisisNotify] SMS failed:', error)
            results.notifications.sms = { sent: false, error: error.message }
          })
      )
    } else if (config.sms && !coach.phone) {
      results.notifications.sms = { sent: false, error: 'No phone number on file' }
    }

    // Wait for all notifications to complete
    await Promise.all(promises)

    // Update the crisis alert document with notification status
    await updateAlertNotificationStatus(alertId, results.notifications)

    results.success = true
    results.timing = Date.now() - startTime

    // Log timing for SLA monitoring
    console.log(
      `[CrisisNotify] Completed in ${results.timing}ms (SLA: ${config.maxDelay}ms) - ` +
        `Push: ${results.notifications.push.sent}, ` +
        `Email: ${results.notifications.email.sent}, ` +
        `SMS: ${results.notifications.sms.sent}`
    )

    // Warn if we exceeded SLA
    if (config.maxDelay && results.timing > config.maxDelay) {
      console.warn(
        `[CrisisNotify] SLA EXCEEDED: ${results.timing}ms > ${config.maxDelay}ms for ${tier} alert`
      )
    }

    return results
  } catch (error) {
    console.error('[CrisisNotify] Critical error:', error)
    results.error = error.message
    results.timing = Date.now() - startTime

    // Try to update alert with failure status
    try {
      await db.collection('crisisAlerts').doc(alertId).update({
        'notificationsSent.error': error.message,
        'notificationsSent.errorAt': admin.firestore.FieldValue.serverTimestamp(),
      })
    } catch (updateError) {
      console.error('[CrisisNotify] Failed to update alert with error:', updateError)
    }

    return results
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get coach information for a PIR
 */
async function getCoachInfo(pirId, providedCoachId = null) {
  try {
    let coachId = providedCoachId

    // If no coach ID provided, get from PIR document
    if (!coachId) {
      const pirDoc = await db.collection('users').doc(pirId).get()
      if (!pirDoc.exists) {
        console.error('[CrisisNotify] PIR document not found:', pirId)
        return null
      }
      coachId = pirDoc.data().assignedCoach
    }

    if (!coachId) {
      console.error('[CrisisNotify] No assigned coach for PIR:', pirId)
      return null
    }

    // Get coach document
    const coachDoc = await db.collection('users').doc(coachId).get()
    if (!coachDoc.exists) {
      console.error('[CrisisNotify] Coach document not found:', coachId)
      return null
    }

    const coachData = coachDoc.data()
    return {
      id: coachId,
      email: coachData.email,
      phone: coachData.phone || coachData.phoneNumber || null,
      firstName: coachData.firstName || 'Coach',
      lastName: coachData.lastName || '',
    }
  } catch (error) {
    console.error('[CrisisNotify] Error getting coach info:', error)
    return null
  }
}

/**
 * Build notification content for all channels
 */
function buildNotificationContent({ pirName, tier, source, triggeredBy, flaggedContent, alertId }) {
  const tierEmoji = {
    critical: '🚨',
    high: '⚠️',
    moderate: '📋',
    standard: 'ℹ️',
  }

  const emoji = tierEmoji[tier.toLowerCase()] || '⚠️'

  // Truncate flagged content for SMS/push
  const truncatedContent =
    flaggedContent.length > 100 ? flaggedContent.substring(0, 100) + '...' : flaggedContent

  return {
    // Push notification content
    push: {
      title: `${emoji} ${tier.toUpperCase()} Crisis Alert`,
      body: `${pirName} needs immediate attention. ${triggeredBy} detected in ${source}.`,
    },
    // Email content (full details)
    email: {
      subject: `${emoji} ${tier.toUpperCase()} Crisis Alert: ${pirName}`,
      pirName,
      tier: tier.toUpperCase(),
      source,
      triggeredBy,
      flaggedContent,
      alertId,
      timestamp: new Date().toISOString(),
    },
    // SMS content (brief, urgent)
    sms: {
      message:
        `GLRS CRISIS ALERT: ${pirName} - ${tier.toUpperCase()}\n` +
        `${triggeredBy} in ${source}\n` +
        `"${truncatedContent}"\n` +
        `Review: app.glrecoveryservices.com/coach`,
    },
  }
}

/**
 * Send push notification to coach
 */
async function sendPushNotification(coachId, content, tier, alertId) {
  const priority = tier.toLowerCase() === 'critical' ? 'critical' : 'high'

  const result = await sendNotification({
    userId: coachId,
    type: 'crisis_alert',
    title: content.push.title,
    message: content.push.body,
    category: 'emergency',
    priority,
    actionUrl: `/coach/alerts/${alertId}`,
    data: {
      alertId,
      tier,
      type: 'crisis',
    },
  })

  return { notificationId: result?.id || null }
}

/**
 * Send email notification to coach
 */
async function sendEmailNotification(coachEmail, content, tier, pirId) {
  // Render the crisis alert email template
  const html = crisisAlertTemplate({
    pirName: content.email.pirName,
    tier: content.email.tier,
    source: content.email.source,
    triggeredBy: content.email.triggeredBy,
    flaggedContent: content.email.flaggedContent,
    alertId: content.email.alertId,
    timestamp: content.email.timestamp,
    reviewUrl: `https://app.glrecoveryservices.com/coach/alerts/${content.email.alertId}`,
    pirProfileUrl: `https://app.glrecoveryservices.com/coach/pir/${pirId}`,
  })

  await sendEmail({
    to: coachEmail,
    subject: content.email.subject,
    html,
  })

  return { emailSent: true }
}

/**
 * Send SMS notification to coach (CRITICAL tier only)
 */
async function sendSMSNotification(phoneNumber, content, pirName) {
  const smsFunction = getSendSMS()
  const result = await smsFunction({
    to: phoneNumber,
    message: content.sms.message,
    type: 'crisis_alert',
  })

  return { messageSid: result?.messageSid || null }
}

/**
 * Update crisis alert document with notification status
 */
async function updateAlertNotificationStatus(alertId, notifications) {
  const now = admin.firestore.FieldValue.serverTimestamp()

  const updateData = {
    'notificationsSent.push': notifications.push.sent,
    'notificationsSent.email': notifications.email.sent,
    'notificationsSent.sms': notifications.sms.sent,
  }

  if (notifications.push.sent) {
    updateData['notificationsSent.pushAt'] = now
  }
  if (notifications.email.sent) {
    updateData['notificationsSent.emailAt'] = now
  }
  if (notifications.sms.sent) {
    updateData['notificationsSent.smsAt'] = now
  }

  await db.collection('crisisAlerts').doc(alertId).update(updateData)
}

// =============================================================================
// BATCH NOTIFICATION FUNCTIONS (for retries and escalation)
// =============================================================================

/**
 * Retry failed notifications for an alert
 * Called by scheduled retry function or manually
 */
async function retryFailedNotifications(alertId) {
  try {
    const alertDoc = await db.collection('crisisAlerts').doc(alertId).get()
    if (!alertDoc.exists) {
      throw new Error(`Alert not found: ${alertId}`)
    }

    const alert = alertDoc.data()

    // Check which notifications failed
    const notificationsSent = alert.notificationsSent || {}
    const tier = alert.tier

    // Get notification config
    const config = NOTIFICATION_MATRIX[tier.toLowerCase()]
    if (!config) {
      throw new Error(`Invalid tier: ${tier}`)
    }

    const retryResults = {
      alertId,
      retried: [],
      succeeded: [],
      failed: [],
    }

    // Get coach info
    const coach = await getCoachInfo(alert.pirId)
    if (!coach) {
      throw new Error(`No coach found for PIR: ${alert.pirId}`)
    }

    // Build content
    const content = buildNotificationContent({
      pirName: alert.pirName || 'Unknown PIR',
      tier: alert.tier,
      source: alert.source,
      triggeredBy: alert.triggeredBy,
      flaggedContent: alert.flaggedContent,
      alertId,
    })

    // Retry push if it should have been sent but wasn't
    if (config.push && !notificationsSent.push) {
      retryResults.retried.push('push')
      try {
        await sendPushNotification(coach.id, content, tier, alertId)
        retryResults.succeeded.push('push')
        await db.collection('crisisAlerts').doc(alertId).update({
          'notificationsSent.push': true,
          'notificationsSent.pushAt': admin.firestore.FieldValue.serverTimestamp(),
          'notificationsSent.pushRetried': true,
        })
      } catch (error) {
        retryResults.failed.push({ channel: 'push', error: error.message })
      }
    }

    // Retry email if it should have been sent but wasn't
    if (config.email && !notificationsSent.email) {
      retryResults.retried.push('email')
      try {
        await sendEmailNotification(coach.email, content, tier, alert.pirId)
        retryResults.succeeded.push('email')
        await db.collection('crisisAlerts').doc(alertId).update({
          'notificationsSent.email': true,
          'notificationsSent.emailAt': admin.firestore.FieldValue.serverTimestamp(),
          'notificationsSent.emailRetried': true,
        })
      } catch (error) {
        retryResults.failed.push({ channel: 'email', error: error.message })
      }
    }

    // Retry SMS if it should have been sent but wasn't
    if (config.sms && !notificationsSent.sms && coach.phone) {
      retryResults.retried.push('sms')
      try {
        await sendSMSNotification(coach.phone, content, alert.pirName)
        retryResults.succeeded.push('sms')
        await db.collection('crisisAlerts').doc(alertId).update({
          'notificationsSent.sms': true,
          'notificationsSent.smsAt': admin.firestore.FieldValue.serverTimestamp(),
          'notificationsSent.smsRetried': true,
        })
      } catch (error) {
        retryResults.failed.push({ channel: 'sms', error: error.message })
      }
    }

    console.log('[CrisisNotify] Retry results:', retryResults)
    return retryResults
  } catch (error) {
    console.error('[CrisisNotify] Retry error:', error)
    throw error
  }
}

/**
 * Escalate unacknowledged critical alerts
 * Called by scheduled escalation function
 */
async function escalateUnacknowledgedAlerts(minutesThreshold = 15) {
  try {
    const cutoffTime = new Date(Date.now() - minutesThreshold * 60 * 1000)

    // Find critical alerts that haven't been acknowledged
    const alertsSnapshot = await db
      .collection('crisisAlerts')
      .where('tier', '==', 'critical')
      .where('status', '==', 'active')
      .where('createdAt', '<', cutoffTime)
      .get()

    if (alertsSnapshot.empty) {
      console.log('[CrisisNotify] No alerts to escalate')
      return { escalated: 0 }
    }

    const escalationResults = {
      escalated: 0,
      alerts: [],
    }

    for (const doc of alertsSnapshot.docs) {
      const alert = doc.data()

      // Get coach info for escalation
      const coach = await getCoachInfo(alert.pirId)
      if (!coach) continue

      // Send escalation notifications
      const escalationContent = {
        push: {
          title: '🔴 ESCALATION: Unacknowledged Crisis Alert',
          body: `Alert for ${alert.pirName || 'PIR'} has not been acknowledged for ${minutesThreshold} minutes.`,
        },
        sms: {
          message:
            `GLRS ESCALATION: Crisis alert for ${alert.pirName || 'PIR'} unacknowledged for ${minutesThreshold}min. ` +
            `Immediate action required. app.glrecoveryservices.com/coach`,
        },
      }

      // Re-send push
      try {
        await sendPushNotification(coach.id, escalationContent, 'critical', doc.id)
      } catch (error) {
        console.error('[CrisisNotify] Escalation push failed:', error)
      }

      // Re-send SMS
      if (coach.phone) {
        try {
          await sendSMSNotification(coach.phone, escalationContent, alert.pirName)
        } catch (error) {
          console.error('[CrisisNotify] Escalation SMS failed:', error)
        }
      }

      // Mark alert as escalated
      await db.collection('crisisAlerts').doc(doc.id).update({
        escalated: true,
        escalatedAt: admin.firestore.FieldValue.serverTimestamp(),
        escalationCount: admin.firestore.FieldValue.increment(1),
      })

      escalationResults.escalated++
      escalationResults.alerts.push(doc.id)
    }

    console.log('[CrisisNotify] Escalation complete:', escalationResults)
    return escalationResults
  } catch (error) {
    console.error('[CrisisNotify] Escalation error:', error)
    throw error
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  sendCrisisNotifications,
  retryFailedNotifications,
  escalateUnacknowledgedAlerts,
  NOTIFICATION_MATRIX,
  // Expose helpers for testing
  _internal: {
    getCoachInfo,
    buildNotificationContent,
    sendPushNotification,
    sendEmailNotification,
    sendSMSNotification,
    updateAlertNotificationStatus,
  },
}
