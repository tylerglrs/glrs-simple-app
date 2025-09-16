// PIR Platform with Coach Controls and Google Sheets Integration
// Global variables
let currentUser = null;
let userRole = null;
let userTier = null;

// Simulated database (will be replaced with Google Sheets)
let mockDatabase = {
    users: [],
    checkins: [],
    connections: [],
    messages: [],
    assignments: []
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
        const userData = JSON.parse(remembered);
        if (userData.firstLogin) {
            showTermsModal();
        } else {
            autoLogin(userData);
        }
    } else {
        document.getElementById('loginScreen').style.display = 'block';
    }
});

// Terms Modal Functions
function showTermsModal() {
    document.getElementById('termsModal').style.display = 'flex';
}

function acceptTerms() {
    if (currentUser) {
        currentUser.termsAccepted = new Date().toISOString();
        currentUser.firstLogin = false;
        localStorage.setItem('termsAccepted_' + currentUser.username, 'true');
    }
    
    document.getElementById('termsModal').style.display = 'none';
    proceedToApp();
}

// Login Functions
function login() {
    const loginInput = document.getElementById('loginInput').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!loginInput || !password) {
        alert('Please enter username/email and password');
        return;
    }
    
    authenticateUser(loginInput, password, rememberMe);
}

function authenticateUser(credential, password, remember) {
    // Check if coach
    if (credential.includes('@glrecoveryservices.com')) {
        currentUser = {
            id: Date.now(),
            email: credential,
            name: 'Coach ' + credential.split('@')[0],
            role: 'coach',
            firstLogin: false
        };
        userRole = 'coach';
    } else {
        // PIR user - simulate finding in database
        const recoveryDate = new Date();
        recoveryDate.setDate(recoveryDate.getDate() - 45);
        
        currentUser = {
            id: Date.now(),
            username: credential.includes('@') ? credential.split('@')[0] : credential,
            email: credential.includes('@') ? credential : credential + '@example.com',
            name: 'John Doe', // Would come from database
            role: 'pir',
            recoveryStartDate: recoveryDate.toISOString(),
            tier: calculateTier(recoveryDate),
            firstLogin: !localStorage.getItem('termsAccepted_' + credential),
            coachId: 'coach1'
        };
        userRole = 'pir';
        userTier = currentUser.tier;
    }
    
    if (remember) {
        localStorage.setItem('rememberedUser', JSON.stringify(currentUser));
    }
    
    if (currentUser.firstLogin && userRole === 'pir') {
        showTermsModal();
    } else {
        proceedToApp();
    }
}

function calculateTier(recoveryDate) {
    const days = Math.floor((new Date() - new Date(recoveryDate)) / (1000 * 60 * 60 * 24));
    if (days < 30) return 'new';
    if (days < 90) return 'established';
    return 'trusted';
}

function proceedToApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('userName').textContent = currentUser.name;
    
    if (userRole === 'pir') {
        document.getElementById('userTier').textContent = userTier.charAt(0).toUpperCase() + userTier.slice(1);
        document.getElementById('userTier').className = 'tier-badge ' + userTier;
        document.getElementById('pirInterface').classList.remove('hidden');
        updateTierFeatures();
        loadPIRDashboard();
    } else {
        document.getElementById('userTier').textContent = 'Coach';
        document.getElementById('coachInterface').classList.remove('hidden');
        loadCoachDashboard();
    }
}

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
    
    const weeklyCheckins = getWeeklyCheckins();
    document.getElementById('weeklyCheckins').textContent = `${weeklyCheckins}/7`;
    
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

// Check-in Functions
document.getElementById('checkinForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const checkinData = {
        userId: currentUser.id,
        date: new Date().toISOString(),
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
        showCrisisAlert();
        return;
    }
    
    mockDatabase.checkins.push(checkinData);
    saveToGoogleSheets('checkin', checkinData);
    
    alert('Check-in saved! Keep up the great work!');
    document.getElementById('checkinForm').reset();
    updateSlider('mood');
    updateSlider('cravings');
    updateSlider('support');
    
    loadRecentCheckins();
});

