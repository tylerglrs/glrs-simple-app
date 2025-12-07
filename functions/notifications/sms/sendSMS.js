/**
 * Twilio SMS Integration
 * Phase 8C-3: SMS notifications for CRITICAL crisis alerts
 *
 * Only used for CRITICAL tier alerts to minimize costs
 * and ensure the highest priority alerts reach coaches immediately.
 *
 * @module notifications/sms/sendSMS
 */

const functions = require('firebase-functions')
const admin = require('firebase-admin')

// Lazy load Twilio client to avoid initialization overhead
let twilioClient = null

/**
 * Get or initialize Twilio client
 * Uses Firebase Functions config for credentials
 */
function getTwilioClient() {
  if (twilioClient) {
    return twilioClient
  }

  // Get credentials from Firebase Functions config
  // Set with: firebase functions:config:set twilio.account_sid="..." twilio.auth_token="..." twilio.from_number="..."
  const config = functions.config().twilio || {}

  const accountSid = config.account_sid || process.env.TWILIO_ACCOUNT_SID
  const authToken = config.auth_token || process.env.TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured. Set twilio.account_sid and twilio.auth_token')
  }

  // Initialize Twilio client
  const twilio = require('twilio')
  twilioClient = twilio(accountSid, authToken)

  return twilioClient
}

/**
 * Get the Twilio "from" phone number
 */
function getFromNumber() {
  const config = functions.config().twilio || {}
  const fromNumber = config.from_number || process.env.TWILIO_FROM_NUMBER

  if (!fromNumber) {
    throw new Error('Twilio from_number not configured. Set twilio.from_number')
  }

  return fromNumber
}

// =============================================================================
// RATE LIMITING
// =============================================================================

const db = admin.firestore()

// Rate limit: Max 3 SMS per phone number per hour
const RATE_LIMIT = {
  maxMessages: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
}

/**
 * Check if sending SMS is within rate limits
 * @param {string} phoneNumber - The recipient phone number
 * @returns {Promise<boolean>} True if within limits
 */
async function checkRateLimit(phoneNumber) {
  const normalizedPhone = normalizePhoneNumber(phoneNumber)
  const cutoffTime = new Date(Date.now() - RATE_LIMIT.windowMs)

  try {
    const recentMessages = await db
      .collection('smsLogs')
      .where('to', '==', normalizedPhone)
      .where('sentAt', '>', cutoffTime)
      .get()

    if (recentMessages.size >= RATE_LIMIT.maxMessages) {
      console.warn(`[SMS] Rate limit exceeded for ${normalizedPhone}: ${recentMessages.size} messages in last hour`)
      return false
    }

    return true
  } catch (error) {
    // If we can't check rate limit, allow the message (fail open for safety)
    console.error('[SMS] Rate limit check failed:', error)
    return true
  }
}

// =============================================================================
// PHONE NUMBER UTILITIES
// =============================================================================

/**
 * Normalize phone number to E.164 format
 * @param {string} phone - Input phone number
 * @returns {string} Normalized phone number
 */
function normalizePhoneNumber(phone) {
  if (!phone) return null

  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '')

  // Handle US numbers without country code
  if (digits.length === 10) {
    digits = '1' + digits
  }

  // Add + prefix if not present
  if (!digits.startsWith('+')) {
    digits = '+' + digits
  }

  return digits
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
function isValidPhoneNumber(phone) {
  const normalized = normalizePhoneNumber(phone)
  if (!normalized) return false

  // Check length (E.164 format: +1XXXXXXXXXX for US)
  // Valid lengths: 11-15 digits including country code
  const digitsOnly = normalized.replace(/\D/g, '')
  return digitsOnly.length >= 10 && digitsOnly.length <= 15
}

// =============================================================================
// MAIN SMS FUNCTION
// =============================================================================

/**
 * Send SMS message via Twilio
 *
 * @param {Object} params - SMS parameters
 * @param {string} params.to - Recipient phone number
 * @param {string} params.message - Message content (max 1600 chars)
 * @param {string} [params.type] - Message type for logging
 * @returns {Promise<Object>} Result with messageSid
 */
