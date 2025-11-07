// Recovery Resources View Component - No Favorites
function ResourcesView(app) {
    const {
        user,
        userData,
        setCurrentView  // replaces onBack callback
    } = app;

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [activeTab, setActiveTab] = useState('assigned');
    const [resources, setResources] = useState([]);
    const [allResources, setAllResources] = useState([]);
    const [notes, setNotes] = useState({});
    const [progress, setProgress] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedResource, setSelectedResource] = useState(null);
    const [loading, setLoading] = useState(false);
    const [resourceCounts, setResourceCounts] = useState({});
    const [totalResourceCount, setTotalResourceCount] = useState(0);
    const [newResourceIds, setNewResourceIds] = useState([]);
    const [userNames, setUserNames] = useState({});

    const categories = [
        { id: 'coping', name: 'Coping Skills', icon: 'brain', color: 'var(--color-success)' },
        { id: 'relapse', name: 'Relapse Prevention', icon: 'shield', color: 'var(--color-warning)' },
        { id: 'daily', name: 'Daily Tools', icon: 'calendar-check', color: 'var(--color-info)' },
        { id: 'education', name: 'Education', icon: 'book-open', color: 'var(--color-secondary)' },
        { id: 'support', name: 'Support', icon: 'users', color: 'var(--color-primary)' },
        { id: 'life', name: 'Life Skills', icon: 'sparkles', color: 'var(--color-accent)' }
    ];

    useEffect(() => {
        loadAllResources();
        loadUserPreferences();
    }, [user?.uid]);

    useEffect(() => {
        if (allResources.length > 0) {
            checkNewResources();
            loadUserNames();
        }
    }, [allResources]);

    useEffect(() => {
        if (selectedCategory) {
            filterCategoryResources();
        }
    }, [selectedCategory, activeTab, allResources]);

    const loadUserNames = async () => {
        try {
            const uniqueUserIds = [...new Set(allResources.map(r => r.addedBy).filter(Boolean))];
            const names = {};
            
            for (const userId of uniqueUserIds) {
                try {
                    const userDoc = await db.collection('users').doc(userId).get();
                    if (userDoc.exists) {
                        const data = userDoc.data();
                        names[userId] = data.displayName || `${data.firstName} ${data.lastName}` || 'Unknown';
                    }
                } catch (error) {
                    names[userId] = 'Unknown';
                }
            }
            
            setUserNames(names);
        } catch (error) {
        }
    };

    const loadAllResources = async () => {
        try {
            const assignedQuery = await db.collection('resources')
                .where('assignedTo', 'array-contains', user.uid)
                .where('active', '==', true)
                .get();
            
            const globalQuery = await db.collection('resources')
                .where('isGlobal', '==', true)
                .where('active', '==', true)
                .get();

            const resourceMap = new Map();
            
            assignedQuery.forEach(doc => {
                resourceMap.set(doc.id, { 
                    id: doc.id, 
                    ...doc.data(),
                    isAssigned: true 
                });
            });
            
            globalQuery.forEach(doc => {
                if (!resourceMap.has(doc.id)) {
                    resourceMap.set(doc.id, { 
                        id: doc.id, 
                        ...doc.data(),
                        isAssigned: false 
                    });
                }
            });

            const allResourcesList = Array.from(resourceMap.values());
            setAllResources(allResourcesList);
            setTotalResourceCount(allResourcesList.length);
            
            const counts = {};
            categories.forEach(cat => {
                counts[cat.id] = allResourcesList.filter(r => r.category === cat.id).length;
            });
            setResourceCounts(counts);

        } catch (error) {
        }
    };

    const filterCategoryResources = () => {
        let filtered = allResources.filter(r => r.category === selectedCategory);
        
        if (activeTab === 'assigned') {
            filtered = filtered.filter(r => r.isAssigned);
        } else {
            filtered = filtered.filter(r => !r.isAssigned);
        }
        
        setResources(filtered);
    };

    const checkNewResources = async () => {
        try {
            const lastViewDoc = await db.collection('users').doc(user.uid)
                .collection('preferences').doc('lastResourceView').get();
            
            const lastView = lastViewDoc.exists ? lastViewDoc.data().timestamp : null;
            
            if (lastView && lastView.toDate) {
                const newResources = allResources.filter(r => 
                    r.addedAt && r.addedAt.toDate && r.addedAt.toDate() > lastView.toDate()
                );
                setNewResourceIds(newResources.map(r => r.id));
            }
            
            await db.collection('users').doc(user.uid)
                .collection('preferences').doc('lastResourceView')
                .set({ timestamp: firebase.firestore.FieldValue.serverTimestamp() });
                
        } catch (error) {
        }
    };

    const loadUserPreferences = async () => {
        try {
            const prefDoc = await db.collection('users').doc(user.uid)
                .collection('preferences').doc('resources').get();
            
            if (prefDoc.exists) {
                const data = prefDoc.data();
                setNotes(data.notes || {});
                setProgress(data.progress || {});
            }
        } catch (error) {
            setNotes({});
            setProgress({});
        }
    };

    const updateProgress = async (resourceId, status) => {
        const newProgress = { 
            ...progress, 
            [resourceId]: {
                status: status,
                updatedAt: new Date().toISOString(),
                completedAt: status === 'completed' ? new Date().toISOString() : progress[resourceId]?.completedAt || null
            }
        };
        setProgress(newProgress);
        
        const saved = await savePreferences({ progress: newProgress });

        if (saved) {
            try {
                await db.collection('activities').add({
                    userId: user.uid,
                    type: 'resource_progress',
                    resourceId: resourceId,
                    status: status,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (error) {
            }
            
            showNotification(`Progress updated to ${status}`, 'success');
        }
    };

    const saveNote = async (resourceId, note) => {
        const newNotes = { ...notes, [resourceId]: note };
        setNotes(newNotes);
        
        const saved = await savePreferences({ notes: newNotes });
        if (saved) {
            showNotification('Note saved', 'success');
        }
    };

    const savePreferences = async (updates) => {
        try {
            const currentPrefs = {
                notes: notes,
                progress: progress,
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('users').doc(user.uid)
                .collection('preferences').doc('resources')
                .set(currentPrefs, { merge: true });
                
            return true;
        } catch (error) {
            showNotification('Failed to save - check permissions', 'error');
            return false;
        }
    };

    const recordView = async (resourceId) => {
        try {
            await db.collection('users').doc(user.uid)
                .collection('resourceViews').doc(resourceId)
                .set({
                    viewedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
        } catch (error) {
        }
    };

    const showNotification = (message, type) => {
        const existingToast = document.querySelector('.resource-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = 'resource-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 3px 6px rgba(0,0,0,0.2);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    };

    const getFilteredResources = () => {
        if (!searchQuery) return resources;
        
        return resources.filter(resource => 
            resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const handleResourceClick = async (resource) => {
        if (!resource || !resource.id) {
            return;
        }
        
        let completeResource = resource;
        if (!resource.category || !resource.title) {
            completeResource = allResources.find(r => r.id === resource.id) || resource;
        }
        
        setSelectedResource(completeResource);
        
        try {
            await recordView(resource.id);
        } catch (error) {
        }
    };

    // Category Selection View
    if (!selectedCategory) {
        return (
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                minHeight: '100vh',
                padding: '20px'
            }}>
                <style>{`
                    @keyframes slideIn {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                    @keyframes slideOut {
                        from {
                            transform: translateX(0);
                            opacity: 1;
                        }
                        to {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                    }
                `}</style>

                <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    padding: '20px',
                    marginBottom: '30px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <button
                            onClick={() => setCurrentView('home')}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                color: 'white',
                                fontSize: '24px',
                                cursor: 'pointer',
                                padding: '10px',
                                borderRadius: '10px',
                                transition: 'all 0.3s'
                            }}
                        >
                            ←
                        </button>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <h2 style={{ margin: 0, color: 'white' }}>Recovery Resources</h2>
                            <p style={{ 
                                margin: '5px 0 0 0', 
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: '14px'
                            }}>
                                {totalResourceCount} resources available
                            </p>
                        </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <input 
                            type="text"
                            placeholder="Search all resources..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '15px 20px 15px 50px',
                                background: 'rgba(255,255,255,0.9)',
                                border: 'none',
                                borderRadius: '15px',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                        />
                        <span style={{
                            position: 'absolute',
                            left: '20px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '20px'
                        }}>
                            <i data-lucide="search" style={{width: '18px', height: '18px'}}></i>
                        </span>
                    </div>
                </div>

                {searchQuery && (
                    <div style={{
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: '20px',
                        padding: '20px',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0' }}>
                            Search Results ({allResources.filter(r => 
                                r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                r.description?.toLowerCase().includes(searchQuery.toLowerCase())
                            ).length})
                        </h3>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {allResources
                                .filter(r => 
                                    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map(resource => (
                                    <div 
                                        key={resource.id}
                                        onClick={() => handleResourceClick(resource)}
                                        style={{
                                            padding: '10px',
                                            marginBottom: '10px',
                                            background: 'rgba(103,58,183,0.05)',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        <div style={{ fontWeight: 'bold' }}>{resource.title}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            {categories.find(c => c.id === resource.category)?.name}
                                        </div>
                                    </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '15px',
                    marginBottom: '30px'
                }}>
                    {categories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            style={{
                                background: 'rgba(255,255,255,0.95)',
                                border: 'none',
                                borderRadius: '20px',
                                padding: '25px',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {newResourceIds.some(id => 
                                allResources.find(r => r.id === id && r.category === category.id)
                            ) && (
                                <span style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: '#ff4444',
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontSize: '10px',
                                    fontWeight: 'bold'
                                }}>
                                    NEW
                                </span>
                            )}
                            
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: `linear-gradient(135deg, ${category.color}, ${category.color}cc)`,
                                borderRadius: 'var(--radius-lg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto var(--space-3)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                <i data-lucide={category.icon} style={{width: '32px', height: '32px', color: '#fff'}}></i>
                            </div>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#333',
                                marginBottom: '5px'
                            }}>
                                {category.name}
                            </div>
                            <div style={{
                                fontSize: '14px',
                                color: category.color,
                                fontWeight: 'bold'
                            }}>
                                {resourceCounts[category.id] || 0} resources
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Resource List View
    if (!selectedResource) {
        const category = categories.find(c => c.id === selectedCategory);
        const filteredResources = getFilteredResources();
        
        return (
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                minHeight: '100vh',
                padding: '20px'
            }}>
                <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    padding: '20px',
                    marginBottom: '20px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <button 
                            onClick={() => setSelectedCategory(null)}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                color: 'white',
                                fontSize: '24px',
                                cursor: 'pointer',
                                padding: '10px',
                                borderRadius: '10px'
                            }}
                        >
                            ←
                        </button>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <h2 style={{ margin: 0, color: 'white' }}>
                                {category?.icon} {category?.name}
                            </h2>
                            <p style={{ 
                                margin: '5px 0 0 0', 
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: '14px'
                            }}>
                                {filteredResources.length} resources
                            </p>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '15px',
                        padding: '5px'
                    }}>
                        <button
                            onClick={() => setActiveTab('assigned')}
                            style={{
                                flex: 1,
                                padding: '12px',
                                background: activeTab === 'assigned' ? 'white' : 'transparent',
                                color: activeTab === 'assigned' ? '#764ba2' : 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'all 0.3s'
                            }}
                        >
                            Assigned ({resources.filter(r => r.isAssigned).length})
                        </button>
                        <button
                            onClick={() => setActiveTab('global')}
                            style={{
                                flex: 1,
                                padding: '12px',
                                background: activeTab === 'global' ? 'white' : 'transparent',
                                color: activeTab === 'global' ? '#764ba2' : 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'all 0.3s'
                            }}
                        >
                            Global ({resources.filter(r => !r.isAssigned).length})
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{
                        textAlign: 'center',
                        color: 'white',
                        padding: '40px'
                    }}>
                        Loading resources...
                    </div>
                ) : filteredResources.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        color: 'rgba(255,255,255,0.8)',
                        padding: '40px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '20px'
                    }}>
                        No resources found.
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px'
                    }}>
                        {filteredResources.map(resource => (
                            <div 
                                key={resource.id}
                                style={{
                                    background: 'rgba(255,255,255,0.95)',
                                    borderRadius: '20px',
                                    padding: '20px',
                                    position: 'relative',
                                    transition: 'all 0.3s',
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleResourceClick(resource)}
                            >
                                {newResourceIds.includes(resource.id) && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: '#ff4444',
                                        color: 'white',
                                        padding: '4px 10px',
                                        borderRadius: '10px',
                                        fontSize: '11px',
                                        fontWeight: 'bold'
                                    }}>
                                        NEW
                                    </span>
                                )}

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{
                                            color: '#333',
                                            margin: '0 0 8px 0',
                                            fontSize: '18px'
                                        }}>
                                            {resource.title}
                                        </h4>
                                        {resource.description && (
                                            <p style={{
                                                color: '#666',
                                                fontSize: '14px',
                                                margin: '0 0 15px 0',
                                                lineHeight: '1.5'
                                            }}>
                                                {resource.description}
                                            </p>
                                        )}
                                        
                                        <div style={{
                                            display: 'flex',
                                            gap: '10px',
                                            flexWrap: 'wrap',
                                            marginBottom: '15px'
                                        }}>
                                            <span style={{
                                                background: progress[resource.id]?.status === 'completed' 
                                                    ? 'linear-gradient(135deg, #4CAF50, #45a049)'
                                                    : progress[resource.id]?.status === 'in-progress' 
                                                    ? 'linear-gradient(135deg, #ff9800, #f57c00)'
                                                    : 'linear-gradient(135deg, #9e9e9e, #757575)',
                                                color: 'white',
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}>
                                                {progress[resource.id]?.status === 'completed' ? '✓ Completed' :
                                                 progress[resource.id]?.status === 'in-progress' ? '⏳ In Progress' :
                                                 '○ Not Started'}
                                            </span>

                                            {resource.addedAt && (
                                                <span style={{
                                                    background: 'rgba(103,58,183,0.1)',
                                                    color: '#673ab7',
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px'
                                                }}>
                                                    <i data-lucide="calendar" style={{width: '12px', height: '12px', marginRight: '4px'}}></i>
                                                    Added {resource.addedAt.toDate ?
                                                        new Date(resource.addedAt.toDate()).toLocaleDateString() :
                                                        new Date(resource.addedAt).toLocaleDateString()}
                                                </span>
                                            )}

                                            {progress[resource.id]?.completedAt && (
                                                <span style={{
                                                    background: 'rgba(76,175,80,0.1)',
                                                    color: '#4CAF50',
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px'
                                                }}>
                                                    ✅ Completed {new Date(progress[resource.id].completedAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            gap: '10px',
                                            alignItems: 'center'
                                        }}>
                                            <select
                                                value={progress[resource.id]?.status || 'not-started'}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    updateProgress(resource.id, e.target.value);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    padding: '8px 12px',
                                                    background: 'white',
                                                    border: '2px solid #e0e0e0',
                                                    borderRadius: '10px',
                                                    color: '#333',
                                                    cursor: 'pointer',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                <option value="not-started">Not Started</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                            
                                            {notes[resource.id] && (
                                                <span style={{
                                                    background: 'rgba(33,150,243,0.1)',
                                                    color: '#2196F3',
                                                    padding: '8px 12px',
                                                    borderRadius: '10px',
                                                    fontSize: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}>
                                                    <i data-lucide="file-text" style={{width: '14px', height: '14px', marginRight: '4px'}}></i>
                                                    Has notes
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <ResourceViewer 
            resource={selectedResource}
            onBack={() => setSelectedResource(null)}
            onUpdateNote={(note) => saveNote(selectedResource.id, note)}
            currentNote={notes[selectedResource.id]}
            progress={progress[selectedResource.id]}
            onUpdateProgress={(status) => updateProgress(selectedResource.id, status)}
            userName={userNames[selectedResource.addedBy] || 'Unknown'}
        />
    );
}

// Resource Viewer Component
function ResourceViewer({ resource, onBack, onUpdateNote, currentNote, progress, onUpdateProgress, userName }) {
    const [note, setNote] = useState(currentNote || '');
    const [showNoteInput, setShowNoteInput] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        if (resource.fileURL) {
            window.open(resource.fileURL, '_blank');
        } else if (resource.content) {
            const blob = new Blob([resource.content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${resource.title}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'white',
            zIndex: 9999,
            overflowY: 'auto'
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
                padding: '20px',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <button 
                        onClick={onBack}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: 'white',
                            fontSize: '24px',
                            cursor: 'pointer',
                            padding: '5px 10px',
                            borderRadius: '8px'
                        }}
                    >
                        ←
                    </button>
                    <h2 style={{
                        flex: 1,
                        textAlign: 'center',
                        margin: 0,
                        color: 'white',
                        fontSize: '18px'
                    }}>
                        {resource.title}
                    </h2>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <button 
                            onClick={handlePrint}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            <i data-lucide="printer" style={{width: '18px', height: '18px'}}></i>
                        </button>
                        <button
                            onClick={handleDownload}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            <i data-lucide="download" style={{width: '18px', height: '18px'}}></i>
                        </button>
                    </div>
                </div>
                
                <div style={{
                    marginTop: '15px',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center'
                }}>
                    <span style={{color: 'white', fontSize: '14px'}}>Progress:</span>
                    <select
                        value={progress?.status || 'not-started'}
                        onChange={(e) => onUpdateProgress(e.target.value)}
                        style={{
                            padding: '6px 12px',
                            background: 'rgba(255,255,255,0.9)',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            flex: 1
                        }}
                    >
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            <div style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
                {resource.content ? (
                    <div style={{
                        fontSize: '16px',
                        lineHeight: '1.8',
                        color: '#333'
                    }}>
                        {resource.content.split('\n').map((paragraph, index) => (
                            <p key={index} style={{marginBottom: '15px'}}>
                                {paragraph}
                            </p>
                        ))}
                    </div>
                ) : resource.embedUrl ? (
                    <iframe 
                        src={resource.embedUrl}
                        style={{
                            width: '100%',
                            height: '600px',
                            border: 'none',
                            borderRadius: '10px'
                        }}
                    />
                ) : (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#999'
                    }}>
                        <p>This resource is available externally.</p>
                        <a 
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-block',
                                marginTop: '20px',
                                padding: '12px 24px',
                                background: '#9c27b0',
                                color: 'white',
                                borderRadius: '8px',
                                textDecoration: 'none'
                            }}
                        >
                            Open Resource
                        </a>
                    </div>
                )}

                <div style={{
                    marginTop: '40px',
                    padding: '20px',
                    background: '#f5f5f5',
                    borderRadius: '10px'
                }}>
                    <h3 style={{margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <i data-lucide="file-text" style={{width: '20px', height: '20px'}}></i>
                        Personal Notes
                    </h3>
                    {showNoteInput ? (
                        <div>
                            <textarea 
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Add your thoughts, reflections, or key takeaways..."
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                }}
                            />
                            <div style={{marginTop: '10px', display: 'flex', gap: '10px'}}>
                                <button
                                    onClick={() => {
                                        onUpdateNote(note);
                                        setShowNoteInput(false);
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Save Note
                                </button>
                                <button
                                    onClick={() => {
                                        setNote(currentNote || '');
                                        setShowNoteInput(false);
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#999',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {currentNote ? (
                                <div>
                                    <p style={{margin: '0 0 10px 0', whiteSpace: 'pre-wrap'}}>
                                        {currentNote}
                                    </p>
                                    <button
                                        onClick={() => {
                                            setNote(currentNote);
                                            setShowNoteInput(true);
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#9c27b0',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Edit Note
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowNoteInput(true)}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#9c27b0',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Add Note
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: '#f9f9f9',
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: '#666'
                }}>
                    <div style={{marginBottom: '8px'}}>
                        <strong>Category:</strong> {resource.category}
                    </div>
                    {resource.addedAt && (
                        <div style={{marginBottom: '8px'}}>
                            <strong>Added:</strong> {resource.addedAt.toDate ? 
                                new Date(resource.addedAt.toDate()).toLocaleDateString() :
                                new Date(resource.addedAt).toLocaleDateString()}
                        </div>
                    )}
                    {progress?.completedAt && (
                        <div style={{marginBottom: '8px'}}>
                            <strong>Completed:</strong> {new Date(progress.completedAt).toLocaleDateString()}
                        </div>
                    )}
                    {userName && (
                        <div>
                            <strong>Added by:</strong> {userName}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Expose ResourcesView to global namespace
window.GLRSApp.components.ResourcesView = ResourcesView;
console.log('✅ ResourcesView component loaded');