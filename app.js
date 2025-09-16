// GLRS PIR Platform with Firebase Integration
// Global variables
let currentUser = null;
let userRole = null;
let userTier = null;
let userDocData = null;

// Listen for auth state changes
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // User is signed in
        await loadUserData(user.uid);
    } else {
        // User is signed out
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
                
                // Check if first login
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

// Initialize app - removed the old code that was showing terms
document.addEventListener('DOMContentLoaded', function() {
    // Firebase will handle everything through onAuthStateChanged
});

// Show login screen
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('pirInterface').classList.add('hidden');
    document.getElementById('coachInterface').classList.add('hidden');
    document.getElementById('userInfo').classList.add('hidden');
    document.getElementById('termsModal').style.display = 'none';
    document.getElementById('passwordModal').style.display = 'none';
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
        alert('Please enter email and password');
        return;
    }
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        // onAuthStateChanged will handle the rest
    } catch (error) {
        console.error("Login error:", error);
        alert("Login failed: " + error.message);
    }
}

// Logout function
async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            await auth.signOut();
            document.getElementById('loginInput').value = '';
            document.getElementById('password').value = '';
        } catch (error) {
            console.error("Logout error:", error);
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
        proceedToApp();
        
    } catch (error) {
        console.error("Error accepting terms:", error);
        alert("Error accepting terms. Please try again.");
    }
}

// Change password function
async function changePassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!newPassword || !confirmPassword) {
        alert('Please enter and confirm your new password');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (newPassword.length < 8) {
        alert('Password must be at least 8 characters long');
        return;
    }
    
    try {
        // Update password
        await auth.currentUser.updatePassword(newPassword);
        
        // Update firstLogin flag
        await db.collection('users').doc(currentUser.uid).update({
            firstLogin: false
        });
        
        userDocData.firstLogin = false;
        alert('Password updated successfully!');
        document.getElementById('passwordModal').style.display = 'none';
        
        // Continue to terms
        if (!userDocData.termsAccepted) {
            showTermsModal();
        } else {
            proceedToApp();
        }
        
    } catch (error) {
        console.error("Password update error:", error);
        alert("Error updating password: " + error.message);
    }
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
        document.getElementById('coachInterface').classList.add('hidden');
        updateTierFeatures();
        loadPIRDashboard();
    } else {
        document.getElementById('userName').textContent = currentUser.email;
        document.getElementById('userTier').textContent = 'Coach';
        document.getElementById('coachInterface').classList.remove('hidden');
        document.getElementById('pirInterface').classList.add('hidden');
        loadCoachDashboard();
    }
}

// Calculate tier
function calculateTier(recoveryDate) {
    const days = Math.floor((new Date() - new Date(recoveryDate)) / (1000 * 60 * 60 * 24));
    if (days < 30) return 'new';
    if (days < 90) return 'established';
    return 'trusted';
}

// Create PIR Account (Coach Function)
async function createPIRAccount(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('pirEmail').value;
    const coachEmail = currentUser.email;
    const coachPassword = prompt("Please enter your password to continue:");
    
    if (!coachPassword) {
        alert("Password required to create account");
        return;
    }
    
    // Generate temporary password
    const tempPassword = 'Temp' + Math.random().toString(36).slice(-8) + '!';
    
    try {
        // Create auth account
        const userCredential = await auth.createUserWithEmailAndPassword(email, tempPassword);
        const uid = userCredential.user.uid;
        
        // Create user document in Firestore
        await db.collection('users').doc(uid).set({
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
            coachId: currentUser.uid,
            createdBy: currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            firstLogin: true,
            termsAccepted: false,
            tier: calculateTier(document.getElementById('recoveryDate').value)
        });
        
        // Show success message
        document.getElementById('accountCreatedInfo').innerHTML = `
            <div class="generated-credentials">
                <h3>✓ Account Created Successfully!</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                <p class="mt-10">Please share these credentials with the PIR</p>
                <button onclick="copyCredentials('${email}', '${tempPassword}')" class="primary-btn">Copy Credentials</button>
                <button onclick="showCoachSection('createAccount')" class="btn-secondary">Create Another</button>
            </div>
        `;
        document.getElementById('accountCreatedInfo').style.display = 'block';
        
        // Reset form
        event.target.reset();
        
        // Sign back in as coach
        await auth.signInWithEmailAndPassword(coachEmail, coachPassword);
        
    } catch (error) {
        console.error("Error creating PIR account:", error);
        alert("Error creating account: " + error.message);
        
        // Try to sign back in as coach if there was an error
        try {
            await auth.signInWithEmailAndPassword(coachEmail, coachPassword);
        } catch (e) {
            console.error("Could not re-authenticate coach:", e);
        }
    }
}

// Copy credentials to clipboard
function copyCredentials(email, password) {
    const text = `Email: ${email}\nPassword: ${password}`;
    navigator.clipboard.writeText(text).then(() => {
        alert('Credentials copied to clipboard!');
    }).catch(() => {
        alert('Could not copy to clipboard. Please copy manually.');
    });
}