async function sendSMS({ to, message, type = 'general' }) {
  const startTime = Date.now()

  try {
    // Validate phone number
    if (!isValidPhoneNumber(to)) {
      throw new Error(`Invalid phone number: ${to}`)
    }

    const normalizedTo = normalizePhoneNumber(to)

    // Check rate limit
    const withinLimit = await checkRateLimit(normalizedTo)
    if (!withinLimit) {
      throw new Error('Rate limit exceeded for this phone number')
    }

    // Truncate message if too long (Twilio max is 1600 for long messages)
    const truncatedMessage = message.length > 1600 ? message.substring(0, 1597) + '...' : message

    // Get Twilio client and send
    const client = getTwilioClient()
    const fromNumber = getFromNumber()

    const result = await client.messages.create({
      to: normalizedTo,
      from: fromNumber,
      body: truncatedMessage,
    })

    // Log successful send
    await logSMS({
      to: normalizedTo,
      type,
      messageSid: result.sid,
      status: result.status,
      success: true,
      timing: Date.now() - startTime,
    })

    console.log(`[SMS] Sent successfully: ${result.sid} (${Date.now() - startTime}ms)`)

    return {
      success: true,
      messageSid: result.sid,
      status: result.status,
      timing: Date.now() - startTime,
    }
  } catch (error) {
    console.error('[SMS] Send failed:', error)

    // Log failed attempt
    await logSMS({
      to: normalizePhoneNumber(to),
      type,
      success: false,
      error: error.message,
      timing: Date.now() - startTime,
    })

    throw error
  }
}

/**
 * Log SMS send attempt for rate limiting and audit
 */
async function logSMS({ to, type, messageSid, status, success, error, timing }) {
  try {
    await db.collection('smsLogs').add({
      to,
      type,
      messageSid: messageSid || null,
      status: status || null,
      success,
      error: error || null,
      timing,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
    })
  } catch (logError) {
    console.error('[SMS] Failed to log SMS:', logError)
  }
}

// =============================================================================
// BATCH SMS (for escalation scenarios)
// =============================================================================

/**
 * Send SMS to multiple recipients
 * Used for escalation when primary coach doesn't respond
 *
 * @param {Object} params - Batch parameters
 * @param {string[]} params.recipients - Array of phone numbers
 * @param {string} params.message - Message content
 * @param {string} [params.type] - Message type for logging
 * @returns {Promise<Object>} Results for each recipient
 */
async function sendBatchSMS({ recipients, message, type = 'batch' }) {
  const results = {
    success: [],
    failed: [],
    skipped: [],
  }

  // Filter to valid phone numbers only
  const validRecipients = recipients.filter((phone) => {
    if (isValidPhoneNumber(phone)) {
      return true
    }
    results.skipped.push({ phone, reason: 'Invalid phone number' })
    return false
  })

  // Send in parallel with Promise.allSettled
  const promises = validRecipients.map(async (phone) => {
    try {
      const result = await sendSMS({ to: phone, message, type })
      results.success.push({ phone, messageSid: result.messageSid })
    } catch (error) {
      results.failed.push({ phone, error: error.message })
    }
  })

  await Promise.allSettled(promises)

  console.log(
    `[SMS] Batch complete: ${results.success.length} sent, ${results.failed.length} failed, ${results.skipped.length} skipped`
  )

  return results
}

// =============================================================================
// STATUS CHECKING
// =============================================================================

/**
 * Check delivery status of a sent message
 * Can be called later to verify delivery
 *
 * @param {string} messageSid - Twilio message SID
 * @returns {Promise<Object>} Message status
 */
async function checkMessageStatus(messageSid) {
  try {
    const client = getTwilioClient()
    const message = await client.messages(messageSid).fetch()

    return {
      sid: message.sid,
      status: message.status,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
      dateSent: message.dateSent,
      dateUpdated: message.dateUpdated,
    }
  } catch (error) {
    console.error('[SMS] Status check failed:', error)
    throw error
  }
}

// =============================================================================
// WEBHOOK HANDLER (for delivery receipts)
// =============================================================================

/**
 * Process Twilio webhook for delivery status updates
 * Configure webhook URL in Twilio console: /api/sms/webhook
 *
 * @param {Object} webhookData - Data from Twilio webhook
 * @returns {Promise<void>}
 */
async function processDeliveryWebhook(webhookData) {
  const { MessageSid, MessageStatus, ErrorCode, ErrorMessage } = webhookData

  try {
    // Find the log entry for this message
    const logsSnapshot = await db.collection('smsLogs').where('messageSid', '==', MessageSid).limit(1).get()

    if (!logsSnapshot.empty) {
      const logDoc = logsSnapshot.docs[0]

      await logDoc.ref.update({
        deliveryStatus: MessageStatus,
        deliveryErrorCode: ErrorCode || null,
        deliveryErrorMessage: ErrorMessage || null,
        deliveryUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      console.log(`[SMS] Delivery status updated: ${MessageSid} -> ${MessageStatus}`)
    }
  } catch (error) {
    console.error('[SMS] Webhook processing failed:', error)
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  sendSMS,
  sendBatchSMS,
  checkMessageStatus,
  processDeliveryWebhook,
  // Utilities
  normalizePhoneNumber,
  isValidPhoneNumber,
  // For testing
  _internal: {
    getTwilioClient,
    getFromNumber,
    checkRateLimit,
    logSMS,
  },
}
