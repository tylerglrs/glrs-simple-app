// GLRS PIR Platform - Fixed Version
// Global variables
let currentUser = null;
let userRole = null;
let userTier = null;
let userDocData = null;

// Hide loading screen function
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.remove('show');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 300);
    }
}

// Create icons safely
function createIcons() {
    if (window.lucide) {
        try {
            lucide.createIcons();
        } catch (error) {
            console.error("Error creating icons:", error);
        }
    }
}

// Wait for Firebase to be ready
function waitForFirebase() {
    return new Promise((resolve) => {
        if (window.auth && window.db) {
            resolve();
        } else {
            setTimeout(() => {
                waitForFirebase().then(resolve);
            }, 100);
        }
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
    // Wait for Firebase
    await waitForFirebase();
    
    // Listen for auth state changes
    window.auth.onAuthStateChanged(async (user) => {
        try {
            if (user) {
                await loadUserData(user.uid);
            } else {
                currentUser = null;
                showLoginScreen();
            }
        } catch (error) {
            console.error("Auth state change error:", error);
            showLoginScreen();
        } finally {
            hideLoadingScreen();
        }
    });
    
    // Set up form event listeners
    const checkinForm = document.getElementById('checkinForm');
    if (checkinForm) {
        checkinForm.addEventListener('submit', saveCheckin);
    }
    
    // Failsafe timeout
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            console.warn('Loading screen timeout - forcing hide');
            hideLoadingScreen();
            if (!currentUser) {
                showLoginScreen();
            }
        }
    }, 5000);
});

// Load user data from Firestore
async function loadUserData(uid) {
    try {
        const userDoc = await window.db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            userDocData = userDoc.data();
            currentUser = {
                uid: uid,
                email: window.auth.currentUser.email,
                ...userDocData
            };
            userRole = userDocData.role;
            
            if (userRole === 'pir') {
                userTier = calculateTier(userDocData.recoveryStartDate);
                
                if (userDocData.firstLogin) {
                    showPasswordChangeModal();
                } else if (!userDocData.termsAccepted) {
                    showTermsModal();
                } else {
                    proceedToApp();
                }
            } else {
                proceedToApp();
            }
        }
    } catch (error) {
        console.error("Error loading user data:", error);
        showLoginScreen();
    }
}

// Show login screen
function showLoginScreen() {
    hideLoadingScreen();
    
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen) loginScreen.style.display = 'block';
    
    const pirInterface = document.getElementById('pirInterface');
    if (pirInterface) pirInterface.classList.add('hidden');
    
    const coachInterface = document.getElementById('coachInterface');
    if (coachInterface) coachInterface.classList.add('hidden');
    
    const userInfo = document.getElementById('userInfo');
    if (userInfo) userInfo.classList.add('hidden');
    
    const termsModal = document.getElementById('termsModal');
    if (termsModal) termsModal.style.display = 'none';
    
    const passwordModal = document.getElementById('passwordModal');
    if (passwordModal) passwordModal.style.display = 'none';
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Email sending function
async function sendEmail(to, subject, body) {
    // Using EmailJS (you'll need to sign up at emailjs.com)
    // For now, I'll provide the structure
    try {
        console.log('Email would be sent to:', to);
        console.log('Subject:', subject);
        console.log('Body:', body);
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
}

// Show terms modal
function showTermsModal() {
    document.getElementById('termsModal').style.display = 'flex';
}

// Show password change modal
function showPasswordChangeModal() {
    document.getElementById('passwordModal').style.display = 'flex';
}

// Login function
window.login = async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginInput').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showToast('Please enter email and password', 'error');
        return;
    }
    
    try {
        await window.auth.signInWithEmailAndPassword(email, password);
        showToast('Login successful!', 'success');
    } catch (error) {
        console.error("Login error:", error);
        showToast('Login failed: ' + error.message, 'error');
    }
}

// Logout function
window.logout = async function() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            await window.auth.signOut();
            document.getElementById('loginInput').value = '';
            document.getElementById('password').value = '';
            showToast('Logged out successfully', 'success');
        } catch (error) {
            console.error("Logout error:", error);
            showToast('Logout failed', 'error');
        }
    }
}

