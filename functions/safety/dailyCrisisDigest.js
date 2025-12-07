/**
 * Daily Crisis Digest
 * Phase 8C-4: Scheduled digest for MODERATE tier alerts
 *
 * Runs at 8 PM Pacific Time daily to send coaches a digest
 * of MODERATE tier alerts from the past 24 hours.
 *
 * MODERATE alerts don't need immediate attention but should
 * be reviewed within 24 hours.
 *
 * @module safety/dailyCrisisDigest
 */

const functions = require('firebase-functions')
const admin = require('firebase-admin')
const { sendEmail } = require('../notifications/email/sendEmail')

const db = admin.firestore()

// =============================================================================
// DIGEST CONFIGURATION
// =============================================================================

const DIGEST_CONFIG = {
  // Timezone for scheduling (Pacific Time)
  timezone: 'America/Los_Angeles',
  // Time to send digest (24-hour format)
  sendTime: '20:00', // 8 PM
  // How far back to look for alerts (24 hours)
  lookbackHours: 24,
  // Only include these tiers in digest
  includeTiers: ['moderate'],
  // Minimum alerts to send digest (don't bother coaches for 0 alerts)
  minimumAlerts: 1,
}

// =============================================================================
// MAIN SCHEDULED FUNCTION
// =============================================================================

/**
 * Scheduled function to send daily crisis digest to coaches
 * Runs at 8 PM Pacific Time daily
 */
const dailyCrisisDigest = functions.pubsub
  .schedule('0 20 * * *') // 8 PM daily
  .timeZone(DIGEST_CONFIG.timezone)
  .onRun(async (context) => {
    console.log('[CrisisDigest] Starting daily digest run')
    const startTime = Date.now()

    try {
      // Get all active coaches
      const coaches = await getActiveCoaches()
      console.log(`[CrisisDigest] Found ${coaches.length} active coaches`)

      if (coaches.length === 0) {
        console.log('[CrisisDigest] No active coaches found, skipping digest')
        return null
      }

      // Process each coach's digest in parallel
      const results = await Promise.allSettled(
        coaches.map((coach) => processCoachDigest(coach))
      )

      // Summarize results
      const sent = results.filter((r) => r.status === 'fulfilled' && r.value.sent).length
      const skipped = results.filter((r) => r.status === 'fulfilled' && !r.value.sent).length
      const failed = results.filter((r) => r.status === 'rejected').length

      console.log(
        `[CrisisDigest] Complete: ${sent} sent, ${skipped} skipped, ${failed} failed (${Date.now() - startTime}ms)`
      )

      // Log digest run
      await logDigestRun({
        coachCount: coaches.length,
        sent,
        skipped,
        failed,
        timing: Date.now() - startTime,
      })

      return null
    } catch (error) {
      console.error('[CrisisDigest] Fatal error:', error)

      // Log failed run
      await logDigestRun({
        error: error.message,
        timing: Date.now() - startTime,
      })

      throw error
    }
  })

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all active coaches
 */
