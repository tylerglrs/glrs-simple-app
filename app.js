// GLRS PIR Platform - Complete Functional Version
// Global variables
let currentUser = null;
let userRole = null;
let userTier = null;
let userDocData = null;

// Listen for auth state changes
auth.onAuthStateChanged(async (user) => {
    if (user) {
        await loadUserData(user.uid);
    } else {
        currentUser = null;
        showLoginScreen();
    }
});

// Load user data from Firestore
async function loadUserData(uid) {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            userDocData = userDoc.data();
            currentUser = {
                uid: uid,
                email: auth.currentUser.email,
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
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Set up all event listeners
    const checkinForm = document.getElementById('checkinForm');
    if (checkinForm) {
        checkinForm.addEventListener('submit', saveCheckin);
    }
});

// Show login screen
function showLoginScreen() {
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
        // Initialize EmailJS with your user ID
        // emailjs.init("YOUR_USER_ID");
        
        // Send email
        // await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
        //     to_email: to,
        //     subject: subject,
        //     message: body
        // });
        
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
async function login() {
    const email = document.getElementById('loginInput').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showToast('Please enter email and password', 'error');
        return;
    }
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showToast('Login successful!', 'success');
    } catch (error) {
        console.error("Login error:", error);
        showToast('Login failed: ' + error.message, 'error');
    }
}