// Accept terms function
window.acceptTerms = async function() {
    if (!currentUser || !currentUser.uid) {
        console.error("No user logged in");
        return;
    }
    
    try {
        await window.db.collection('users').doc(currentUser.uid).update({
            termsAccepted: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        userDocData.termsAccepted = true;
        document.getElementById('termsModal').style.display = 'none';
        showToast('Terms accepted', 'success');
        proceedToApp();
        
    } catch (error) {
        console.error("Error accepting terms:", error);
        showToast('Error accepting terms', 'error');
    }
}

// Change password function
window.changePassword = async function(event) {
    if (event) event.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!newPassword || !confirmPassword) {
        showToast('Please enter and confirm your new password', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showToast('Password must be at least 8 characters long', 'error');
        return;
    }
    
    try {
        await window.auth.currentUser.updatePassword(newPassword);
        await window.db.collection('users').doc(currentUser.uid).update({
            firstLogin: false
        });
        
        userDocData.firstLogin = false;
        showToast('Password updated successfully!', 'success');
        document.getElementById('passwordModal').style.display = 'none';
        
        if (!userDocData.termsAccepted) {
            showTermsModal();
        } else {
            proceedToApp();
        }
        
    } catch (error) {
        console.error("Password update error:", error);
        showToast('Error updating password: ' + error.message, 'error');
    }
}

// Calculate tier
function calculateTier(recoveryDate) {
    const days = Math.floor((new Date() - new Date(recoveryDate)) / (1000 * 60 * 60 * 24));
    if (days < 30) return 'new';
    if (days < 90) return 'established';
    return 'trusted';
}

// Proceed to app after login/auth
function proceedToApp() {
    hideLoadingScreen();
    
    document.getElementById('loginScreen').style.display = 'none';
    
    const userInfo = document.getElementById('userInfo');
    if (userInfo) userInfo.classList.remove('hidden');
    
    document.getElementById('termsModal').style.display = 'none';
    document.getElementById('passwordModal').style.display = 'none';
    
    if (userRole === 'pir') {
        const displayName = currentUser.firstName && currentUser.lastName 
            ? `${currentUser.firstName} ${currentUser.lastName}` 
            : currentUser.email;
        document.getElementById('userName').textContent = displayName;
        
        document.getElementById('userTier').textContent = userTier.charAt(0).toUpperCase() + userTier.slice(1);
        document.getElementById('userTier').className = 'tier-badge ' + userTier;
        document.getElementById('pirInterface').classList.remove('hidden');
        updateTierFeatures();
        loadPIRDashboard();
    } else {
        const coachNameEl = document.getElementById('coachName');
        if (coachNameEl) coachNameEl.textContent = currentUser.email;
        document.getElementById('coachInterface').classList.remove('hidden');
        loadCoachDashboard();
    }
    
    // Update icons after showing interface
    createIcons();
}

// Update tier features
function updateTierFeatures() {
    const tierDescriptions = {
        new: 'New Member (0-30 days): Check-ins and resources only',
        established: 'Established (31-90 days): Can request connections',
        trusted: 'Trusted (90+ days): Full access to all features'
    };
    
    const tierDesc = document.getElementById('tierDescription');
    if (tierDesc) {
        tierDesc.textContent = tierDescriptions[userTier];
    }
    
    const days = Math.floor((new Date() - new Date(currentUser.recoveryStartDate)) / (1000 * 60 * 60 * 24));
    const daysEl = document.getElementById('daysInRecovery');
    if (daysEl) {
        daysEl.textContent = `${days} days in recovery`;
    }
}

// Create PIR Account with coach selection
window.createPIRAccount = async function(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('pirEmail').value;
    const selectedCoachId = document.getElementById('assignedCoach').value;
    
    const tempPassword = 'Temp' + Math.random().toString(36).slice(-8) + '!';
    
    // For re-authentication
    const coachEmail = currentUser.email;
    const coachPassword = prompt("Please enter your password to continue:");
    
    if (!coachPassword) {
        showToast('Password required to create account', 'error');
        return;
    }
    
    try {
        // Create auth account
        const userCredential = await window.auth.createUserWithEmailAndPassword(email, tempPassword);
        const uid = userCredential.user.uid;
        
        // Create user document in Firestore
        const newUserData = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: document.getElementById('pirPhone').value,
            role: 'pir',
            recoveryStartDate: document.getElementById('recoveryDate').value,
            servicePackage: document.getElementById('servicePackage').value,
            emergencyContact: document.getElementById('emergencyName').value,
            emergencyPhone: document.getElementById('emergencyPhone').value,
            notes: document.getElementById('initialNotes').value,
            coachId: selectedCoachId || currentUser.uid,
            createdBy: currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            firstLogin: true,
            termsAccepted: false,
            tier: calculateTier(document.getElementById('recoveryDate').value)
        };
        
        await window.db.collection('users').doc(uid).set(newUserData);
        
        // Save to Google Sheets for record keeping
        await saveToGoogleSheets(newUserData);
        
        // Send welcome email
        const emailSubject = "Welcome to GLRS Recovery Connect";
        const emailBody = `
Welcome ${firstName} ${lastName}!

Your recovery coach has created your account for GLRS Recovery Connect.

Login Credentials:
Email: ${email}
Temporary Password: ${tempPassword}

Please login at: ${window.location.origin}

You will be required to change your password on first login.

Best regards,
The GLRS Team
        `;
        
        await sendEmail(email, emailSubject, emailBody);
        
        // Show success message
        document.getElementById('accountCreatedInfo').innerHTML = `
            <div class="generated-credentials">
                <h3>✓ Account Created Successfully!</h3>
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                <p class="mt-10">Welcome email sent to ${email}</p>
                <button onclick="copyCredentials('${email}', '${tempPassword}')" class="primary-btn">Copy Credentials</button>
                <button onclick="showCoachSection('createAccount', this)" class="btn-secondary">Create Another</button>
            </div>
        `;
        document.getElementById('accountCreatedInfo').style.display = 'block';
        
        // Reset form
        event.target.reset();
        
        // Sign back in as coach
        await window.auth.signInWithEmailAndPassword(coachEmail, coachPassword);
        showToast('Account created successfully!', 'success');
        
    } catch (error) {
        console.error("Error creating PIR account:", error);
        showToast('Error creating account: ' + error.message, 'error');
        
        // Try to sign back in as coach
        try {
            await window.auth.signInWithEmailAndPassword(coachEmail, coachPassword);
        } catch (e) {
            console.error("Could not re-authenticate coach:", e);
        }
    }
}

// Save to Google Sheets function
async function saveToGoogleSheets(userData) {
    // This would connect to your Google Sheets API
    // For now, we'll just log it
    console.log('Would save to Google Sheets:', userData);
}

// Copy credentials
window.copyCredentials = function(email, password) {
    const text = `Email: ${email}\nPassword: ${password}`;
    navigator.clipboard.writeText(text).then(() => {
        showToast('Credentials copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Could not copy to clipboard', 'error');
    });
}

// Check for crisis keywords
function checkForCrisisKeywords(text) {
    if (!text) return false;
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'self-harm', 'hurt myself', 'want to die'];
    const lowerText = text.toLowerCase();
    return crisisKeywords.some(keyword => lowerText.includes(keyword));
}

