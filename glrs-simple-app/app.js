// Simple app logic
let currentUser = null;

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (email && password) {
        // For now, accept any login
        currentUser = email;
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainScreen').classList.remove('hidden');
        document.getElementById('welcome').textContent = `Welcome, ${email}!`;
    }
}

function logout() {
    currentUser = null;
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('mainScreen').classList.add('hidden');
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
}

function showCheckIn() {
    document.getElementById('checkInForm').classList.toggle('hidden');
    document.getElementById('progressView').classList.add('hidden');
}

function showProgress() {
    document.getElementById('progressView').classList.toggle('hidden');
    document.getElementById('checkInForm').classList.add('hidden');
}

function saveCheckIn() {
    const mood = document.getElementById('mood').value;
    const thoughts = document.getElementById('thoughts').value;
    
    // For now, just log it
    console.log('Check-in saved:', { mood, thoughts });
    alert('Check-in saved!');
    
    document.getElementById('checkInForm').classList.add('hidden');
}