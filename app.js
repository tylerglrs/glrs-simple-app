// Simple app logic
let currentUser = null;

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (email && password) {
        currentUser = email;
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainScreen').classList.remove('hidden');
        document.getElementById('welcome').textContent = `Welcome, ${email}!`;
        updateProgress();
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
    hideAllSections();
    document.getElementById('checkInForm').classList.remove('hidden');
}

function showProgress() {
    hideAllSections();
    document.getElementById('progressView').classList.remove('hidden');
    updateProgress();
}

function showHomework() {
    hideAllSections();
    document.getElementById('homeworkView').classList.remove('hidden');
}

function hideAllSections() {
    document.getElementById('checkInForm').classList.add('hidden');
    document.getElementById('progressView').classList.add('hidden');
    document.getElementById('homeworkView').classList.add('hidden');
}

function updateSlider(sliderId) {
    const value = document.getElementById(sliderId).value;
    document.getElementById(sliderId + 'Value').textContent = value;
}

function saveCheckIn() {
    const checkIn = {
        date: new Date().toISOString(),
        mood: document.getElementById('mood').value,
        cravings: document.getElementById('cravings').value,
        thoughts: document.getElementById('thoughts').value,
        gratitude: document.getElementById('gratitude').value,
        user: currentUser
    };
    
    // Get existing check-ins
    let checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]');
    checkIns.push(checkIn);
    localStorage.setItem('checkIns', JSON.stringify(checkIns));
    
    alert('Check-in saved! Keep up the great work!');
    
    // Clear form
    document.getElementById('mood').value = 5;
    document.getElementById('cravings').value = 1;
    document.getElementById('thoughts').value = '';
    document.getElementById('gratitude').value = '';
    updateSlider('mood');
    updateSlider('cravings');
    
    hideAllSections();
}

function updateProgress() {
    // Calculate days in recovery (for demo, using account creation)
    const startDate = new Date('2024-01-01'); // Demo start date
    const today = new Date();
    const days = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    document.getElementById('daysCount').textContent = days;
    
    // Get check-ins for this week
    const checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]');
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyCheckins = checkIns.filter(c => {
        return new Date(c.date) > weekAgo && c.user === currentUser;
    });
    
    document.getElementById('weeklyCheckins').textContent = weeklyCheckins.length;
    
    // Show recent check-ins
    const recentCheckins = checkIns
        .filter(c => c.user === currentUser)
        .slice(-5)
        .reverse();
    
    const checkinList = document.getElementById('checkinList');
    checkinList.innerHTML = '';
    
    recentCheckins.forEach(checkin => {
        const item = document.createElement('div');
        item.className = 'checkin-item';
        const date = new Date(checkin.date).toLocaleDateString();
        item.innerHTML = `
            <div class="checkin-date">${date}</div>
            <div class="checkin-mood">Mood: ${checkin.mood}/10 | Cravings: ${checkin.cravings}/10</div>
            ${checkin.gratitude ? `<div>Grateful for: ${checkin.gratitude}</div>` : ''}
        `;
        checkinList.appendChild(item);
    });
}

function addHomeworkItem() {
    const task = prompt('What homework was assigned in your session?');
    if (task) {
        const homeworkList = document.getElementById('homeworkList');
        if (homeworkList.innerHTML === '<p>No homework assigned yet.</p>') {
            homeworkList.innerHTML = '';
        }
        const item = document.createElement('div');
        item.innerHTML = `<input type="checkbox"> ${task}`;
        item.style.marginBottom = '10px';
        homeworkList.appendChild(item);
    }
}
