// PIR Platform with Coach Controls and Google Sheets Integration
// Global variables
let currentUser = null;
let userRole = null; // 'pir' or 'coach'
let userTier = null; // 'new', 'established', 'trusted'

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Check for remembered login
    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
        const userData = JSON.parse(remembered);
        if (userData.firstLogin) {
            showTermsModal();
        } else {
            autoLogin(userData);
        }
    } else {
        // Show login screen
        document.getElementById('loginScreen').style.display = 'block';
    }
});

// Terms Modal Functions
function showTermsModal() {
    document.getElementById('termsModal').style.display = 'flex';
    
    // Enable accept button only when all checkboxes are checked
    const checkboxes = document.querySelectorAll('.terms-agreement input[type="checkbox"]');
    const acceptBtn = document.getElementById('acceptTerms');
    
    checkboxes.forEach(cb => {
        cb.addEventListener('change', function() {
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            acceptBtn.disabled = !allChecked;
        });
    });
    
    acceptBtn.addEventListener('click', function() {
        acceptTerms();
    });
}

function acceptTerms() {
    // Mark terms as accepted
    if (currentUser) {
        currentUser.termsAccepted = new Date().toISOString();
        currentUser.firstLogin = false;
        saveToGoogleSheets('updateTermsAcceptance', currentUser);
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
    
    // Simulate authentication (replace with actual Google Sheets lookup)
    authenticateUser(loginInput, password, rememberMe);
}

function authenticateUser(credential, password, remember) {
    // In production, this would check against Google Sheets data
    // For now, simulate user data
    
    // Check if coach (ends with @glrecoveryservices.com)
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
        // PIR user
        const recoveryDate = new Date();
        recoveryDate.setDate(recoveryDate.getDate() - 45); // Simulate 45 days in recovery
        
        currentUser = {
            id: Date.now(),
            username: credential.includes('@') ? credential.split('@')[0] : credential,
            email: credential.includes('@') ? credential : credential + '@example.com',
            name: 'PIR User',
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
    
    // Check if first login (needs terms acceptance)
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
    // Hide login screen
    document.getElementById('loginScreen').style.display = 'none';
    
    // Show user info
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('userName').textContent = currentUser.name;
    
    if (userRole === 'pir') {
        // Show PIR interface
        document.getElementById('userTier').textContent = userTier.charAt(0).toUpperCase() + userTier.slice(1);
        document.getElementById('userTier').className = 'tier-badge ' + userTier;
        document.getElementById('pirInterface').classList.remove('hidden');
        
        // Update tier-specific features
        updateTierFeatures();
        loadPIRDashboard();
    } else {
        // Show coach interface
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
    
    // Disable features based on tier
    if (userTier === 'new') {
        document.getElementById('connectionsBtn').disabled = true;
        document.getElementById('messagesBtn').disabled = true;
    } else if (userTier === 'established') {
        document.getElementById('messagesBtn').disabled = false;
    }
}

// Section Navigation
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    
    // Show selected section
    document.getElementById(section + 'Section').style.display = 'block';
    
    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function showCoachSection(section) {
    const content = document.getElementById('coachContent');
    
    switch(section) {
        case 'overview':
            content.innerHTML = generateCoachOverview();
            break;
        case 'pirs':
            content.innerHTML = generatePIRList();
            break;
        case 'alerts':
            content.innerHTML = generateAlerts();
            break;
        case 'approvals':
            content.innerHTML = generateApprovals();
            break;
        case 'reports':
            content.innerHTML = generateReports();
            break;
    }
    
    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// PIR Dashboard Functions
function loadPIRDashboard() {
    // Calculate days in recovery
    const days = Math.floor((new Date() - new Date(currentUser.recoveryStartDate)) / (1000 * 60 * 60 * 24));
    document.getElementById('streakDays').textContent = days;
    
    // Load weekly check-ins
    const weeklyCheckins = getWeeklyCheckins();
    document.getElementById('weeklyCheckins').textContent = `${weeklyCheckins}/7`;
    
    // Next session (mock data)
    document.getElementById('nextSession').textContent = 'Tomorrow 2PM';
    
    // Load alerts
    loadAlerts();
    
    // Show dashboard
    showSection('dashboard');
}

function getWeeklyCheckins() {
    // In production, fetch from Google Sheets
    return Math.floor(Math.random() * 7) + 1;
}

function loadAlerts() {
    const alertsList = document.getElementById('alertsList');
    alertsList.innerHTML = `
        <div class="alert-item info">
            <strong>Reminder:</strong> Daily check-in helps track your progress
        </div>
        <div class="alert-item warning">
            <strong>Homework Due:</strong> Complete reflection exercise by Friday
        </div>
    `;
}

// Check-in Form
document.getElementById('checkinForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const checkinData = {
        userId: currentUser.id,
        date: new Date().toISOString(),
        mood: document.getElementById('mood').value,
        cravings: document.getElementById('cravings').value,
        sleep: document.getElementById('sleep').value,
        dailyWin: document.getElementById('dailyWin').value,
        gratitude: document.getElementById('gratitude').value,
        thoughts: document.getElementById('thoughts').value
    };
    
    // Check for crisis keywords
    if (checkForCrisisKeywords(checkinData.thoughts)) {
        showCrisisAlert();
        return;
    }
    
    // Save to Google Sheets
    saveToGoogleSheets('checkin', checkinData);
    
    alert('Check-in saved! Great job staying on track.');
    
    // Reset form
    document.getElementById('checkinForm').reset();
    updateSlider('mood');
    updateSlider('cravings');
});

function checkForCrisisKeywords(text) {
    if (!text) return false;
    
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'self-harm', 'hurt myself'];
    const lowerText = text.toLowerCase();
    
    return crisisKeywords.some(keyword => lowerText.includes(keyword));
}

function showCrisisAlert() {
    alert(`IMPORTANT: Based on your response, we're concerned about your safety. 
    
Per our terms of service, we are required to contact emergency services when someone expresses thoughts of self-harm.

Please call 988 (Suicide & Crisis Lifeline) immediately for support.

If you're in immediate danger, call 911.`);
    
    // Log crisis alert for coach
    saveToGoogleSheets('crisisAlert', {
        userId: currentUser.id,
        timestamp: new Date().toISOString(),
        type: 'self-harm keywords detected'
    });
}

// Utility Functions
function updateSlider(sliderId) {
    const value = document.getElementById(sliderId).value;
    document.getElementById(sliderId + 'Value').textContent = value;
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        userRole = null;
        userTier = null;
        
        // Clear remember me if not checked
        if (!document.getElementById('rememberMe')?.checked) {
            localStorage.removeItem('rememberedUser');
        }
        
        // Reset UI
        document.getElementById('pirInterface').classList.add('hidden');
        document.getElementById('coachInterface').classList.add('hidden');
        document.getElementById('userInfo').classList.add('hidden');
        document.getElementById('loginScreen').style.display = 'block';
        
        // Clear form
        document.getElementById('loginInput').value = '';
        document.getElementById('password').value = '';
    }
}

