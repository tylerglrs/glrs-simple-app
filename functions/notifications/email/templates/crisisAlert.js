/**
 * Crisis Alert Email Template
 * Phase 8C-2: Coach notification for crisis detection
 *
 * Red banner design for urgency, includes:
 * - PIR name and crisis tier
 * - Source and trigger information
 * - Flagged content (sanitized)
 * - Action buttons for review
 *
 * @module notifications/email/templates/crisisAlert
 */

/**
 * Generate crisis alert email HTML
 *
 * @param {Object} data - Template data
 * @param {string} data.pirName - PIR's display name
 * @param {string} data.tier - Crisis tier (CRITICAL, HIGH, MODERATE, STANDARD)
 * @param {string} data.source - Source of detection (check-in, reflection, chat, etc.)
 * @param {string} data.triggeredBy - What triggered the alert
 * @param {string} data.flaggedContent - The content that triggered the alert
 * @param {string} data.alertId - Alert document ID
 * @param {string} data.timestamp - ISO timestamp of alert
 * @param {string} data.reviewUrl - URL to review the alert
 * @param {string} data.pirProfileUrl - URL to PIR's profile
 * @returns {string} Rendered HTML email
 */
function crisisAlertTemplate({
  pirName,
  tier,
  source,
  triggeredBy,
  flaggedContent,
  alertId,
  timestamp,
  reviewUrl,
  pirProfileUrl,
}) {
  // Tier-specific styling
  const tierStyles = {
    CRITICAL: {
      headerBg: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      badgeBg: '#dc2626',
      borderColor: '#dc2626',
      emoji: '🚨',
    },
    HIGH: {
      headerBg: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      badgeBg: '#f97316',
      borderColor: '#f97316',
      emoji: '⚠️',
    },
    MODERATE: {
      headerBg: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
      badgeBg: '#eab308',
      borderColor: '#eab308',
      emoji: '📋',
    },
    STANDARD: {
      headerBg: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      badgeBg: '#6b7280',
      borderColor: '#6b7280',
      emoji: 'ℹ️',
    },
  }

  const style = tierStyles[tier] || tierStyles.STANDARD

  // Format timestamp
  const date = new Date(timestamp)
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  // Sanitize flagged content for email display
  const sanitizedContent = sanitizeForEmail(flaggedContent)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Crisis Alert: ${pirName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">

          <!-- URGENT BANNER -->
          <tr>
            <td style="background: ${style.headerBg}; padding: 24px; text-align: center;">
              <p style="margin: 0; font-size: 40px;">${style.emoji}</p>
              <h1 style="color: white; margin: 12px 0 0; font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                ${tier} Crisis Alert
              </h1>
              <p style="color: rgba(255,255,255,0.95); margin: 8px 0 0; font-size: 14px;">
                Immediate attention required
              </p>
            </td>
          </tr>

          <!-- PIR INFO -->
          <tr>
            <td style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Person in Recovery</p>
                    <p style="margin: 8px 0 0; font-size: 24px; font-weight: 700; color: #111827;">${pirName}</p>
                  </td>
                  <td style="text-align: right; vertical-align: top;">
                    <span style="display: inline-block; padding: 6px 16px; background: ${style.badgeBg}; color: white; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase;">
                      ${tier}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ALERT DETAILS -->
          <tr>
            <td style="padding: 24px;">
              <h2 style="margin: 0 0 16px; font-size: 16px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">
                Alert Details
              </h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Source</p>
                    <p style="margin: 4px 0 0; font-size: 15px; color: #111827; font-weight: 500;">${source}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Triggered By</p>
                    <p style="margin: 4px 0 0; font-size: 15px; color: #111827; font-weight: 500;">${triggeredBy}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Detected At</p>
                    <p style="margin: 4px 0 0; font-size: 15px; color: #111827; font-weight: 500;">${formattedDate} at ${formattedTime}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Alert ID</p>
                    <p style="margin: 4px 0 0; font-size: 13px; color: #6b7280; font-family: monospace;">${alertId}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FLAGGED CONTENT -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <h2 style="margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">
                Flagged Content
              </h2>
              <div style="padding: 16px; background: #fef2f2; border-left: 4px solid ${style.borderColor}; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.6; font-style: italic;">
                  "${sanitizedContent}"
                </p>
              </div>
              <p style="margin: 8px 0 0; font-size: 12px; color: #9ca3af;">
                This content triggered the safety detection system.
              </p>
            </td>
          </tr>

          <!-- ACTION BUTTONS -->
          <tr>
            <td style="padding: 24px; text-align: center; background: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #374151; font-weight: 600;">
                Please review this alert and take appropriate action
              </p>
              <table cellpadding="0" cellspacing="0" style="display: inline-block;">
                <tr>
                  <td style="padding-right: 8px;">
                    <a href="${reviewUrl}" style="display: inline-block; padding: 14px 24px; background: ${style.badgeBg}; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                      Review Alert
                    </a>
                  </td>
                  <td style="padding-left: 8px;">
                    <a href="${pirProfileUrl}" style="display: inline-block; padding: 14px 24px; background: white; color: #374151; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; border: 1px solid #d1d5db;">
                      View PIR Profile
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- RESPONSE GUIDANCE -->
          ${tier === 'CRITICAL' ? getCriticalGuidance() : ''}

          <!-- FOOTER -->
          <tr>
            <td style="padding: 20px; text-align: center; background: #1f2937;">
              <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                This is an automated safety alert from GLRS Lighthouse.
              </p>
              <p style="margin: 8px 0 0; font-size: 13px; color: #9ca3af;">
                Do not reply to this email. For urgent matters, contact your supervisor.
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

/**
 * Get critical response guidance section
 */
function getCriticalGuidance() {
  return `
          <!-- CRITICAL RESPONSE GUIDANCE -->
          <tr>
            <td style="padding: 24px; border-top: 1px solid #e5e7eb;">
              <div style="padding: 16px; background: #fef3c7; border-radius: 8px; border: 1px solid #f59e0b;">
                <h3 style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #92400e; text-transform: uppercase;">
                  Recommended Response Protocol
                </h3>
                <ol style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
                  <li>Attempt to contact the PIR immediately via phone</li>
                  <li>If no response, contact their emergency contact</li>
                  <li>Document all contact attempts in the alert notes</li>
                  <li>If unable to verify safety, consider wellness check</li>
                  <li>Update alert status once resolved</li>
                </ol>
              </div>
            </td>
          </tr>
`
}

/**
 * Sanitize content for safe email display
 * Removes potential XSS vectors and truncates long content
 */
function sanitizeForEmail(content) {
  if (!content) return '[No content]'

  // Remove HTML tags
  let sanitized = content.replace(/<[^>]*>/g, '')

  // Escape HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

  // Truncate if too long (preserve readability)
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500) + '...'
  }

  return sanitized
}

module.exports = {
  crisisAlertTemplate,
  sanitizeForEmail,
}