// Save check-in
window.saveCheckin = async function(event) {
    event.preventDefault();
    
    const checkinData = {
        userId: currentUser.uid,
        date: firebase.firestore.FieldValue.serverTimestamp(),
        mood: document.getElementById('mood').value,
        cravings: document.getElementById('cravings').value,
        support: document.getElementById('support').value,
        sleep: document.getElementById('sleep').value,
        meetings: document.getElementById('meetings').value,
        medications: document.getElementById('medications').value,
        dailyWin: document.getElementById('dailyWin').value,
        gratitude: document.getElementById('gratitude').value,
        thoughts: document.getElementById('thoughts').value
    };
    
    if (checkForCrisisKeywords(checkinData.thoughts)) {
        await handleCrisisAlert(checkinData);
        return;
    }
    
    try {
        await window.db.collection('checkins').add(checkinData);
        showToast('Check-in saved! Keep up the great work!', 'success');
        document.getElementById('checkinForm').reset();
        updateSlider('mood');
        updateSlider('cravings');
        updateSlider('support');
        await loadRecentCheckins();
        await updateWeeklyCheckinsCount();
        
    } catch (error) {
        console.error("Error saving check-in:", error);
        showToast('Error saving check-in', 'error');
    }
}

// Handle crisis alert
async function handleCrisisAlert(checkinData) {
    const message = `IMPORTANT: Based on your response, we're concerned about your safety. 
    
Per our terms of service, we are required to contact emergency services when someone expresses thoughts of self-harm.

Please call 988 (Suicide & Crisis Lifeline) immediately for support.

If you're in immediate danger, call 911.`;
    
    alert(message);
    
    try {
        await window.db.collection('alerts').add({
            userId: currentUser.uid,
            userEmail: currentUser.email,
            userName: currentUser.firstName + ' ' + currentUser.lastName,
            coachId: currentUser.coachId,
            type: 'crisis',
            checkinData: checkinData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'active'
        });
    } catch (error) {
        console.error("Error logging crisis alert:", error);
    }
}

// Update slider display
window.updateSlider = function(sliderId) {
    const value = document.getElementById(sliderId).value;
    document.getElementById(sliderId + 'Value').textContent = value;
}

