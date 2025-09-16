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

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Just show login screen - Firebase will handle the rest
    document.getElementById('loginScreen').style.display = 'block';
});

// Show login screen
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('pirInterface').classList.add('hidden');
    document.getElementById('coachInterface').classList.add('hidden');
    document.getElementById('userInfo').classList.add('hidden');
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

// Create PIR Account (Coach Function)
async function createPIRAccount(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('pirEmail').value;
    
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
        
        // Send welcome email with temporary password (you'll need to set up email service)
        // For now, just show the credentials
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
        
        // Sign back in as coach (creating new user signs you in as them)
        await auth.signInWithEmailAndPassword(currentUser.email, prompt("Please re-enter your password:"));
        
    } catch (error) {
        console.error("Error creating PIR account:", error);
        alert("Error creating account: " + error.message);
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

// Accept terms function
async function acceptTerms() {
    try {
        await db.collection('users').doc(currentUser.uid).update({
            termsAccepted: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        document.getElementById('termsModal').style.display = 'none';
        proceedToApp();
        
    } catch (error) {
        console.error("Error accepting terms:", error);
    }
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

// Load recent check-ins
async function loadRecentCheckins() {
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

// Initialize check-in form listener
document.addEventListener('DOMContentLoaded', function() {
    const checkinForm = document.getElementById('checkinForm');
    if (checkinForm) {
        checkinForm.addEventListener('submit', saveCheckin);
    }
});

// Keep all your existing UI functions below this line...
// (showSection, loadPIRDashboard, generateCoachOverview, etc.)
// All these remain the same, but now they'll use Firebase data