function loadRecentCheckins() {
    const recentList = document.getElementById('recentCheckinsList');
    const userCheckins = mockDatabase.checkins
        .filter(c => c.userId === currentUser.id)
        .slice(-7)
        .reverse();
    
    if (userCheckins.length === 0) {
        recentList.innerHTML = '<p>No check-ins yet. Start building your history!</p>';
        return;
    }
    
    recentList.innerHTML = userCheckins.map(checkin => {
        const date = new Date(checkin.date).toLocaleDateString();
        const moodClass = checkin.mood >= 7 ? 'mood-good' : checkin.mood >= 4 ? 'mood-fair' : 'mood-poor';
        
        return `
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
    }).join('');
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
            <p>Average mood this week: ${calculateAverageMood()}/10</p>
            <p>Check-in streak: ${getCheckInStreak()} days</p>
            <p>Most common gratitude theme: Family & Friends</p>
        </div>
        
        <div class="mt-20">
            <button onclick="downloadProgress()" class="primary-btn">Download Progress Report</button>
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
                        <span class="message-time">2 hours ago</span>
                    </div>
                    <p>Great job on your consistent check-ins this week! Let's discuss your progress in our next session.</p>
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
            
            <div class="assignment-card">
                <h4>Recovery Goals Worksheet</h4>
                <p>Complete the SMART goals worksheet for next session</p>
                <p class="assignment-due">Due: ${getNextSessionDate()}</p>
                <button onclick="downloadWorksheet('goals')" class="primary-btn">Download Worksheet</button>
            </div>
        </div>
        
        <div class="upload-section">
            <h3>Upload Completed Work</h3>
            <p>Drag files here or click to upload</p>
            <input type="file" id="fileUpload" style="display: none;">
            <button onclick="document.getElementById('fileUpload').click()" class="primary-btn">Choose Files</button>
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
                <h3>24</h3>
                <p>Active PIRs</p>
            </div>
            <div class="stat-card">
                <h3>3</h3>
                <p>Alerts Today</p>
            </div>
            <div class="stat-card">
                <h3>87%</h3>
                <p>Check-in Rate</p>
            </div>
            <div class="stat-card">
                <h3>5</h3>
                <p>Pending Actions</p>
            </div>
        </div>
        
        <div class="alerts-section">
            <h3>Requires Attention</h3>
            <div class="alert-item warning">
                <strong>John D.</strong> - Crisis keywords detected in check-in
                <button onclick="viewAlert('john-crisis')" class="btn-sm">Review</button>
            </div>
            <div class="alert-item">
                <strong>Sarah M.</strong> - 3 missed check-ins
                <button onclick="reachOut('sarah')" class="btn-sm">Send Message</button>
            </div>
        </div>
        
        <div class="mt-20">
            <h3>Today's Schedule</h3>
            <ul>
                <li>10:00 AM - Session with Mike R.</li>
                <li>11:30 AM - Session with Jennifer L.</li>
                <li>2:00 PM - Group Support Meeting</li>
                <li>3:30 PM - New PIR Intake (David S.)</li>
            </ul>
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
                
                <button type="submit" class="save-btn">Create Account & Send Credentials</button>
            </form>
        </div>
        
        <div id="accountCreatedInfo" style="display: none;"></div>
    `;
}

function createPIRAccount(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('pirEmail').value;
    
    // Generate username and temporary password
    const username = firstName.toLowerCase() + lastName.charAt(0).toLowerCase() + Math.floor(Math.random() * 1000);
    const tempPassword = 'Temp' + Math.random().toString(36).slice(-8) + '!';
    
    const newPIR = {
        id: Date.now(),
        username: username,
        email: email,
        firstName: firstName,
        lastName: lastName,
        phone: document.getElementById('pirPhone').value,
        recoveryStartDate: document.getElementById('recoveryDate').value,
        servicePackage: document.getElementById('servicePackage').value,
        emergencyContact: {
            name: document.getElementById('emergencyName').value,
            phone: document.getElementById('emergencyPhone').value
        },
        notes: document.getElementById('initialNotes').value,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        tempPassword: tempPassword,
        firstLogin: true
    };
    
    // Save to database (Google Sheets)
    saveToGoogleSheets('createPIR', newPIR);
    
    // Show success message
    document.getElementById('accountCreatedInfo').innerHTML = `
        <div class="generated-credentials">
            <h3>✓ Account Created Successfully!</h3>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p class="mt-10">An email with login credentials has been queued for sending to ${email}</p>
            <button onclick="copyCredentials('${username}', '${tempPassword}')" class="primary-btn">Copy Credentials</button>
        </div>
    `;
    document.getElementById('accountCreatedInfo').style.display = 'block';
    
    // Reset form
    event.target.reset();
}

function generateCheckinsReview() {
    return `
        <h2>PIR Check-ins Review</h2>
        <div class="checkin-filters">
            <select onchange="filterCheckins(this.value)">
                <option value="all">All PIRs</option>
                <option value="alerts">With Alerts</option>
                <option value="missed">Missed Check-ins</option>
            </select>
        </div>
        
        <div class="checkin-review-grid">
            <div class="pir-checkin-card alert">
                <h4>John Doe</h4>
                <p>Last check-in: 3 hours ago</p>
                <div class="checkin-summary">
                    <div class="checkin-metric">
                        <strong>Mood</strong>
                        <span>3/10</span>
                    </div>
                    <div class="checkin-metric">
                        <strong>Cravings</strong>
                        <span>8/10</span>
                    </div>
                    <div class="checkin-metric">
                        <strong>Support</strong>
                        <span>2/10</span>
                    </div>
                </div>
                <p class="alert-text">⚠️ Low mood and high cravings</p>
                <button onclick="viewFullCheckin('john')" class="primary-btn">View Details</button>
            </div>
            
            <div class="pir-checkin-card">
                <h4>Sarah Miller</h4>
                <p>Last check-in: Yesterday</p>
                <div class="checkin-summary">
                    <div class="checkin-metric">
                        <strong>Mood</strong>
                        <span>7/10</span>
                    </div>
                    <div class="checkin-metric">
                        <strong>Cravings</strong>
                        <span>2/10</span>
                    </div>
                    <div class="checkin-metric">
                        <strong>Support</strong>
                        <span>8/10</span>
                    </div>
                </div>
                <button onclick="viewFullCheckin('sarah')" class="primary-btn">View Details</button>
            </div>
        </div>
    `;
}

function generateProgressTracking() {
    return `
        <h2>PIR Progress Tracking</h2>
        <div class="progress-overview">
            <select onchange="loadPIRProgress(this.value)" class="mb-20">
                <option value="">Select a PIR</option>
                <option value="john">John Doe</option>
                <option value="sarah">Sarah Miller</option>
                <option value="mike">Mike Roberts</option>
            </select>
            
            <div id="selectedPIRProgress">
                <p>Select a PIR to view their progress details.</p>
            </div>
        </div>
    `;
}

function generateConnectionManagement() {
    return `
        <h2>Manage PIR Connections</h2>
        <div class="connection-requests">
            <h3>Pending Connection Requests</h3>
            <div class="connection-card">
                <div class="connection-info">
                    <h4>Sarah M. → Jennifer L.</h4>
                    <p>Sarah (45 days) wants to connect with Jennifer (52 days)</p>
                    <p>Both in Established tier</p>
                </div>
                <div class="connection-actions">
                    <button onclick="approveConnection('sarah-jennifer')" class="primary-btn">Approve</button>
                    <button onclick="denyConnection('sarah-jennifer')" class="btn-secondary">Deny</button>
                </div>
            </div>
        </div>
        
        <div class="active-connections mt-20">
            <h3>Active Connections</h3>
            <p>12 active peer connections across all PIRs</p>
            <button onclick="viewAllConnections()" class="primary-btn">View All Connections</button>
        </div>
    `;
}

function generateMessageCenter() {
    return `
        <h2>Message Center</h2>
        <div class="message-options">
            <button onclick="composeAnnouncement()" class="primary-btn">Send Announcement</button>
            <button onclick="viewMessageHistory()" class="btn-secondary">Message History</button>
        </div>
        
        <div class="recent-messages mt-20">
            <h3>Recent Conversations</h3>
            <div class="message-item">
                <div class="message-header">
                    <span class="message-from">To: John Doe</span>
                    <span class="message-time">Yesterday</span>
                </div>
                <p>Great progress on your check-ins! Looking forward to our session.</p>
            </div>
        </div>
        
        <div class="compose-section mt-20">
            <h3>Quick Message</h3>
            <select id="messageTo">
                <option value="">Select PIR</option>
                <option value="all">All PIRs</option>
                <option value="john">John Doe</option>
                <option value="sarah">Sarah Miller</option>
            </select>
            <textarea rows="4" placeholder="Type your message..."></textarea>
            <button onclick="sendQuickMessage()" class="save-btn">Send Message</button>
        </div>
    `;
}

function generateAssignmentCenter() {
    return `
        <h2>Assignment Center</h2>
        <div class="assignment-options">
            <button onclick="createAssignment()" class="primary-btn">Create New Assignment</button>
            <button onclick="viewTemplates()" class="btn-secondary">Assignment Templates</button>
        </div>
        
        <div class="active-assignments mt-20">
            <h3>Active Assignments</h3>
            <div class="assignment-tracking">
                <div class="assignment-card">
                    <h4>Daily Gratitude Journal</h4>
                    <p>Assigned to: All PIRs</p>
                    <p>Completion rate: 78%</p>
                    <button onclick="viewAssignmentDetails('gratitude')" class="btn-sm">View Details</button>
                </div>
                
                <div class="assignment-card">
                    <h4>SMART Goals Worksheet</h4>
                    <p>Assigned to: 8 PIRs</p>
                    <p>Due: End of week</p>
                    <p>Completion rate: 45%</p>
                    <button onclick="viewAssignmentDetails('goals')" class="btn-sm">View Details</button>
                </div>
            </div>
        </div>
        
        <div class="upload-worksheet mt-20">
            <h3>Upload New Worksheet</h3>
            <input type="file" accept=".pdf,.doc,.docx">
            <button onclick="uploadWorksheet()" class="primary-btn mt-10">Upload</button>
        </div>
    `;
}

function generateResourceManagement() {
    return `
        <h2>Manage Resources</h2>
        <div class="resource-categories">
            <button onclick="editCategory('crisis')" class="btn-secondary">Crisis Resources</button>
            <button onclick="editCategory('coping')" class="btn-secondary">Coping Skills</button>
            <button onclick="editCategory('literature')" class="btn-secondary">Recovery Literature</button>
            <button onclick="editCategory('local')" class="btn-secondary">Local Resources</button>
        </div>
        
        <div class="add-resource mt-20">
            <h3>Add New Resource</h3>
            <form onsubmit="addResource(event)">
                <div class="form-group">
                    <label>Resource Title</label>
                    <input type="text" id="resourceTitle" required>
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select id="resourceCategory" required>
                        <option value="crisis">Crisis Support</option>
                        <option value="coping">Coping Skills</option>
                        <option value="literature">Recovery Literature</option>
                        <option value="local">Local Resources</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="resourceDescription" rows="3" required></textarea>
                </div>
                <button type="submit" class="save-btn">Add Resource</button>
            </form>
        </div>
    `;
}

// Utility Functions
function updateSlider(sliderId) {
    const value = document.getElementById(sliderId).value;
    document.getElementById(sliderId + 'Value').textContent = value;
}

function checkForCrisisKeywords(text) {
    if (!text) return false;
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'self-harm', 'hurt myself', 'want to die'];
    const lowerText = text.toLowerCase();
    return crisisKeywords.some(keyword => lowerText.includes(keyword));
}

function showCrisisAlert() {
    alert(`IMPORTANT: Based on your response, we're concerned about your safety. 
    
Per our terms of service, we are required to contact emergency services when someone expresses thoughts of self-harm.

Please call 988 (Suicide & Crisis Lifeline) immediately for support.

If you're in immediate danger, call 911.`);
    
    saveToGoogleSheets('crisisAlert', {
        userId: currentUser.id,
        timestamp: new Date().toISOString(),
        type: 'self-harm keywords detected'
    });
}

function getWeeklyCheckins() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return mockDatabase.checkins.filter(c => 
        c.userId === currentUser.id && 
        new Date(c.date) > weekAgo
    ).length;
}

