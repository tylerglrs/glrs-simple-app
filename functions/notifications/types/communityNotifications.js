const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sendNotification } = require('../helpers/sendNotification');

// Phase 8: Like batching - 5-minute window for progressive batching
// Key format: `${messageId}_${postAuthorId}` to isolate likes per post per author
const recentPostLikes = new Map(); // `${messageId}_${postAuthorId}` → { likers: [{id, name}], firstLikerName: string, firstSent: bool, timeoutId }

/**
 * New Comment on User's Post
 * Firestore trigger when someone comments on a user's post
 * Notifies original post author about new comment
 */
exports.newCommentNotification = functions.firestore
    .document('communityMessages/{messageId}/comments/{commentId}')
    .onCreate(async (snap, context) => {
        const comment = snap.data();
        const messageId = context.params.messageId;
        const commentId = context.params.commentId;

        console.log(`New comment ${commentId} on message ${messageId}`);

        const db = admin.firestore();

        try {
            // Get the original post to find the author
            const messageDoc = await db.collection('communityMessages').doc(messageId).get();

            if (!messageDoc.exists) {
                console.warn(`Message ${messageId} not found`);
                return;
            }

            const message = messageDoc.data();
            const postAuthorId = message.userId;
            const commentAuthorId = comment.userId;

            // Don't notify user about their own comment
            if (postAuthorId === commentAuthorId) {
                console.log('Comment author is same as post author, skipping notification');
                return;
            }

            // Get comment author's name - Phase 5: No placeholder fallbacks
            const commentAuthorDoc = await db.collection('users').doc(commentAuthorId).get();

            if (!commentAuthorDoc.exists) {
                console.error(`Comment author ${commentAuthorId} not found`);
                return null;
            }

            const commentAuthorData = commentAuthorDoc.data();
            if (!commentAuthorData.firstName) {
                console.error(`Comment author ${commentAuthorId} missing firstName field`);
                return null;
            }

            const commentAuthorName = `${commentAuthorData.firstName} ${commentAuthorData.lastName || ''}`.trim();

            // Send notification to post author
            await sendNotification({
                userId: postAuthorId,
                type: 'new_comment',
                title: 'New Comment',
                message: `${commentAuthorName} commented on your post.`,
                category: 'community',
                priority: 'normal',
                actionUrl: '/community',
                data: {
                    messageId,
                    commentId,
                    commentAuthorId,
                    commentAuthorName,
                    commentText: comment.content?.substring(0, 100) || '',
                    postType: message.type || 'general',
                    roomId: message.roomId // For topic room posts
                },
                preferenceKey: 'communityComments'
            });

            console.log(`Notified ${postAuthorId} about new comment from ${commentAuthorName}`);

        } catch (error) {
            console.error('Error in newCommentNotification:', error);
            throw error;
        }
    });

/**
 * New Like on User's Post with Progressive Batching
 * Firestore trigger when someone likes a user's post
 * First like → immediate notification
 * Subsequent likes within 5-minute window → batched summary
 * Phase 8: November 23, 2025
 */