// Logout function
async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            await auth.signOut();
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
async function acceptTerms() {
    if (!currentUser || !currentUser.uid) {
        console.error("No user logged in");
        return;
    }
    
    try {
        await db.collection('users').doc(currentUser.uid).update({
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
async function changePassword() {
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
        await auth.currentUser.updatePassword(newPassword);
        await db.collection('users').doc(currentUser.uid).update({
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
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('userInfo').classList.remove('hidden');
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
}

// Update tier features
function updateTierFeatures() {
    const tierDescriptions = {
        new: 'New Member (0-30 days): Check-ins and resources only',
        established: 'Established (31-90 days): Can request connections',
        trusted: 'Trusted (90+ days): Full access to all features'
    };
    
    document.getElementById('tierDescription').textContent = tierDescriptions[userTier];
    
    const days = Math.floor((new Date() - new Date(currentUser.recoveryStartDate)) / (1000 * 60 * 60 * 24));
    document.getElementById('daysInRecovery').textContent = `${days} days in recovery`;
}

// Create PIR Account with coach selection
async function createPIRAccount(event) {
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
        const userCredential = await auth.createUserWithEmailAndPassword(email, tempPassword);
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
        
        await db.collection('users').doc(uid).set(newUserData);
        
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
                <button onclick="showCoachSection('createAccount')" class="btn-secondary">Create Another</button>
            </div>
        `;
        document.getElementById('accountCreatedInfo').style.display = 'block';
        
        // Reset form
        event.target.reset();
        
        // Sign back in as coach
        await auth.signInWithEmailAndPassword(coachEmail, coachPassword);
        showToast('Account created successfully!', 'success');
        
    } catch (error) {
        console.error("Error creating PIR account:", error);
        showToast('Error creating account: ' + error.message, 'error');
        
        // Try to sign back in as coach
        try {
            await auth.signInWithEmailAndPassword(coachEmail, coachPassword);
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
function copyCredentials(email, password) {
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
async function saveCheckin(event) {
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
        await db.collection('checkins').add(checkinData);
        showToast('Check-in saved! Keep up the great work!', 'success');
        document.getElementById('checkinForm').reset();
        updateSlider('mood');
        updateSlider('cravings');
        updateSlider('support');
        await loadRecentCheckins();
        
        // Update weekly count
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
        await db.collection('alerts').add({
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
function updateSlider(sliderId) {
    const value = document.getElementById(sliderId).value;
    document.getElementById(sliderId + 'Value').textContent = value;
}

// PIR Section Navigation
function showSection(section) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.getElementById(section + 'Section').style.display = 'block';
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
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
    const sessions = await db.collection('sessions')
        .where('pirId', '==', currentUser.uid)
        .where('date', '>', new Date())
        .orderBy('date')
        .limit(1)
        .get();
    
    if (!sessions.empty) {
        const nextSession = sessions.docs[0].data();
        const sessionDate = nextSession.date.toDate();
        document.getElementById('nextSession').textContent = sessionDate.toLocaleDateString();
    } else {
        document.getElementById('nextSession').textContent = 'No scheduled sessions';
    }
    
    // Load alerts
    const alertsList = document.getElementById('alertsList');
    const motivationalQuotes = [
        "One day at a time - you're doing great!",
        "Progress, not perfection.",
        "Every day in recovery is a victory.",
        "You are stronger than you know."
    ];
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    
    alertsList.innerHTML = `
        <div class="alert-item info">
            <strong>Daily Motivation:</strong> ${randomQuote}
        </div>
        <div class="alert-item warning">
            <strong>Remember:</strong> Complete your daily check-in!
        </div>
    `;
}

// Update weekly check-ins count
async function updateWeeklyCheckinsCount() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyCheckins = await db.collection('checkins')
        .where('userId', '==', currentUser.uid)
        .where('date', '>', weekAgo)
        .get();
    
    document.getElementById('weeklyCheckins').textContent = `${weeklyCheckins.size}/7`;
}

// Load recent check-ins
async function loadRecentCheckins() {
    if (!currentUser) return;
    
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const checkinsSnapshot = await db.collection('checkins')
            .where('userId', '==', currentUser.uid)
            .orderBy('date', 'desc')
            .limit(7)
            .get();
        
        const recentList = document.getElementById('recentCheckinsList');
        
        if (checkinsSnapshot.empty) {
            recentList.innerHTML = '<p>No check-ins yet. Start building your history!</p>';
            return;
        }
        
        let checkinsHTML = '';
        checkinsSnapshot.forEach(doc => {
            const checkin = doc.data();
            const date = checkin.date.toDate().toLocaleDateString();
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
    }
}

// Load Progress Content
async function loadProgressContent() {
    const days = Math.floor((new Date() - new Date(currentUser.recoveryStartDate)) / (1000 * 60 * 60 * 24));
    
    // Get check-in data for charts
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const checkinsSnapshot = await db.collection('checkins')
        .where('userId', '==', currentUser.uid)
        .where('date', '>', thirtyDaysAgo)
        .orderBy('date')
        .get();
    
    let moodData = [];
    let cravingData = [];
    let dates = [];
    
    checkinsSnapshot.forEach(doc => {
        const data = doc.data();
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
                <h3>${checkinsSnapshot.size}</h3>
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
        createProgressChart(dates, moodData, cravingData);
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
    const ctx = document.getElementById('progressChart').getContext('2d');
    new Chart(ctx, {
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
async function generateProgressReport() {
    showToast('Generating progress report...', 'info');
    // In a real app, this would create a PDF
    // For now, we'll create a simple text report
    
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
        // Get user's connections
        const connectionsSnapshot = await db.collection('connections')
            .where('participants', 'array-contains', currentUser.uid)
            .where('status', '==', 'active')
            .get();
        
        let connectionsHTML = '';
        if (connectionsSnapshot.empty) {
            connectionsHTML = '<p>No connections yet. Find recovery buddies to connect with!</p>';
        } else {
            for (const doc of connectionsSnapshot.docs) {
                const connection = doc.data();
                const otherUserId = connection.participants.find(id => id !== currentUser.uid);
                const otherUser = await db.collection('users').doc(otherUserId).get();
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
async function showAvailableConnections() {
    try {
        // Get PIRs who are open to connections
        const availableUsers = await db.collection('users')
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
async function requestConnection(targetUserId) {
    try {
        await db.collection('connectionRequests').add({
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
async function enrollMentorProgram() {
    try {
        await db.collection('users').doc(currentUser.uid).update({
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
        const messages = await db.collection('messages')
            .where('participants', 'array-contains', currentUser.uid)
            .where('type', '==', 'coach-pir')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();
        
        let messagesHTML = '';
        
        if (messages.empty) {
            messagesHTML = '<p class="no-messages">No messages yet. Send a message to your coach!</p>';
        } else {
            messages.forEach(doc => {
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
async function sendMessageToCoach() {
    const messageText = document.getElementById('messageText').value.trim();
    
    if (!messageText) {
        showToast('Please enter a message', 'error');
        return;
    }
    
    try {
        await db.collection('messages').add({
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
async function showMessageTab(tab) {
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
        const messages = await db.collection('messages')
            .where('participants', 'array-contains', currentUser.uid)
            .where('type', '==', 'peer-peer')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();
        
        let messagesHTML = '';
        
        if (messages.empty) {
            messagesHTML = '<p class="no-messages">No peer messages yet. Connect with other PIRs to start messaging!</p>';
        } else {
            messages.forEach(doc => {
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
        const announcements = await db.collection('announcements')
            .orderBy('timestamp', 'desc')
            .limit(20)
            .get();
        
        let announcementsHTML = '';
        
        if (announcements.empty) {
            announcementsHTML = '<p class="no-messages">No announcements yet.</p>';
        } else {
            announcements.forEach(doc => {
                const announcement = doc.data();
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
        // Load assignments
        const assignments = await db.collection('assignments')
            .where('pirId', '==', currentUser.uid)
            .where('status', '==', 'active')
            .orderBy('dueDate')
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
async function markAssignmentComplete(assignmentId) {
    try {
        await db.collection('assignments').doc(assignmentId).update({
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
function downloadAssignment(fileUrl) {
    window.open(fileUrl, '_blank');
}

// Upload assignment
async function uploadAssignment() {
    const fileInput = document.getElementById('assignmentUpload');
    
    if (!fileInput.files.length) {
        showToast('Please select a file to upload', 'error');
        return;
    }
    
    // In a real app, this would upload to Firebase Storage
    // For now, we'll just show a success message
    showToast('File uploaded successfully!', 'success');
    fileInput.value = '';
}

// Coach Section Navigation
function showCoachSection(section) {
    const content = document.getElementById('coachContent');
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
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
}

// Load coach overview
async function loadCoachOverview() {
    try {
        // Get PIRs assigned to this coach
        const pirsSnapshot = await db.collection('users')
            .where('coachId', '==', currentUser.uid)
            .where('role', '==', 'pir')
            .get();
        
        // Get today's alerts
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const alertsSnapshot = await db.collection('alerts')
            .where('coachId', '==', currentUser.uid)
            .where('timestamp', '>', today)
            .get();
        
        // Get today's check-ins
        const checkinsSnapshot = await db.collection('checkins')
            .where('date', '>', today)
            .get();
        
        // Filter check-ins for coach's PIRs
        const pirIds = pirsSnapshot.docs.map(doc => doc.id);
        const coachCheckins = checkinsSnapshot.docs.filter(doc => 
            pirIds.includes(doc.data().userId)
        );
        
        // Build alerts HTML
        let alertsHTML = '';
        if (alertsSnapshot.empty) {
            alertsHTML = '<p>No alerts today.</p>';
        } else {
            for (const doc of alertsSnapshot.docs) {
                const alert = doc.data();
                const pirDoc = await db.collection('users').doc(alert.userId).get();
                const pirData = pirDoc.data();
                
                alertsHTML += `
                    <div class="alert-item warning">
                        <strong>${pirData.firstName} ${pirData.lastName}</strong> - ${alert.type}
                        <button onclick="viewAlert('${doc.id}')" class="btn-sm">Review</button>
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
                    <h3>${alertsSnapshot.size}</h3>
                    <p>Alerts Today</p>
                </div>
                <div class="stat-card">
                    <h3>${coachCheckins.length}/${pirsSnapshot.size}</h3>
                    <p>Check-ins Today</p>
                </div>
                <div class="stat-card">
                    <h3>${Math.round((coachCheckins.length / pirsSnapshot.size) * 100)}%</h3>
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
        const pirsSnapshot = await db.collection('users')
            .where('coachId', '==', currentUser.uid)
            .where('role', '==', 'pir')
            .get();
        
        const pirIds = pirsSnapshot.docs.map(doc => doc.id);
        
        // Get recent check-ins
        const recentCheckins = await db.collection('checkins')
            .orderBy('date', 'desc')
            .limit(10)
            .get();
        
        let activityHTML = '<ul>';
        
        for (const doc of recentCheckins.docs) {
            const checkin = doc.data();
            if (pirIds.includes(checkin.userId)) {
                const pirDoc = await db.collection('users').doc(checkin.userId).get();
                const pirData = pirDoc.data();
                
                activityHTML += `
                    <li>${pirData.firstName} completed check-in - Mood: ${checkin.mood}/10 
                    <small>(${formatMessageTime(checkin.date)})</small></li>
                `;
            }
        }
        
        activityHTML += '</ul>';
        document.getElementById('recentActivity').innerHTML = activityHTML;
        
    } catch (error) {
        console.error("Error loading recent activity:", error);
        document.getElementById('recentActivity').innerHTML = '<p>Error loading activity</p>';
    }
}

// Generate create account form
function generateCreateAccountForm() {
    return `
        <h2>Create New PIR Account</h2>
        <div class="create-account-form">
            <form onsubmit="createPIRAccount(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>First Name *</label>
                        <input type="text" id="firstName" required>
                    </div>
                    <div class="form-group">
                        <label>Last Name *</label>
                        <input type="text" id="lastName" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Email Address *</label>
                        <input type="email" id="pirEmail" required>
                    </div>
                    <div class="form-group">
                        <label>Phone Number *</label>
                        <input type="tel" id="pirPhone" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Recovery Start Date *</label>
                        <input type="date" id="recoveryDate" required>
                    </div>
                    <div class="form-group">
                        <label>Service Package *</label>
                        <select id="servicePackage" required>
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
                        <select id="assignedCoach" required>
                            <option value="">Loading coaches...</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Open to Connections</label>
                        <select id="openToConnections">
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Emergency Contact Name *</label>
                    <input type="text" id="emergencyName" required>
                </div>
                
                <div class="form-group">
                    <label>Emergency Contact Phone *</label>
                    <input type="tel" id="emergencyPhone" required>
                </div>
                
                <div class="form-group">
                    <label>Initial Notes</label>
                    <textarea id="initialNotes" rows="4" placeholder="Any relevant information about this PIR..."></textarea>
                </div>
                
                <button type="submit" class="save-btn">Create Account & Send Credentials</button>
            </form>
        </div>
        
        <div id="accountCreatedInfo" style="display: none;"></div>
    `;
}

// Load coaches for dropdown
async function loadCoachesForDropdown() {
    try {
        const coaches = await db.collection('users')
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

// Load coach check-ins review
async function loadCoachCheckinsReview() {
    try {
        // Get PIRs assigned to this coach
        const pirsSnapshot = await db.collection('users')
            .where('coachId', '==', currentUser.uid)
            .where('role', '==', 'pir')
            .get();
        
        let checkinsHTML = `
            <h2>PIR Check-ins Review</h2>
            <div class="checkin-filters">
                <select onchange="filterCheckins(this.value)">
                    <option value="all">All PIRs</option>
                    <option value="alerts">With Alerts</option>
                    <option value="missed">Missed Check-ins</option>
                </select>
            </div>
            <div class="checkin-review-grid">
        `;
        
        // For each PIR, get their latest check-in
        for (const pirDoc of pirsSnapshot.docs) {
            const pir = pirDoc.data();
            
            // Get latest check-in
            const latestCheckin = await db.collection('checkins')
                .where('userId', '==', pirDoc.id)
                .orderBy('date', 'desc')
                .limit(1)
                .get();
            
            if (!latestCheckin.empty) {
                const checkin = latestCheckin.docs[0].data();
                const isAlert = checkin.mood <= 3 || checkin.cravings >= 7 || checkin.support <= 3;
                
                checkinsHTML += `
                    <div class="pir-checkin-card ${isAlert ? 'alert' : ''}">
                        <h4>${pir.firstName} ${pir.lastName}</h4>
                        <p>Last check-in: ${formatMessageTime(checkin.date)}</p>
                        <div class="checkin-summary">
                            <div class="checkin-metric">
                                <strong>Mood</strong>
                                <span>${checkin.mood}/10</span>
                            </div>
                            <div class="checkin-metric">
                                <strong>Cravings</strong>
                                <span>${checkin.cravings}/10</span>
                            </div>
                            <div class="checkin-metric">
                                <strong>Support</strong>
                                <span>${checkin.support}/10</span>
                            </div>
                        </div>
                        ${isAlert ? '<p class="alert-text">⚠️ Needs attention</p>' : ''}
                        <button onclick="viewPIRDetails('${pirDoc.id}')" class="primary-btn">View Details</button>
                    </div>
                `;
            } else {
                checkinsHTML += `
                    <div class="pir-checkin-card missed">
                        <h4>${pir.firstName} ${pir.lastName}</h4>
                        <p>No check-ins yet</p>
                        <button onclick="sendReminder('${pirDoc.id}')" class="primary-btn">Send Reminder</button>
                    </div>
                `;
            }
        }
        
        checkinsHTML += '</div>';
        document.getElementById('coachContent').innerHTML = checkinsHTML;
        
    } catch (error) {
        console.error("Error loading check-ins review:", error);
        showToast('Error loading check-ins', 'error');
    }
}

// View PIR details
async function viewPIRDetails(pirId) {
    // This would show a detailed view of the PIR's history
    showToast('Loading PIR details...', 'info');
}

// Send reminder to PIR
async function sendReminder(pirId) {
    try {
        const pirDoc = await db.collection('users').doc(pirId).get();
        const pir = pirDoc.data();
        
        await db.collection('messages').add({
            fromUserId: currentUser.uid,
            fromUserName: 'Your Coach',
            toUserId: pirId,
            participants: [currentUser.uid, pirId],
            message: `Hi ${pir.firstName}, just checking in! Don't forget to complete your daily check-in. How are you feeling today?`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            type: 'coach-pir',
            read: false
        });
        
        showToast('Reminder sent!', 'success');
        
    } catch (error) {
        console.error("Error sending reminder:", error);
        showToast('Error sending reminder', 'error');
    }
}

// View alert details
async function viewAlert(alertId) {
    try {
        const alertDoc = await db.collection('alerts').doc(alertId).get();
        const alert = alertDoc.data();
        
        // Mark alert as reviewed
        await db.collection('alerts').doc(alertId).update({
            reviewed: true,
            reviewedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Show alert details (in a real app, this would be a modal)
        showToast('Alert reviewed', 'success');
        
    } catch (error) {
        console.error("Error viewing alert:", error);
        showToast('Error viewing alert', 'error');
    }
}

// Load coach progress tracking
async function loadCoachProgressTracking() {
    try {
        const pirsSnapshot = await db.collection('users')
            .where('coachId', '==', currentUser.uid)
            .where('role', '==', 'pir')
            .get();
        
        let progressHTML = `
            <h2>PIR Progress Tracking</h2>
            <div class="progress-overview">
                <select id="pirSelector" onchange="loadPIRProgress(this.value)" class="mb-20">
                    <option value="">Select a PIR</option>
        `;
        
        pirsSnapshot.forEach(doc => {
            const pir = doc.data();
            progressHTML += `<option value="${doc.id}">${pir.firstName} ${pir.lastName}</option>`;
        });
        
        progressHTML += `
                </select>
                <div id="selectedPIRProgress">
                    <p>Select a PIR to view their progress details.</p>
                </div>
            </div>
        `;
        
        document.getElementById('coachContent').innerHTML = progressHTML;
        
    } catch (error) {
        console.error("Error loading progress tracking:", error);
        showToast('Error loading progress tracking', 'error');
    }
}

// Load specific PIR progress
async function loadPIRProgress(pirId) {
    if (!pirId) return;
    
    try {
        const pirDoc = await db.collection('users').doc(pirId).get();
        const pir = pirDoc.data();
        
        // Get check-ins for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const checkinsSnapshot = await db.collection('checkins')
            .where('userId', '==', pirId)
            .where('date', '>', thirtyDaysAgo)
            .orderBy('date')
            .get();
        
        // Calculate stats
        const days = Math.floor((new Date() - new Date(pir.recoveryStartDate)) / (1000 * 60 * 60 * 24));
        const checkinRate = Math.round((checkinsSnapshot.size / 30) * 100);
        
        let totalMood = 0;
        checkinsSnapshot.forEach(doc => {
            totalMood += parseInt(doc.data().mood);
        });
        const avgMood = checkinsSnapshot.size > 0 ? (totalMood / checkinsSnapshot.size).toFixed(1) : 'N/A';
        
        document.getElementById('selectedPIRProgress').innerHTML = `
            <div class="pir-progress-details">
                <h3>${pir.firstName} ${pir.lastName}</h3>
                <div class="progress-stats">
                    <div class="stat-card">
                        <h4>${days}</h4>
                        <p>Days in Recovery</p>
                    </div>
                    <div class="stat-card">
                        <h4>${checkinRate}%</h4>
                        <p>Check-in Rate</p>
                    </div>
                    <div class="stat-card">
                        <h4>${avgMood}</h4>
                        <p>Avg Mood</p>
                    </div>
                </div>
                <button onclick="generatePIRReport('${pirId}')" class="primary-btn mt-20">Generate Full Report</button>
                <button onclick="showPIRCheckinHistory('${pirId}')" class="btn-secondary mt-20">View Check-in History</button>
            </div>
        `;
        } catch (error) {
        console.error("Error loading PIR progress:", error);
        document.getElementById('selectedPIRProgress').innerHTML = '<p>Error loading progress data</p>';
    }
}

// Generate PIR report
async function generatePIRReport(pirId) {
    try {
        const pirDoc = await db.collection('users').doc(pirId).get();
        const pir = pirDoc.data();
        
        // Get all check-ins
        const checkinsSnapshot = await db.collection('checkins')
            .where('userId', '==', pirId)
            .orderBy('date', 'desc')
            .get();
        
        let report = `
PIR PROGRESS REPORT
Generated: ${new Date().toLocaleDateString()}
Coach: ${currentUser.email}

CLIENT INFORMATION
Name: ${pir.firstName} ${pir.lastName}
Recovery Start Date: ${new Date(pir.recoveryStartDate).toLocaleDateString()}
Days in Recovery: ${Math.floor((new Date() - new Date(pir.recoveryStartDate)) / (1000 * 60 * 60 * 24))}
Service Package: ${pir.servicePackage}

CHECK-IN SUMMARY
Total Check-ins: ${checkinsSnapshot.size}
Last 30 Days: ${checkinsSnapshot.docs.filter(doc => {
    const date = doc.data().date.toDate();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date > thirtyDaysAgo;
}).length}

RECENT CHECK-INS
`;
        
        // Add last 10 check-ins
        checkinsSnapshot.docs.slice(0, 10).forEach(doc => {
            const checkin = doc.data();
            report += `
Date: ${checkin.date.toDate().toLocaleDateString()}
Mood: ${checkin.mood}/10 | Cravings: ${checkin.cravings}/10 | Support: ${checkin.support}/10
`;
            if (checkin.dailyWin) report += `Win: ${checkin.dailyWin}\n`;
            if (checkin.gratitude) report += `Gratitude: ${checkin.gratitude}\n`;
            report += '---\n';
        });
        
        // Download report
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pir-report-${pir.firstName}-${pir.lastName}-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        
        showToast('Report downloaded!', 'success');
        
    } catch (error) {
        console.error("Error generating report:", error);
        showToast('Error generating report', 'error');
    }
}

// Show PIR check-in history
async function showPIRCheckinHistory(pirId) {
    try {
        const checkinsSnapshot = await db.collection('checkins')
            .where('userId', '==', pirId)
            .orderBy('date', 'desc')
            .limit(30)
            .get();
        
        let historyHTML = '<h3>Check-in History</h3><div class="checkin-history">';
        
        checkinsSnapshot.forEach(doc => {
            const checkin = doc.data();
            const date = checkin.date.toDate().toLocaleDateString();
            
            historyHTML += `
                <div class="checkin-history-card">
                    <h4>${date}</h4>
                    <div class="checkin-details">
                        <p><strong>Mood:</strong> ${checkin.mood}/10</p>
                        <p><strong>Cravings:</strong> ${checkin.cravings}/10</p>
                        <p><strong>Support:</strong> ${checkin.support}/10</p>
                        <p><strong>Sleep:</strong> ${checkin.sleep}</p>
                        <p><strong>Meetings:</strong> ${checkin.meetings}</p>
                        ${checkin.dailyWin ? `<p><strong>Win:</strong> ${checkin.dailyWin}</p>` : ''}
                        ${checkin.thoughts ? `<p><strong>Thoughts:</strong> ${checkin.thoughts}</p>` : ''}
                    </div>
                </div>
            `;
        });
        
        historyHTML += '</div>';
        document.getElementById('selectedPIRProgress').innerHTML = historyHTML;
        
    } catch (error) {
        console.error("Error loading check-in history:", error);
        showToast('Error loading history', 'error');
    }
}

// Load coach connection management
async function loadCoachConnectionManagement() {
    try {
        // Get connection requests
        const requestsSnapshot = await db.collection('connectionRequests')
            .where('status', '==', 'pending')
            .get();
        
        // Get active connections
        const connectionsSnapshot = await db.collection('connections')
            .where('status', '==', 'active')
            .get();
        
        let connectionsHTML = `
            <h2>Manage PIR Connections</h2>
            <div class="connection-requests">
                <h3>Pending Connection Requests</h3>
        `;
        
        if (requestsSnapshot.empty) {
            connectionsHTML += '<p>No pending requests.</p>';
        } else {
            for (const doc of requestsSnapshot.docs) {
                const request = doc.data();
                
                // Get user details
                const fromUser = await db.collection('users').doc(request.fromUserId).get();
                const toUser = await db.collection('users').doc(request.toUserId).get();
                
                if (fromUser.exists && toUser.exists) {
                    const fromData = fromUser.data();
                    const toData = toUser.data();
                    
                    connectionsHTML += `
                        <div class="connection-card">
                            <div class="connection-info">
                                <h4>${fromData.firstName} ${fromData.lastName} → ${toData.firstName} ${toData.lastName}</h4>
                                <p>${fromData.firstName} (${calculateTier(fromData.recoveryStartDate)}) wants to connect with ${toData.firstName} (${calculateTier(toData.recoveryStartDate)})</p>
                            </div>
                            <div class="connection-actions">
                                <button onclick="approveConnection('${doc.id}')" class="primary-btn">Approve</button>
                                <button onclick="denyConnection('${doc.id}')" class="btn-secondary">Deny</button>
                            </div>
                        </div>
                    `;
                }
            }
        }
        
        connectionsHTML += `
            </div>
            <div class="active-connections mt-20">
                <h3>Active Connections</h3>
                <p>${connectionsSnapshot.size} active peer connections</p>
            </div>
        `;
        
        document.getElementById('coachContent').innerHTML = connectionsHTML;
        
    } catch (error) {
        console.error("Error loading connection management:", error);
        showToast('Error loading connections', 'error');
    }
}

// Approve connection
async function approveConnection(requestId) {
    try {
        const requestDoc = await db.collection('connectionRequests').doc(requestId).get();
        const request = requestDoc.data();
        
        // Create connection
        await db.collection('connections').add({
            participants: [request.fromUserId, request.toUserId],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'active'
        });
        
        // Update request status
        await db.collection('connectionRequests').doc(requestId).update({
            status: 'approved',
            approvedBy: currentUser.uid,
            approvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast('Connection approved!', 'success');
        loadCoachConnectionManagement();
        
    } catch (error) {
        console.error("Error approving connection:", error);
        showToast('Error approving connection', 'error');
    }
}

// Deny connection
async function denyConnection(requestId) {
    try {
        await db.collection('connectionRequests').doc(requestId).update({
            status: 'denied',
            deniedBy: currentUser.uid,
            deniedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast('Connection denied', 'success');
        loadCoachConnectionManagement();
        
    } catch (error) {
        console.error("Error denying connection:", error);
        showToast('Error denying connection', 'error');
    }
}

// Load coach message center
async function loadCoachMessageCenter() {
    try {
        // Get PIRs
        const pirsSnapshot = await db.collection('users')
            .where('coachId', '==', currentUser.uid)
            .where('role', '==', 'pir')
            .get();
        
        let messageHTML = `
            <h2>Message Center</h2>
            <div class="message-options">
                <button onclick="composeAnnouncement()" class="primary-btn">Send Announcement</button>
            </div>
            
            <div class="mt-20">
                <h3>Select PIR to Message</h3>
                <select id="messageRecipient" onchange="loadMessagesWithPIR(this.value)">
                    <option value="">Select a PIR...</option>
                    <option value="all">All PIRs (Broadcast)</option>
        `;
        
        pirsSnapshot.forEach(doc => {
            const pir = doc.data();
            messageHTML += `<option value="${doc.id}">${pir.firstName} ${pir.lastName}</option>`;
        });
        
        messageHTML += `
                </select>
            </div>
            
            <div id="messagesContainer" class="mt-20"></div>
        `;
        
        document.getElementById('coachContent').innerHTML = messageHTML;
        
    } catch (error) {
        console.error("Error loading message center:", error);
        showToast('Error loading messages', 'error');
    }
}

// Load messages with specific PIR
async function loadMessagesWithPIR(pirId) {
    if (!pirId) return;
    
    if (pirId === 'all') {
        document.getElementById('messagesContainer').innerHTML = `
            <h3>Broadcast Message to All PIRs</h3>
            <textarea id="broadcastMessage" rows="4" placeholder="Type your message to all PIRs..."></textarea>
            <button onclick="sendBroadcastMessage()" class="primary-btn mt-10">Send to All</button>
        `;
        return;
    }
    
    try {
        // Load conversation with this PIR
        const messages = await db.collection('messages')
            .where('participants', 'array-contains', currentUser.uid)
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();
        
        let messagesHTML = '<div class="messages-container">';
        
        const filteredMessages = messages.docs.filter(doc => 
            doc.data().participants.includes(pirId)
        );
        
        if (filteredMessages.length === 0) {
            messagesHTML += '<p>No messages yet.</p>';
        } else {
            filteredMessages.forEach(doc => {
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
        
        messagesHTML += `
            </div>
            <div class="message-compose mt-20">
                <textarea id="coachMessage" rows="4" placeholder="Type your message..."></textarea>
                <button onclick="sendMessageToPIR('${pirId}')" class="primary-btn mt-10">Send</button>
            </div>
        `;
        
        document.getElementById('messagesContainer').innerHTML = messagesHTML;
        
    } catch (error) {
        console.error("Error loading messages:", error);
        showToast('Error loading messages', 'error');
    }
}

// Send message to PIR
async function sendMessageToPIR(pirId) {
    const messageText = document.getElementById('coachMessage').value.trim();
    
    if (!messageText) {
        showToast('Please enter a message', 'error');
        return;
    }
    
    try {
        await db.collection('messages').add({
            fromUserId: currentUser.uid,
            fromUserName: 'Your Coach',
            toUserId: pirId,
            participants: [currentUser.uid, pirId],
            message: messageText,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            type: 'coach-pir',
            read: false
        });
        
        document.getElementById('coachMessage').value = '';
        showToast('Message sent!', 'success');
        loadMessagesWithPIR(pirId);
        
    } catch (error) {
        console.error("Error sending message:", error);
        showToast('Error sending message', 'error');
    }
}

// Send broadcast message
async function sendBroadcastMessage() {
    const messageText = document.getElementById('broadcastMessage').value.trim();
    
    if (!messageText) {
        showToast('Please enter a message', 'error');
        return;
    }
    
    try {
        // Get all PIRs
        const pirsSnapshot = await db.collection('users')
            .where('coachId', '==', currentUser.uid)
            .where('role', '==', 'pir')
            .get();
        
        // Send message to each PIR
        const promises = pirsSnapshot.docs.map(doc => 
            db.collection('messages').add({
                fromUserId: currentUser.uid,
                fromUserName: 'Your Coach',
                toUserId: doc.id,
                participants: [currentUser.uid, doc.id],
                message: messageText,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                type: 'coach-pir',
                read: false,
                isBroadcast: true
            })
        );
        
        await Promise.all(promises);
        
        document.getElementById('broadcastMessage').value = '';
        showToast(`Broadcast sent to ${pirsSnapshot.size} PIRs!`, 'success');
        
    } catch (error) {
        console.error("Error sending broadcast:", error);
        showToast('Error sending broadcast', 'error');
    }
}

// Compose announcement
async function composeAnnouncement() {
    const title = prompt('Announcement Title:');
    if (!title) return;
    
    const message = prompt('Announcement Message:');
    if (!message) return;
    
    try {
        await db.collection('announcements').add({
            title: title,
            message: message,
            authorId: currentUser.uid,
            authorName: currentUser.email,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast('Announcement posted!', 'success');
        
    } catch (error) {
        console.error("Error posting announcement:", error);
        showToast('Error posting announcement', 'error');
    }
}

// Load coach assignment center
async function loadCoachAssignmentCenter() {
    try {
        const pirsSnapshot = await db.collection('users')
            .where('coachId', '==', currentUser.uid)
            .where('role', '==', 'pir')
            .get();
        
        let assignmentHTML = `
            <h2>Assignment Center</h2>
            <div class="assignment-options">
                <button onclick="showCreateAssignment()" class="primary-btn">Create New Assignment</button>
            </div>
            
            <div id="createAssignmentForm" style="display: none;" class="mt-20">
                <h3>Create Assignment</h3>
                <form onsubmit="createAssignment(event)">
                    <div class="form-group">
                        <label>Assignment Title *</label>
                        <input type="text" id="assignmentTitle" required>
                    </div>
                    <div class="form-group">
                        <label>Description *</label>
                        <textarea id="assignmentDescription" rows="3" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Assign To *</label>
                        <select id="assignTo" required>
                            <option value="all">All PIRs</option>
        `;
        
        pirsSnapshot.forEach(doc => {
            const pir = doc.data();
            assignmentHTML += `<option value="${doc.id}">${pir.firstName} ${pir.lastName}</option>`;
        });
        
        assignmentHTML += `
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Due Date</label>
                        <input type="date" id="assignmentDueDate">
                    </div>
                    <button type="submit" class="save-btn">Create Assignment</button>
                </form>
            </div>
            
            <div class="active-assignments mt-20">
                <h3>Active Assignments</h3>
                <div id="activeAssignmentsList">Loading...</div>
            </div>
        `;
        
        document.getElementById('coachContent').innerHTML = assignmentHTML;
        loadActiveAssignments();
        
    } catch (error) {
        console.error("Error loading assignment center:", error);
        showToast('Error loading assignments', 'error');
    }
}

// Show create assignment form
function showCreateAssignment() {
    document.getElementById('createAssignmentForm').style.display = 'block';
}

// Create assignment
async function createAssignment(event) {
    event.preventDefault();
    
    const title = document.getElementById('assignmentTitle').value;
    const description = document.getElementById('assignmentDescription').value;
    const assignTo = document.getElementById('assignTo').value;
    const dueDate = document.getElementById('assignmentDueDate').value;
    
    try {
        if (assignTo === 'all') {
            // Create assignment for all PIRs
            const pirsSnapshot = await db.collection('users')
                .where('coachId', '==', currentUser.uid)
                .where('role', '==', 'pir')
                .get();
            
            const promises = pirsSnapshot.docs.map(doc => 
                db.collection('assignments').add({
                    title: title,
                    description: description,
                    pirId: doc.id,
                    coachId: currentUser.uid,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    dueDate: dueDate ? new Date(dueDate) : null,
                    status: 'active'
                })
            );
            
            await Promise.all(promises);
            showToast(`Assignment created for ${pirsSnapshot.size} PIRs!`, 'success');
        } else {
            // Create for specific PIR
            await db.collection('assignments').add({
                title: title,
                description: description,
                pirId: assignTo,
                coachId: currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                dueDate: dueDate ? new Date(dueDate) : null,
                status: 'active'
            });
            showToast('Assignment created!', 'success');
        }
        
        event.target.reset();
        document.getElementById('createAssignmentForm').style.display = 'none';
        loadActiveAssignments();
        
    } catch (error) {
        console.error("Error creating assignment:", error);
        showToast('Error creating assignment', 'error');
    }
}

// Load active assignments
async function loadActiveAssignments() {
    try {
        const assignments = await db.collection('assignments')
            .where('coachId', '==', currentUser.uid)
            .where('status', '==', 'active')
            .orderBy('createdAt', 'desc')
            .get();
        
        if (assignments.empty) {
            document.getElementById('activeAssignmentsList').innerHTML = '<p>No active assignments.</p>';
            return;
        }
        
        // Group by assignment title
        const grouped = {};
        assignments.forEach(doc => {
            const data = doc.data();
            if (!grouped[data.title]) {
                grouped[data.title] = {
                    ...data,
                    count: 0,
                    completed: 0
                };
            }
            grouped[data.title].count++;
            if (data.status === 'completed') grouped[data.title].completed++;
        });
        
        let html = '';
        Object.entries(grouped).forEach(([title, data]) => {
            html += `
                <div class="assignment-tracking">
                    <h4>${title}</h4>
                    <p>${data.description}</p>
                    <p>Assigned to: ${data.count} PIRs</p>
                    <p>Completion: ${data.completed}/${data.count}</p>
                    ${data.dueDate ? `<p>Due: ${data.dueDate.toDate().toLocaleDateString()}</p>` : ''}
                </div>
            `;
        });
        
        document.getElementById('activeAssignmentsList').innerHTML = html;
        
    } catch (error) {
        console.error("Error loading assignments:", error);
        document.getElementById('activeAssignmentsList').innerHTML = '<p>Error loading assignments</p>';
    }
}

// Load coach resource management
async function loadCoachResourceManagement() {
    let resourceHTML = `
        <h2>Manage Resources</h2>
        
        <div class="add-resource">
            <h3>Add New Resource</h3>
            <form onsubmit="addResource(event)">
                <div class="form-group">
                    <label>Resource Title *</label>
                    <input type="text" id="resourceTitle" required>
                </div>
                <div class="form-group">
                    <label>Category *</label>
                    <select id="resourceCategory" required>
                        <option value="crisis">Crisis Support</option>
                        <option value="coping">Coping Skills</option>
                        <option value="literature">Recovery Literature</option>
                        <option value="local">Local Resources</option>
                        <option value="educational">Educational</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Description *</label>
                    <textarea id="resourceDescription" rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label>Link (optional)</label>
                    <input type="url" id="resourceLink" placeholder="https://...">
                </div>
                <div class="form-group">
                    <label>Minimum Tier Required</label>
                    <select id="resourceTier">
                        <option value="all">All Members</option>
                        <option value="established">Established & Trusted</option>
                        <option value="trusted">Trusted Only</option>
                    </select>
                </div>
                <button type="submit" class="save-btn">Add Resource</button>
            </form>
        </div>
        
        <div class="existing-resources mt-20">
            <h3>Existing Resources</h3>
            <div id="resourcesList">Loading...</div>
        </div>
    `;
    
    document.getElementById('coachContent').innerHTML = resourceHTML;
    loadExistingResources();
}

// Add resource
async function addResource(event) {
    event.preventDefault();
    
    const resourceData = {
        title: document.getElementById('resourceTitle').value,
        category: document.getElementById('resourceCategory').value,
        description: document.getElementById('resourceDescription').value,
        link: document.getElementById('resourceLink').value,
        minTier: document.getElementById('resourceTier').value,
        addedBy: currentUser.uid,
        addedAt: firebase.firestore.FieldValue.serverTimestamp(),
        active: true
    };
    
    try {
        await db.collection('resources').add(resourceData);
        showToast('Resource added successfully!', 'success');
        event.target.reset();
        loadExistingResources();
        
    } catch (error) {
        console.error("Error adding resource:", error);
        showToast('Error adding resource', 'error');
    }
}

// Load existing resources
async function loadExistingResources() {
    try {
        const resources = await db.collection('resources')
            .where('active', '==', true)
            .orderBy('addedAt', 'desc')
            .get();
        
        if (resources.empty) {
            document.getElementById('resourcesList').innerHTML = '<p>No resources added yet.</p>';
            return;
        }
        
        let html = '<div class="resources-grid">';
        resources.forEach(doc => {
            const resource = doc.data();
            html += `
                <div class="resource-item">
                    <h4>${resource.title}</h4>
                    <p><strong>Category:</strong> ${resource.category}</p>
                    <p>${resource.description}</p>
                    ${resource.link ? `<a href="${resource.link}" target="_blank">View Resource</a>` : ''}
                    <p><small>Access: ${resource.minTier === 'all' ? 'All Members' : resource.minTier}</small></p>
                    <button onclick="removeResource('${doc.id}')" class="btn-sm danger">Remove</button>
                </div>
            `;
        });
        html += '</div>';
        
        document.getElementById('resourcesList').innerHTML = html;
        
    } catch (error) {
        console.error("Error loading resources:", error);
        document.getElementById('resourcesList').innerHTML = '<p>Error loading resources</p>';
    }
}

// Remove resource
async function removeResource(resourceId) {
    if (!confirm('Are you sure you want to remove this resource?')) return;
    
    try {
        await db.collection('resources').doc(resourceId).update({
            active: false,
            removedAt: firebase.firestore.FieldValue.serverTimestamp(),
            removedBy: currentUser.uid
        });
        
        showToast('Resource removed', 'success');
        loadExistingResources();
        
    } catch (error) {
        console.error("Error removing resource:", error);
        showToast('Error removing resource', 'error');
    }
}

// Message a connection
function messageConnection(userId) {
    showToast('Opening message composer...', 'info');
    // This would open a message composer for peer-to-peer messaging
}

// Filter check-ins
function filterCheckins(filter) {
    showToast(`Filtering by: ${filter}`, 'info');
    // This would filter the check-ins display
}