// Save check-in function
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
        alert('Check-in saved! Keep up the great work!');
        document.getElementById('checkinForm').reset();
        updateSlider('mood');
        updateSlider('cravings');
        updateSlider('support');
        loadRecentCheckins();
    } catch (error) {
        console.error("Error saving check-in:", error);
        alert("Error saving check-in. Please try again.");
    }
}

// Check for crisis keywords
function checkForCrisisKeywords(text) {
    if (!text) return false;
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'self-harm', 'hurt myself', 'want to die'];
    const lowerText = text.toLowerCase();
    return crisisKeywords.some(keyword => lowerText.includes(keyword));
}

// Handle crisis alert
async function handleCrisisAlert(checkinData) {
    alert(`IMPORTANT: Based on your response, we're concerned about your safety. 
    
Per our terms of service, we are required to contact emergency services when someone expresses thoughts of self-harm.

Please call 988 (Suicide & Crisis Lifeline) immediately for support.

If you're in immediate danger, call 911.`);
    
    try {
        await db.collection('alerts').add({
            userId: currentUser.uid,
            userEmail: currentUser.email,
            userName: currentUser.firstName + ' ' + currentUser.lastName,
            coachId: currentUser.coachId,
            type: 'crisis',
            checkinData: checkinData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
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

// Load recent check-ins
async function loadRecentCheckins() {
    if (!currentUser) return;
    
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const checkinsSnapshot = await db.collection('checkins')
            .where('userId', '==', currentUser.uid)
            .where('date', '>', sevenDaysAgo)
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
                    ${checkin.dailyWin ? `<p>Win: ${checkin.dailyWin}</p>` : ''}
                </div>
            `;
        });
        
        recentList.innerHTML = checkinsHTML;
        
    } catch (error) {
        console.error("Error loading check-ins:", error);
    }
}

// Initialize check-in form listener
document.addEventListener('DOMContentLoaded', function() {
    const checkinForm = document.getElementById('checkinForm');
    if (checkinForm) {
        checkinForm.addEventListener('submit', saveCheckin);
    }
});

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

// Coach Section Navigation
function showCoachSection(section) {
    const content = document.getElementById('coachContent');
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    switch(section) {
        case 'overview':
            content.innerHTML = generateCoachOverview();
            break;
        case 'createAccount':
            content.innerHTML = generateCreateAccountForm();
            break;
        case 'checkins':
            content.innerHTML = generateCheckinsReview();
            break;
        case 'progress':
            content.innerHTML = generateProgressTracking();
            break;
        case 'connections':
            content.innerHTML = generateConnectionManagement();
            break;
        case 'messages':
            content.innerHTML = generateMessageCenter();
            break;
        case 'assignments':
            content.innerHTML = generateAssignmentCenter();
            break;
        case 'resources':
            content.innerHTML = generateResourceManagement();
            break;
    }
}

// PIR Dashboard
function loadPIRDashboard() {
    const days = Math.floor((new Date() - new Date(currentUser.recoveryStartDate)) / (1000 * 60 * 60 * 24));
    document.getElementById('streakDays').textContent = days;
    
    // This will be updated with real data later
    document.getElementById('weeklyCheckins').textContent = '0/7';
    document.getElementById('nextSession').textContent = 'Tomorrow 2PM';
    
    const alertsList = document.getElementById('alertsList');
    alertsList.innerHTML = `
        <div class="alert-item info">
            <strong>Welcome back!</strong> Don't forget your daily check-in.
        </div>
        <div class="alert-item warning">
            <strong>Session Tomorrow:</strong> Prepare your weekly goals.
        </div>
    `;
}

// Progress Content
function loadProgressContent() {
    const days = Math.floor((new Date() - new Date(currentUser.recoveryStartDate)) / (1000 * 60 * 60 * 24));
    
    document.getElementById('progressContent').innerHTML = `
        <div class="stat-card">
            <h3>${days}</h3>
            <p>Total Days in Recovery</p>
        </div>
        
        <h3>Recovery Milestones</h3>
        <div class="milestone-list">
            <div class="milestone ${days >= 1 ? 'achieved' : ''}">
                <span>✓</span>
                24 Hours
            </div>
            <div class="milestone ${days >= 7 ? 'achieved' : ''}">
                <span>✓</span>
                1 Week
            </div>
            <div class="milestone ${days >= 30 ? 'achieved' : ''}">
                <span>✓</span>
                30 Days
            </div>
            <div class="milestone ${days >= 60 ? 'achieved' : ''}">
                <span>✓</span>
                60 Days
            </div>
            <div class="milestone ${days >= 90 ? 'achieved' : ''}">
                <span>✓</span>
                90 Days
            </div>
            <div class="milestone ${days >= 180 ? 'achieved' : ''}">
                <span>✓</span>
                6 Months
            </div>
            <div class="milestone ${days >= 365 ? 'achieved' : ''}">
                <span>✓</span>
                1 Year
            </div>
        </div>
        
        <div class="progress-chart">
            <h3>Your Recovery Trends</h3>
            <p>Check back after a few check-ins to see your trends!</p>
        </div>
    `;
}

// Connections Content
function loadConnectionsContent() {
    if (userTier === 'new') {
        document.getElementById('connectionsContent').innerHTML = `
            <div class="tier-locked">
                <h3>🔒 Unlock at 30 Days</h3>
                <p>Connection features help you build a support network with other PIRs.</p>
                <p>Focus on your daily check-ins and personal foundation first.</p>
                <p>You'll unlock this feature in ${30 - Math.floor((new Date() - new Date(currentUser.recoveryStartDate)) / (1000 * 60 * 60 * 24))} days!</p>
            </div>
        `;
    } else {
        document.getElementById('connectionsContent').innerHTML = `
            <div class="connections-section">
                <h3>Your Recovery Buddies</h3>
                <div id="connectionsList">
                    <p>No connections yet.</p>
                </div>
                
                <h3 class="mt-20">Request New Connection</h3>
                <button onclick="findConnections()" class="primary-btn">Find Recovery Buddies</button>
                
                ${userTier === 'trusted' ? `
                    <h3 class="mt-20">Mentor Others</h3>
                    <p>As a trusted member, you can now mentor newer PIRs!</p>
                    <button onclick="volunteerMentor()" class="primary-btn">Become a Mentor</button>
                ` : ''}
            </div>
        `;
    }
}

// Messages Content
function loadMessagesContent() {
    const messagesHTML = `
        <div class="message-tabs">
            <button onclick="showMessageTab('coach')" class="active">Coach Messages</button>
            ${userTier !== 'new' ? '<button onclick="showMessageTab(\'peers\')">Peer Messages</button>' : ''}
            <button onclick="showMessageTab('announcements')">Announcements</button>
        </div>
        
        <div id="messageTabContent">
            <div class="message-list">
                <div class="message-item">
                    <div class="message-header">
                        <span class="message-from">Your Coach</span>
                        <span class="message-time">Welcome</span>
                    </div>
                    <p>Welcome to GLRS Recovery Connect! I'm here to support your recovery journey.</p>
                </div>
            </div>
            
            <div class="message-compose">
                <h4>Send Message</h4>
                <textarea placeholder="Type your message..." rows="4"></textarea>
                <button class="primary-btn mt-10">Send</button>
            </div>
        </div>
    `;
    
    document.getElementById('messagesContent').innerHTML = messagesHTML;
}

// Session Tools Content
function loadSessionContent() {
    document.getElementById('sessionContent').innerHTML = `
        <div class="assignments-section">
            <h3>Current Assignments</h3>
            <div class="assignment-card">
                <h4>Daily Gratitude Journal</h4>
                <p>Write three things you're grateful for each day</p>
                <p class="assignment-due">Due: Ongoing</p>
                <button onclick="markComplete('assignment1')" class="primary-btn">Mark Complete</button>
            </div>
        </div>
        
        <div class="session-prep">
            <h3>Prepare for Next Session</h3>
            <ul>
                <li>Review your weekly check-in patterns</li>
                <li>Identify challenges you faced</li>
                <li>List questions for your coach</li>
                <li>Celebrate your wins!</li>
            </ul>
        </div>
    `;
}

// Coach Functions
function loadCoachDashboard() {
    showCoachSection('overview');
}

function generateCoachOverview() {
    return `
        <h2>Coach Dashboard</h2>
        <div class="quick-stats">
            <div class="stat-card">
                <h3>0</h3>
                <p>Active PIRs</p>
            </div>
            <div class="stat-card">
                <h3>0</h3>
                <p>Alerts Today</p>
            </div>
        </div>
        
        <div class="mt-20">
            <h3>Getting Started</h3>
            <p>Welcome to your coach dashboard! Start by creating PIR accounts for your clients.</p>
        </div>
    `;
}

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
                
                <button type="submit" class="save-btn">Create Account & Generate Credentials</button>
            </form>
        </div>
        
        <div id="accountCreatedInfo" style="display: none;"></div>
    `;
}

function generateCheckinsReview() {
    return `
        <h2>PIR Check-ins Review</h2>
        <p>Check-ins from your PIRs will appear here.</p>
    `;
}

function generateProgressTracking() {
    return `
        <h2>PIR Progress Tracking</h2>
        <p>Track your PIRs' recovery progress here.</p>
    `;
}

function generateConnectionManagement() {
    return `
        <h2>Manage PIR Connections</h2>
        <p>Manage peer connections between PIRs here.</p>
    `;
}

function generateMessageCenter() {
    return `
        <h2>Message Center</h2>
        <p>Send messages to your PIRs here.</p>
    `;
}

function generateAssignmentCenter() {
    return `
        <h2>Assignment Center</h2>
        <p>Create and manage assignments for your PIRs here.</p>
    `;
}

function generateResourceManagement() {
    return `
        <h2>Manage Resources</h2>
        <p>Update recovery resources available to PIRs here.</p>
    `;
}

// Placeholder functions for features not yet implemented
function findConnections() {
    alert('Connection finder coming soon!');
}

function volunteerMentor() {
    alert('Mentor program coming soon!');
}

function showMessageTab(tab) {
    alert(`${tab} messages coming soon!`);
}

function markComplete(assignmentId) {
    alert('Assignment tracking coming soon!');
}
