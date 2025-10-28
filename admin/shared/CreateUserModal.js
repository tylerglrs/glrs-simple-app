// ==========================================
// CREATE USER MODAL - SHARED COMPONENT
// ==========================================
// Used by: users.html
// Extracted from admin.html lines 31290-31928 (639 lines)
// ==========================================

function CreateUserModal({ onClose, onSuccess, defaultRole }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: defaultRole || 'pir',
        assignedCoach: '',
        phone: '',
        sobrietyDate: ''
    });
    const [coachesList, setCoachesList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [emailValid, setEmailValid] = useState(null);
    const [step, setStep] = useState(1);

    useEffect(() => {
        loadCoaches();
    }, []);

    // Auto-generate password when names change
    useEffect(() => {
        if (formData.firstName && formData.lastName) {
            const newPassword = generateTempPassword(formData.firstName, formData.lastName);
            setFormData(prev => ({ ...prev, password: newPassword }));
        }
    }, [formData.firstName, formData.lastName]);

    const generateTempPassword = (firstName, lastName) => {
        if (!firstName || !lastName) return 'TempPass123!';
        
        const firstPart = firstName.slice(0, Math.min(3, firstName.length));
        const firstFormatted = firstPart.charAt(0).toUpperCase() + firstPart.slice(1).toLowerCase();
        
        const lastPart = lastName.slice(0, Math.min(3, lastName.length));
        const lastFormatted = lastPart.charAt(0).toUpperCase() + lastPart.slice(1).toLowerCase();
        
        const randomNum = Math.floor(Math.random() * 90) + 10;
        const specialChars = ['!', '@', '#', '$', '%', '&', '*'];
        const randomSpecial = specialChars[Math.floor(Math.random() * specialChars.length)];
        
        return `${firstFormatted}${lastFormatted}${randomNum}${randomSpecial}`;
    };

    const loadCoaches = async () => {
        const coachesSnap = await db.collection('users')
            .where('tenantId', '==', CURRENT_TENANT)
            .where('role', 'in', ['coach', 'admin'])
            .get();

        const coachesData = [];
        coachesSnap.forEach(doc => {
            coachesData.push({ id: doc.id, ...doc.data() });
        });
        setCoachesList(coachesData);
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleEmailChange = (email) => {
        setFormData({...formData, email});
        if (email.length > 0) {
            setEmailValid(validateEmail(email));
        } else {
            setEmailValid(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateEmail(formData.email)) {
            alert('Please enter a valid email address');
            return;
        }

        // ==========================================
        // CAPACITY LIMIT ENFORCEMENT
        // ==========================================
        // Check tenant subscription limits before creating user
        try {
            const tenantDoc = await db.collection('tenants').doc(CURRENT_TENANT).get();

            if (tenantDoc.exists) {
                const tenantConfig = tenantDoc.data().config;
                const subscriptionTier = tenantConfig?.subscriptionTier || 'Professional';
                const maxPirs = tenantConfig?.maxPirs || 100;
                const maxCoaches = tenantConfig?.maxCoaches || 10;

                // Check PIR capacity
                if (formData.role === 'pir') {
                    const pirSnapshot = await db.collection('users')
                        .where('tenantId', '==', CURRENT_TENANT)
                        .where('role', '==', 'pir')
                        .get();

                    const currentPirCount = pirSnapshot.size;

                    if (currentPirCount >= maxPirs) {
                        alert(
                            `⚠️ PIR Capacity Limit Reached\n\n` +
                            `Your ${subscriptionTier} subscription allows ${maxPirs} PIRs.\n` +
                            `You currently have ${currentPirCount} PIRs.\n\n` +
                            `Please contact your administrator to upgrade your subscription.`
                        );
                        return;
                    }

                    console.log(`✅ PIR capacity check passed: ${currentPirCount}/${maxPirs}`);
                }

                // Check Coach/Admin capacity
                if (formData.role === 'coach' || formData.role === 'admin') {
                    const coachSnapshot = await db.collection('users')
                        .where('tenantId', '==', CURRENT_TENANT)
                        .where('role', 'in', ['coach', 'admin'])
                        .get();

                    const currentCoachCount = coachSnapshot.size;

                    if (currentCoachCount >= maxCoaches) {
                        alert(
                            `⚠️ Coach/Admin Capacity Limit Reached\n\n` +
                            `Your ${subscriptionTier} subscription allows ${maxCoaches} coaches/admins.\n` +
                            `You currently have ${currentCoachCount} coaches/admins.\n\n` +
                            `Please contact your administrator to upgrade your subscription.`
                        );
                        return;
                    }

                    console.log(`✅ Coach/Admin capacity check passed: ${currentCoachCount}/${maxCoaches}`);
                }
            } else {
                console.warn('⚠️ Tenant document not found - proceeding without capacity check');
            }
        } catch (capacityError) {
            console.error('❌ Error checking capacity limits:', capacityError);
            alert('⚠️ Error checking subscription limits. Please try again or contact support.');
            return;
        }

        setLoading(true);
        
        let secondaryApp;
        try {
            // Delete existing secondary app if any
            try {
                secondaryApp = firebase.app('SecondaryApp');
                await secondaryApp.delete();
            } catch (e) {
                // App doesn't exist
            }
            
            // Create secondary app for user creation
            secondaryApp = firebase.initializeApp(firebaseConfig, 'SecondaryApp');
            const secondaryAuth = secondaryApp.auth();
            
            // Create Firebase Auth user
            const userCredential = await secondaryAuth.createUserWithEmailAndPassword(
                formData.email,
                formData.password
            );
            
            // Prepare user data
            const userData = {
                tenantId: CURRENT_TENANT,
                email: formData.email,
                displayName: `${formData.firstName} ${formData.lastName}`,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                role: formData.role,
                active: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Add PIR-specific fields
            if (formData.role === 'pir') {
                if (formData.assignedCoach) {
                    userData.assignedCoach = formData.assignedCoach;
                    const coach = coachesList.find(c => c.id === formData.assignedCoach);
                    if (coach) {
                        userData.assignedCoachName = coach.displayName || coach.email;
                    }
                }
                if (formData.sobrietyDate) {
                    userData.sobrietyDate = firebase.firestore.Timestamp.fromDate(new Date(formData.sobrietyDate));
                }
            }
            
            // Save to Firestore
            await db.collection('users').doc(userCredential.user.uid).set(userData);
            
            // Create notification (with preference checking)
            await createNotificationWithPreferences({
                tenantId: CURRENT_TENANT,
                type: 'user-created',
                message: `New ${formData.role} created: ${userData.displayName}`,
                recipientId: auth.currentUser.uid,
                relatedId: userCredential.user.uid,
                read: false
            }, 'user-created');
            
            // Send welcome email if PIR (using Firebase Extension)
            if (formData.role === 'pir') {
                try {
                    console.log('📧 Sending welcome email via Firebase Extension...');
                    
                    const currentUserDoc = await db.collection('users').doc(auth.currentUser.uid).get();
                    const currentUserData = currentUserDoc.data();
                    const coachName = currentUserData.displayName || `${currentUserData.firstName} ${currentUserData.lastName}`;
                    
                    // Write to Firestore - Extension automatically sends email
                    await db.collection('mail').add({
                        to: [formData.email],
                        message: {
                            subject: '🎉 Welcome to Guiding Light Recovery Services!',
                            html: getWelcomeEmailHTML(
                                `${formData.firstName} ${formData.lastName}`,
                                coachName,
                                formData.email,
                                formData.password
                            ),
                            text: getWelcomeEmailText(
                                `${formData.firstName} ${formData.lastName}`,
                                coachName,
                                formData.email,
                                formData.password
                            )
                        }
                    });
                    
                    console.log('✅ Welcome email queued successfully!');
                } catch (emailError) {
                    console.error('⚠️ Failed to queue welcome email:', emailError);
                    // Don't block user creation if email fails
                }
            }
            
            // Clean up secondary app
            await secondaryApp.delete();
            
            alert('✅ User created successfully!' + (formData.role === 'pir' ? '\n\nWelcome email has been sent with login credentials.' : ''));
            onSuccess();
            
        } catch (error) {
            console.error('Error creating user:', error);
            alert('❌ Error creating user: ' + error.message);
            
            if (secondaryApp) {
                try {
                    await secondaryApp.delete();
                } catch (e) {
                    // Ignore
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const getRoleColor = (role) => {
        if (role === 'pir') return 'linear-gradient(135deg, #0077CC 0%, #008B8B 100%)';
        if (role === 'coach') return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            animation: 'fadeIn 0.2s'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '20px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                animation: 'slideUp 0.3s'
            }}>
                {/* Header */}
                <div style={{
                    background: getRoleColor(formData.role),
                    padding: '25px 30px',
                    borderRadius: '20px 20px 0 0',
                    color: 'white',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>Create New User</h2>
                            <div style={{ fontSize: '14px', opacity: 0.9 }}>
                                Step {step} of 2
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                color: 'white',
                                fontSize: '24px',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} style={{ padding: '30px' }}>
                    {step === 1 && (
                        <>
                            {/* Role Selection */}
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    fontSize: '14px', 
                                    fontWeight: '600', 
                                    color: '#333', 
                                    marginBottom: '10px' 
                                }}>
                                    User Role *
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                    {['pir', 'coach', 'admin'].map(role => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => setFormData({...formData, role})}
                                            style={{
                                                padding: '15px',
                                                background: formData.role === role ? getRoleColor(role) : '#f0f0f0',
                                                color: formData.role === role ? 'white' : '#666',
                                                border: 'none',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (formData.role !== role) {
                                                    e.currentTarget.style.background = '#e0e0e0';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (formData.role !== role) {
                                                    e.currentTarget.style.background = '#f0f0f0';
                                                }
                                            }}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Email */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    fontSize: '14px', 
                                    fontWeight: '600', 
                                    color: '#333', 
                                    marginBottom: '8px' 
                                }}>
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleEmailChange(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 15px',
                                        border: `2px solid ${emailValid === false ? '#f44336' : emailValid === true ? '#00A86B' : '#e0e0e0'}`,
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        if (emailValid === null) e.currentTarget.style.borderColor = '#0077CC';
                                    }}
                                    onBlur={(e) => {
                                        if (emailValid === null) e.currentTarget.style.borderColor = '#e0e0e0';
                                    }}
                                />
                                {emailValid === false && (
                                    <div style={{ color: '#DC143C', fontSize: '12px', marginTop: '5px' }}>
                                        Please enter a valid email address
                                    </div>
                                )}
                                {emailValid === true && (
                                    <div style={{ color: '#00A86B', fontSize: '12px', marginTop: '5px' }}>
                                        ✓ Valid email address
                                    </div>
                                )}
                            </div>

                            {/* Name Fields */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ 
                                        display: 'block', 
                                        fontSize: '14px', 
                                        fontWeight: '600', 
                                        color: '#333', 
                                        marginBottom: '8px' 
                                    }}>
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 15px',
                                            border: '2px solid #e0e0e0',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = '#0077CC'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                                    />
                                </div>
                                <div>
                                    <label style={{ 
                                        display: 'block', 
                                        fontSize: '14px', 
                                        fontWeight: '600', 
                                        color: '#333', 
                                        marginBottom: '8px' 
                                    }}>
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 15px',
                                            border: '2px solid #e0e0e0',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = '#0077CC'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    fontSize: '14px', 
                                    fontWeight: '600', 
                                    color: '#333', 
                                    marginBottom: '8px' 
                                }}>
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    placeholder="(555) 123-4567"
                                    style={{
                                        width: '100%',
                                        padding: '12px 15px',
                                        border: '2px solid #e0e0e0',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#0077CC'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                                />
                            </div>

                            {/* Auto-generated Password Preview */}
                            {formData.role === 'pir' && formData.firstName && formData.lastName && (
                                <div style={{
                                    padding: '15px',
                                    background: '#f0f9ff',
                                    border: '2px solid #0077CC',
                                    borderRadius: '10px',
                                    marginBottom: '20px'
                                }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e', marginBottom: '5px' }}>
                                        Auto-Generated Password:
                                    </div>
                                    <div style={{ fontSize: '18px', color: '#0077CC', fontFamily: 'monospace', fontWeight: '600' }}>
                                        {formData.password}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
                                        This will be sent to the PIR in their welcome email
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: 'linear-gradient(135deg, #0077CC 0%, #008B8B 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                Next Step →
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            {/* PIR-specific fields */}
                            {formData.role === 'pir' && (
                                <>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ 
                                            display: 'block', 
                                            fontSize: '14px', 
                                            fontWeight: '600', 
                                            color: '#333', 
                                            marginBottom: '8px' 
                                        }}>
                                            Assign Coach
                                        </label>
                                        <select
                                            value={formData.assignedCoach}
                                            onChange={(e) => setFormData({...formData, assignedCoach: e.target.value})}
                                            style={{
                                                width: '100%',
                                                padding: '12px 15px',
                                                border: '2px solid #e0e0e0',
                                                borderRadius: '10px',
                                                fontSize: '14px',
                                                background: 'white',
                                                cursor: 'pointer',
                                                transition: 'border-color 0.2s'
                                            }}
                                            onFocus={(e) => e.currentTarget.style.borderColor = '#0077CC'}
                                            onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                                        >
                                            <option value="">Select Coach (Optional)</option>
                                            {coachesList.map(coach => (
                                                <option key={coach.id} value={coach.id}>
                                                    {coach.displayName || coach.email}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ marginBottom: '25px' }}>
                                        <label style={{ 
                                            display: 'block', 
                                            fontSize: '14px', 
                                            fontWeight: '600', 
                                            color: '#333', 
                                            marginBottom: '8px' 
                                        }}>
                                            Sobriety Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.sobrietyDate}
                                            onChange={(e) => setFormData({...formData, sobrietyDate: e.target.value})}
                                            style={{
                                                width: '100%',
                                                padding: '12px 15px',
                                                border: '2px solid #e0e0e0',
                                                borderRadius: '10px',
                                                fontSize: '14px',
                                                transition: 'border-color 0.2s'
                                            }}
                                            onFocus={(e) => e.currentTarget.style.borderColor = '#0077CC'}
                                            onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Email Info */}
                            <div style={{
                                padding: '15px',
                                background: '#e3f2fd',
                                borderRadius: '10px',
                                marginBottom: '25px'
                            }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1976d2', marginBottom: '5px' }}>
                                    Welcome Email
                                </div>
                                <div style={{ fontSize: '13px', color: '#1565c0' }}>
                                    {formData.role === 'pir' 
                                        ? 'A welcome email with login credentials will be sent to the PIR automatically. They should change their password after first login.'
                                        : 'User will be created and notified.'
                                    }
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        background: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#5a6268'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#6c757d'}
                                >
                                    ← Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        flex: 2,
                                        padding: '14px',
                                        background: loading ? '#ccc' : getRoleColor(formData.role),
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!loading) e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {loading ? 'Creating User...' : 'Create User'}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}

// ==========================================
// TENANT MANAGEMENT MODAL (SUPERADMIN ONLY)
// ==========================================