function getCheckInStreak() {
    // Calculate consecutive days of check-ins
    return Math.floor(Math.random() * 14) + 1; // Mock data
}

function calculateAverageMood() {
    const recentCheckins = mockDatabase.checkins
        .filter(c => c.userId === currentUser.id)
        .slice(-7);
    
    if (recentCheckins.length === 0) return 'N/A';
    
    const avgMood = recentCheckins.reduce((sum, c) => sum + parseInt(c.mood), 0) / recentCheckins.length;
    return avgMood.toFixed(1);
}

function getNextSessionDate() {
    const nextSession = new Date();
    nextSession.setDate(nextSession.getDate() + ((7 - nextSession.getDay()) % 7 || 7));
    return nextSession.toLocaleDateString();
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        userRole = null;
        userTier = null;
        
        if (!document.getElementById('rememberMe')?.checked) {
            localStorage.removeItem('rememberedUser');
        }
        
        document.getElementById('pirInterface').classList.add('hidden');
        document.getElementById('coachInterface').classList.add('hidden');
        document.getElementById('userInfo').classList.add('hidden');
        document.getElementById('loginScreen').style.display = 'block';
        
        document.getElementById('loginInput').value = '';
        document.getElementById('password').value = '';
    }
}

function autoLogin(userData) {
    currentUser = userData;
    userRole = userData.role;
    if (userData.role === 'pir') {
        userTier = calculateTier(userData.recoveryStartDate);
    }
    proceedToApp();
}

