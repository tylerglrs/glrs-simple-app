 // ==========================================
    // GOOGLE CALENDAR INTEGRATION - PIR SIDE
    // ==========================================

    // Simple encryption/decryption for token storage

    // Load Google connection status on mount
    const loadGoogleConnection = async () => {
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            const data = userDoc.data();
            
            if (data?.googleConnected && data?.googleAccessToken) {
                setGoogleConnected(true);
                
                // Decrypt token
                const decrypted = window.GLRSApp.utils.decryptToken(data.googleAccessToken, user.uid);
                setGoogleToken(decrypted);
                setGoogleTokenExpiry(data.googleTokenExpiry);
                
                // Check if token is expired
                if (data.googleTokenExpiry && Date.now() > data.googleTokenExpiry) {
                }
            } else {
                setGoogleConnected(false);
                setGoogleToken(null);
            }
        } catch (error) {
            setGoogleConnected(false);
        }
    };

    // Check and auto-refresh Google token if needed
    const checkGoogleToken = async () => {
        try {
            if (!googleConnected || !googleToken) {
                return { 
                    valid: false, 
                    error: 'Google Calendar not connected. Please connect in Settings.' 
                };
            }
            
            // Check if token is expired or will expire in next 5 minutes
            const expiryBuffer = 5 * 60 * 1000; // 5 minutes
            const isExpired = googleTokenExpiry && (Date.now() + expiryBuffer) > googleTokenExpiry;
            
            if (isExpired) {
                
                // Show user-friendly message
                window.GLRSApp.utils.showNotification('Refreshing Google Calendar connection...', 'info');
                
                // Attempt to refresh token
                const refreshed = await refreshGoogleToken();
                
                if (!refreshed) {
                    // Show error banner
                    window.GLRSApp.utils.showNotification(
                        'Google Calendar connection expired. Please reconnect in Settings.', 
                        'error'
                    );
                    return { 
                        valid: false, 
                        error: 'Token refresh failed. Please reconnect Google Calendar.' 
                    };
                }
                
                return { valid: true, token: googleToken };
            }
            
            return { valid: true, token: googleToken };
            
        } catch (error) {
            window.GLRSApp.utils.showNotification('Error validating Google Calendar connection', 'error');
            return { 
                valid: false, 
                error: 'Failed to validate token: ' + error.message 
            };
        }
    };

    // Refresh Google token
    const refreshGoogleToken = async () => {
        try {
            // For OAuth tokens, we need to re-authenticate
            // Google doesn't provide refresh tokens for browser-based OAuth
            
            // Attempt silent refresh if possible
            if (typeof google !== 'undefined' && google.accounts) {
                // This won't work automatically - user must re-consent
                return false;
            }
            
            return false;
        } catch (error) {
            return false;
        }
    };

    // Connect Google Calendar
    const connectGoogleCalendar = async () => {
        setSyncingGoogle(true);
        try {
            
            // Check if Google Identity Services loaded
            if (typeof google === 'undefined' || !google.accounts) {
                throw new Error('Google Identity Services not loaded. Please refresh the page.');
            }
            
            // Initialize token client with CALENDAR ONLY scope
            const tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: '457406864879-k1sunucuqofe22m5rg93hvo6nngiqh0u.apps.googleusercontent.com',
                scope: 'https://www.googleapis.com/auth/calendar.events',
                callback: async (tokenResponse) => {
                    try {
                        
                        if (tokenResponse.error) {
                            throw new Error(tokenResponse.error);
                        }
                        
                        if (!tokenResponse.access_token) {
                            throw new Error('No access token received');
                        }
                        
                        // Encrypt token before storing
                        const encryptedToken = window.GLRSApp.utils.encryptToken(tokenResponse.access_token, user.uid);
                        
                        
                        // Save to Firebase
                        await db.collection('users').doc(user.uid).update({
                            googleConnected: true,
                            googleAccessToken: encryptedToken,
                            googleTokenExpiry: Date.now() + (tokenResponse.expires_in * 1000),
                            googleConnectedAt: firebase.firestore.FieldValue.serverTimestamp(),
                            calendarSyncEnabled: false // Default to off, user must enable
                        });
                        
                        // Update local state
                        setGoogleConnected(true);
                        setGoogleToken(tokenResponse.access_token);
                        setGoogleTokenExpiry(Date.now() + (tokenResponse.expires_in * 1000));
                        
                        window.GLRSApp.utils.showNotification('Google Calendar Connected!', 'success');
                        
                        // Close modal and reload
                        setShowModal(null);
                        setTimeout(() => loadGoogleConnection(), 500);
                        
                    } catch (error) {
                        window.GLRSApp.utils.showNotification('Failed to save connection: ' + error.message, 'error');
                    } finally {
                        setSyncingGoogle(false);
                    }
                },
            });
            
            // Request access token
            tokenClient.requestAccessToken({ prompt: 'consent' });
            
        } catch (error) {
            window.GLRSApp.utils.showNotification('Failed to connect: ' + error.message, 'error');
            setSyncingGoogle(false);
        }
    };

    // Disconnect Google Calendar
    const disconnectGoogleCalendar = async () => {
        if (!confirm('Disconnect Google Calendar?\n\nThis will remove:\n• Calendar sync\n• All synced milestones\n\nYou can reconnect anytime.')) {
            return;
        }
        
        setSyncingGoogle(true);
        try {
            
            // Revoke token if available
            if (googleToken && typeof google !== 'undefined' && google.accounts) {
                google.accounts.oauth2.revoke(googleToken, () => {
                });
            }
            
            // Remove from Firebase
            await db.collection('users').doc(user.uid).update({
                googleConnected: false,
                googleAccessToken: firebase.firestore.FieldValue.delete(),
                googleTokenExpiry: firebase.firestore.FieldValue.delete(),
                calendarSyncEnabled: false,
                milestoneCalendarEvents: firebase.firestore.FieldValue.delete(),
                googleDisconnectedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update local state
            setGoogleConnected(false);
            setGoogleToken(null);
            setGoogleTokenExpiry(null);
            
            window.GLRSApp.utils.showNotification('Google Calendar disconnected', 'success');
            setShowModal(null);
            
        } catch (error) {
            window.GLRSApp.utils.showNotification('Failed to disconnect: ' + error.message, 'error');
        } finally {
            setSyncingGoogle(false);
        }
    };

    // ==========================================
    // END GOOGLE CALENDAR INTEGRATION
    // ==========================================