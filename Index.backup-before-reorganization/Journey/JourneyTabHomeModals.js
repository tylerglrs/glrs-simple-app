// ================================================================
// JOURNEY/HOME TAB MODALS - Savings Jar Feature
// Extracted from ModalContainer.js Lines 17625-18258 (634 lines)
// Original comment: "JOURNEYTAB MODALS - Copied from JourneyTab.js"
// Date: Current session
// ================================================================

// JourneyTabHomeModals Component
// Renders 4 savings-related modals for Journey/Home tabs
function JourneyTabHomeModals({
    // Visibility state props
    showSetGoalModal,
    showJarModal,
    showAddCountdownModal,
    showUpdateAmountModal,

    // Close handler props
    setShowSetGoalModal,
    setShowJarModal,
    setShowAddCountdownModal,
    setShowUpdateAmountModal,

    // Data props
    userData,
    savingsGoals,
    activeSavingsGoal,
    setActiveSavingsGoal,
    actualMoneySaved,
    setActualMoneySaved,
    customGoalItems,
    setCustomGoalItems,
    tempAmount,
    setTempAmount,

    // Function props
    calculateSobrietyDays
}) {
    return (
        <>
{/* ========================================
    JOURNEYTAB MODALS - Copied from JourneyTab.js
    Lines 1661-2297 (634 lines)
    DO NOT MODIFY - Preserve exactly as copied
======================================== */}

                        {/* SetGoalModal - Choose a savings goal */}
                        {showSetGoalModal && (() => {
                            // Calculate totalDays and dailyCost for modal scope
                            const modalTotalDays = calculateSobrietyDays(userData.sobrietyDate);
                            const dailyCost = userData?.dailyCost || 20;

                            return (
                                <div style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'rgba(0,0,0,0.7)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 10000,
                                    padding: '20px'
                                }}
                                onClick={() => setShowSetGoalModal(false)}
                                >
                                    <div style={{
                                        background: '#fff',
                                        borderRadius: '15px',
                                        maxWidth: '500px',
                                        width: '100%',
                                        maxHeight: '80vh',
                                        overflow: 'auto'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    >
                                        <div style={{
                                            padding: '20px',
                                            borderBottom: '2px solid #058585',
                                            background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
                                            color: '#fff',
                                            borderRadius: '15px 15px 0 0',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <h3 style={{ margin: 0, fontSize: '20px' }}>
                                                Choose Your Savings Goal
                                            </h3>
                                            <button
                                                onClick={() => setShowSetGoalModal(false)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#fff',
                                                    fontSize: '24px',
                                                    cursor: 'pointer',
                                                    padding: '0',
                                                    lineHeight: '1'
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>

                                        <div style={{ padding: '20px' }}>
                                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                                                Select a goal to track your progress. Your savings will be measured against this goal.
                                            </p>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {savingsGoals.map((goal, index) => {
                                                    const totalSaved = modalTotalDays * dailyCost;
                                                    const progress = Math.min(100, (totalSaved / goal.amount) * 100);
                                                    const achieved = totalSaved >= goal.amount;

                                                return (
                                                    <div
                                                        key={index}
                                                        onClick={() => {
                                                            setActiveSavingsGoal(goal);
                                                            setShowSetGoalModal(false);
                                                        }}
                                                        style={{
                                                            padding: '16px',
                                                            border: activeSavingsGoal?.name === goal.name ? '2px solid #058585' : '1px solid #ddd',
                                                            borderRadius: '10px',
                                                            cursor: 'pointer',
                                                            background: achieved
                                                                ? 'linear-gradient(135deg, rgba(0, 168, 107, 0.1) 0%, rgba(0, 168, 107, 0.05) 100%)'
                                                                : '#fff',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = 'none';
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                            <i data-lucide={goal.icon} style={{width: '24px', height: '24px', strokeWidth: 2, color: '#058585'}}></i>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '2px' }}>
                                                                    {goal.name}
                                                                </div>
                                                                <div style={{ fontSize: '14px', color: '#666' }}>
                                                                    ${goal.amount.toLocaleString()}
                                                                </div>
                                                            </div>
                                                            {achieved && (
                                                                <div style={{
                                                                    background: '#00A86B',
                                                                    color: '#fff',
                                                                    padding: '4px 12px',
                                                                    borderRadius: '20px',
                                                                    fontSize: '11px',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    ACHIEVED
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Progress Bar */}
                                                        <div style={{
                                                            width: '100%',
                                                            height: '6px',
                                                            background: 'rgba(0,0,0,0.1)',
                                                            borderRadius: '3px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <div style={{
                                                                width: `${progress}%`,
                                                                height: '100%',
                                                                background: achieved ? '#00A86B' : '#058585',
                                                                borderRadius: '3px',
                                                                transition: 'width 0.3s ease'
                                                            }} />
                                                        </div>

                                                        <div style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                                                            {Math.round(progress)}% progress
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            );
                        })()}
                        {/* JarDetailsModal - Virtual jar details */}
                        {showJarModal && (() => {
                            // Calculate totalDays and dailyCost for modal scope
                            const modalTotalDays = calculateSobrietyDays(userData.sobrietyDate);
                            const dailyCost = userData?.dailyCost || 20;

                            return (
                                <div style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'rgba(0,0,0,0.7)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 10000,
                                    padding: '20px'
                                }}
                                onClick={() => setShowJarModal(false)}
                                >
                                    <div style={{
                                        background: '#fff',
                                        borderRadius: '15px',
                                        maxWidth: '500px',
                                        width: '100%',
                                        maxHeight: '80vh',
                                        overflow: 'auto'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    >
                                        <div style={{
                                            padding: '20px',
                                            borderBottom: '2px solid #FFD700',
                                            background: 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,215,0,0.1) 100%)',
                                            color: '#333',
                                            borderRadius: '15px 15px 0 0',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <h3 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <i data-lucide="piggy-bank" style={{width: '24px', height: '24px', strokeWidth: 2}}></i>
                                                Your Savings Jar
                                            </h3>
                                            <button
                                                onClick={() => setShowJarModal(false)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#333',
                                                    fontSize: '24px',
                                                    cursor: 'pointer',
                                                    padding: '0',
                                                    lineHeight: '1'
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>

                                        <div style={{ padding: '24px', textAlign: 'center' }}>
                                            {/* Virtual vs Actual Money */}
                                            <div style={{ marginBottom: '30px' }}>
                                                <div style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                                                    Based on your sobriety, you would have spent:
                                                </div>
                                                <div style={{ fontSize: '36px', fontWeight: '700', color: '#058585', marginBottom: '8px' }}>
                                                    ${(modalTotalDays * dailyCost).toLocaleString()}
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#999' }}>
                                                    Virtual Savings (${dailyCost}/day × {modalTotalDays} days)
                                            </div>
                                        </div>

                                        <div style={{
                                            height: '1px',
                                            background: 'linear-gradient(90deg, transparent 0%, #ddd 50%, transparent 100%)',
                                            marginBottom: '20px'
                                        }} />

                                        {/* Actual Money Saved */}
                                        <div style={{ marginBottom: '24px' }}>
                                            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                                                Money you've actually saved:
                                            </div>
                                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#00A86B', marginBottom: '8px' }}>
                                                ${actualMoneySaved.toLocaleString()}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setTempAmount(actualMoneySaved.toString());
                                                    setShowUpdateAmountModal(true);
                                                }}
                                                style={{
                                                    background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
                                                    color: '#fff',
                                                    padding: '8px 16px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    marginTop: '8px'
                                                }}
                                            >
                                                Update Amount
                                            </button>
                                        </div>

                                        {/* Breakdown */}
                                        <div style={{
                                            background: '#f8f9fa',
                                            borderRadius: '10px',
                                            padding: '16px',
                                            textAlign: 'left'
                                        }}>
                                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>
                                                Savings Breakdown
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '13px', color: '#666' }}>Days Sober:</span>
                                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>{modalTotalDays}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '13px', color: '#666' }}>Daily Cost:</span>
                                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>${dailyCost}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '13px', color: '#666' }}>Total Virtual:</span>
                                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#058585' }}>${(modalTotalDays * dailyCost).toLocaleString()}</span>
                                            </div>
                                            <div style={{
                                                height: '1px',
                                                background: '#ddd',
                                                margin: '8px 0'
                                            }} />
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '13px', color: '#666' }}>Actual Saved:</span>
                                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#00A86B' }}>${actualMoneySaved.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div style={{
                                            marginTop: '20px',
                                            padding: '12px',
                                            background: '#fff3cd',
                                            borderRadius: '8px',
                                            border: '1px solid #ffc107'
                                        }}>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#856404' }}>
                                                💡 Tip: Keep your actual savings separate to build your emergency fund!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            );
                        })()}
                        {/* AddGoalModal - Add custom countdown item */}
                        {showAddCountdownModal && (
                            <div style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0,0,0,0.7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10000,
                                padding: '20px'
                            }}
                            onClick={() => setShowAddCountdownModal(false)}
                            >
                                <div style={{
                                    background: '#fff',
                                    borderRadius: '15px',
                                    maxWidth: '500px',
                                    width: '100%'
                                }}
                                onClick={(e) => e.stopPropagation()}
                                >
                                    <div style={{
                                        padding: '20px',
                                        borderBottom: '2px solid #058585',
                                        background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
                                        color: '#fff',
                                        borderRadius: '15px 15px 0 0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <h3 style={{ margin: 0, fontSize: '20px' }}>
                                            Add Custom Goal
                                        </h3>
                                        <button
                                            onClick={() => setShowAddCountdownModal(false)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#fff',
                                                fontSize: '24px',
                                                cursor: 'pointer',
                                                padding: '0',
                                                lineHeight: '1'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div style={{ padding: '24px' }}>
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                                                Goal Name
                                            </label>
                                            <input
                                                type="text"
                                                id="customGoalName"
                                                placeholder="e.g., New Laptop, Vacation, Car Repair"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #ddd',
                                                    fontSize: '14px',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>

                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                                                Target Amount ($)
                                            </label>
                                            <input
                                                type="number"
                                                id="customGoalAmount"
                                                placeholder="e.g., 1500"
                                                min="1"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #ddd',
                                                    fontSize: '14px',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                                                Choose Icon
                                            </label>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(6, 1fr)',
                                                gap: '8px'
                                            }}>
                                                {['dollar-sign', 'shopping-cart', 'home', 'car', 'plane', 'heart', 'gift', 'trophy', 'star', 'zap', 'music', 'book'].map(iconName => (
                                                    <button
                                                        key={iconName}
                                                        onClick={(e) => {
                                                            document.querySelectorAll('.custom-goal-icon-btn').forEach(btn => {
                                                                btn.style.border = '2px solid #ddd';
                                                                btn.style.background = '#fff';
                                                            });
                                                            e.currentTarget.style.border = '2px solid #058585';
                                                            e.currentTarget.style.background = 'rgba(5, 133, 133, 0.1)';
                                                            e.currentTarget.dataset.selected = 'true';
                                                        }}
                                                        className="custom-goal-icon-btn"
                                                        data-icon={iconName}
                                                        style={{
                                                            padding: '12px',
                                                            border: '2px solid #ddd',
                                                            borderRadius: '8px',
                                                            background: '#fff',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        <i data-lucide={iconName} style={{width: '20px', height: '20px', strokeWidth: 2, color: '#058585'}}></i>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                const name = document.getElementById('customGoalName').value;
                                                const amount = parseFloat(document.getElementById('customGoalAmount').value);
                                                const selectedIcon = document.querySelector('.custom-goal-icon-btn[data-selected="true"]');
                                                const icon = selectedIcon ? selectedIcon.dataset.icon : 'target';

                                                if (!name || !amount || amount <= 0) {
                                                    alert('Please enter a valid name and amount');
                                                    return;
                                                }

                                                const newGoal = {
                                                    name,
                                                    amount,
                                                    icon,
                                                    custom: true
                                                };

                                                setCustomGoalItems([...customGoalItems, newGoal]);
                                                setShowAddCountdownModal(false);

                                                // Clear form
                                                document.getElementById('customGoalName').value = '';
                                                document.getElementById('customGoalAmount').value = '';
                                                document.querySelectorAll('.custom-goal-icon-btn').forEach(btn => {
                                                    btn.style.border = '2px solid #ddd';
                                                    btn.style.background = '#fff';
                                                    btn.dataset.selected = 'false';
                                                });
                                            }}
                                            style={{
                                                width: '100%',
                                                background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
                                                color: '#fff',
                                                padding: '14px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Add Goal
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* UpdateAmountModal - Professional modal to update actual savings */}
                        {showUpdateAmountModal && (
                            <div style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0,0,0,0.7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10001,
                                padding: '20px'
                            }}
                            onClick={() => setShowUpdateAmountModal(false)}
                            >
                                <div style={{
                                    background: '#fff',
                                    borderRadius: '15px',
                                    maxWidth: '400px',
                                    width: '100%'
                                }}
                                onClick={(e) => e.stopPropagation()}
                                >
                                    <div style={{
                                        padding: '20px',
                                        borderBottom: '2px solid #058585',
                                        background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
                                        color: '#fff',
                                        borderRadius: '15px 15px 0 0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <h3 style={{ margin: 0, fontSize: '20px' }}>
                                            Update Savings Amount
                                        </h3>
                                        <button
                                            onClick={() => setShowUpdateAmountModal(false)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#fff',
                                                fontSize: '24px',
                                                cursor: 'pointer',
                                                padding: '0',
                                                lineHeight: '1'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div style={{ padding: '24px' }}>
                                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                                            Enter the amount you've actually saved so far.
                                        </p>

                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                                                Amount ($)
                                            </label>
                                            <input
                                                type="number"
                                                value={tempAmount}
                                                onChange={(e) => setTempAmount(e.target.value)}
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                autoFocus
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: '2px solid #058585',
                                                    fontSize: '16px',
                                                    boxSizing: 'border-box'
                                                }}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const amount = parseFloat(tempAmount);
                                                        if (!isNaN(amount) && amount >= 0) {
                                                            setActualMoneySaved(amount);
                                                            setShowUpdateAmountModal(false);
                                                        } else {
                                                            alert('Please enter a valid amount');
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => setShowUpdateAmountModal(false)}
                                                style={{
                                                    flex: 1,
                                                    background: '#f0f0f0',
                                                    color: '#666',
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const amount = parseFloat(tempAmount);
                                                    if (!isNaN(amount) && amount >= 0) {
                                                        setActualMoneySaved(amount);
                                                        setShowUpdateAmountModal(false);
                                                    } else {
                                                        alert('Please enter a valid amount');
                                                    }
                                                }}
                                                style={{
                                                    flex: 1,
                                                    background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
                                                    color: '#fff',
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Update
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

{/* ========================================
    END JOURNEYTAB MODALS
======================================== */}
        </>
    );
}

// Register component globally
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.JourneyTabHomeModals = JourneyTabHomeModals;