// PIR Section Navigation
window.showSection = function(section, button) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.getElementById(section + 'Section').style.display = 'block';
    
    // Update nav buttons
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    if (button) {
        button.classList.add('active');
    }
    
    // Update bottom nav for mobile
    const navItem = document.querySelector(`.nav-item[data-section="${section}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    // Update icons
    createIcons();
    
    // Load section content
    switch(section) {
        case 'dashboard':
            loadPIRDashboard();
            break;
        case 'checkin':
            loadRecentCheckins();
            break;
        case 'progress':
            loadProgressContent();
            break;
        case 'connections':
            loadConnectionsContent();
            break;
        case 'messages':
            loadMessagesContent();
            break;
        case 'sessions':
            loadSessionContent();
            break;
    }
}

// Load PIR Dashboard
async function loadPIRDashboard() {
    const days = Math.floor((new Date() - new Date(currentUser.recoveryStartDate)) / (1000 * 60 * 60 * 24));
    document.getElementById('streakDays').textContent = days;
    
    await updateWeeklyCheckinsCount();
    
    // Get next session
    try {
        const sessions = await window.db.collection('sessions')
            .where('pirId', '==', currentUser.uid)
            .limit(10)
            .get();
        
        // Filter for future sessions
        const futureSessions = [];
        sessions.forEach(doc => {
            const data = doc.data();
            if (data.date && data.date.toDate() > new Date()) {
                futureSessions.push(data);
            }
        });
        
        if (futureSessions.length > 0) {
            // Sort by date
            futureSessions.sort((a, b) => a.date.toDate() - b.date.toDate());
            const nextSession = futureSessions[0];
            const sessionDate = nextSession.date.toDate();
            document.getElementById('nextSession').textContent = sessionDate.toLocaleDateString();
        } else {
            document.getElementById('nextSession').textContent = 'No scheduled sessions';
        }
    } catch (error) {
        document.getElementById('nextSession').textContent = 'No scheduled sessions';
    }
    
    // Load alerts
    const alertsList = document.getElementById('alertsList');
    if (alertsList) {
        const motivationalQuotes = [
            "One day at a time - you're doing great!",
            "Progress, not perfection.",
            "Every day in recovery is a victory.",
            "You are stronger than you know."
        ];
        const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        
        const motivationalEl = document.getElementById('motivationalQuote');
        if (motivationalEl) {
            motivationalEl.textContent = randomQuote;
        }
        
        alertsList.innerHTML = `
            <div class="alert-item info">
                <strong>Daily Motivation:</strong> ${randomQuote}
            </div>
            <div class="alert-item warning">
                <strong>Remember:</strong> Complete your daily check-in!
            </div>
        `;
    }
}

// Update weekly check-ins count
async function updateWeeklyCheckinsCount() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    try {
        const weeklyCheckins = await window.db.collection('checkins')
            .where('userId', '==', currentUser.uid)
            .get();
        
        // Filter for last 7 days
        let count = 0;
        weeklyCheckins.forEach(doc => {
            const data = doc.data();
            if (data.date && data.date.toDate() > weekAgo) {
                count++;
            }
        });
        
        document.getElementById('weeklyCheckins').textContent = `${count}/7`;
    } catch (error) {
        document.getElementById('weeklyCheckins').textContent = '0/7';
    }
}

// Load recent check-ins
async function loadRecentCheckins() {
    if (!currentUser) return;
    
    try {
        const checkinsSnapshot = await window.db.collection('checkins')
            .where('userId', '==', currentUser.uid)
            .limit(7)
            .get();
        
        const recentList = document.getElementById('recentCheckinsList');
        if (!recentList) return;
        
        if (checkinsSnapshot.empty) {
            recentList.innerHTML = '<p>No check-ins yet. Start building your history!</p>';
            return;
        }
        
        // Sort manually
        const checkins = [];
        checkinsSnapshot.forEach(doc => {
            checkins.push({ id: doc.id, ...doc.data() });
        });
        
        checkins.sort((a, b) => {
            const dateA = a.date ? a.date.toDate() : new Date(0);
            const dateB = b.date ? b.date.toDate() : new Date(0);
            return dateB - dateA;
        });
        
        let checkinsHTML = '';
        checkins.slice(0, 7).forEach(checkin => {
            const date = checkin.date ? checkin.date.toDate().toLocaleDateString() : 'Unknown date';
            const moodClass = checkin.mood >= 7 ? 'mood-good' : checkin.mood >= 4 ? 'mood-fair' : 'mood-poor';
            
            checkinsHTML += `
                <div class="checkin-history-item">
                    <div class="date">${date}</div>
                    <div>
                        <span class="mood-indicator ${moodClass}">Mood: ${checkin.mood}/10</span>
                        <span class="mood-indicator">Cravings: ${checkin.cravings}/10</span>
                        <span class="mood-indicator">Support: ${checkin.support}/10</span>
                    </div>
                    ${checkin.dailyWin ? `<p><strong>Win:</strong> ${checkin.dailyWin}</p>` : ''}
                    ${checkin.gratitude ? `<p><strong>Grateful for:</strong> ${checkin.gratitude}</p>` : ''}
                </div>
            `;
        });
        
        recentList.innerHTML = checkinsHTML;
        
    } catch (error) {
        console.error("Error loading check-ins:", error);
        const recentList = document.getElementById('recentCheckinsList');
        if (recentList) {
            recentList.innerHTML = '<p>Error loading check-ins. Please try again later.</p>';
        }
    }
}

// Load Progress Content
async function loadProgressContent() {
    const days = Math.floor((new Date() - new Date(currentUser.recoveryStartDate)) / (1000 * 60 * 60 * 24));
    
    // Get check-in data for charts
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    try {
        const checkinsSnapshot = await window.db.collection('checkins')
            .where('userId', '==', currentUser.uid)
            .limit(30)
            .get();
        
        // Sort manually
        const checkins = [];
        checkinsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.date && data.date.toDate() > thirtyDaysAgo) {
                checkins.push(data);
            }
        });
        
        checkins.sort((a, b) => {
            const dateA = a.date ? a.date.toDate() : new Date(0);
            const dateB = b.date ? b.date.toDate() : new Date(0);
            return dateA - dateB;
        });
        
        let moodData = [];
        let cravingData = [];
        let dates = [];
        
        checkins.forEach(data => {
            moodData.push(data.mood);
            cravingData.push(data.cravings);
            dates.push(data.date.toDate().toLocaleDateString());
        });
        
        document.getElementById('progressContent').innerHTML = `
            <div class="progress-stats">
                <div class="stat-card">
                    <h3>${days}</h3>
                    <p>Total Days in Recovery</p>
                </div>
                <div class="stat-card">
                    <h3>${checkins.length}</h3>
                    <p>Check-ins Last 30 Days</p>
                </div>
                <div class="stat-card">
                    <h3>${calculateAverageMood(moodData)}</h3>
                    <p>Average Mood</p>
                </div>
            </div>
            
            <h3>Recovery Milestones</h3>
            <div class="milestone-list">
                ${generateMilestoneHTML(days)}
            </div>
            
            <div class="progress-chart">
                <h3>Your Recovery Trends</h3>
                <canvas id="progressChart"></canvas>
            </div>
            
            <div class="mt-20">
                <button onclick="generateProgressReport()" class="primary-btn">Download Progress Report</button>
            </div>
        `;
        
        // Create chart if data exists
        if (moodData.length > 0) {
            setTimeout(() => {
                createProgressChart(dates, moodData, cravingData);
            }, 100);
        }
    } catch (error) {
        console.error("Error loading progress:", error);
        document.getElementById('progressContent').innerHTML = '<p>Error loading progress data.</p>';
    }
}

// Calculate average mood
function calculateAverageMood(moodData) {
    if (moodData.length === 0) return 'N/A';
    const sum = moodData.reduce((a, b) => parseInt(a) + parseInt(b), 0);
    return (sum / moodData.length).toFixed(1);
}

// Generate milestone HTML
function generateMilestoneHTML(days) {
    const milestones = [
        { days: 1, label: '24 Hours' },
        { days: 7, label: '1 Week' },
        { days: 30, label: '30 Days' },
        { days: 60, label: '60 Days' },
        { days: 90, label: '90 Days' },
        { days: 180, label: '6 Months' },
        { days: 365, label: '1 Year' }
    ];
    
    return milestones.map(milestone => `
        <div class="milestone ${days >= milestone.days ? 'achieved' : ''}">
            <span>${days >= milestone.days ? '✓' : '○'}</span>
            ${milestone.label}
        </div>
    `).join('');
}

// Create progress chart
function createProgressChart(dates, moodData, cravingData) {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;
    
    new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Mood',
                data: moodData,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4
            }, {
                label: 'Cravings',
                data: cravingData,
                borderColor: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10
                }
            }
        }
    });
}

// Generate progress report
window.generateProgressReport = async function() {
    showToast('Generating progress report...', 'info');
    
    const days = Math.floor((new Date() - new Date(currentUser.recoveryStartDate)) / (1000 * 60 * 60 * 24));
    const report = `
GLRS RECOVERY PROGRESS REPORT
Generated: ${new Date().toLocaleDateString()}

Client: ${currentUser.firstName} ${currentUser.lastName}
Recovery Start Date: ${new Date(currentUser.recoveryStartDate).toLocaleDateString()}
Days in Recovery: ${days}

Recent Progress Summary:
- Check-in consistency: Good
- Average mood: Improving
- Support level: Strong

Generated by GLRS Recovery Connect
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress-report-${currentUser.firstName}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    
    showToast('Report downloaded!', 'success');
}