exports.newLikeNotification = functions.firestore
    .document('communityMessages/{messageId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const messageId = context.params.messageId;

        // Check if likes array changed and increased
        const beforeLikes = before.likes || [];
        const afterLikes = after.likes || [];

        if (afterLikes.length <= beforeLikes.length) {
            return; // No new likes
        }

        // Find who just liked the post (new user IDs in likes array)
        const newLikers = afterLikes.filter(userId => !beforeLikes.includes(userId));

        if (newLikers.length === 0) {
            return;
        }

        console.log(`${newLikers.length} new likes on message ${messageId}`);

        const db = admin.firestore();

        try {
            const postAuthorId = after.userId;
            const batchKey = `${messageId}_${postAuthorId}`;

            // Process each new liker
            for (const likerId of newLikers) {
                // Don't notify user about their own like
                if (postAuthorId === likerId) {
                    continue;
                }

                // Get liker's name - Phase 5: No placeholder fallbacks
                const likerDoc = await db.collection('users').doc(likerId).get();

                if (!likerDoc.exists) {
                    console.error(`Liker ${likerId} not found`);
                    continue; // Skip this liker
                }

                const likerData = likerDoc.data();
                if (!likerData.firstName) {
                    console.error(`Liker ${likerId} missing firstName field`);
                    continue; // Skip this liker
                }

                const likerName = `${likerData.firstName} ${likerData.lastName || ''}`.trim();

                // Initialize batch if this is the first like in the window
                if (!recentPostLikes.has(batchKey)) {
                    recentPostLikes.set(batchKey, {
                        likers: [],
                        firstLikerName: likerName,
                        firstSent: false,
                        timeoutId: null,
                        messageData: {
                            postType: after.type || 'general',
                            roomId: after.roomId
                        }
                    });
                }

                const batch = recentPostLikes.get(batchKey);

                // Add liker to batch
                batch.likers.push({ id: likerId, name: likerName });

                // If this is the first like, send immediate notification
                if (!batch.firstSent) {
                    await sendNotification({
                        userId: postAuthorId,
                        type: 'new_like',
                        title: 'New Like',
                        message: `${likerName} liked your post.`,
                        category: 'community',
                        priority: 'low',
                        actionUrl: '/community',
                        data: {
                            messageId,
                            likerId,
                            likerName,
                            totalLikes: afterLikes.length,
                            postType: batch.messageData.postType,
                            roomId: batch.messageData.roomId
                        },
                        preferenceKey: 'communityLikes'
                    });

                    batch.firstSent = true;
                    console.log(`Sent immediate like notification to ${postAuthorId} from ${likerName}`);
                }

                // Clear existing timeout and set new one
                if (batch.timeoutId) {
                    clearTimeout(batch.timeoutId);
                }

                // Set 5-minute timeout for batch summary
                batch.timeoutId = setTimeout(async () => {
                    const finalBatch = recentPostLikes.get(batchKey);

                    if (!finalBatch) {
                        console.log(`Batch ${batchKey} already processed`);
                        return;
                    }

                    // Clean up
                    recentPostLikes.delete(batchKey);

                    // If only 1 liker total, we already sent the notification
                    if (finalBatch.likers.length <= 1) {
                        console.log(`Only 1 liker for ${batchKey}, no batch summary needed`);
                        return;
                    }

                    // Send batch summary for multiple likers
                    const additionalCount = finalBatch.likers.length - 1;
                    const batchMessage = `${finalBatch.firstLikerName} and ${additionalCount} ${additionalCount === 1 ? 'other' : 'others'} liked your post.`;

                    try {
                        await sendNotification({
                            userId: postAuthorId,
                            type: 'new_like',
                            title: 'New Likes',
                            message: batchMessage,
                            category: 'community',
                            priority: 'low',
                            actionUrl: '/community',
                            data: {
                                messageId,
                                likerIds: finalBatch.likers.map(l => l.id),
                                likerNames: finalBatch.likers.map(l => l.name),
                                totalLikers: finalBatch.likers.length,
                                postType: finalBatch.messageData.postType,
                                roomId: finalBatch.messageData.roomId
                            },
                            preferenceKey: 'communityLikes'
                        });

                        console.log(`Sent batched like notification to ${postAuthorId}: ${finalBatch.likers.length} total likers`);
                    } catch (error) {
                        console.error(`Failed to send batched like notification to ${postAuthorId}:`, error);
                    }
                }, 300000); // 5-minute window (300,000ms)
            }

        } catch (error) {
            console.error('Error in newLikeNotification:', error);
            throw error;
        }
    });

/**
 * User Mentioned in Post/Comment
 * Firestore trigger when user is @mentioned in a post or comment
 * Notifies mentioned user
 */
exports.userMentionedNotification = functions.firestore
    .document('communityMessages/{messageId}')
    .onCreate(async (snap, context) => {
        const message = snap.data();
        const messageId = context.params.messageId;
        const content = message.content || '';

        // Extract @mentions from content (pattern: @userId or @username)
        const mentionPattern = /@(\w+)/g;
        const mentions = [...content.matchAll(mentionPattern)];

        if (mentions.length === 0) {
            return; // No mentions found
        }

        console.log(`Found ${mentions.length} mentions in message ${messageId}`);

        const db = admin.firestore();

        try {
            const authorId = message.userId;

            // Get author's name - Phase 5: No placeholder fallbacks
            const authorDoc = await db.collection('users').doc(authorId).get();

            if (!authorDoc.exists) {
                console.error(`Message author ${authorId} not found`);
                return null;
            }

            const authorData = authorDoc.data();
            if (!authorData.firstName) {
                console.error(`Message author ${authorId} missing firstName field`);
                return null;
            }

            const authorName = `${authorData.firstName} ${authorData.lastName || ''}`.trim();

            // Get all users to match mentions
            const usersSnapshot = await db.collection('users').get();
            const usersMap = new Map();

            usersSnapshot.forEach(doc => {
                const userData = doc.data();
                const username = userData.username || `${userData.firstName}${userData.lastName}`.toLowerCase();
                usersMap.set(username.toLowerCase(), doc.id);
            });

            // Notify each mentioned user
            for (const match of mentions) {
                const mentionedUsername = match[1].toLowerCase();
                const mentionedUserId = usersMap.get(mentionedUsername);

                if (!mentionedUserId) {
                    console.log(`User @${mentionedUsername} not found`);
                    continue;
                }

                // Don't notify user about mentioning themselves
                if (mentionedUserId === authorId) {
                    continue;
                }

                await sendNotification({
                    userId: mentionedUserId,
                    type: 'user_mentioned',
                    title: 'You Were Mentioned',
                    message: `${authorName} mentioned you in a post.`,
                    category: 'community',
                    priority: 'high',
                    actionUrl: '/community',
                    data: {
                        messageId,
                        authorId,
                        authorName,
                        mentionedUsername
                    },
                    preferenceKey: 'communityMentions'
                });

                console.log(`Notified ${mentionedUserId} about mention from ${authorName}`);
            }

        } catch (error) {
            console.error('Error in userMentionedNotification:', error);
            throw error;
        }
    });

/**
 * Also check for mentions in comments
 */