function copyCredentials(username, password) {
    const text = `Username: ${username}\nPassword: ${password}`;
    navigator.clipboard.writeText(text).then(() => {
        alert('Credentials copied to clipboard!');
    });
}

function saveToGoogleSheets(action, data) {
    console.log('Saving to Google Sheets:', action, data);
    // Will be replaced with actual Google Sheets API integration
}

// Additional mock functions for coach actions
function viewAlert(alertId) {
    alert(`Viewing alert: ${alertId}`);
}

function reachOut(pirId) {
    alert(`Opening message composer for PIR: ${pirId}`);
}

function viewFullCheckin(pirId) {
    alert(`Loading full check-in details for: ${pirId}`);
}

function approveConnection(connectionId) {
    alert(`Connection approved: ${connectionId}`);
}

function denyConnection(connectionId) {
    alert(`Connection denied: ${connectionId}`);
}

function downloadProgress() {
    alert('Progress report download started...');
}
function downloadWorksheet(type) {
    alert(`Downloading ${type} worksheet...`);
}

function markComplete(assignmentId) {
    alert(`Marking assignment ${assignmentId} as complete`);
}

function findConnections() {
    alert('Opening connection finder...');
}

function volunteerMentor() {
    alert('Thank you for volunteering to mentor! We\'ll match you with newer PIRs.');
}