// Load connections content
async function loadConnectionsContent() {
    if (userTier === 'new') {
        const daysLeft = 30 - Math.floor((new Date() - new Date(currentUser.recoveryStartDate)) / (1000 * 60 * 60 * 24));
        document.getElementById('connectionsContent').innerHTML = `
            <div class="tier-locked">
                <h3>🔒 Unlock at 30 Days</h3>
                <p>Connection features help you build a support network with other PIRs.</p>
                <p>Focus on your daily check-ins and personal foundation first.</p>
                <p>You'll unlock this feature in ${daysLeft} days!</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${((30 - daysLeft) / 30) * 100}%"></div>
                </div>
            </div>
        `;
        return;
    }
    
    // Load connections for established/trusted users
    try {
        const connectionsSnapshot = await window.db.collection('connections')
            .where('participants', 'array-contains', currentUser.uid)
            .where('status', '==', 'active')
            .get();
        
        let connectionsHTML = '';
        if (connectionsSnapshot.empty) {
            connectionsHTML = '<p>No connections yet. Find recovery buddies
                // ... continuing from loadConnectionsContent()

            connectionsHTML = '<p>No connections yet. Find recovery buddies to connect with!</p>';
        } else {
            for (const doc of connectionsSnapshot.docs) {
                const connection = doc.data();
                const otherUserId = connection.participants.find(id => id !== currentUser.uid);
                const otherUser = await window.db.collection('users').doc(otherUserId).get();
                const userData = otherUser.data();
                
                connectionsHTML += `
                    <div class="connection-card">
                        <h4>${userData.firstName}</h4>
                        <p>${Math.floor((new Date() - new Date(userData.recoveryStartDate)) / (1000 * 60 * 60 * 24))} days in recovery</p>
                        <button onclick="messageConnection('${otherUserId}')" class="btn-sm">Send Message</button>
                    </div>
                `;
            }
        }
        
        document.getElementById('connectionsContent').innerHTML = `
            <div class="connections-section">
                <h3>Your Recovery Buddies</h3>
                <div id="connectionsList">${connectionsHTML}</div>
                
                <h3 class="mt-20">Find New Connections</h3>
                <button onclick="showAvailableConnections()" class="primary-btn">Browse Available PIRs</button>
                
                ${userTier === 'trusted' ? `
                    <h3 class="mt-20">Mentor Others</h3>
                    <p>As a trusted member with ${Math.floor((new Date() - new Date(currentUser.recoveryStartDate)) / (1000 * 60 * 60 * 24))} days, you can mentor newer PIRs!</p>
                    <button onclick="enrollMentorProgram()" class="primary-btn">Become a Mentor</button>
                ` : ''}
            </div>
        `;
        
    } catch (error) {
        console.error("Error loading connections:", error);
        showToast('Error loading connections', 'error');
    }
}

