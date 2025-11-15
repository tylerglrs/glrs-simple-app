// ========================================
// MAIN APP CODE (Extracted from inline script)
// Uses modules loaded above via window.GLRSApp namespace
// Firebase, auth, db, storage already initialized in bundles
// ========================================

const { useState, useEffect, useRef } = React;

// Get references from modular services (already initialized)
const auth = window.GLRSApp.auth || window.auth;
const db = window.GLRSApp.db || window.db;
const storage = window.GLRSApp.storage || window.storage;

// Lighthouse Logo Component
function LighthouseLogo({ size = 100 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="95" stroke="#1e3c72" strokeWidth="3" fill="rgba(30, 60, 114, 0.1)"/>
            <path d="M100 140 L85 180 L115 180 Z" fill="#ffffff"/>
            <rect x="92" y="100" width="16" height="40" fill="#ffffff"/>
            <rect x="88" y="90" width="24" height="10" fill="#1e3c72"/>
            <path d="M100 70 L90 90 L110 90 Z" fill="#1e3c72"/>
            <rect x="95" y="70" width="10" height="20" fill="#1e3c72"/>
            <path d="M100 80 L60 70" stroke="#f4c430" strokeWidth="3" opacity="0.8"/>
            <path d="M100 80 L140 70" stroke="#f4c430" strokeWidth="3" opacity="0.8"/>
            <path d="M100 80 L50 85" stroke="#f4c430" strokeWidth="3" opacity="0.6"/>
            <path d="M100 80 L150 85" stroke="#f4c430" strokeWidth="3" opacity="0.6"/>
            <circle cx="100" cy="80" r="8" fill="#f4c430"/>
            <path d="M 60 170 Q 80 165, 100 170 T 140 170" stroke="#4a90e2" strokeWidth="2" fill="none"/>
            <path d="M 50 175 Q 75 170, 100 175 T 150 175" stroke="#4a90e2" strokeWidth="2" fill="none" opacity="0.6"/>
        </svg>
    );
}


// ═══════════════════════════════════════════════════════════
// FIRESTORE TIMEOUT WRAPPER - Prevents infinite hangs
// ═══════════════════════════════════════════════════════════
function firestoreWithTimeout(promise, timeoutMs = 10000) {
    let timeoutHandle;

    const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
            reject(new Error(`Firestore query timeout after ${timeoutMs}ms`));
        }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise])
        .finally(() => clearTimeout(timeoutHandle));
}

       // Main App Component
