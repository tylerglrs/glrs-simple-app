// ============================================================
// GLRS LIGHTHOUSE - FIREBASE CONFIGURATION
// ============================================================
// This file contains Firebase configuration and initialization
// Part of modular architecture - loads before all other modules
// ============================================================

// Initialize global namespace
window.GLRSApp = window.GLRSApp || {};

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAufSTHtCTFSEIeZ9YzvrULCnji5I-SMi0",
    authDomain: "glrs-pir-system.firebaseapp.com",
    projectId: "glrs-pir-system",
    storageBucket: "glrs-pir-system.firebasestorage.app",  // FIXED: Updated to new Firebase Storage URL format
    messagingSenderId: "830378577655",
    appId: "1:830378577655:web:ceb8e57c80f9b1cc028df2",  // FIXED: Updated to correct App ID
    measurementId: "G-W5JDNQ9J1X"  // ADDED: Analytics measurement ID
};

// Initialize Firebase (only if not already initialized)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized from config.js');
} else {
    console.log('✅ Firebase already initialized');
}

// Export Firebase services for global access
window.GLRSApp.auth = firebase.auth();
window.GLRSApp.db = firebase.firestore();
window.GLRSApp.storage = firebase.storage();

// Backward compatibility - maintain global references
window.auth = window.GLRSApp.auth;
window.db = window.GLRSApp.db;
window.storage = window.GLRSApp.storage;
window.firebase = firebase;

console.log('✅ config.js loaded - Firebase services available');