exports.userMentionedInCommentNotification = functions.firestore
    .document('communityMessages/{messageId}/comments/{commentId}')
    .onCreate(async (snap, context) => {
        const comment = snap.data();
        const messageId = context.params.messageId;
        const commentId = context.params.commentId;
        const content = comment.content || '';

        // Extract @mentions from content
        const mentionPattern = /@(\w+)/g;
        const mentions = [...content.matchAll(mentionPattern)];

        if (mentions.length === 0) {
            return;
        }

        console.log(`Found ${mentions.length} mentions in comment ${commentId}`);

        const db = admin.firestore();

        try {
            const authorId = comment.userId;

            // Get author's name - Phase 5: No placeholder fallbacks
            const authorDoc = await db.collection('users').doc(authorId).get();

            if (!authorDoc.exists) {
                console.error(`Comment author ${authorId} not found`);
                return null;
            }

            const authorData = authorDoc.data();
            if (!authorData.firstName) {
                console.error(`Comment author ${authorId} missing firstName field`);
                return null;
            }

            const authorName = `${authorData.firstName} ${authorData.lastName || ''}`.trim();

            // Get all users to match mentions
            const usersSnapshot = await db.collection('users').get();
            const usersMap = new Map();

            usersSnapshot.forEach(doc => {
                const userData = doc.data();
                const username = userData.username || `${userData.firstName}${userData.lastName}`.toLowerCase();
                usersMap.set(username.toLowerCase(), doc.id);
            });

            // Notify each mentioned user
            for (const match of mentions) {
                const mentionedUsername = match[1].toLowerCase();
                const mentionedUserId = usersMap.get(mentionedUsername);

                if (!mentionedUserId) {
                    console.log(`User @${mentionedUsername} not found`);
                    continue;
                }

                // Don't notify user about mentioning themselves
                if (mentionedUserId === authorId) {
                    continue;
                }

                await sendNotification({
                    userId: mentionedUserId,
                    type: 'user_mentioned',
                    title: 'You Were Mentioned',
                    message: `${authorName} mentioned you in a comment.`,
                    category: 'community',
                    priority: 'high',
                    actionUrl: '/community',
                    data: {
                        messageId,
                        commentId,
                        authorId,
                        authorName,
                        mentionedUsername
                    },
                    preferenceKey: 'communityMentions'
                });

                console.log(`Notified ${mentionedUserId} about mention in comment from ${authorName}`);
            }

        } catch (error) {
            console.error('Error in userMentionedInCommentNotification:', error);
            throw error;
        }
    });

/**
 * New Post in Followed Topic Room
 * Firestore trigger when new message posted in a topic room user follows
 * Notifies all followers of that topic room
 */
exports.newPostInTopicRoomNotification = functions.firestore
    .document('topicRooms/{roomId}/messages/{messageId}')
    .onCreate(async (snap, context) => {
        const message = snap.data();
        const roomId = context.params.roomId;
        const messageId = context.params.messageId;

        console.log(`New message ${messageId} in topic room ${roomId}`);

        const db = admin.firestore();

        try {
            // Get topic room details
            const roomDoc = await db.collection('topicRooms').doc(roomId).get();

            if (!roomDoc.exists) {
                console.warn(`Topic room ${roomId} not found`);
                return;
            }

            const room = roomDoc.data();
            const roomName = room.name || 'a topic room';
            const followers = room.followers || [];
            const authorId = message.userId;

            if (followers.length === 0) {
                console.log('No followers to notify');
                return;
            }

            // Get author's name - Phase 5: No placeholder fallbacks
            const authorDoc = await db.collection('users').doc(authorId).get();

            if (!authorDoc.exists) {
                console.error(`Topic room post author ${authorId} not found`);
                return null;
            }

            const authorData = authorDoc.data();
            if (!authorData.firstName) {
                console.error(`Topic room post author ${authorId} missing firstName field`);
                return null;
            }

            const authorName = `${authorData.firstName} ${authorData.lastName || ''}`.trim();

            const notificationPromises = [];

            // Notify each follower (except the post author)
            for (const followerId of followers) {
                // Don't notify the author about their own post
                if (followerId === authorId) {
                    continue;
                }

                notificationPromises.push(
                    sendNotification({
                        userId: followerId,
                        type: 'new_topic_post',
                        title: `New Post in ${roomName}`,
                        message: `${authorName} posted in ${roomName}.`,
                        category: 'community',
                        priority: 'normal',
                        actionUrl: '/community',
                        data: {
                            roomId,
                            messageId,
                            roomName,
                            postType: 'topic-room', // Topic room posts
                            authorId,
                            authorName,
                            messagePreview: message.content?.substring(0, 100) || ''
                        },
                        preferenceKey: 'communityTopicRooms'
                    }).catch(error => {
                        console.error(`Failed to notify follower ${followerId}:`, error);
                    })
                );
            }

            await Promise.all(notificationPromises);
            console.log(`Notified ${notificationPromises.length} followers about new post in ${roomName}`);

        } catch (error) {
            console.error('Error in newPostInTopicRoomNotification:', error);
            throw error;
        }
    });
