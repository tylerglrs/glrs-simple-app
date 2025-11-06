{/* Journey Calendar Options Modal */}
{showJourneyCalendarModal && (
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
    onClick={() => setShowJourneyCalendarModal(false)}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '400px',
            width: '100%'
        }}
        onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #E5E5E5'
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#000000'
                }}>
                    📅 Calendar Options
                </h3>
            </div>

            {/* Options */}
            <div style={{ padding: '20px' }}>
                {/* Option 1: Milestone Calendar */}
                <button
                    onClick={() => {
                        triggerHaptic('medium');
                        setShowJourneyCalendarModal(false);
                        setShowMilestoneModal(true);
                    }}
                    style={{
                        width: '100%',
                        padding: '18px',
                        background: 'linear-gradient(135deg, #0077CC 0%, #058585 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#FFFFFF',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(0,119,204,0.3)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <i data-lucide="milestone" style={{ width: '24px', height: '24px' }}></i>
                        <div style={{ textAlign: 'left' }}>
                            <div>Milestone Calendar</div>
                            <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: '400' }}>
                                View and share recovery milestones
                            </div>
                        </div>
                    </div>
                    <i data-lucide="chevron-right" style={{ width: '20px', height: '20px' }}></i>
                </button>

                {/* Option 2: Graph Settings */}
                <button
                    onClick={() => {
                        triggerHaptic('medium');
                        setShowJourneyCalendarModal(false);
                        setShowGraphSettingsModal(true);
                    }}
                    style={{
                        width: '100%',
                        padding: '18px',
                        background: 'linear-gradient(135deg, #00A86B 0%, #008554 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#FFFFFF',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(0,168,107,0.3)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <i data-lucide="bar-chart-3" style={{ width: '24px', height: '24px' }}></i>
                        <div style={{ textAlign: 'left' }}>
                            <div>Graph Settings</div>
                            <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: '400' }}>
                                Share & print wellness graphs
                            </div>
                        </div>
                    </div>
                    <i data-lucide="chevron-right" style={{ width: '20px', height: '20px' }}></i>
                </button>

                {/* Close Button */}
                <button
                    onClick={() => {
                        triggerHaptic('light');
                        setShowJourneyCalendarModal(false);
                    }}
                    style={{
                        marginTop: '20px',
                        width: '100%',
                        padding: '12px',
                        background: '#6c757d',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}

{/* Graph Settings Modal */}
{showGraphSettingsModal && (
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
    onClick={() => setShowGraphSettingsModal(false)}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #E5E5E5'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <i data-lucide="bar-chart-3" style={{ width: '24px', height: '24px', color: '#00A86B' }}></i>
                        <h3 style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#000000'
                        }}>
                            Graph Settings
                        </h3>
                    </div>
                    <button
                        onClick={() => setShowGraphSettingsModal(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
                {/* Date Range Selection */}
                <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#000000', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i data-lucide="calendar" style={{ width: '18px', height: '18px', color: '#0077CC' }}></i>
                        Date Range
                    </h4>
                    <p style={{ fontSize: '13px', color: '#666666', marginBottom: '12px' }}>
                        Select a date range to view your wellness graphs
                    </p>

                    {/* Quick Select Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
                        <button
                            onClick={() => {
                                triggerHaptic('light');
                                const endDate = new Date();
                                const startDate = new Date();
                                startDate.setDate(startDate.getDate() - 7);
                                setGraphDateRange({ start: startDate, end: endDate });
                                setSelectedRange('7days');
                            }}
                            style={{
                                padding: '12px',
                                background: selectedRange === '7days' ?
                                    'linear-gradient(135deg, #00A86B 0%, #008554 100%)' : '#F5F5F5',
                                color: selectedRange === '7days' ? '#FFFFFF' : '#333333',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            Last 7 Days
                        </button>

                        <button
                            onClick={() => {
                                triggerHaptic('light');
                                const endDate = new Date();
                                const startDate = new Date();
                                startDate.setDate(startDate.getDate() - 30);
                                setGraphDateRange({ start: startDate, end: endDate });
                                setSelectedRange('30days');
                            }}
                            style={{
                                padding: '12px',
                                background: selectedRange === '30days' ?
                                    'linear-gradient(135deg, #00A86B 0%, #008554 100%)' : '#F5F5F5',
                                color: selectedRange === '30days' ? '#FFFFFF' : '#333333',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            Last 30 Days
                        </button>

                        <button
                            onClick={() => {
                                triggerHaptic('light');
                                const endDate = new Date();
                                const startDate = new Date();
                                startDate.setDate(startDate.getDate() - 90);
                                setGraphDateRange({ start: startDate, end: endDate });
                                setSelectedRange('90days');
                            }}
                            style={{
                                padding: '12px',
                                background: selectedRange === '90days' ?
                                    'linear-gradient(135deg, #00A86B 0%, #008554 100%)' : '#F5F5F5',
                                color: selectedRange === '90days' ? '#FFFFFF' : '#333333',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            Last 90 Days
                        </button>

                        <button
                            onClick={() => {
                                triggerHaptic('light');
                                setGraphDateRange({ start: null, end: null });
                                setSelectedRange('all');
                            }}
                            style={{
                                padding: '12px',
                                background: selectedRange === 'all' ?
                                    'linear-gradient(135deg, #00A86B 0%, #008554 100%)' : '#F5F5F5',
                                color: selectedRange === 'all' ? '#FFFFFF' : '#333333',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            All Time
                        </button>
                    </div>

                    {/* Custom Date Range */}
                    <div style={{
                        padding: '16px',
                        background: '#F8F9FA',
                        borderRadius: '10px',
                        border: '1px solid #E5E5E5'
                    }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#000000', marginBottom: '12px' }}>
                            Custom Date Range
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={{ fontSize: '12px', color: '#666666', marginBottom: '6px', display: 'block' }}>
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={graphDateRange.start ? graphDateRange.start.toISOString().split('T')[0] : ''}
                                    onChange={(e) => {
                                        const date = e.target.value ? new Date(e.target.value) : null;
                                        setGraphDateRange({ ...graphDateRange, start: date });
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', color: '#666666', marginBottom: '6px', display: 'block' }}>
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={graphDateRange.end ? graphDateRange.end.toISOString().split('T')[0] : ''}
                                    onChange={(e) => {
                                        const date = e.target.value ? new Date(e.target.value) : null;
                                        setGraphDateRange({ ...graphDateRange, end: date });
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Export Options */}
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#000000', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i data-lucide="file-text" style={{ width: '18px', height: '18px', color: '#0077CC' }}></i>
                        Export & Share
                    </h4>

                    {/* Print PDF Button */}
                    <button
                        onClick={async () => {
                            triggerHaptic('medium');
                            await exportGraphsToPDF(graphDateRange, user);
                        }}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #0077CC 0%, #005A9C 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#FFFFFF',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            boxShadow: '0 4px 12px rgba(0,119,204,0.3)'
                        }}
                    >
                        <i data-lucide="printer" style={{ width: '20px', height: '20px' }}></i>
                        Print to PDF
                    </button>

                    {/* Share PDF Button */}
                    <button
                        onClick={async () => {
                            triggerHaptic('medium');
                            await shareGraphsPDF(graphDateRange, user);
                        }}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #00A86B 0%, #008554 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#FFFFFF',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            boxShadow: '0 4px 12px rgba(0,168,107,0.3)'
                        }}
                    >
                        <i data-lucide="share-2" style={{ width: '20px', height: '20px' }}></i>
                        Share PDF
                    </button>
                </div>

                {/* Close Button */}
                <button
                    onClick={() => {
                        triggerHaptic('light');
                        setShowGraphSettingsModal(false);
                    }}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: '#6c757d',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}
    </div>
);
}