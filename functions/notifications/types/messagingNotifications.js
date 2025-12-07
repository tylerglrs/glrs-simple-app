const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sendNotification } = require('../helpers/sendNotification');
const { sendEmail, renderTemplate } = require('../email/sendEmail');

/**
 * New Message Notification
 * Firestore trigger when new message is created
 * Notifies recipient (PIR or Coach) about new message
 */
exports.newMessageNotification = functions.firestore
    .document('messages/{messageId}')
    .onCreate(async (snap, context) => {
        const message = snap.data();
        const messageId = context.params.messageId;

        console.log(`New message ${messageId} from ${message.senderId} to ${message.recipientId}`);

        const db = admin.firestore();

        try {
            // Get sender and recipient data
            const senderDoc = await db.collection('users').doc(message.senderId).get();
            const recipientDoc = await db.collection('users').doc(message.recipientId).get();

            if (!senderDoc.exists || !recipientDoc.exists) {
                console.warn('Sender or recipient not found');
                return;
            }

            const sender = senderDoc.data();
            const recipient = recipientDoc.data();

            // Phase 5: Validate firstName exists - no placeholders
            if (!sender.firstName) {
                console.error(`Sender ${message.senderId} missing firstName field`);
                return null;
            }

            // Determine sender's role for notification text
            const senderName = `${sender.firstName} ${sender.lastName || ''}`.trim();
            const senderRole = sender.role || 'user';

            let notificationTitle = 'New Message';
            let notificationMessage = `${senderName} sent you a message.`;

            // Customize message based on roles
            if (senderRole === 'coach' || senderRole === 'admin') {
                notificationTitle = 'Message from Your Coach';
                notificationMessage = `${senderName} sent you a message: "${message.content?.substring(0, 50) || ''}${message.content?.length > 50 ? '...' : ''}"`;
            } else {
                // PIR sending to coach
                notificationTitle = 'New Message from PIR';
                notificationMessage = `${senderName} sent you a message: "${message.content?.substring(0, 50) || ''}${message.content?.length > 50 ? '...' : ''}"`;
            }

            // Send in-app notification
            await sendNotification({
                userId: message.recipientId,
                type: 'new_message',
                title: notificationTitle,
                message: notificationMessage,
                category: 'messaging',
                priority: 'high',
                actionUrl: '/messages',
                data: {
                    messageId,
                    senderId: message.senderId,
                    senderName,
                    conversationId: message.conversationId,
                    messagePreview: message.content?.substring(0, 100) || ''
                },
                preferenceKey: 'messageAlerts'
            });

            // Mark message as delivered
            await snap.ref.update({
                delivered: true,
                deliveredAt: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log(`Notified ${message.recipientId} about new message from ${senderName}`);

        } catch (error) {
            console.error('Error in newMessageNotification:', error);
            throw error;
        }
    });

/**
 * Message Read Receipt Notification
 * Firestore trigger when message is marked as read
 * Notifies sender that their message was read
 */
exports.messageReadNotification = functions.firestore
    .document('messages/{messageId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const messageId = context.params.messageId;

        // Only trigger if message was just marked as read
        if (before.read === false && after.read === true) {
            console.log(`Message ${messageId} was read`);

            const db = admin.firestore();

            try {
                // Get sender and reader data
                const senderDoc = await db.collection('users').doc(after.senderId).get();
                const readerDoc = await db.collection('users').doc(after.recipientId).get();

                if (!senderDoc.exists || !readerDoc.exists) {
                    console.warn('Sender or reader not found');
                    return;
                }

                const sender = senderDoc.data();
                const reader = readerDoc.data();

                // Phase 5: Validate firstName exists - no placeholders
                if (!reader.firstName) {
                    console.error(`Reader ${after.recipientId} missing firstName field`);
                    return null;
                }

                const readerName = `${reader.firstName} ${reader.lastName || ''}`.trim();

                // Send read receipt notification to sender
                await sendNotification({
                    userId: after.senderId,
                    type: 'message_read',
                    title: 'Message Read',
                    message: `${readerName} read your message.`,
                    category: 'messaging',
                    priority: 'low',
                    actionUrl: '/messages',
                    data: {
                        messageId,
                        readerId: after.recipientId,
                        readerName,
                        conversationId: after.conversationId,
                        readAt: after.readAt
                    },
                    preferenceKey: 'messageReadReceipts' // New optional toggle
                });

                console.log(`Notified ${after.senderId} that ${readerName} read their message`);

            } catch (error) {
                console.error('Error in messageReadNotification:', error);
                throw error;
            }
        }
    });

/**
 * Unread Message Reminder
 * Scheduled function running every hour
 * Sends reminder for messages unread for 24+ hours
 * Escalates to email if still unread
 */
exports.unreadMessageReminder = functions.pubsub
    .schedule('0 * * * *') // Every hour
    .timeZone('UTC')
    .onRun(async (context) => {
        console.log('Running unread message reminder function');

        const db = admin.firestore();
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        try {
            // Find messages that are unread and older than 24 hours
            const unreadMessagesSnapshot = await db.collection('messages')
                .where('read', '==', false)
                .where('createdAt', '<', twentyFourHoursAgo)
                .where('reminderSent', '==', false) // Only send reminder once
                .get();

            console.log(`Found ${unreadMessagesSnapshot.size} unread messages older than 24 hours`);

            const reminderPromises = [];

            for (const messageDoc of unreadMessagesSnapshot.docs) {
                const message = messageDoc.data();
                const messageId = messageDoc.id;

                // Get sender and recipient data
                const senderDoc = await db.collection('users').doc(message.senderId).get();
                const recipientDoc = await db.collection('users').doc(message.recipientId).get();

                if (!senderDoc.exists || !recipientDoc.exists) {
                    continue;
                }

                const sender = senderDoc.data();
                const recipient = recipientDoc.data();

                // Phase 5: Validate firstName exists - no placeholders
                if (!sender.firstName) {
                    console.error(`Sender ${message.senderId} missing firstName field`);
                    continue; // Skip this reminder
                }

                const senderName = `${sender.firstName} ${sender.lastName || ''}`.trim();

                // Count total unread messages from this sender
                const unreadFromSenderSnapshot = await db.collection('messages')
                    .where('recipientId', '==', message.recipientId)
                    .where('senderId', '==', message.senderId)
                    .where('read', '==', false)
                    .get();

                const unreadCount = unreadFromSenderSnapshot.size;

                // Send in-app reminder
                reminderPromises.push(
                    sendNotification({
                        userId: message.recipientId,
                        type: 'unread_message_reminder',
                        title: 'Unread Messages',
                        message: `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''} from ${senderName}.`,
                        category: 'messaging',
                        priority: 'normal',
                        actionUrl: '/messages',
                        data: {
                            senderId: message.senderId,
                            senderName,
                            unreadCount,
                            oldestMessageId: messageId
                        },
                        preferenceKey: 'messageAlerts'
                    }).catch(error => {
                        console.error(`Failed to send unread reminder to ${message.recipientId}:`, error);
                    })
                );

                // Send email escalation
                if (recipient.email && recipient.notifications?.messageAlerts !== false) {
                    const emailSubject = `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''} from ${senderName}`;
                    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Unread Messages</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; text-align: center;">
              <p style="margin: 0; font-size: 16px; color: #111827;">You have <strong>${unreadCount}</strong> unread message${unreadCount > 1 ? 's' : ''} from</p>
              <p style="margin: 10px 0 30px; font-size: 20px; font-weight: 700; color: #ec4899;">${senderName}</p>
              <p style="margin: 0 0 30px; font-size: 14px; color: #6b7280; line-height: 1.6;">These messages have been waiting for over 24 hours. Check your messages to stay connected with your recovery support team.</p>
              <a href="https://app.glrecoveryservices.com/messages" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                Read Messages
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; text-align: center; background: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 13px; color: #6b7280;">You're receiving this because you have unread messages on GLRS Lighthouse.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
                    `;

                    reminderPromises.push(
                        sendEmail({
                            to: recipient.email,
                            subject: emailSubject,
                            html: emailHtml
                        }).catch(error => {
                            console.error(`Failed to send email reminder to ${recipient.email}:`, error);
                        })
                    );
                }

                // Mark reminder as sent
                reminderPromises.push(
                    messageDoc.ref.update({
                        reminderSent: true,
                        reminderSentAt: admin.firestore.FieldValue.serverTimestamp()
                    }).catch(error => {
                        console.error(`Failed to update message ${messageId}:`, error);
                    })
                );

                console.log(`Sent unread reminder for message ${messageId} to ${message.recipientId}`);
            }

            await Promise.all(reminderPromises);
            console.log(`Sent ${reminderPromises.length / 2} unread message reminders (in-app + email)`);

        } catch (error) {
            console.error('Error in unreadMessageReminder:', error);
            throw error;
        }
    });

/**
 * Conversation Thread Grouping Helper
 * Gets or creates a conversation ID for two users
 */
async function getConversationId(userId1, userId2) {
    const db = admin.firestore();

    // Sort user IDs to ensure consistent conversation ID
    const sortedIds = [userId1, userId2].sort();
    const conversationId = `${sortedIds[0]}_${sortedIds[1]}`;

    // Check if conversation exists
    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();

    if (!conversationDoc.exists) {
        // Create new conversation
        await conversationRef.set({
            participants: sortedIds,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
            lastMessage: null,
            unreadCount: {
                [userId1]: 0,
                [userId2]: 0
            }
        });
    }

    return conversationId;
}

/**
 * Update Conversation Metadata
 * Firestore trigger to keep conversation metadata up-to-date
 */
exports.updateConversationMetadata = functions.firestore
    .document('messages/{messageId}')
    .onCreate(async (snap, context) => {
        const message = snap.data();

        try {
            const conversationId = await getConversationId(message.senderId, message.recipientId);

            const db = admin.firestore();
            const conversationRef = db.collection('conversations').doc(conversationId);

            // Update conversation metadata
            await conversationRef.update({
                lastMessageAt: message.createdAt || admin.firestore.FieldValue.serverTimestamp(),
                lastMessage: {
                    content: message.content?.substring(0, 100) || '',
                    senderId: message.senderId,
                    createdAt: message.createdAt
                },
                [`unreadCount.${message.recipientId}`]: admin.firestore.FieldValue.increment(1)
            });

            console.log(`Updated conversation ${conversationId} metadata`);

        } catch (error) {
            console.error('Error updating conversation metadata:', error);
            throw error;
        }
    });

/**
 * Reset Unread Count
 * Firestore trigger when message is marked as read
 * Decrements unread count for recipient
 */
exports.decrementUnreadCount = functions.firestore
    .document('messages/{messageId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();

        // Only trigger if message was just marked as read
        if (before.read === false && after.read === true) {
            try {
                const conversationId = await getConversationId(after.senderId, after.recipientId);

                const db = admin.firestore();
                const conversationRef = db.collection('conversations').doc(conversationId);

                // Decrement unread count for recipient
                await conversationRef.update({
                    [`unreadCount.${after.recipientId}`]: admin.firestore.FieldValue.increment(-1)
                });

                console.log(`Decremented unread count for ${after.recipientId} in conversation ${conversationId}`);

            } catch (error) {
                console.error('Error decrementing unread count:', error);
                throw error;
            }
        }
    });

module.exports.getConversationId = getConversationId;