function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('🔍 DEBUG: Setting up auth listener');
        console.log('🔍 DEBUG: auth object:', auth);
        console.log('🔍 DEBUG: auth.onAuthStateChanged:', typeof auth?.onAuthStateChanged);

        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            console.log('🔍 DEBUG: Auth state changed, user:', firebaseUser ? firebaseUser.email : 'null');
            if (firebaseUser) {
                try {
                    // ✅ CRITICAL FIX: Verify token is ready before querying Firestore
                    console.log('🔍 DEBUG: Verifying auth token...');
                    await firebaseUser.getIdToken(false);

                    // ✅ CRITICAL FIX: Small delay ensures Firestore has received auth token
                    await new Promise(r => setTimeout(r, 100));
                    console.log('🔍 DEBUG: Token verified, querying user document...');

                    // ✅ CRITICAL FIX: Wrap query with timeout to catch hangs
                    let userDoc = await firestoreWithTimeout(
                        db.collection('users').doc(firebaseUser.uid).get(),
                        10000
                    );

                    if (!userDoc.exists) {
                        // Create new user document with timestamps
                        await db.collection('users').doc(firebaseUser.uid).set({
                            email: firebaseUser.email,
                            role: 'pir',
                            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                            active: true,
                            sobrietyDate: new Date().toISOString(),
                            profileComplete: false
                        });

                        // Re-fetch the document after creating it
                        userDoc = await db.collection('users').doc(firebaseUser.uid).get();
                    }

                    const userData = userDoc.data();

                    // Check for existing users without createdAt
                    if (userData && !userData.createdAt) {
                        await db.collection('users').doc(firebaseUser.uid).update({
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }

                    // Verify role
                    if (userData && userData.role !== 'pir') {
                        await auth.signOut();
                        alert('This portal is for PIRs only. Coaches should use admin.html');
                        setUser(null);
                    } else {
                        setUser(firebaseUser);
                    }
                } catch (error) {
                    setUser(null);
                }
            } else {
                console.log('🔍 DEBUG: No Firebase user, setting user to null');
                setUser(null);
            }
            console.log('🔍 DEBUG: Setting loading to false');
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return user ? <PIRApp user={user} /> : <LoginScreen />;
}

// Login Screen Component
function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        setLoading(true);

        try {
            await auth.signInWithEmailAndPassword(email, password);
            setSuccess('Login successful! Redirecting...');
            // onAuthStateChanged (lines 1645-1705) handles validation, role check, and activity logging
        } catch (error) {

            switch(error.code) {
                case 'auth/user-not-found':
                    setError('No account found with this email');
                    break;
                case 'auth/wrong-password':
                    setError('Incorrect password');
                    break;
                case 'auth/invalid-email':
                    setError('Invalid email address');
                    break;
                default:
                    setError('Failed to sign in. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="app-title" style={{ marginTop: '40px' }}>Guiding Light</h1>
                <p className="app-subtitle">Recovery Services</p>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                </form>
            </div>
        </div>
    );
}

// ========================================
// PDF EXPORT FUNCTIONS (Graph Capture)
// ========================================

// Export wellness graphs to PDF
const exportGraphsToPDF = async (graphDateRange, user) => {
    try {
        console.log('📄 Starting PDF export...');

        // Get all graph canvases
        const moodCanvas = document.querySelector('canvas[id*="mood"]') || document.querySelector('.wellness-graph canvas');

        if (!moodCanvas) {
            alert('❌ Could not find wellness graphs to export. Please ensure graphs are visible on screen.');
            return;
        }

        // Initialize jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Add header
        doc.setFontSize(20);
        doc.setTextColor(0, 119, 204); // Medical Blue
        doc.text('Wellness Graphs Report', pageWidth / 2, 20, { align: 'center' });

        // Add user info
        doc.setFontSize(12);
        doc.setTextColor(51, 51, 51);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);

        if (graphDateRange && graphDateRange.start) {
            const dateRangeText = `Period: ${graphDateRange.start.toLocaleDateString()} - ${(graphDateRange.end || new Date()).toLocaleDateString()}`;
            doc.text(dateRangeText, 20, 36);
        }

        // Find the wellness graphs container
        const graphsContainer = document.querySelector('.wellness-graphs-container') ||
                               document.querySelector('[style*="wellness"]') ||
                               moodCanvas.closest('div');

        if (graphsContainer) {
            console.log('📊 Capturing graphs container with html2canvas...');

            // Capture the graphs with html2canvas
            const canvas = await html2canvas(graphsContainer, {
                scale: 2, // Higher quality
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: graphsContainer.scrollWidth,
                windowHeight: graphsContainer.scrollHeight
            });

            // Convert canvas to base64 image
            const imgData = canvas.toDataURL('image/png');

            // Calculate dimensions to fit page
            const imgWidth = pageWidth - 40; // 20mm margins on each side
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Add image to PDF
            if (imgHeight > (pageHeight - 50)) {
                // Image too tall, scale down further
                const scaledHeight = pageHeight - 50;
                const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
                doc.addImage(imgData, 'PNG', (pageWidth - scaledWidth) / 2, 45, scaledWidth, scaledHeight);
            } else {
                doc.addImage(imgData, 'PNG', 20, 45, imgWidth, imgHeight);
            }

            console.log('✅ Image added to PDF');
        }

        // Add footer
        doc.setFontSize(10);
        doc.setTextColor(102, 102, 102);
        doc.text('Generated with GLRS Lighthouse Recovery App', pageWidth / 2, pageHeight - 10, { align: 'center' });

        // Save the PDF
        const fileName = `wellness-graphs-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        console.log('✅ PDF saved successfully:', fileName);
        alert('✅ PDF downloaded successfully!');

    } catch (error) {
        console.error('❌ PDF export error:', error);
        alert('❌ Error creating PDF. Please try again.\n\n' + error.message);
    }
};

// Share wellness graphs as PDF
const shareGraphsPDF = async (graphDateRange, user) => {
    try {
        console.log('📄 Creating PDF for sharing...');

        // Get all graph canvases
        const moodCanvas = document.querySelector('canvas[id*="mood"]') || document.querySelector('.wellness-graph canvas');

        if (!moodCanvas) {
            alert('❌ Could not find wellness graphs to share. Please ensure graphs are visible on screen.');
            return;
        }

        // Initialize jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Add header
        doc.setFontSize(20);
        doc.setTextColor(0, 119, 204);
        doc.text('Wellness Graphs Report', pageWidth / 2, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.setTextColor(51, 51, 51);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);

        if (graphDateRange && graphDateRange.start) {
            const dateRangeText = `Period: ${graphDateRange.start.toLocaleDateString()} - ${(graphDateRange.end || new Date()).toLocaleDateString()}`;
            doc.text(dateRangeText, 20, 36);
        }

        // Find the wellness graphs container
        const graphsContainer = document.querySelector('.wellness-graphs-container') ||
                               document.querySelector('[style*="wellness"]') ||
                               moodCanvas.closest('div');

        if (graphsContainer) {
            console.log('📊 Capturing graphs for sharing...');

            const canvas = await html2canvas(graphsContainer, {
                scale: 2,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: graphsContainer.scrollWidth,
                windowHeight: graphsContainer.scrollHeight
            });

            const imgData = canvas.toDataURL('image/png');

            const imgWidth = pageWidth - 40;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            if (imgHeight > (pageHeight - 50)) {
                const scaledHeight = pageHeight - 50;
                const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
                doc.addImage(imgData, 'PNG', (pageWidth - scaledWidth) / 2, 45, scaledWidth, scaledHeight);
            } else {
                doc.addImage(imgData, 'PNG', 20, 45, imgWidth, imgHeight);
            }
        }

        doc.setFontSize(10);
        doc.setTextColor(102, 102, 102);
        doc.text('Generated with GLRS Lighthouse Recovery App', pageWidth / 2, pageHeight - 10, { align: 'center' });

        // Convert PDF to blob for sharing
        const pdfBlob = doc.output('blob');
        const fileName = `wellness-graphs-${new Date().toISOString().split('T')[0]}.pdf`;

        // Use Web Share API if available
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], fileName, { type: 'application/pdf' })] })) {
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

            await navigator.share({
                title: 'Wellness Graphs Report',
                text: 'My wellness progress graphs from GLRS Lighthouse',
                files: [file]
            });

            console.log('✅ PDF shared successfully');
        } else {
            // Fallback: download the PDF
            doc.save(fileName);
            alert('✅ PDF downloaded! (File sharing not supported on this device)');
        }

    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('❌ PDF share error:', error);
            alert('❌ Error sharing PDF. Please try again.\n\n' + error.message);
        }
    }
};

// Make functions available globally for PIRApp
window.GLRSApp.exportGraphsToPDF = exportGraphsToPDF;
window.GLRSApp.shareGraphsPDF = shareGraphsPDF;

// ============================================================================
// RENDER THE APP
// ============================================================================

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));
