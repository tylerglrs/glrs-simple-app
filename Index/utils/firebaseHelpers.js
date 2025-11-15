// ============================================================
// FIREBASE QUERY HELPERS
// ============================================================
// Simple utility functions for common Firebase patterns
// Components still call Firebase directly - these just reduce boilerplate
// ============================================================

/**
 * Convert Firestore snapshot to array
 * @param {QuerySnapshot} snapshot - Firestore query snapshot
 * @returns {Array} Array of documents with id field
 */
window.snapshotToArray = (snapshot) => {
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

/**
 * Get today's date range for queries (midnight today)
 * @returns {Timestamp} Firestore timestamp for start of today
 */
window.getTodayStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return firebase.firestore.Timestamp.fromDate(today);
};

/**
 * Get end of today for date range queries
 * @returns {Timestamp} Firestore timestamp for end of today
 */
window.getTodayEnd = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return firebase.firestore.Timestamp.fromDate(today);
};

/**
 * Common error handler for Firebase operations
 * @param {Error} error - Error object
 * @param {string} context - Context description for logging
 * @returns {null}
 */
window.handleFirebaseError = (error, context) => {
    console.error(`Firebase error in ${context}:`, error);
    return null;
};

/**
 * Get date range for queries (start of day)
 * @param {Date} date - Date to convert
 * @returns {Timestamp} Firestore timestamp
 */
window.dateToTimestamp = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return firebase.firestore.Timestamp.fromDate(d);
};

console.log('✅ Firebase helpers loaded');