function showMessageTab(tab) {
    document.querySelectorAll('.message-tabs button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    // Load appropriate messages
}

function loadPIRProgress(pirId) {
    if (!pirId) return;
    
    document.getElementById('selectedPIRProgress').innerHTML = `
        <div class="pir-progress-details">
            <h3>${pirId === 'john' ? 'John Doe' : pirId === 'sarah' ? 'Sarah Miller' : 'Mike Roberts'}</h3>
            <div class="progress-stats">
                <div class="stat-card">
                    <h4>45</h4>
                    <p>Days in Recovery</p>
                </div>
                <div class="stat-card">
                    <h4>85%</h4>
                    <p>Check-in Rate</p>
                </div>
                <div class="stat-card">
                    <h4>7.2</h4>
                    <p>Avg Mood</p>
                </div>
            </div>
            <button onclick="generatePIRReport('${pirId}')" class="primary-btn mt-20">Generate Full Report</button>
        </div>
    `;
}

function generatePIRReport(pirId) {
    alert(`Generating comprehensive report for PIR: ${pirId}`);
}

function composeAnnouncement() {
    const message = prompt('Enter announcement message for all PIRs:');
    if (message) {
        alert('Announcement queued for sending to all PIRs');
    }
}

function sendQuickMessage() {
    const to = document.getElementById('messageTo').value;
    const message = document.querySelector('.compose-section textarea').value;
    
    if (!to || !message) {
        alert('Please select a recipient and enter a message');
        return;
    }
    
    alert(`Message sent to ${to}`);
    document.querySelector('.compose-section textarea').value = '';
}

function createAssignment() {
    alert('Opening assignment creation form...');
}

function viewTemplates() {
    alert('Loading assignment templates...');
}

function viewAssignmentDetails(assignmentId) {
    alert(`Loading details for assignment: ${assignmentId}`);
}

function uploadWorksheet() {
    const fileInput = document.querySelector('.upload-worksheet input[type="file"]');
    if (fileInput.files.length > 0) {
        alert(`Uploading worksheet: ${fileInput.files[0].name}`);
    } else {
        alert('Please select a file to upload');
    }
}

function addResource(event) {
    event.preventDefault();
    
    const resource = {
        title: document.getElementById('resourceTitle').value,
        category: document.getElementById('resourceCategory').value,
        description: document.getElementById('resourceDescription').value,
        addedBy: currentUser.id,
        addedAt: new Date().toISOString()
    };
    
    saveToGoogleSheets('addResource', resource);
    alert('Resource added successfully!');
    event.target.reset();
}

function editCategory(category) {
    alert(`Opening editor for ${category} resources`);
}

function viewMessageHistory() {
    alert('Loading message history...');
}

function viewAllConnections() {
    alert('Loading all PIR connections...');
}

// Initialize demo data
function initializeDemoData() {
    // Add some demo check-ins if user is a PIR
    if (userRole === 'pir' && mockDatabase.checkins.length === 0) {
        const demoCheckins = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            demoCheckins.push({
                userId: currentUser.id,
                date: date.toISOString(),
                mood: Math.floor(Math.random() * 4) + 5,
                cravings: Math.floor(Math.random() * 3) + 1,
                support: Math.floor(Math.random() * 3) + 6,
                sleep: ['Good', 'Fair', 'Excellent'][Math.floor(Math.random() * 3)],
                meetings: Math.random() > 0.3 ? 'Yes' : 'No',
                medications: 'Yes',
                dailyWin: ['Went for a walk', 'Called my sponsor', 'Attended meeting', 'Practiced meditation'][Math.floor(Math.random() * 4)],
                gratitude: ['My family', 'My health', 'New opportunities', 'Support system'][Math.floor(Math.random() * 4)]
            });
        }
        mockDatabase.checkins.push(...demoCheckins);
    }
}

// Call initialization when user logs in
window.addEventListener('load', function() {
    if (currentUser) {
        initializeDemoData();
    }
});