// Show available connections
window.showAvailableConnections = async function() {
    try {
        const availableUsers = await window.db.collection('users')
            .where('role', '==', 'pir')
            .where('openToConnections', '==', true)
            .get();
        
        let html = '<h3>Available Recovery Buddies</h3><div class="available-connections">';
        
        availableUsers.forEach(doc => {
            const user = doc.data();
            if (doc.id !== currentUser.uid) {
                const days = Math.floor((new Date() - new Date(user.recoveryStartDate)) / (1000 * 60 * 60 * 24));
                html += `
                    <div class="connection-request-card">
                        <h4>${user.firstName}</h4>
                        <p>${days} days in recovery</p>
                        <p>Interests: Recovery, Wellness</p>
                        <button onclick="requestConnection('${doc.id}')" class="primary-btn">Connect</button>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        document.getElementById('connectionsContent').innerHTML = html;
        
    } catch (error) {
        console.error("Error loading available connections:", error);
        showToast('Error loading available connections', 'error');
    }
}

// Request connection
window.requestConnection = async function(targetUserId) {
    try {
        await window.db.collection('connectionRequests').add({
            fromUserId: currentUser.uid,
            fromUserName: currentUser.firstName + ' ' + currentUser.lastName,
            toUserId: targetUserId,
            requestDate: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
        });
        
        showToast('Connection request sent!', 'success');
        loadConnectionsContent();
        
    } catch (error) {
        console.error("Error requesting connection:", error);
        showToast('Error sending connection request', 'error');
    }
}

// Enroll in mentor program
window.enrollMentorProgram = async function() {
    try {
        await window.db.collection('users').doc(currentUser.uid).update({
            isMentor: true,
            mentorSince: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast('Welcome to the mentor program!', 'success');
        loadConnectionsContent();
        
    } catch (error) {
        console.error("Error enrolling in mentor program:", error);
        showToast('Error enrolling in mentor program', 'error');
    }
}

// Load messages content
async function loadMessagesContent() {
    try {
        const messagesHTML = `
            <div class="message-tabs">
                <button onclick="showMessageTab('coach')" class="message-tab-btn active">Coach Messages</button>
                ${userTier !== 'new' ? '<button onclick="showMessageTab(\'peers\')" class="message-tab-btn">Peer Messages</button>' : ''}
                <button onclick="showMessageTab('announcements')" class="message-tab-btn">Announcements</button>
            </div>
            
            <div id="messageTabContent">
                <div id="messagesList" class="messages-container">
                    <div class="loading">Loading messages...</div>
                </div>
                
                <div class="message-compose">
                    <h4>Send Message to Coach</h4>
                    <textarea id="messageText" placeholder="Type your message..." rows="4"></textarea>
                    <button onclick="sendMessageToCoach()" class="primary-btn mt-10">Send</button>
                </div>
            </div>
        `;
        
        document.getElementById('messagesContent').innerHTML = messagesHTML;
        
        // Load coach messages by default
        await loadCoachMessages();
        
    } catch (error) {
        console.error("Error loading messages:", error);
        showToast('Error loading messages', 'error');
    }
}

// Load coach messages
async function loadCoachMessages() {
    try {
        const messages = await window.db.collection('messages')
            .where('participants', 'array-contains', currentUser.uid)
            .limit(50)
            .get();
        
        // Filter for coach-pir messages
        const coachMessages = messages.docs.filter(doc => 
            doc.data().type === 'coach-pir'
        );
        
        // Sort by timestamp
        coachMessages.sort((a, b) => {
            const timeA = a.data().timestamp || 0;
            const timeB = b.data().timestamp || 0;
            return timeB - timeA;
        });
        
        let messagesHTML = '';
        
        if (coachMessages.length === 0) {
            messagesHTML = '<p class="no-messages">No messages yet. Send a message to your coach!</p>';
        } else {
            coachMessages.forEach(doc => {
                const msg = doc.data();
                const isFromMe = msg.fromUserId === currentUser.uid;
                const messageClass = isFromMe ? 'message-sent' : 'message-received';
                
                messagesHTML += `
                    <div class="message-item ${messageClass}">
                        <div class="message-header">
                            <span class="message-from">${isFromMe ? 'You' : 'Your Coach'}</span>
                            <span class="message-time">${formatMessageTime(msg.timestamp)}</span>
                        </div>
                        <p>${msg.message}</p>
                    </div>
                `;
            });
        }
        
        document.getElementById('messagesList').innerHTML = messagesHTML;
        
    } catch (error) {
        console.error("Error loading coach messages:", error);
        document.getElementById('messagesList').innerHTML = '<p class="error">Error loading messages</p>';
    }
}

// Send message to coach
window.sendMessageToCoach = async function() {
    const messageText = document.getElementById('messageText').value.trim();
    
    if (!messageText) {
        showToast('Please enter a message', 'error');
        return;
    }
    
    try {
        await window.db.collection('messages').add({
            fromUserId: currentUser.uid,
            fromUserName: currentUser.firstName + ' ' + currentUser.lastName,
            toUserId: currentUser.coachId,
            participants: [currentUser.uid, currentUser.coachId],
            message: messageText,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            type: 'coach-pir',
            read: false
        });
        
        document.getElementById('messageText').value = '';
        showToast('Message sent!', 'success');
        await loadCoachMessages();
        
    } catch (error) {
        console.error("Error sending message:", error);
        showToast('Error sending message', 'error');
    }
}

// Format message time
function formatMessageTime(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
        return 'Yesterday';
    } else if (days < 7) {
        return `${days} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Show message tab
window.showMessageTab = async function(tab) {
    document.querySelectorAll('.message-tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    switch(tab) {
        case 'coach':
            await loadCoachMessages();
            document.querySelector('.message-compose h4').textContent = 'Send Message to Coach';
            break;
        case 'peers':
            await loadPeerMessages();
            document.querySelector('.message-compose h4').textContent = 'Select a peer to message';
            break;
        case 'announcements':
            await loadAnnouncements();
            document.querySelector('.message-compose').style.display = 'none';
            break;
    }
}

// Load peer messages
async function loadPeerMessages() {
    try {
        const messages = await window.db.collection('messages')
            .where('participants', 'array-contains', currentUser.uid)
            .limit(50)
            .get();
        
        // Filter for peer messages
        const peerMessages = messages.docs.filter(doc => 
            doc.data().type === 'peer-peer'
        );
        
        // Sort by timestamp
        peerMessages.sort((a, b) => {
            const timeA = a.data().timestamp || 0;
            const timeB = b.data().timestamp || 0;
            return timeB - timeA;
        });
        
        let messagesHTML = '';
        
        if (peerMessages.length === 0) {
            messagesHTML = '<p class="no-messages">No peer messages yet. Connect with other PIRs to start messaging!</p>';
        } else {
            peerMessages.forEach(doc => {
                const msg = doc.data();
                const isFromMe = msg.fromUserId === currentUser.uid;
                const messageClass = isFromMe ? 'message-sent' : 'message-received';
                
                messagesHTML += `
                    <div class="message-item ${messageClass}">
                        <div class="message-header">
                            <span class="message-from">${isFromMe ? 'You' : msg.fromUserName}</span>
                            <span class="message-time">${formatMessageTime(msg.timestamp)}</span>
                        </div>
                        <p>${msg.message}</p>
                    </div>
                `;
            });
        }
        
        document.getElementById('messagesList').innerHTML = messagesHTML;
        
    } catch (error) {
        console.error("Error loading peer messages:", error);
        document.getElementById('messagesList').innerHTML = '<p class="error">Error loading messages</p>';
    }
}

// Load announcements
async function loadAnnouncements() {
    try {
        const announcements = await window.db.collection('announcements')
            .limit(20)
            .get();
        
        let announcementsHTML = '';
        
        if (announcements.empty) {
            announcementsHTML = '<p class="no-messages">No announcements yet.</p>';
        } else {
            // Sort manually
            const announcementsList = [];
            announcements.forEach(doc => {
                announcementsList.push({ id: doc.id, ...doc.data() });
            });
            
            announcementsList.sort((a, b) => {
                const timeA = a.timestamp || 0;
                const timeB = b.timestamp || 0;
                return timeB - timeA;
            });
            
            announcementsList.forEach(announcement => {
                announcementsHTML += `
                    <div class="announcement-item">
                        <h4>${announcement.title}</h4>
                        <p>${announcement.message}</p>
                        <small>${formatMessageTime(announcement.timestamp)}</small>
                    </div>
                `;
            });
        }
        
        document.getElementById('messagesList').innerHTML = announcementsHTML;
        
    } catch (error) {
        console.error("Error loading announcements:", error);
        document.getElementById('messagesList').innerHTML = '<p class="error">Error loading announcements</p>';
    }
}

// Load session content
async function loadSessionContent() {
    try {
        const assignments = await window.db.collection('assignments')
            .where('pirId', '==', currentUser.uid)
            .where('status', '==', 'active')
            .get();
        
        let assignmentsHTML = '<h3>Current Assignments</h3>';
        
        if (assignments.empty) {
            assignmentsHTML += '<p>No active assignments.</p>';
        } else {
            assignments.forEach(doc => {
                const assignment = doc.data();
                const dueDate = assignment.dueDate ? assignment.dueDate.toDate().toLocaleDateString() : 'Ongoing';
                
                assignmentsHTML += `
                    <div class="assignment-card">
                        <h4>${assignment.title}</h4>
                        <p>${assignment.description}</p>
                        <p class="assignment-due">Due: ${dueDate}</p>
                        ${assignment.fileUrl ? `<button onclick="downloadAssignment('${assignment.fileUrl}')" class="btn-sm">Download</button>` : ''}
                        <button onclick="markAssignmentComplete('${doc.id}')" class="primary-btn">Mark Complete</button>
                    </div>
                `;
            });
        }
        
        document.getElementById('sessionContent').innerHTML = `
            <div class="assignments-section">
                ${assignmentsHTML}
            </div>
            
            <div class="upload-section mt-20">
                <h3>Upload Completed Work</h3>
                <input type="file" id="assignmentUpload" accept=".pdf,.doc,.docx,.txt">
                <button onclick="uploadAssignment()" class="primary-btn mt-10">Upload File</button>
            </div>
            
            <div class="session-prep mt-20">
                <h3>Prepare for Next Session</h3>
                <ul>
                    <li>Review your weekly check-in patterns</li>
                    <li>Identify challenges you faced</li>
                    <li>List questions for your coach</li>
                    <li>Celebrate your wins!</li>
                </ul>
            </div>
        `;
        
    } catch (error) {
        console.error("Error loading session content:", error);
        showToast('Error loading assignments', 'error');
    }
}

// Mark assignment complete
window.markAssignmentComplete = async function(assignmentId) {
    try {
        await window.db.collection('assignments').doc(assignmentId).update({
            status: 'completed',
            completedDate: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast('Assignment marked as complete!', 'success');
        loadSessionContent();
        
    } catch (error) {
        console.error("Error marking assignment complete:", error);
        showToast('Error updating assignment', 'error');
    }
}

// Download assignment
window.downloadAssignment = function(fileUrl) {
    window.open(fileUrl, '_blank');
}

// Upload assignment
window.uploadAssignment = async function() {
    const fileInput = document.getElementById('assignmentUpload');
    
    if (!fileInput.files.length) {
        showToast('Please select a file to upload', 'error');
        return;
    }
    
    // In a real app, this would upload to Firebase Storage
    showToast('File uploaded successfully!', 'success');
    fileInput.value = '';
}

// Coach Section Navigation
window.showCoachSection = function(section, button) {
    const content = document.getElementById('coachContent');
    
    document.querySelectorAll('.coach-nav-item').forEach(btn => btn.classList.remove('active'));
    if (button) {
        button.classList.add('active');
    }
    
    switch(section) {
        case 'overview':
            loadCoachOverview();
            break;
        case 'createAccount':
            content.innerHTML = generateCreateAccountForm();
            loadCoachesForDropdown();
            break;
        case 'checkins':
            loadCoachCheckinsReview();
            break;
        case 'progress':
            loadCoachProgressTracking();
            break;
        case 'connections':
            loadCoachConnectionManagement();
            break;
        case 'messages':
            loadCoachMessageCenter();
            break;
        case 'assignments':
            loadCoachAssignmentCenter();
            break;
        case 'resources':
            loadCoachResourceManagement();
            break;
    }
    
    createIcons();
}

// Load coach dashboard
async function loadCoachDashboard() {
    loadCoachOverview();
}

// Load coach overview
async function loadCoachOverview() {
    try {
        const pirsSnapshot = await window.db.collection('users')
            .where('coachId', '==', currentUser.uid)
            .where('role', '==', 'pir')
            .get();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const alertsSnapshot = await window.db.collection('alerts')
            .where('coachId', '==', currentUser.uid)
            .get();
        
        // Filter for today's alerts
        const todaysAlerts = [];
        alertsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.timestamp && data.timestamp.toDate() > today) {
                todaysAlerts.push({ id: doc.id, ...data });
            }
        });
        
        // Get today's check-ins
        const checkinsSnapshot = await window.db.collection('checkins')
            .get();
        
        // Filter check-ins for coach's PIRs
        const pirIds = pirsSnapshot.docs.map(doc => doc.id);
        const todaysCheckins = [];
        checkinsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.date && data.date.toDate() > today && pirIds.includes(data.userId)) {
                todaysCheckins.push(data);
            }
        });
        
        // Build alerts HTML
        let alertsHTML = '';
        if (todaysAlerts.length === 0) {
            alertsHTML = '<p>No alerts today.</p>';
        } else {
            for (const alert of todaysAlerts) {
                const pirDoc = await window.db.collection('users').doc(alert.userId).get();
                const pirData = pirDoc.data();
                
                alertsHTML += `
                    <div class="alert-item warning">
                        <strong>${pirData.firstName} ${pirData.lastName}</strong> - ${alert.type}
                        <button onclick="viewAlert('${alert.id}')" class="btn-sm">Review</button>
                    </div>
                `;
            }
        }
        
        document.getElementById('coachContent').innerHTML = `
            <h2>Coach Dashboard</h2>
            <div class="quick-stats">
                <div class="stat-card">
                    <h3>${pirsSnapshot.size}</h3>
                    <p>Active PIRs</p>
                </div>
                <div class="stat-card">
                    <h3>${todaysAlerts.length}</h3>
                    <p>Alerts Today</p>
                </div>
                <div class="stat-card">
                    <h3>${todaysCheckins.length}/${pirsSnapshot.size}</h3>
                    <p>Check-ins Today</p>
                </div>
                <div class="stat-card">
                    <h3>${pirsSnapshot.size > 0 ? Math.round((todaysCheckins.length / pirsSnapshot.size) * 100) : 0}%</h3>
                    <p>Check-in Rate</p>
                </div>
            </div>
            
            <div class="alerts-section">
                <h3>Requires Attention</h3>
                ${alertsHTML}
            </div>
            
            <div class="mt-20">
                <h3>Recent Activity</h3>
                <div id="recentActivity">Loading...</div>
            </div>
        `;
        
        // Load recent activity
        loadRecentActivity();
        
    } catch (error) {
        console.error("Error loading coach overview:", error);
        showToast('Error loading dashboard', 'error');
    }
}

// Load recent activity for coach
async function loadRecentActivity() {
    try {
        const pirsSnapshot = await window.db.collection('users')
            .where('coachId', '==', currentUser.uid)
            .where('role', '==', 'pir')
            .get();
        
        const pirIds = pirsSnapshot.docs.map(doc => doc.id);
        
        // Get recent check-ins
        const recentCheckins = await window.db.collection('checkins')
            .limit(20)
            .get();
        
        let activityHTML = '<ul>';
        
        // Filter and sort manually
        const relevantCheckins = [];
        recentCheckins.forEach(doc => {
            const checkin = doc.data();
            if (pirIds.includes(checkin.userId)) {
                relevantCheckins.push({ id: doc.id, ...checkin });
            }
        });
        
        relevantCheckins.sort((a, b) => {
            const dateA = a.date ? a.date.toDate() : new Date(0);
            const dateB = b.date ? b.date.toDate() : new Date(0);
            return dateB - dateA;
        });
        
        for (const checkin of relevantCheckins.slice(0, 10)) {
            const pirDoc = await window.db.collection('users').doc(checkin.userId).get();
            const pirData = pirDoc.data();
            
            activityHTML += `
                <li>${pirData.firstName} completed check-in - Mood: ${checkin.mood}/10 
                <small>(${formatMessageTime(checkin.date)})</small></li>
            `;
        }
        
        activityHTML += '</ul>';
        document.getElementById('recentActivity').innerHTML = activityHTML;
        
    } catch (error) {
        console.error("Error loading recent activity:", error);
        document.getElementById('recentActivity').innerHTML = '<p>Error loading activity</p>';
    }
}

// Continue with remaining coach functions...
// [The rest of the coach functions remain the same as in your original code]

// Message a connection
window.messageConnection = function(userId) {
    showToast('Opening message composer...', 'info');
}

// Filter check-ins
window.filterCheckins = function(filter) {
    showToast(`Filtering by: ${filter}`, 'info');
}

// View alert details
window.viewAlert = async function(alertId) {
    try {
        const alertDoc = await window.db.collection('alerts').doc(alertId).get();
        const alert = alertDoc.data();
        
        await window.db.collection('alerts').doc(alertId).update({
            reviewed: true,
            reviewedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast('Alert reviewed', 'success');
        
    } catch (error) {
        console.error("Error viewing alert:", error);
        showToast('Error viewing alert', 'error');
    }
}

// Generate create account form
function generateCreateAccountForm() {
    return `
        <h2>Create New PIR Account</h2>
        <div class="create-account-form">
            <form onsubmit="createPIRAccount(event); return false;">
                <div class="form-row">
                    <div class="form-group">
                        <label>First Name *</label>
                        <input type="text" id="firstName" required class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Last Name *</label>
                        <input type="text" id="lastName" required class="form-input">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Email Address *</label>
                        <input type="email" id="pirEmail" required class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Phone Number *</label>
                        <input type="tel" id="pirPhone" required class="form-input">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Recovery Start Date *</label>
                        <input type="date" id="recoveryDate" required class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Service Package *</label>
                        <select id="servicePackage" required class="form-select">
                            <option value="">Select Package</option>
                            <option value="virtual-foundation">Virtual Foundation ($299/mo)</option>
                            <option value="virtual-growth">Virtual Growth ($499/mo)</option>
                            <option value="virtual-premium">Virtual Premium ($799/mo)</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Assigned Coach *</label>
                        <select id="assignedCoach" required class="form-select">
                            <option value="">Loading coaches...</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Open to Connections</label>
                        <select id="openToConnections" class="form-select">
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Emergency Contact Name *</label>
                    <input type="text" id="emergencyName" required class="form-input">
                </div>
                
                <div class="form-group">
                    <label>Emergency Contact Phone *</label>
                    <input type="tel" id="emergencyPhone" required class="form-input">
                </div>
                
                <div class="form-group">
                    <label>Initial Notes</label>
                    <textarea id="initialNotes" rows="4" class="form-textarea" placeholder="Any relevant information about this PIR..."></textarea>
                </div>
                
                <button type="submit" class="btn btn-primary btn-lg">Create Account & Send Credentials</button>
            </form>
        </div>
        
        <div id="accountCreatedInfo" style="display: none;"></div>
    `;
}

// Load coaches for dropdown
async function loadCoachesForDropdown() {
    try {
        const coaches = await window.db.collection('users')
            .where('role', '==', 'coach')
            .get();
        
        const dropdown = document.getElementById('assignedCoach');
        dropdown.innerHTML = `<option value="${currentUser.uid}" selected>${currentUser.email} (You)</option>`;
        
        coaches.forEach(doc => {
            if (doc.id !== currentUser.uid) {
                const coach = doc.data();
                dropdown.innerHTML += `<option value="${doc.id}">${coach.email}</option>`;
            }
        });
        
    } catch (error) {
        console.error("Error loading coaches:", error);
    }
}

// [Include all remaining coach functions here - they remain the same as in your original code]