// Coach Dashboard Functions
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
                <h3>5</h3>
                <p>Pending Approvals</p>
            </div>
        </div>
        
        <div class="alerts-section">
            <h3>Recent Activity</h3>
            <div class="alert-item warning">
                <strong>John D.</strong> - Missed 3 check-ins this week
            </div>
            <div class="alert-item info">
                <strong>Sarah M.</strong> - Requested connection approval
            </div>
            <div class="alert-item">
                <strong>Mike R.</strong> - Completed 30 days!
            </div>
        </div>
    `;
}

function generatePIRList() {
    return `
        <h2>My PIRs</h2>
        <div class="pir-list">
            <div class="pir-card alert">
                <div class="pir-info">
                    <h4>John Doe</h4>
                    <p>Days in recovery: 15</p>
                    <p>Tier: New</p>
                    <p>⚠️ Missed check-ins: 3</p>
                </div>
                <div class="pir-actions">
                    <button onclick="viewPIRDetails('john')">View Details</button>
                    <button onclick="resetPassword('john')">Reset Password</button>
                </div>
            </div>
            
            <div class="pir-card">
                <div class="pir-info">
                    <h4>Sarah Miller</h4>
                    <p>Days in recovery: 45</p>
                    <p>Tier: Established</p>
                    <p>✓ Regular check-ins</p>
                </div>
                <div class="pir-actions">
                    <button onclick="viewPIRDetails('sarah')">View Details</button>
                    <button onclick="changeTier('sarah')">Change Tier</button>
                </div>
            </div>
            
            <div class="pir-card">
                <div class="pir-info">
                    <h4>Mike Roberts</h4>
                    <p>Days in recovery: 120</p>
                    <p>Tier: Trusted</p>
                    <p>✓ Mentor status</p>
                </div>
                <div class="pir-actions">
                    <button onclick="viewPIRDetails('mike')">View Details</button>
                    <button onclick="exportReport('mike')">Export Report</button>
                </div>
            </div>
        </div>
    `;
}

function generateAlerts() {
    return `
        <h2>Alerts & Warnings</h2>
        <div class="alerts-section">
            <div class="alert-item warning">
                <h4>High Priority</h4>
                <p><strong>John D.</strong> - Crisis keywords detected in check-in</p>
                <p>Time: 2 hours ago</p>
                <button onclick="viewCrisisDetails('john')">View Details</button>
            </div>
            
            <div class="alert-item">
                <h4>Check-in Missed</h4>
                <p><strong>Multiple PIRs</strong> - 5 PIRs haven't checked in for 3+ days</p>
                <button onclick="viewMissedCheckins()">View List</button>
            </div>
        </div>
    `;
}

function generateApprovals() {
    return `
        <h2>Pending Approvals</h2>
        <div class="pir-list">
            <div class="pir-card">
                <div class="pir-info">
                    <h4>Connection Request</h4>
                    <p><strong>Sarah M.</strong> wants to connect with <strong>Jane P.</strong></p>
                    <p>Both have 40+ days in recovery</p>
                </div>
                <div class="pir-actions">
                    <button onclick="approveConnection('sarah-jane')">Approve</button>
                    <button onclick="denyConnection('sarah-jane')">Deny</button>
                </div>
            </div>
            
            <div class="pir-card">
                <div class="pir-info">
                    <h4>Tier Upgrade</h4>
                    <p><strong>Tom H.</strong> eligible for Established tier</p>
                    <p>31 days in recovery, consistent check-ins</p>
                </div>
                <div class="pir-actions">
                    <button onclick="upgradeTier('tom')">Upgrade</button>
                    <button onclick="postponeTier('tom')">Review Later</button>
                </div>
            </div>
        </div>
    `;
}

function generateReports() {
    return `
        <h2>Reports & Analytics</h2>
        <div class="quick-stats">
            <div class="stat-card">
                <h3>87%</h3>
                <p>Check-in Rate</p>
            </div>
            <div class="stat-card">
                <h3>6.2</h3>
                <p>Avg Mood Score</p>
            </div>
            <div class="stat-card">
                <h3>92%</h3>
                <p>30-Day Retention</p>
            </div>
        </div>
        
        <div class="mt-20">
            <h3>Export Options</h3>
            <button onclick="exportAllPIRs()">Export All PIR Data</button>
            <button onclick="exportWeeklyReport()">Weekly Summary Report</button>
            <button onclick="exportProgressReports()">Individual Progress Reports</button>
        </div>
    `;
}

// Coach Action Functions
function viewPIRDetails(pirId) {
    alert(`Opening detailed view for PIR: ${pirId}`);
    // In production, load PIR details from Google Sheets
}

function resetPassword(pirId) {
    if (confirm(`Reset password for this PIR? They will receive an email with temporary credentials.`)) {
        // Generate temporary password
        const tempPassword = 'Temp' + Math.random().toString(36).slice(-8);
        
        // Save to Google Sheets and trigger email
        saveToGoogleSheets('passwordReset', {
            pirId: pirId,
            tempPassword: tempPassword,
            resetBy: currentUser.id,
            timestamp: new Date().toISOString()
        });
        
        alert('Password reset. PIR will receive email with new credentials.');
    }
}

function changeTier(pirId) {
    const newTier = prompt('Enter new tier (new/established/trusted):');
    if (newTier && ['new', 'established', 'trusted'].includes(newTier)) {
        saveToGoogleSheets('tierChange', {
            pirId: pirId,
            newTier: newTier,
            changedBy: currentUser.id,
            timestamp: new Date().toISOString()
        });
        alert('Tier updated successfully.');
    }
}

// Google Sheets Integration (Simulated)
function saveToGoogleSheets(action, data) {
    // In production, this would use Google Sheets API
    console.log('Saving to Google Sheets:', action, data);
    
    // Simulate save
    setTimeout(() => {
        console.log('Data saved successfully');
    }, 500);
}

// Auto-login function
function autoLogin(userData) {
    currentUser = userData;
    userRole = userData.role;
    if (userData.role === 'pir') {
        userTier = calculateTier(userData.recoveryStartDate);
    }
    proceedToApp();
}

// Progress section population
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    
    // Show selected section
    const sectionElement = document.getElementById(section + 'Section');
    if (sectionElement) {
        sectionElement.style.display = 'block';
        
        // Load section-specific content
        if (section === 'progress' && userRole === 'pir') {
            loadProgressContent();
        } else if (section === 'connections' && userRole === 'pir') {
            loadConnectionsContent();
        } else if (section === 'messages' && userRole === 'pir') {
            loadMessagesContent();
        } else if (section === 'homework' && userRole === 'pir') {
            loadHomeworkContent();
        }
    }
    
    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

function loadProgressContent() {
    const days = Math.floor((new Date() - new Date(currentUser.recoveryStartDate)) / (1000 * 60 * 60 * 24));
    
    document.getElementById('progressContent').innerHTML = `
        <div class="progress-overview">
            <div class="stat-card">
                <h3>${days}</h3>
                <p>Total Days in Recovery</p>
            </div>
            
            <h3 class="mt-20">Milestones</h3>
            <div class="milestone-list">
                <div class="milestone ${days >= 7 ? 'achieved' : ''}">
                    <span>✓</span> 1 Week
                </div>
                <div class="milestone ${days >= 30 ? 'achieved' : ''}">
                    <span>✓</span> 30 Days
                </div>
                <div class="milestone ${days >= 60 ? 'achieved' : ''}">
                    <span>✓</span> 60 Days
                </div>
                <div class="milestone ${days >= 90 ? 'achieved' : ''}">
                    <span>✓</span> 90 Days
                </div>
            </div>
            
            <h3 class="mt-20">Recent Check-ins</h3>
            <p>Your average mood this week: 7.2/10</p>
            <p>Days checked in this month: 22/30</p>
        </div>
    `;
}

function loadConnectionsContent() {
    if (userTier === 'new') {
        document.getElementById('connectionsContent').innerHTML = `
            <p>Connection features become available after 30 days in recovery.</p>
            <p>Keep working on your daily check-ins to unlock this feature!</p>
        `;
    } else {
        document.getElementById('connectionsContent').innerHTML = `
            <h3>Connection Requests</h3>
            <p>You can now request to connect with other PIRs in recovery.</p>
            <button onclick="requestConnection()">Find Recovery Buddies</button>
            
            <h3 class="mt-20">Your Connections</h3>
            <p>No connections yet. Start building your support network!</p>
        `;
    }
}

function loadMessagesContent() {
    if (userTier === 'new') {
        document.getElementById('messagesContent').innerHTML = `
            <p>Messaging becomes available after 30 days in recovery.</p>
        `;
    } else if (userTier === 'established') {
        document.getElementById('messagesContent').innerHTML = `
            <p>You can now message PIRs you're connected with.</p>
            <p>Direct messaging without approval available at 90 days.</p>
        `;
    } else {
        document.getElementById('messagesContent').innerHTML = `
            <h3>Messages</h3>
            <p>Full messaging features unlocked!</p>
            <div class="message-list">
                <p>No messages yet.</p>
            </div>
        `;
    }
}

function loadHomeworkContent() {
    document.getElementById('homeworkList').innerHTML = `
        <div class="homework-item">
            <input type="checkbox" id="hw1">
            <label for="hw1">Complete daily gratitude journal</label>
        </div>
        <div class="homework-item">
            <input type="checkbox" id="hw2">
            <label for="hw2">Attend 3 support meetings this week</label>
        </div>
        <div class="homework-item">
            <input type="checkbox" id="hw3">
            <label for="hw3">Practice mindfulness exercise daily</label>
        </div>
        <button onclick="addHomework()" class="mt-20">Add New Task</button>
    `;
}

function addHomework() {
    const task = prompt('Enter new homework task:');
    if (task) {
        // Save to Google Sheets
        saveToGoogleSheets('homeworkAdded', {
            userId: currentUser.id,
            task: task,
            dateAdded: new Date().toISOString()
        });
        loadHomeworkContent();
    }
}

// Add CSS for milestones
const style = document.createElement('style');
style.textContent = `
    .milestone-list {
        display: flex;
        gap: 20px;
        margin-top: 15px;
    }
    
    .milestone {
        padding: 10px 20px;
        background: #f0f0f0;
        border-radius: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .milestone.achieved {
        background: #27ae60;
        color: white;
    }
    
    .milestone span {
        opacity: 0;
    }
    
    .milestone.achieved span {
        opacity: 1;
    }
    
    .homework-item {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 10px 0;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 5px;
    }
    
    .homework-item input[type="checkbox"] {
        width: 20px;
        height: 20px;
    }
`;
document.head.appendChild(style);