async function getActiveCoaches() {
  const coachesSnapshot = await db
    .collection('users')
    .where('role', 'in', ['coach', 'admin', 'superadmin'])
    .where('active', '==', true)
    .get()

  return coachesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

/**
 * Process digest for a single coach
 */
async function processCoachDigest(coach) {
  const result = {
    coachId: coach.id,
    sent: false,
    alertCount: 0,
    pirCount: 0,
  }

  try {
    // Get alerts for this coach's PIRs
    const alerts = await getCoachAlerts(coach.id)
    result.alertCount = alerts.length

    // Skip if no alerts
    if (alerts.length < DIGEST_CONFIG.minimumAlerts) {
      console.log(`[CrisisDigest] No alerts for coach ${coach.id}, skipping`)
      return result
    }

    // Get unique PIRs
    const uniquePirs = [...new Set(alerts.map((a) => a.pirId))]
    result.pirCount = uniquePirs.length

    // Group alerts by PIR
    const alertsByPir = groupAlertsByPir(alerts)

    // Generate and send digest email
    const html = generateDigestEmail(coach, alertsByPir, alerts.length)

    await sendEmail({
      to: coach.email,
      subject: `Daily Safety Digest: ${alerts.length} Moderate Alerts Require Review`,
      html,
    })

    result.sent = true
    console.log(`[CrisisDigest] Sent digest to ${coach.email}: ${alerts.length} alerts`)

    // Mark alerts as included in digest
    await markAlertsDigested(alerts)

    return result
  } catch (error) {
    console.error(`[CrisisDigest] Error processing coach ${coach.id}:`, error)
    throw error
  }
}

/**
 * Get MODERATE alerts for a coach's PIRs from the last 24 hours
 */
async function getCoachAlerts(coachId) {
  const cutoffTime = new Date(Date.now() - DIGEST_CONFIG.lookbackHours * 60 * 60 * 1000)

  // Get all PIRs assigned to this coach
  const pirsSnapshot = await db
    .collection('users')
    .where('assignedCoach', '==', coachId)
    .where('role', '==', 'pir')
    .get()

  if (pirsSnapshot.empty) {
    return []
  }

  const pirIds = pirsSnapshot.docs.map((doc) => doc.id)
  const pirNames = {}
  pirsSnapshot.docs.forEach((doc) => {
    pirNames[doc.id] = doc.data().firstName || doc.data().displayName || 'Unknown'
  })

  // Get MODERATE alerts for these PIRs
  // Firestore doesn't support 'in' with more than 30 values, so batch if needed
  const alerts = []
  const batches = []

  for (let i = 0; i < pirIds.length; i += 30) {
    batches.push(pirIds.slice(i, i + 30))
  }

  for (const batch of batches) {
    const alertsSnapshot = await db
      .collection('crisisAlerts')
      .where('pirId', 'in', batch)
      .where('tier', 'in', DIGEST_CONFIG.includeTiers)
      .where('createdAt', '>', cutoffTime)
      .where('digestedAt', '==', null)
      .orderBy('createdAt', 'desc')
      .get()

    alertsSnapshot.docs.forEach((doc) => {
      const data = doc.data()
      alerts.push({
        id: doc.id,
        ...data,
        pirName: data.pirName || pirNames[data.pirId] || 'Unknown',
      })
    })
  }

  return alerts
}

/**
 * Group alerts by PIR for email organization
 */
function groupAlertsByPir(alerts) {
  const grouped = {}

  for (const alert of alerts) {
    const pirId = alert.pirId
    if (!grouped[pirId]) {
      grouped[pirId] = {
        pirId,
        pirName: alert.pirName,
        alerts: [],
      }
    }
    grouped[pirId].alerts.push(alert)
  }

  return Object.values(grouped)
}

/**
 * Mark alerts as included in digest
 */
async function markAlertsDigested(alerts) {
  const batch = db.batch()

  for (const alert of alerts) {
    const alertRef = db.collection('crisisAlerts').doc(alert.id)
    batch.update(alertRef, {
      digestedAt: admin.firestore.FieldValue.serverTimestamp(),
      'notificationsSent.digest': true,
      'notificationsSent.digestAt': admin.firestore.FieldValue.serverTimestamp(),
    })
  }

  await batch.commit()
}

/**
 * Log digest run for monitoring
 */
async function logDigestRun(data) {
  try {
    await db.collection('digestLogs').add({
      type: 'crisis_digest',
      ...data,
      runAt: admin.firestore.FieldValue.serverTimestamp(),
    })
  } catch (error) {
    console.error('[CrisisDigest] Failed to log run:', error)
  }
}

// =============================================================================
// EMAIL TEMPLATE
// =============================================================================

/**
 * Generate digest email HTML
 */
function generateDigestEmail(coach, alertsByPir, totalAlerts) {
  const coachName = coach.firstName || 'Coach'
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Generate PIR sections
  const pirSections = alertsByPir
    .map((pir) => {
      const alertRows = pir.alerts
        .map((alert) => {
          const time = alert.createdAt?.toDate?.()
            ? alert.createdAt.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            : 'Unknown'

          return `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">${time}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #111827;">${alert.source || 'Unknown'}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #111827;">${alert.triggeredBy || 'Pattern detected'}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                <a href="https://app.glrecoveryservices.com/coach/alerts/${alert.id}" style="color: #058585; text-decoration: none; font-size: 14px;">Review</a>
              </td>
            </tr>
          `
        })
        .join('')

      return `
        <tr>
          <td style="padding: 20px;">
            <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #111827;">
              ${pir.pirName}
              <span style="font-weight: 400; color: #6b7280; font-size: 14px;">(${pir.alerts.length} alert${pir.alerts.length > 1 ? 's' : ''})</span>
            </h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; border-radius: 8px; overflow: hidden;">
              <tr style="background: #e5e7eb;">
                <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #374151; text-transform: uppercase;">Time</th>
                <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #374151; text-transform: uppercase;">Source</th>
                <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #374151; text-transform: uppercase;">Trigger</th>
                <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #374151; text-transform: uppercase;">Action</th>
              </tr>
              ${alertRows}
            </table>
          </td>
        </tr>
      `
    })
    .join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Safety Digest</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%); padding: 24px; text-align: center;">
              <p style="margin: 0; font-size: 32px;">📋</p>
              <h1 style="color: white; margin: 12px 0 0; font-size: 22px; font-weight: 700;">Daily Safety Digest</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">${today}</p>
            </td>
          </tr>

          <!-- Summary -->
          <tr>
            <td style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.6;">
                Hi ${coachName},
              </p>
              <p style="margin: 12px 0 0; font-size: 15px; color: #374151; line-height: 1.6;">
                You have <strong>${totalAlerts} moderate alert${totalAlerts > 1 ? 's' : ''}</strong> from <strong>${alertsByPir.length} PIR${alertsByPir.length > 1 ? 's' : ''}</strong> that require your review.
                These alerts don't indicate immediate danger but should be reviewed within 24 hours.
              </p>
            </td>
          </tr>

          <!-- Alert Details by PIR -->
          ${pirSections}

          <!-- Action Button -->
          <tr>
            <td style="padding: 24px; text-align: center; background: #f9fafb; border-top: 1px solid #e5e7eb;">
              <a href="https://app.glrecoveryservices.com/coach/alerts?tier=moderate" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                Review All Alerts
              </a>
            </td>
          </tr>

          <!-- Guidance -->
          <tr>
            <td style="padding: 20px; border-top: 1px solid #e5e7eb;">
              <h3 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #374151;">Recommended Actions:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
                <li>Review each alert and PIR's recent activity</li>
                <li>Check in with PIRs showing concerning patterns</li>
                <li>Update safety plans if needed</li>
                <li>Acknowledge alerts after review</li>
              </ul>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center; background: #1f2937;">
              <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                This is your daily safety digest from GLRS Lighthouse.
              </p>
              <p style="margin: 8px 0 0; font-size: 13px; color: #9ca3af;">
                Sent at 8 PM Pacific Time
              </p>
              <p style="margin: 12px 0 0; font-size: 11px; color: #6b7280;">
                Guiding Light Recovery Services | app.glrecoveryservices.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

// =============================================================================
// MANUAL TRIGGER (for testing)
// =============================================================================

/**
 * Callable function to manually trigger digest
 * For testing and on-demand digest generation
 */
const triggerCrisisDigest = functions.https.onCall(async (data, context) => {
  // Verify caller is admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated')
  }

  // Get user role
  const userDoc = await db.collection('users').doc(context.auth.uid).get()
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User not found')
  }

  const userData = userDoc.data()
  if (!['admin', 'superadmin'].includes(userData.role)) {
    throw new functions.https.HttpsError('permission-denied', 'Must be admin to trigger digest')
  }

  console.log(`[CrisisDigest] Manual trigger by ${context.auth.uid}`)

  // Run digest logic
  const coaches = await getActiveCoaches()
  const results = await Promise.allSettled(coaches.map((coach) => processCoachDigest(coach)))

  const sent = results.filter((r) => r.status === 'fulfilled' && r.value.sent).length
  const skipped = results.filter((r) => r.status === 'fulfilled' && !r.value.sent).length
  const failed = results.filter((r) => r.status === 'rejected').length

  return {
    success: true,
    coachCount: coaches.length,
    sent,
    skipped,
    failed,
    message: `Digest sent to ${sent} coaches`,
  }
})

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  dailyCrisisDigest,
  triggerCrisisDigest,
  // Expose helpers for testing
  _internal: {
    getActiveCoaches,
    processCoachDigest,
    getCoachAlerts,
    groupAlertsByPir,
    generateDigestEmail,
    DIGEST_CONFIG,
  },
}
