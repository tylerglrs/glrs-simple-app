// ============================================================
// USER PROFILE VIEW COMPONENT
// ============================================================
// Full-page view for viewing other users' public profiles
// Displays: Avatar, stats, about info, posts feed with tabs
// Privacy-respecting: Honors profileVisibility settings
// Coach override: Coaches/admins see all data
// ============================================================

// Destructure React hooks for use in components
const { useState, useEffect, useRef } = React;

// ============================================================
// STYLE CONSTANTS (RESPONSIVE)
// ============================================================
const getStyles = (isMobile) => ({
  colors: {
    background: '#f8f9fa',
    card: '#ffffff',
    textPrimary: '#1a1a1a',
    textSecondary: '#6c6c6c',
    textTertiary: '#9e9e9e',
    accent: '#069494',
    accentDark: '#048080',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
    border: '#e4e6eb',
    borderLight: '#f0f2f5',
    overlay: 'rgba(0, 0, 0, 0.6)',
    hoverOverlay: 'rgba(0, 0, 0, 0.05)'
  },

  typography: {
    displayName: {
      fontSize: isMobile ? '22px' : '28px',
      fontWeight: '700',
      lineHeight: '1.2',
      color: '#1a1a1a'
    },
    sectionHeader: {
      fontSize: isMobile ? '16px' : '18px',
      fontWeight: '600',
      lineHeight: '1.3',
      color: '#2c2c2c'
    },
    statNumber: {
      fontSize: isMobile ? '20px' : '24px',
      fontWeight: '700',
      lineHeight: '1.2'
    },
    statLabel: {
      fontSize: isMobile ? '11px' : '12px',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: '#7a7a7a'
    },
    body: {
      fontSize: isMobile ? '14px' : '15px',
      fontWeight: '400',
      lineHeight: '1.5',
      color: '#333333'
    },
    caption: {
      fontSize: isMobile ? '12px' : '13px',
      fontWeight: '400',
      lineHeight: '1.4',
      color: '#6c6c6c'
    },
    tabLabel: {
      fontSize: isMobile ? '13px' : '14px',
      fontWeight: '500',
      color: '#6c6c6c'
    },
    tabLabelActive: {
      fontSize: isMobile ? '13px' : '14px',
      fontWeight: '600',
      color: '#069494'
    }
  },

  spacing: {
    xs: isMobile ? '3px' : '4px',
    sm: isMobile ? '6px' : '8px',
    md: isMobile ? '12px' : '16px',
    lg: isMobile ? '16px' : '24px',
    xl: isMobile ? '20px' : '32px',
    xxl: isMobile ? '32px' : '48px'
  },

  borderRadius: {
    small: isMobile ? '4px' : '6px',
    medium: isMobile ? '6px' : '8px',
    large: isMobile ? '10px' : '12px',
    xlarge: isMobile ? '12px' : '16px',
    pill: '999px',
    circle: '50%'
  },

  shadows: {
    subtle: '0 1px 3px rgba(0,0,0,0.08)',
    card: '0 1px 3px rgba(0,0,0,0.1)',
    cardHover: '0 4px 12px rgba(0,0,0,0.12)',
    strong: '0 4px 16px rgba(0,0,0,0.15)',
    teal: '0 2px 8px rgba(6,148,148,0.3)'
  },

  transitions: {
    fast: '0.15s ease',
    base: '0.3s ease',
    slow: '0.5s ease'
  },

  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px'
  }
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Calculate days sober from sobriety date
 * @param {string} sobrietyDate - Date string in YYYY-MM-DD format
 * @returns {number} - Number of days sober
 */
const calculateDaysSober = (sobrietyDate) => {
  if (!sobrietyDate) return 0;

  try {
    // Parse as LOCAL date
    const [year, month, day] = sobrietyDate.split('-');
    const sobrietyDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Convert both to UTC to avoid DST issues
    const sobrietyUTC = Date.UTC(sobrietyDateObj.getFullYear(), sobrietyDateObj.getMonth(), sobrietyDateObj.getDate());
    const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

    // Calculate difference in milliseconds (DST-proof)
    const diffTime = todayUTC - sobrietyUTC;

    // Convert to days and add 1 (sobriety date counts as day 1)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Return at least 1 if sobriety date is today or in the past
    return Math.max(1, diffDays);
  } catch (error) {
    console.error('Error calculating sobriety days:', error);
    return 0;
  }
};

/**
 * Format member since date (e.g., "Member since Jan 2024")
 * @param {object} joinDate - Firestore timestamp object
 * @returns {string} - Formatted string
 */
const formatMemberSince = (joinDate) => {
  if (!joinDate) return 'Member';

  try {
    let date;
    if (joinDate.toDate) {
      date = joinDate.toDate();
    } else if (joinDate.seconds) {
      date = new Date(joinDate.seconds * 1000);
    } else if (typeof joinDate === 'string' || typeof joinDate === 'number') {
      date = new Date(joinDate);
    } else {
      return 'Member';
    }

    return `Member since ${date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })}`;
  } catch (error) {
    console.error('Error formatting member since date:', error);
    return 'Member';
  }
};

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 * @param {object} timestamp - Firestore timestamp object
 * @returns {string} - Relative time string
 */
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';

  try {
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      return '';
    }

    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;

    return window.GLRSApp?.utils?.formatTimestamp(timestamp, null, 'date') || '';
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
};

/**
 * Get initials from name (for avatar placeholder)
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} - Initials (e.g., "JD")
 */
const getInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return '?';
  const first = (firstName || '').charAt(0).toUpperCase();
  const last = (lastName || '').charAt(0).toUpperCase();
  return `${first}${last}`.trim() || '?';
};

/**
 * Get cache key for sessionStorage
 * @param {string} userId - User ID
 * @returns {string} - Cache key
 */
const getCacheKey = (userId) => `userProfile_${userId}`;

/**
 * Get cached profile data from sessionStorage
 * @param {string} userId - User ID
 * @returns {object|null} - Cached data or null
 */
const getCachedProfile = (userId) => {
  try {
    const cached = sessionStorage.getItem(getCacheKey(userId));
    if (cached) {
      const data = JSON.parse(cached);
      // Check if cache is less than 5 minutes old
      if (Date.now() - data.timestamp < 5 * 60 * 1000) {
        return data.profile;
      }
    }
  } catch (error) {
    console.error('Error reading cache:', error);
  }
  return null;
};

/**
 * Save profile data to sessionStorage
 * @param {string} userId - User ID
 * @param {object} profileData - Profile data to cache
 */
const cacheProfile = (userId, profileData) => {
  try {
    sessionStorage.setItem(getCacheKey(userId), JSON.stringify({
      profile: profileData,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error writing cache:', error);
  }
};

// ============================================================
// SUB-COMPONENTS
// ============================================================

/**
 * StatCard Component
 * Display a single stat (days sober, posts count, goals count)
 *
 * @param {object} props
 * @param {string} props.icon - Lucide icon name
 * @param {string|number} props.value - Stat value to display
 * @param {string} props.label - Stat label
 * @param {string} props.color - Color for value and icon
 * @param {boolean} props.isPrivate - Whether stat is private
 * @param {function} props.onClick - Optional click handler
 */
const StatCard = ({ icon, value, label, color, isPrivate, onClick, STYLES, isMobile }) => {
  // Create gradient background for icon based on color
  const iconGradient = isPrivate
    ? 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)'
    : color === STYLES.colors.success
      ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
      : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)';

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isMobile ? '16px 12px' : '20px 16px',
        background: '#FFFFFF',
        borderRadius: isMobile ? '12px' : '16px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        flex: 1,
        minWidth: 0,
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
        }
      }}
    >
      {/* Icon with gradient background */}
      <div style={{
        width: isMobile ? '48px' : '56px',
        height: isMobile ? '48px' : '56px',
        borderRadius: '14px',
        background: iconGradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: isMobile ? '10px' : '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <i
          data-lucide={isPrivate ? 'lock' : icon}
          style={{
            width: isMobile ? '24px' : '28px',
            height: isMobile ? '24px' : '28px',
            color: '#FFFFFF'
          }}
        />
      </div>

      {/* Value */}
      <div style={{
        fontSize: isMobile ? '24px' : '28px',
        fontWeight: '700',
        lineHeight: '1.2',
        color: isPrivate ? '#9CA3AF' : color,
        marginBottom: '6px'
      }}>
        {isPrivate ? '—' : value}
      </div>

      {/* Label */}
      <div style={{
        fontSize: isMobile ? '12px' : '13px',
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        textAlign: 'center'
      }}>
        {label}
      </div>
    </div>
  );
};

/**
 * AboutField Component
 * Display a single profile field with icon and label
 *
 * @param {object} props
 * @param {string} props.icon - Lucide icon name
 * @param {string} props.label - Field label
 * @param {string} props.value - Field value
 * @param {boolean} props.isPrivate - Whether field is private
 */
const AboutField = ({ icon, label, value, isPrivate, isMobile }) => {
  if (isPrivate && !value) return null;

  return (
    <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '6px' : '8px',
        marginBottom: isMobile ? '4px' : '6px'
      }}>
        <i
          data-lucide={isPrivate ? 'lock' : icon}
          style={{
            width: isMobile ? '14px' : '16px',
            height: isMobile ? '14px' : '16px',
            color: isPrivate ? '#9CA3AF' : '#058585'
          }}
        />
        <span style={{
          fontSize: isMobile ? '11px' : '12px',
          fontWeight: '500',
          color: '#6B7280',
          textTransform: 'uppercase',
          letterSpacing: '0.025em'
        }}>
          {label}
        </span>
      </div>
      <p style={{
        fontSize: isMobile ? '14px' : '15px',
        fontWeight: '400',
        lineHeight: '1.6',
        color: isPrivate ? '#9CA3AF' : '#111827',
        margin: 0,
        paddingLeft: isMobile ? '20px' : '24px'
      }}>
        {isPrivate ? 'Private' : value}
      </p>
    </div>
  );
};

/**
 * ProfileDropdownMenu Component
 * Dropdown menu with Edit Profile, Settings, Privacy, Logout options
 */
const ProfileDropdownMenu = ({ isOpen, onClose, onEditProfile, onLogout, STYLES }) => {
  if (!isOpen) return null;

  const menuItems = [
    {
      icon: 'edit-3',
      label: 'Edit Profile',
      onClick: () => {
        onEditProfile();
        onClose();
      },
      color: '#058585'
    },
    {
      icon: 'settings',
      label: 'Settings',
      onClick: () => {
        alert('Settings feature coming soon!');
        onClose();
      },
      color: '#666666'
    },
    {
      icon: 'shield',
      label: 'Privacy Settings',
      onClick: () => {
        alert('Privacy Settings feature coming soon!');
        onClose();
      },
      color: '#666666'
    },
    {
      icon: 'log-out',
      label: 'Logout',
      onClick: () => {
        onLogout();
        onClose();
      },
      color: '#dc2626'
    }
  ];

  return (
    <div
      data-dropdown-menu="true"
      style={{
        position: 'absolute',
        top: '60px',
        left: '16px',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        minWidth: '220px',
        overflow: 'hidden',
        animation: 'slideDown 0.2s ease-out'
      }}
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={item.onClick}
          style={{
            width: '100%',
            padding: '14px 18px',
            border: 'none',
            background: '#ffffff',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '15px',
            fontWeight: '500',
            color: item.color,
            borderBottom: index < menuItems.length - 1 ? '1px solid #f0f0f0' : 'none',
            transition: 'background 0.15s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
        >
          <i data-lucide={item.icon} style={{ width: '18px', height: '18px', color: item.color }} />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

/**
 * ProfileHeader Component
 * Display user avatar, name, about info, and back button
 *
 * @param {object} props
 * @param {object} props.profileData - User profile data
 * @param {function} props.onBack - Back button callback
 * @param {boolean} props.isOwnProfile - Whether viewing own profile
 * @param {function} props.onProfilePictureChange - Profile picture upload handler
 */
const ProfileHeader = ({ profileData, onBack, isOwnProfile, onProfilePictureChange, onCoverPhotoChange, onEditProfile, onMenuToggle, showDropdown, onLogout, STYLES, isMobile, variant = 'default' }) => {
  if (!profileData) return null;

  const displayName = `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 'User';
  const initials = getInitials(profileData.firstName, profileData.lastName);
  const profilePicture = profileData.profileImageUrl || profileData.profilePhoto || profileData.profilePicture;
  const coverPhoto = profileData.coverPhotoUrl;
  const aboutText = profileData.recoveryGoals || profileData.bio || '';

  // Conditional styling based on variant
  const coverPhotoHeight = isMobile ? '150px' : '200px';
  const profilePictureSize = isMobile ? '100px' : '120px';
  const textColor = '#FFFFFF'; // Always white on cover photo
  const textSecondaryColor = 'rgba(255, 255, 255, 0.9)';

  // Default cover photo gradient if none uploaded
  const coverPhotoBackground = coverPhoto
    ? `url(${coverPhoto})`
    : 'linear-gradient(135deg, #058585 0%, #047272 50%, #036969 100%)';

  return (
    <>
      {/* Shared ProfileHeaderBar - Hamburger + Profile + User Dropdown */}
      {window.GLRSApp?.components?.ProfileHeaderBar &&
        React.createElement(window.GLRSApp.components.ProfileHeaderBar, {
          title: 'Profile',
          onEditProfile: onEditProfile,
          onShowSettings: onBack,
          onLogout: onLogout,
          isMobile: isMobile
        })
      }

      <div style={{
        position: 'relative',
        background: STYLES.colors.card
      }}>
        {/* Cover Photo Section */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: coverPhotoHeight,
        background: coverPhotoBackground,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
      }}>
        {/* Cover Photo Upload (Own Profile Only) */}
        {isOwnProfile && onCoverPhotoChange && (
          <>
            <input
              type="file"
              id="cover-photo-input"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={onCoverPhotoChange}
            />
            <button
              onClick={() => document.getElementById('cover-photo-input').click()}
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <i data-lucide="camera" style={{ width: '18px', height: '18px' }} />
              {!isMobile && <span>Edit Cover Photo</span>}
            </button>
          </>
        )}

        {/* Back Button - Shows for other users' profiles */}
        {!isOwnProfile && (
          <button
            onClick={onBack}
            style={{
              position: 'absolute',
              left: STYLES.spacing.md,
              top: STYLES.spacing.md,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '10px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
              zIndex: 10
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'}
          >
            <i data-lucide="arrow-left" style={{ width: '20px', height: '20px' }} />
            Back
          </button>
        )}

      </div>

      {/* Profile Content Section */}
      <div style={{
        position: 'relative',
        padding: `${STYLES.spacing.lg} ${STYLES.spacing.md}`,
        textAlign: 'center'
      }}>
        {/* Avatar with Edit Option - Overlapping Cover Photo */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: `calc(-${profilePictureSize} / 2)`,
          transform: 'translateX(-50%)',
          zIndex: 100
        }}>
          {/* Avatar Image or Initials */}
          <div style={{
            width: profilePictureSize,
            height: profilePictureSize,
            borderRadius: STYLES.borderRadius.circle,
            background: profilePicture ? 'transparent' : `linear-gradient(135deg, ${STYLES.colors.accent}, ${STYLES.colors.accentDark})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? '36px' : '42px',
            fontWeight: '700',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '4px solid #ffffff',
            overflow: 'hidden',
            position: 'relative'
          }}>
          {profilePicture ? (
            <img
              src={profilePicture}
              alt={displayName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            initials
          )}
        </div>

        {/* Edit Button (only for own profile) */}
        {isOwnProfile && (
          <>
            <input
              type="file"
              id="profile-picture-input"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={onProfilePictureChange}
            />
            <button
              onClick={() => document.getElementById('profile-picture-input').click()}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '28px',
                height: '28px',
                borderRadius: STYLES.borderRadius.circle,
                background: STYLES.colors.accent,
                border: `2px solid ${STYLES.colors.card}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: STYLES.shadows.card,
                transition: `all ${STYLES.transitions.fast}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = STYLES.colors.accentDark;
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = STYLES.colors.accent;
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <i data-lucide="camera" style={{ width: '14px', height: '14px', color: '#ffffff' }} />
            </button>
          </>
        )}
      </div>

        {/* Display Name - Add margin-top for overlapping avatar */}
        <h1 style={{
          ...STYLES.typography.displayName,
          marginTop: `calc(${profilePictureSize} / 2 + ${STYLES.spacing.md})`,
          marginBottom: STYLES.spacing.xs,
          color: STYLES.colors.textPrimary
        }}>
          {displayName}
        </h1>

        {/* About Section Under Name */}
        <div style={{
          marginTop: STYLES.spacing.lg,
          padding: `0 ${STYLES.spacing.md}`,
          width: '100%'
        }}>
          {/* About Header - Centered across all columns */}
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: STYLES.colors.textPrimary,
            margin: `0 0 ${STYLES.spacing.md} 0`,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            textAlign: 'center'
          }}>
            About
          </h3>

          {/* About Content - Single Row Layout */}
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'left',
            fontSize: '14px',
            lineHeight: '1.8'
          }}>
            {/* Member Since & Bio - Same Line */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              flexWrap: 'wrap',
              gap: isMobile ? '8px' : '16px',
              marginBottom: STYLES.spacing.md
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontWeight: '600', color: STYLES.colors.textPrimary }}>Member Since:</span>
                <span style={{ color: STYLES.colors.textSecondary }}>
                  {profileData.createdAt ? formatMemberSince(profileData.createdAt) : 'Unknown'}
                </span>
              </div>
              {profileData.bio && (
                <>
                  <span style={{ color: STYLES.colors.textSecondary }}>•</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flex: 1, minWidth: isMobile ? '100%' : 'auto' }}>
                    <span style={{ fontWeight: '600', color: STYLES.colors.textPrimary }}>Bio:</span>
                    <span style={{ color: STYLES.colors.textSecondary }}>{profileData.bio}</span>
                  </div>
                </>
              )}
            </div>

            {/* Additional Details in Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: STYLES.spacing.md
            }}>
              {/* Recovery Goals */}
              {profileData.recoveryGoals && (
                <div>
                  <div style={{
                    fontWeight: '600',
                    color: STYLES.colors.textPrimary,
                    marginBottom: '4px'
                  }}>
                    Recovery Goals
                  </div>
                  <ol style={{
                    color: STYLES.colors.textSecondary,
                    paddingLeft: '20px',
                    margin: 0,
                    listStyleType: 'decimal'
                  }}>
                    {profileData.recoveryGoals.split('\n').filter(g => g.trim()).map((goal, index) => (
                      <li key={index} style={{ marginBottom: '4px' }}>
                        {goal.trim()}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Primary Drug of Choice */}
              {profileData.primaryDrugOfChoice && (
                <div>
                  <div style={{
                    fontWeight: '600',
                    color: STYLES.colors.textPrimary,
                    marginBottom: '4px'
                  }}>
                    Primary Drug of Choice
                  </div>
                  <div style={{ color: STYLES.colors.textSecondary }}>
                    {profileData.primaryDrugOfChoice}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

/**
 * StatsRow Component
 * Display 2 stat cards: Days Sober, Posts
 *
 * @param {object} props
 * @param {object} props.profileData - User profile data
 * @param {number} props.postsCount - Number of posts
 * @param {Function} props.canView - Function to check if field is viewable
 */
const StatsRow = ({ profileData, postsCount, goalsCount, canView, STYLES, isMobile }) => {
  if (!profileData) return null;

  const daysSober = canView('sobrietyDate') && profileData.sobrietyDate
    ? calculateDaysSober(profileData.sobrietyDate)
    : null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: STYLES.spacing.md,
      padding: STYLES.spacing.md,
      background: STYLES.colors.background
    }}>
      <StatCard
        icon="target"
        value={daysSober || '—'}
        label={daysSober ? 'Days Sober' : 'Private'}
        color={STYLES.colors.success}
        isPrivate={!daysSober}
        STYLES={STYLES}
        isMobile={isMobile}
      />
      <StatCard
        icon="message-circle"
        value={postsCount || 0}
        label="Posts"
        color={STYLES.colors.info}
        STYLES={STYLES}
        isMobile={isMobile}
      />
    </div>
  );
};

/**
 * AboutSection Component
 * Display profile details: member since, bio, recovery goals, primary drug, timezone
 *
 * @param {object} props
 * @param {object} props.profileData - User profile data
 * @param {function} props.canView - Function to check if field is viewable
 * @param {boolean} props.isOwnProfile - Whether viewing own profile
 */
const AboutSection = ({ profileData, canView, isOwnProfile, isMobile }) => {
  if (!profileData) return null;

  const hasAnyPublicData = canView('bio') || canView('recoveryGoals') || canView('primaryDrugOfChoice') || canView('timezone');

  return (
    <div style={{
      margin: isMobile ? '12px' : '16px',
      padding: isMobile ? '12px' : '16px',
      background: '#FFFFFF',
      borderRadius: isMobile ? '10px' : '12px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{
        fontSize: isMobile ? '16px' : '18px',
        fontWeight: '600',
        color: '#111827',
        margin: isMobile ? '0 0 12px 0' : '0 0 16px 0'
      }}>
        About
      </h2>

      {/* Member Since (always visible) */}
      <AboutField
        icon="calendar"
        label="Member Since"
        value={formatMemberSince(profileData.createdAt)}
        isPrivate={false}
        isMobile={isMobile}
      />

      {/* Bio (privacy-controlled) */}
      {canView('bio') && profileData.bio && (
        <AboutField
          icon="user"
          label="Bio"
          value={profileData.bio}
          isPrivate={false}
          isMobile={isMobile}
        />
      )}

      {/* Recovery Goals (privacy-controlled) */}
      {canView('recoveryGoals') && profileData.recoveryGoals && (
        <AboutField
          icon="target"
          label="Recovery Goals"
          value={profileData.recoveryGoals}
          isPrivate={false}
          isMobile={isMobile}
        />
      )}

      {/* Primary Drug of Choice (privacy-controlled) */}
      {canView('primaryDrugOfChoice') && profileData.primaryDrugOfChoice && (
        <AboutField
          icon="alert-circle"
          label="Primary Drug of Choice"
          value={profileData.primaryDrugOfChoice}
          isPrivate={false}
          isMobile={isMobile}
        />
      )}

      {/* Timezone (privacy-controlled) */}
      {canView('timezone') && profileData.timezone && (
        <AboutField
          icon="globe"
          label="Timezone"
          value={profileData.timezone}
          isPrivate={false}
          isMobile={isMobile}
        />
      )}

      {/* Private Profile Message */}
      {!hasAnyPublicData && !isOwnProfile && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: isMobile ? '20px 12px' : '24px 16px',
          background: '#F9FAFB',
          borderRadius: isMobile ? '6px' : '8px',
          border: '1px solid #F3F4F6'
        }}>
          <i data-lucide="lock" style={{
            width: isMobile ? '40px' : '48px',
            height: isMobile ? '40px' : '48px',
            color: '#6B7280',
            marginBottom: isMobile ? '12px' : '16px'
          }} />
          <h3 style={{
            fontSize: isMobile ? '15px' : '16px',
            fontWeight: '600',
            margin: isMobile ? '0 0 6px 0' : '0 0 8px 0',
            color: '#111827'
          }}>
            Private profile
          </h3>
          <p style={{
            fontSize: isMobile ? '12px' : '13px',
            color: '#6B7280',
            margin: 0,
            textAlign: 'center',
            maxWidth: isMobile ? '240px' : '280px'
          }}>
            {profileData.firstName || 'This user'} hasn't made profile details public yet
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * TabNavigation Component
 * Display tab buttons for switching content
 *
 * @param {object} props
 * @param {string} props.activeTab - Currently active tab
 * @param {function} props.onTabChange - Tab change callback
 * @param {object} props.counts - Post counts per tab
 */
const TabNavigation = ({ activeTab, onTabChange, counts = {}, STYLES }) => {
  const tabs = [
    { id: 'all', label: 'All', icon: 'list', count: counts.all },
    { id: 'photos', label: 'Photos', icon: 'image', count: counts.photos },
    { id: 'reflections', label: 'Reflections', icon: 'message-square', count: counts.reflections },
    { id: 'wins', label: 'Wins', icon: 'trophy', count: counts.wins },
    { id: 'about', label: 'About', icon: 'info', count: null }
  ];

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 10,
      background: STYLES.colors.card,
      borderBottom: `1px solid ${STYLES.colors.border}`,
      overflowX: 'auto',
      whiteSpace: 'nowrap'
    }}>
      <div style={{
        display: 'flex',
        padding: `0 ${STYLES.spacing.md}`
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              position: 'relative',
              flex: '0 0 auto',
              padding: `${STYLES.spacing.md} ${STYLES.spacing.md}`,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: STYLES.spacing.sm,
              fontSize: activeTab === tab.id ? STYLES.typography.tabLabelActive.fontSize : STYLES.typography.tabLabel.fontSize,
              fontWeight: activeTab === tab.id ? STYLES.typography.tabLabelActive.fontWeight : STYLES.typography.tabLabel.fontWeight,
              color: activeTab === tab.id ? STYLES.typography.tabLabelActive.color : STYLES.typography.tabLabel.color,
              transition: `all ${STYLES.transitions.fast}`
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = STYLES.colors.accent;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = STYLES.typography.tabLabel.color;
              }
            }}
          >
            <i data-lucide={tab.icon} style={{ width: '18px', height: '18px' }} />
            <span>{tab.label}</span>
            {tab.count !== null && tab.count !== undefined && (
              <span style={{
                padding: '2px 6px',
                background: activeTab === tab.id ? STYLES.colors.accent : STYLES.colors.borderLight,
                color: activeTab === tab.id ? '#ffffff' : STYLES.colors.textSecondary,
                borderRadius: STYLES.borderRadius.pill,
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {tab.count}
              </span>
            )}

            {/* Active indicator */}
            {activeTab === tab.id && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: STYLES.colors.accent,
                borderRadius: '3px 3px 0 0'
              }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * EmptyState Component
 * Display when no content available
 *
 * @param {object} props
 * @param {string} props.type - Type of empty state ('posts', 'photos', 'reflections', 'wins', 'private')
 * @param {string} props.userName - User's first name for personalized message
 */
const EmptyState = ({ type, userName, isMobile = false }) => {
  const configs = {
    posts: {
      icon: 'message-circle',
      title: 'No posts yet',
      message: `${userName || 'This user'} hasn't shared anything yet`
    },
    photos: {
      icon: 'image',
      title: 'No photos shared',
      message: `${userName || 'This user'} hasn't posted photos yet`
    },
    reflections: {
      icon: 'message-square',
      title: 'No reflections',
      message: `${userName || 'This user'} hasn't shared any reflections yet`
    },
    wins: {
      icon: 'trophy',
      title: 'No wins',
      message: `${userName || 'This user'} hasn't celebrated any wins yet`
    },
    private: {
      icon: 'lock',
      title: 'Private profile',
      message: `${userName || 'This user'} hasn't made profile details public yet`
    }
  };

  const config = configs[type] || configs.posts;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      color: '#6c6c6c'
    }}>
      <i data-lucide={config.icon} style={{
        width: '64px',
        height: '64px',
        color: '#c4c4c4',
        marginBottom: isMobile ? '12px' : '16px'
      }} />
      <h3 style={{
        fontSize: isMobile ? '16px' : '18px',
        fontWeight: '600',
        lineHeight: '1.3',
        color: '#2c2c2c',
        margin: `0 0 ${isMobile ? '6px' : '8px'} 0`
      }}>
        {config.title}
      </h3>
      <p style={{
        fontSize: isMobile ? '12px' : '13px',
        fontWeight: '400',
        lineHeight: '1.4',
        color: '#6c6c6c',
        margin: 0,
        textAlign: 'center',
        maxWidth: '300px'
      }}>
        {config.message}
      </p>
    </div>
  );
};

/**
 * LoadingState Component
 * Display skeleton UI while loading
 */
const LoadingState = ({ isMobile = false }) => {
  return (
    <div style={{ padding: isMobile ? '12px' : '16px' }}>
      {/* Avatar skeleton */}
      <div style={{
        width: isMobile ? '64px' : '80px',
        height: isMobile ? '64px' : '80px',
        borderRadius: '50%',
        background: '#f0f2f5',
        margin: `0 auto ${isMobile ? '12px' : '16px'}`,
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />

      {/* Name skeleton */}
      <div style={{
        width: '150px',
        height: '28px',
        borderRadius: isMobile ? '4px' : '6px',
        background: '#f0f2f5',
        margin: `0 auto ${isMobile ? '6px' : '8px'}`,
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />

      {/* Badge skeleton */}
      <div style={{
        width: '80px',
        height: '20px',
        borderRadius: '999px',
        background: '#f0f2f5',
        margin: `0 auto ${isMobile ? '16px' : '24px'}`,
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />

      {/* Stats skeletons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: isMobile ? '12px' : '16px',
        marginTop: isMobile ? '16px' : '24px'
      }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            height: '100px',
            borderRadius: isMobile ? '10px' : '12px',
            background: '#f0f2f5',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
        ))}
      </div>
    </div>
  );
};

/**
 * PostCard Component
 * Display a single post with reactions and comments
 *
 * @param {object} props
 * @param {object} props.post - Post data
 * @param {object} props.profileData - User profile data (for display name)
 * @param {function} props.onImageClick - Image click handler
 * @param {object} props.currentUser - Current logged-in user
 * @param {function} props.onReaction - Reaction handler
 * @param {function} props.onToggleComments - Toggle comments handler
 * @param {boolean} props.commentsExpanded - Comments expanded state
 */
const PostCard = ({
  post,
  profileData,
  onImageClick,
  currentUser,
  userData,
  onReaction,
  onToggleComments,
  commentsExpanded,
  commentsLoading,
  comments,
  commentInputText,
  onCommentTextChange,
  onAddComment,
  submittingComment,
  onDeleteComment,
  onStartReply,
  replyingToId,
  replyInputText,
  onReplyTextChange,
  onAddReply,
  onCancelReply,
  submittingReply,
  onToggleReplies,
  repliesExpanded,
  repliesLoading,
  commentRepliesMap,
  onDeletePost,
  isOwnProfile,
  isCoachOrAdmin,
  onTogglePostMenu,
  postMenuOpen,
  STYLES
}) => {
  if (!post) return null;

  const displayName = `${profileData?.firstName || ''} ${profileData?.lastName || ''}`.trim() || 'User';
  const initials = getInitials(profileData?.firstName, profileData?.lastName);
  const profilePicture = profileData?.profileImageUrl || profileData?.profilePhoto || profileData?.profilePicture;

  // Type badge config
  const typeConfig = {
    reflection: { bg: '#E7F3FF', text: '#1877F2', icon: 'message-square', label: 'Reflection' },
    win: { bg: '#FFF4E6', text: '#E67E22', icon: 'trophy', label: 'Win' },
    photo: { bg: '#F0F9FF', text: '#0284c7', icon: 'image', label: 'Photo' },
    default: { bg: '#F0F2F5', text: '#65676B', icon: 'message-circle', label: 'Post' }
  };

  const type = post.category || post.type || (post.imageUrl ? 'photo' : 'default');
  const config = typeConfig[type] || typeConfig.default;

  return (
    <div style={{
      background: STYLES.colors.card,
      borderRadius: STYLES.borderRadius.medium,
      padding: STYLES.spacing.md,
      marginBottom: STYLES.spacing.md,
      boxShadow: STYLES.shadows.card
    }}>
      {/* Post Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: STYLES.spacing.md
      }}>
        {/* Avatar */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: STYLES.borderRadius.circle,
          background: profilePicture ? 'transparent' : `linear-gradient(135deg, ${STYLES.colors.accent}, ${STYLES.colors.accentDark})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: '18px',
          fontWeight: '700',
          flexShrink: 0,
          marginRight: STYLES.spacing.md,
          overflow: 'hidden'
        }}>
          {profilePicture ? (
            <img
              src={profilePicture}
              alt={displayName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            initials
          )}
        </div>

        {/* User Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: STYLES.spacing.sm,
            marginBottom: '4px'
          }}>
            <span style={{
              ...STYLES.typography.body,
              fontWeight: '600',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {displayName}
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: STYLES.spacing.sm
          }}>
            {/* Type Badge */}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: STYLES.borderRadius.pill,
              background: config.bg,
              color: config.text
            }}>
              <i data-lucide={config.icon} style={{ width: '12px', height: '12px' }} />
              {config.label}
            </span>
            {/* Timestamp */}
            <span style={{ ...STYLES.typography.caption }}>
              {formatRelativeTime(post.timestamp || post.createdAt)}
            </span>
          </div>
        </div>

        {/* Three-Dot Menu Button - Only show if own profile or coach/admin */}
        {onDeletePost && (isOwnProfile || isCoachOrAdmin) && (
          <div style={{ position: 'relative', marginLeft: 'auto' }}>
            <button
              data-post-menu-button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePostMenu(post.id);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '8px',
                cursor: 'pointer',
                color: STYLES.colors.textSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: STYLES.borderRadius.circle,
                transition: `background ${STYLES.transitions.fast}`
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F0F2F5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <i data-lucide="more-vertical" style={{ width: '20px', height: '20px' }} />
            </button>

            {/* Dropdown Menu */}
            {postMenuOpen === post.id && (
              <div
                data-post-menu-dropdown
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  background: '#FFFFFF',
                  border: '1px solid #CCD0D5',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  minWidth: '180px',
                  zIndex: 1000,
                  overflow: 'hidden'
                }}
              >
                {/* Delete Post - Show if own post OR coach/admin */}
                {((post.userId === currentUser?.uid || post.senderId === currentUser?.uid) || isCoachOrAdmin) && (
                  <button
                    onClick={() => onDeletePost(post.id, post)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#F02849',
                      fontSize: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#F0F2F5'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <i data-lucide="trash-2" style={{ width: '18px', height: '18px' }} />
                    Delete Post
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      {post.content && (
        <div style={{
          ...STYLES.typography.body,
          marginBottom: post.imageUrl ? STYLES.spacing.md : STYLES.spacing.sm,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {post.content}
        </div>
      )}

      {/* Post Image */}
      {post.imageUrl && (
        <div style={{ marginBottom: STYLES.spacing.sm }}>
          <img
            src={post.imageUrl}
            alt="Post image"
            onClick={() => onImageClick && onImageClick(post.imageUrl)}
            style={{
              width: '100%',
              maxHeight: '500px',
              objectFit: 'contain',
              borderRadius: STYLES.borderRadius.medium,
              cursor: onImageClick ? 'pointer' : 'default',
              transition: `opacity ${STYLES.transitions.fast}`
            }}
            onMouseEnter={(e) => {
              if (onImageClick) e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          />
        </div>
      )}

      {/* Reactions & Comments Section */}
      <div style={{
        paddingTop: STYLES.spacing.sm,
        borderTop: `1px solid ${STYLES.colors.border}`,
        marginTop: STYLES.spacing.sm
      }}>
        {/* Reaction Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '8px'
        }}>
          {/* Heart Button */}
          <button
            onClick={() => onReaction && onReaction(post.id, 'heart', post.source)}
            style={{
              flex: 1,
              padding: '8px',
              background: post.reactedBy?.[currentUser?.uid] === 'heart' ? '#F0F2F5' : 'transparent',
              color: post.reactedBy?.[currentUser?.uid] === 'heart' ? '#F02849' : STYLES.colors.textSecondary,
              border: 'none',
              borderRadius: STYLES.borderRadius.small,
              fontSize: '15px',
              fontWeight: post.reactedBy?.[currentUser?.uid] === 'heart' ? '600' : '400',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              minHeight: '36px'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F0F2F5'; }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = post.reactedBy?.[currentUser?.uid] === 'heart' ? '#F0F2F5' : 'transparent';
            }}
          >
            <span>❤️</span>
            <span>Heart</span>
            {(post.reactions?.heart?.length || 0) > 0 && (
              <span style={{ fontSize: '13px', opacity: 0.8 }}>
                ({post.reactions.heart.length})
              </span>
            )}
          </button>

          {/* Support Button */}
          <button
            onClick={() => onReaction && onReaction(post.id, 'support', post.source)}
            style={{
              flex: 1,
              padding: '8px',
              background: post.reactedBy?.[currentUser?.uid] === 'support' ? '#F0F2F5' : 'transparent',
              color: post.reactedBy?.[currentUser?.uid] === 'support' ? STYLES.colors.accent : STYLES.colors.textSecondary,
              border: 'none',
              borderRadius: STYLES.borderRadius.small,
              fontSize: '15px',
              fontWeight: post.reactedBy?.[currentUser?.uid] === 'support' ? '600' : '400',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              minHeight: '36px'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F0F2F5'; }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = post.reactedBy?.[currentUser?.uid] === 'support' ? '#F0F2F5' : 'transparent';
            }}
          >
            <span>🤝</span>
            <span>Support</span>
            {(post.reactions?.support?.length || 0) > 0 && (
              <span style={{ fontSize: '13px', opacity: 0.8 }}>
                ({post.reactions.support.length})
              </span>
            )}
          </button>

          {/* Celebrate Button */}
          <button
            onClick={() => onReaction && onReaction(post.id, 'celebrate', post.source)}
            style={{
              flex: 1,
              padding: '8px',
              background: post.reactedBy?.[currentUser?.uid] === 'celebrate' ? '#F0F2F5' : 'transparent',
              color: post.reactedBy?.[currentUser?.uid] === 'celebrate' ? '#FFA500' : STYLES.colors.textSecondary,
              border: 'none',
              borderRadius: STYLES.borderRadius.small,
              fontSize: '15px',
              fontWeight: post.reactedBy?.[currentUser?.uid] === 'celebrate' ? '600' : '400',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              minHeight: '36px'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F0F2F5'; }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = post.reactedBy?.[currentUser?.uid] === 'celebrate' ? '#F0F2F5' : 'transparent';
            }}
          >
            <span>🎉</span>
            <span>Celebrate</span>
            {(post.reactions?.celebrate?.length || 0) > 0 && (
              <span style={{ fontSize: '13px', opacity: 0.8 }}>
                ({post.reactions.celebrate.length})
              </span>
            )}
          </button>
        </div>

        {/* Comment Count - Clickable */}
        <div
          onClick={() => onToggleComments && onToggleComments(post.id)}
          style={{
            fontSize: '13px',
            color: STYLES.colors.accent,
            paddingTop: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          💬 {post.commentCount || 0} comments
          {commentsExpanded ? ' ▲' : ' ▼'}
        </div>
      </div>

      {/* Comments Section (Expandable) */}
      {commentsExpanded && (
        <div style={{
          paddingTop: STYLES.spacing.sm,
          borderTop: `1px solid ${STYLES.colors.border}`,
          marginTop: '8px'
        }}>
          {/* Comments List */}
          {commentsLoading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: STYLES.colors.textSecondary, fontSize: '13px' }}>
              Loading comments...
            </div>
          ) : (comments || []).length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: STYLES.colors.textSecondary, fontSize: '13px' }}>
              No comments yet. Be the first to comment!
            </div>
          ) : (
            (comments || []).map(comment => {
              const replies = commentRepliesMap?.[comment.id] || [];
              const replyCount = replies.length;

              return (
                <div key={comment.id}>
                  {/* Top-Level Comment */}
                  <div style={{
                    background: '#F0F2F5',
                    borderRadius: '16px',
                    padding: '8px 12px',
                    marginBottom: '8px'
                  }}>
                    {/* Comment Header */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${STYLES.colors.accent}, ${STYLES.colors.accentDark})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginRight: '8px'
                      }}>
                        {(comment.userDisplayName?.[0] || '?').toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: STYLES.colors.textPrimary
                        }}>
                          {comment.userDisplayName}
                        </span>
                        <span style={{ fontSize: '11px', color: STYLES.colors.textSecondary, marginLeft: '8px' }}>
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                      {onDeleteComment && (comment.userId === currentUser?.uid || userData?.role === 'coach' || userData?.role === 'admin') && (
                        <button
                          onClick={() => onDeleteComment(post.id, comment.id, comment.userId, post.source)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: STYLES.colors.textSecondary,
                            fontSize: '16px',
                            cursor: 'pointer',
                            padding: '0 4px'
                          }}
                          title="Delete comment"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* Comment Content */}
                    <div style={{
                      fontSize: '14px',
                      lineHeight: '18px',
                      color: STYLES.colors.textPrimary,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      paddingLeft: '32px',
                      marginBottom: '4px'
                    }}>
                      {comment.content}
                    </div>

                    {/* Reply Button */}
                    <div style={{ paddingLeft: '32px' }}>
                      <button
                        onClick={() => onStartReply && onStartReply(comment.id, comment.userDisplayName)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: STYLES.colors.textSecondary,
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          padding: '4px 0'
                        }}
                      >
                        Reply
                      </button>
                    </div>
                  </div>

                  {/* Inline Reply Input */}
                  {replyingToId === comment.id && (
                    <div style={{
                      marginLeft: '32px',
                      marginBottom: '8px',
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center'
                    }}>
                      <input
                        type="text"
                        value={replyInputText}
                        onChange={(e) => onReplyTextChange && onReplyTextChange(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && onAddReply) {
                            e.preventDefault();
                            onAddReply(post.id, comment.id, comment, post.source);
                          }
                        }}
                        placeholder={`Reply to ${comment.userDisplayName}...`}
                        autoFocus
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '16px',
                          border: `1px solid ${STYLES.colors.border}`,
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                      <button
                        onClick={() => onAddReply && onAddReply(post.id, comment.id, comment, post.source)}
                        disabled={!replyInputText?.trim() || submittingReply}
                        style={{
                          padding: '8px 16px',
                          background: replyInputText?.trim() && !submittingReply ? STYLES.colors.accent : STYLES.colors.border,
                          color: '#fff',
                          border: 'none',
                          borderRadius: '16px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: replyInputText?.trim() && !submittingReply ? 'pointer' : 'not-allowed'
                        }}
                      >
                        Post
                      </button>
                      <button
                        onClick={onCancelReply}
                        style={{
                          padding: '8px 16px',
                          background: 'transparent',
                          color: STYLES.colors.textSecondary,
                          border: 'none',
                          borderRadius: '16px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* View Replies Toggle */}
                  {replyCount > 0 && (
                    <div style={{ marginLeft: '32px', marginBottom: '8px' }}>
                      <button
                        onClick={() => onToggleReplies && onToggleReplies(post.id, comment.id, post.source)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: STYLES.colors.accent,
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          padding: '4px 0'
                        }}
                      >
                        {repliesExpanded?.[comment.id] ? '▲' : '▼'} {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                      </button>
                    </div>
                  )}

                  {/* Nested Replies */}
                  {repliesExpanded?.[comment.id] && (
                    <div>
                      {repliesLoading?.[comment.id] ? (
                        <div style={{ marginLeft: '32px', padding: '8px', color: STYLES.colors.textSecondary, fontSize: '13px' }}>
                          Loading replies...
                        </div>
                      ) : (
                        replies.map(reply => (
                          <div key={reply.id} style={{
                            marginLeft: '32px',
                            marginBottom: '8px',
                            paddingLeft: '12px',
                            borderLeft: `2px solid ${STYLES.colors.border}`
                          }}>
                            <div style={{
                              background: '#F0F2F5',
                              borderRadius: '16px',
                              padding: '8px 12px'
                            }}>
                              {/* Reply Header */}
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                <div style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  background: `linear-gradient(135deg, ${STYLES.colors.accent}, ${STYLES.colors.accentDark})`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#fff',
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                  marginRight: '6px'
                                }}>
                                  {(reply.userDisplayName?.[0] || '?').toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <span style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: STYLES.colors.textPrimary
                                  }}>
                                    {reply.userDisplayName}
                                  </span>
                                  <span style={{ fontSize: '11px', color: STYLES.colors.textSecondary, marginLeft: '6px' }}>
                                    {formatRelativeTime(reply.createdAt)}
                                  </span>
                                </div>
                                {onDeleteComment && (reply.userId === currentUser?.uid || userData?.role === 'coach' || userData?.role === 'admin') && (
                                  <button
                                    onClick={() => onDeleteComment(post.id, reply.id, reply.userId, post.source)}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: STYLES.colors.textSecondary,
                                      fontSize: '14px',
                                      cursor: 'pointer',
                                      padding: '0 4px'
                                    }}
                                    title="Delete reply"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>

                              {/* Reply Content */}
                              <div style={{
                                fontSize: '13px',
                                lineHeight: '17px',
                                color: STYLES.colors.textPrimary,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                paddingLeft: '26px'
                              }}>
                                {reply.content}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Comment Input */}
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start',
            marginTop: STYLES.spacing.sm
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${STYLES.colors.accent}, ${STYLES.colors.accentDark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              {(userData?.firstName?.[0] || currentUser?.displayName?.[0] || '?').toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                value={commentInputText || ''}
                onChange={(e) => onCommentTextChange && onCommentTextChange(post.id, e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && onAddComment) {
                    e.preventDefault();
                    onAddComment(post.id, post.source);
                  }
                }}
                disabled={submittingComment}
                placeholder="Write a comment..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${STYLES.colors.border}`,
                  borderRadius: '20px',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              {(commentInputText?.length || 0) > 250 && (
                <div style={{
                  fontSize: '11px',
                  color: (commentInputText?.length || 0) > 280 ? '#F02849' : STYLES.colors.textSecondary,
                  textAlign: 'right',
                  marginTop: '4px',
                  marginRight: '4px'
                }}>
                  {commentInputText?.length || 0}/280
                </div>
              )}
              {(commentInputText?.trim()?.length || 0) > 0 && (
                <button
                  onClick={() => onAddComment && onAddComment(post.id, post.source)}
                  disabled={submittingComment || (commentInputText?.length || 0) > 280}
                  style={{
                    marginTop: '4px',
                    padding: '6px 16px',
                    background: (submittingComment || (commentInputText?.length || 0) > 280)
                      ? STYLES.colors.border
                      : STYLES.colors.accent,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: (submittingComment || (commentInputText?.length || 0) > 280)
                      ? 'not-allowed'
                      : 'pointer',
                    float: 'right'
                  }}
                >
                  {submittingComment ? 'Posting...' : 'Post'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

/**
 * EditProfileModal Component
 * Professional modal for editing all profile/about fields with privacy controls
 *
 * @param {object} props
 * @param {object} props.profileData - Current profile data
 * @param {function} props.onClose - Close modal callback
 * @param {function} props.onSave - Save callback
 */
const EditProfileModal = ({ profileData, onClose, onSave, STYLES }) => {
  // Parse recovery goals from newline-separated string to array
  const parseRecoveryGoals = () => {
    if (!profileData?.recoveryGoals) return ['', '', ''];

    // If it's a string, split by newlines
    if (typeof profileData.recoveryGoals === 'string') {
      const goals = profileData.recoveryGoals.split('\n').filter(g => g.trim());
      return [
        goals[0] || '',
        goals[1] || '',
        goals[2] || ''
      ];
    }

    // If it's already an array (shouldn't happen but defensive)
    return [
      profileData.recoveryGoals[0] || '',
      profileData.recoveryGoals[1] || '',
      profileData.recoveryGoals[2] || ''
    ];
  };

  const goalsArray = parseRecoveryGoals();

  const [formData, setFormData] = React.useState({
    // Personal Information
    pronouns: profileData?.pronouns || '',
    city: profileData?.city || '',
    phone: profileData?.phone || '',
    dateOfBirth: profileData?.dateOfBirth || '',

    // Recovery Journey
    programStartDate: profileData?.programStartDate || '',
    previousPrograms: profileData?.previousPrograms || '',
    supportGroupType: profileData?.supportGroupType || '',
    meetingPreference: profileData?.meetingPreference || '',
    hasSponsor: profileData?.hasSponsor || false,

    // Personal Touches
    favoriteQuote: profileData?.favoriteQuote || '',
    interests: profileData?.interests || '',
    copingTechniques: profileData?.copingTechniques || '',
    proudestMilestone: profileData?.proudestMilestone || '',

    // Existing Fields
    bio: profileData?.bio || '',
    recoveryGoal1: goalsArray[0],
    recoveryGoal2: goalsArray[1],
    recoveryGoal3: goalsArray[2],
    substance: profileData?.substance || '',
    timezone: profileData?.timezone || 'America/Los_Angeles'
  });

  const [privacySettings, setPrivacySettings] = React.useState(
    profileData?.profileVisibility || {
      pronouns: 'public',
      city: 'public',
      phone: 'private',
      dateOfBirth: 'private',
      programStartDate: 'public',
      previousPrograms: 'public',
      supportGroupType: 'public',
      meetingPreference: 'public',
      hasSponsor: 'public',
      favoriteQuote: 'public',
      interests: 'public',
      copingTechniques: 'public',
      proudestMilestone: 'public',
      bio: 'public',
      recoveryGoals: 'public',
      substance: 'public',
      timezone: 'public'
    }
  );

  const [isSaving, setIsSaving] = React.useState(false);
  const [charCount, setCharCount] = React.useState({
    bio: (profileData?.bio || '').length,
    favoriteQuote: (profileData?.favoriteQuote || '').length
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Update character count for limited fields
    if (field === 'bio' || field === 'favoriteQuote') {
      setCharCount(prev => ({ ...prev, [field]: value.length }));
    }
  };

  const handlePrivacyChange = (field, value) => {
    setPrivacySettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Compile recovery goals array
      const recoveryGoals = [
        formData.recoveryGoal1,
        formData.recoveryGoal2,
        formData.recoveryGoal3
      ].filter(goal => goal.trim() !== '');

      const updates = {
        pronouns: formData.pronouns,
        city: formData.city,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        programStartDate: formData.programStartDate,
        previousPrograms: formData.previousPrograms,
        supportGroupType: formData.supportGroupType,
        meetingPreference: formData.meetingPreference,
        hasSponsor: formData.hasSponsor,
        favoriteQuote: formData.favoriteQuote,
        interests: formData.interests,
        copingTechniques: formData.copingTechniques,
        proudestMilestone: formData.proudestMilestone,
        bio: formData.bio,
        recoveryGoals: recoveryGoals.length > 0 ? recoveryGoals.join('\n') : '',
        substance: formData.substance,
        timezone: formData.timezone,
        profileVisibility: privacySettings,
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
      };

      await onSave(updates);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '650px',
        width: '100%',
        maxHeight: '85vh',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '2px solid #e5e7eb',
          background: 'linear-gradient(135deg, #058585 0%, #047272 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i data-lucide="edit-3" style={{ width: '20px', height: '20px', color: '#ffffff' }} />
            </div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#ffffff' }}>
              Edit Profile
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <i data-lucide="x" style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* Personal Information Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i data-lucide="user" style={{ width: '18px', height: '18px', color: '#058585' }} />
              Personal Information
            </h3>

            {/* Pronouns */}
            <FormField
              label="Pronouns"
              value={formData.pronouns}
              onChange={(e) => handleChange('pronouns', e.target.value)}
              privacy={privacySettings.pronouns}
              onPrivacyChange={(val) => handlePrivacyChange('pronouns', val)}
              placeholder="e.g., they/them, she/her, he/him"
            />

            {/* City/Location */}
            <FormField
              label="City / Location"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              privacy={privacySettings.city}
              onPrivacyChange={(val) => handlePrivacyChange('city', val)}
              placeholder="e.g., San Francisco, CA"
            />

            {/* Phone */}
            <FormField
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              privacy={privacySettings.phone}
              onPrivacyChange={(val) => handlePrivacyChange('phone', val)}
              placeholder="(555) 123-4567"
            />

            {/* Date of Birth */}
            <FormField
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              privacy={privacySettings.dateOfBirth}
              onPrivacyChange={(val) => handlePrivacyChange('dateOfBirth', val)}
            />
          </div>

          {/* Recovery Journey Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i data-lucide="heart-pulse" style={{ width: '18px', height: '18px', color: '#058585' }} />
              Recovery Journey
            </h3>

            {/* Program Start Date */}
            <FormField
              label="Program Start Date"
              type="date"
              value={formData.programStartDate}
              onChange={(e) => handleChange('programStartDate', e.target.value)}
              privacy={privacySettings.programStartDate}
              onPrivacyChange={(val) => handlePrivacyChange('programStartDate', val)}
            />

            {/* Previous Programs */}
            <FormField
              label="Previous Programs"
              type="textarea"
              value={formData.previousPrograms}
              onChange={(e) => handleChange('previousPrograms', e.target.value)}
              privacy={privacySettings.previousPrograms}
              onPrivacyChange={(val) => handlePrivacyChange('previousPrograms', val)}
              placeholder="List any previous recovery programs..."
            />

            {/* Support Group Type */}
            <FormField
              label="Support Group Type"
              type="select"
              value={formData.supportGroupType}
              onChange={(e) => handleChange('supportGroupType', e.target.value)}
              privacy={privacySettings.supportGroupType}
              onPrivacyChange={(val) => handlePrivacyChange('supportGroupType', val)}
              options={[
                { value: '', label: 'Select support group...' },
                { value: 'AA', label: 'AA (Alcoholics Anonymous)' },
                { value: 'NA', label: 'NA (Narcotics Anonymous)' },
                { value: 'SMART Recovery', label: 'SMART Recovery' },
                { value: 'Other', label: 'Other' }
              ]}
            />

            {/* Meeting Preference */}
            <FormField
              label="Meeting Preference"
              type="select"
              value={formData.meetingPreference}
              onChange={(e) => handleChange('meetingPreference', e.target.value)}
              privacy={privacySettings.meetingPreference}
              onPrivacyChange={(val) => handlePrivacyChange('meetingPreference', val)}
              options={[
                { value: '', label: 'Select preference...' },
                { value: 'In-Person', label: 'In-Person' },
                { value: 'Virtual', label: 'Virtual' },
                { value: 'Hybrid', label: 'Hybrid (Both)' }
              ]}
            />

            {/* Has Sponsor Toggle */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '8px',
                cursor: 'pointer'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  I have a sponsor
                </span>
                <input
                  type="checkbox"
                  checked={formData.hasSponsor}
                  onChange={(e) => handleChange('hasSponsor', e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#058585' }}
                />
              </label>
            </div>
          </div>

          {/* Personal Touches Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i data-lucide="sparkles" style={{ width: '18px', height: '18px', color: '#058585' }} />
              Personal Touches
            </h3>

            {/* Favorite Quote */}
            <FormField
              label={`Favorite Quote (${charCount.favoriteQuote}/150)`}
              type="textarea"
              value={formData.favoriteQuote}
              onChange={(e) => {
                if (e.target.value.length <= 150) {
                  handleChange('favoriteQuote', e.target.value);
                }
              }}
              privacy={privacySettings.favoriteQuote}
              onPrivacyChange={(val) => handlePrivacyChange('favoriteQuote', val)}
              placeholder="Share an inspiring quote..."
              rows={2}
            />

            {/* Interests & Hobbies */}
            <FormField
              label="Interests & Hobbies"
              type="textarea"
              value={formData.interests}
              onChange={(e) => handleChange('interests', e.target.value)}
              privacy={privacySettings.interests}
              onPrivacyChange={(val) => handlePrivacyChange('interests', val)}
              placeholder="Reading, hiking, cooking..."
              rows={2}
            />

            {/* Favorite Coping Techniques */}
            <FormField
              label="Favorite Coping Techniques"
              type="textarea"
              value={formData.copingTechniques}
              onChange={(e) => handleChange('copingTechniques', e.target.value)}
              privacy={privacySettings.copingTechniques}
              onPrivacyChange={(val) => handlePrivacyChange('copingTechniques', val)}
              placeholder="Deep breathing, journaling, exercise..."
              rows={2}
            />

            {/* Proudest Milestone */}
            <FormField
              label="Proudest Milestone"
              type="textarea"
              value={formData.proudestMilestone}
              onChange={(e) => handleChange('proudestMilestone', e.target.value)}
              privacy={privacySettings.proudestMilestone}
              onPrivacyChange={(val) => handlePrivacyChange('proudestMilestone', val)}
              placeholder="Share your proudest achievement in recovery..."
              rows={2}
            />
          </div>

          {/* Bio & Recovery Goals Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i data-lucide="message-square-text" style={{ width: '18px', height: '18px', color: '#058585' }} />
              About You
            </h3>

            {/* Bio */}
            <FormField
              label={`Bio (${charCount.bio}/200)`}
              type="textarea"
              value={formData.bio}
              onChange={(e) => {
                if (e.target.value.length <= 200) {
                  handleChange('bio', e.target.value);
                }
              }}
              privacy={privacySettings.bio}
              onPrivacyChange={(val) => handlePrivacyChange('bio', val)}
              placeholder="Tell others about yourself..."
              rows={3}
            />

            {/* Recovery Goals */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Recovery Goals (Up to 3)
              </label>
              <FormField
                label="1."
                value={formData.recoveryGoal1}
                onChange={(e) => handleChange('recoveryGoal1', e.target.value)}
                placeholder="First recovery goal..."
                hidePrivacy
              />
              <FormField
                label="2."
                value={formData.recoveryGoal2}
                onChange={(e) => handleChange('recoveryGoal2', e.target.value)}
                placeholder="Second recovery goal..."
                hidePrivacy
              />
              <FormField
                label="3."
                value={formData.recoveryGoal3}
                onChange={(e) => handleChange('recoveryGoal3', e.target.value)}
                placeholder="Third recovery goal..."
                hidePrivacy
              />
              <PrivacySelector
                value={privacySettings.recoveryGoals}
                onChange={(val) => handlePrivacyChange('recoveryGoals', val)}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '20px 24px',
          borderTop: '2px solid #e5e7eb',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            disabled={isSaving}
            style={{
              padding: '10px 20px',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: isSaving ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!isSaving) e.currentTarget.style.background = '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              if (!isSaving) e.currentTarget.style.background = '#f3f4f6';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '10px 24px',
              background: isSaving ? '#9ca3af' : 'linear-gradient(135deg, #058585 0%, #047272 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: isSaving ? 'none' : '0 2px 4px rgba(5, 133, 133, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(5, 133, 133, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaving) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(5, 133, 133, 0.2)';
              }
            }}
          >
            {isSaving ? (
              <>
                <i data-lucide="loader-2" style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                Saving...
              </>
            ) : (
              <>
                <i data-lucide="check" style={{ width: '16px', height: '16px' }} />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Spin Animation */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

/**
 * FormField Component - Reusable input field with privacy selector
 */
const FormField = ({ label, type = 'text', value, onChange, privacy, onPrivacyChange, placeholder, options, rows, hidePrivacy }) => {
  const fieldId = `field-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div style={{ marginBottom: '16px' }}>
      <label htmlFor={fieldId} style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '6px'
      }}>
        {label}
      </label>

      {type === 'textarea' ? (
        <textarea
          id={fieldId}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows || 3}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#058585'}
          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
        />
      ) : type === 'select' ? (
        <select
          id={fieldId}
          value={value}
          onChange={onChange}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#058585'}
          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
        >
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          id={fieldId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#058585'}
          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
        />
      )}

      {!hidePrivacy && (
        <PrivacySelector value={privacy} onChange={onPrivacyChange} />
      )}
    </div>
  );
};

/**
 * PrivacySelector Component - Dropdown for field privacy settings
 */
const PrivacySelector = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        marginTop: '6px',
        padding: '4px 8px',
        fontSize: '12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        color: '#6b7280',
        outline: 'none'
      }}
    >
      <option value="public">🌍 Public</option>
      <option value="private">🔒 Private</option>
    </select>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

/**
 * UserProfileView Component
 * Full-page view for viewing other users' public profiles
 *
 * @param {object} props
 * @param {string} props.userId - ID of user to view
 * @param {object} props.currentUser - Currently logged-in user object
 * @param {object} props.userData - Current user's data (for role checks)
 * @param {function} props.onBack - Callback to return to feed
 */
const UserProfileView = ({ userId, currentUser, userData, onBack, headerVariant }) => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================

  // Profile data
  const [profileData, setProfileData] = useState(null);

  // Posts data (organized by tab)
  const [posts, setPosts] = useState([]); // All posts
  const [photoPosts, setPhotoPosts] = useState([]); // Photos only
  const [reflectionPosts, setReflectionPosts] = useState([]); // Reflections only
  const [winPosts, setWinPosts] = useState([]); // Wins only

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDropdownMenu, setShowDropdownMenu] = useState(false);

  // Mobile responsiveness state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Infinite scroll state
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);

  // Stats
  const [completedGoalsCount, setCompletedGoalsCount] = useState(0);

  // Image viewer
  const [viewingImage, setViewingImage] = useState(null);

  // Comments and Reactions state
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [postComments, setPostComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({});
  const [commentReplies, setCommentReplies] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});

  // Post menu state (three-dot menu)
  const [openPostMenu, setOpenPostMenu] = useState(null); // postId or null

  // Refs
  const contentRef = useRef(null);

  // ========================================
  // INITIALIZE RESPONSIVE STYLES
  // ========================================

  const STYLES = getStyles(isMobile);

  // Mobile responsiveness resize listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ========================================
  // COMPUTED VALUES
  // ========================================

  const isOwnProfile = userId === currentUser?.uid;
  const isCoach = userData?.role === 'coach' || userData?.role === 'admin';

  // ========================================
  // DATA LOADING FUNCTIONS
  // ========================================

  /**
   * Check if current user can view a specific field
   * @param {string} fieldName - Field name to check
   * @returns {boolean} - Whether field is viewable
   */
  const canViewField = (fieldName) => {
    // Own profile - can view everything
    if (isOwnProfile) return true;

    // Coach/admin - can view everything (override privacy)
    if (isCoach) return true;

    // Check profileVisibility settings
    if (!profileData?.profileVisibility) {
      // No visibility settings - default to private
      return false;
    }

    // Return visibility setting for this field
    return profileData.profileVisibility[fieldName] === true;
  };

  /**
   * Load user profile data from Firestore
   * Checks cache first, falls back to Firestore
   */
  const loadProfileData = async () => {
    try {
      // Check cache first
      const cached = getCachedProfile(userId);
      if (cached) {
        console.log('✅ Profile loaded from cache:', userId);
        setProfileData(cached);
        return cached;
      }

      // Load from Firestore
      const db = window.GLRSApp?.db || window.db;
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        throw new Error('User profile not found');
      }

      const userData = userDoc.data();
      console.log('✅ Profile loaded from Firestore:', userId);

      // Cache the profile
      cacheProfile(userId, userData);

      setProfileData(userData);
      return userData;

    } catch (error) {
      console.error('❌ Error loading profile:', error);
      setError(error.message || 'Failed to load profile');
      throw error;
    }
  };

  /**
   * Load completed goals count for user
   */
  const loadGoalsCount = async () => {
    try {
      const db = window.GLRSApp?.db || window.db;
      if (!db) return;

      const goalsSnapshot = await db.collection('goals')
        .where('userId', '==', userId)
        .where('status', '==', 'completed')
        .get();

      const count = goalsSnapshot.size;
      setCompletedGoalsCount(count);
      console.log(`✅ Loaded ${count} completed goals for userId:`, userId);

    } catch (error) {
      console.error('❌ Error loading goals count:', error);
      // Don't throw - non-critical
    }
  };

  /**
   * Load all posts for user from BOTH dailyPosts AND messages collections
   * @param {number} limit - Number of posts to load (default: 50)
   * @param {object} startAfter - Last visible document for pagination
   */
  const loadPosts = async (limit = 50, startAfter = null) => {
    try {
      const db = window.GLRSApp?.db || window.db;
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      // Load from BOTH collections in parallel
      const [dailyPostsSnapshot, messagesSnapshot] = await Promise.all([
        // 1. Load dailyPosts (reflections, wins)
        db.collection('dailyPosts')
          .where('userId', '==', userId)
          .where('hidden', '==', false)
          .orderBy('createdAt', 'desc')
          .limit(limit)
          .get(),

        // 2. Load messages (community chat posts)
        db.collection('messages')
          .where('senderId', '==', userId)
          .where('type', '==', 'community')
          .orderBy('createdAt', 'desc')
          .limit(limit)
          .get()
      ]);

      // Extract posts from dailyPosts
      const dailyPostsList = [];
      dailyPostsSnapshot.forEach(doc => {
        dailyPostsList.push({
          id: doc.id,
          source: 'dailyPosts',
          ...doc.data()
        });
      });

      // Extract posts from messages
      const messagesList = [];
      messagesSnapshot.forEach(doc => {
        const data = doc.data();
        messagesList.push({
          id: doc.id,
          source: 'messages',
          userId: data.senderId,
          displayName: data.senderName,
          content: data.content,
          imageUrl: data.imageUrl,
          type: 'community',
          createdAt: data.createdAt,
          reactions: data.reactions || {},
          commentCount: data.commentCount || 0
        });
      });

      // Combine and sort by createdAt
      const allPosts = [...dailyPostsList, ...messagesList].sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime; // Newest first
      });

      console.log(`✅ Loaded ${dailyPostsList.length} daily posts + ${messagesList.length} community posts = ${allPosts.length} total for userId:`, userId);

      // Update state
      if (startAfter) {
        // Append to existing posts (pagination)
        setPosts(prev => [...prev, ...allPosts]);
      } else {
        // Replace posts (initial load)
        setPosts(allPosts);
      }

      // Update pagination state
      setHasMore(allPosts.length === limit);

      // Filter posts by category
      filterPosts(startAfter ? [...posts, ...allPosts] : allPosts);

      return allPosts;

    } catch (error) {
      console.error('❌ Error loading posts:', error);
      setError(error.message || 'Failed to load posts');
      throw error;
    }
  };

  /**
   * Filter posts into categories (photos, reflections, wins)
   * @param {array} allPosts - Array of all posts to filter
   */
  const filterPosts = (allPosts) => {
    // Photos: posts with imageUrl field
    const photos = allPosts.filter(post => post.imageUrl);
    setPhotoPosts(photos);

    // Reflections: posts with type 'reflection' (matches CommunityTab)
    const reflections = allPosts.filter(post => post.type === 'reflection');
    setReflectionPosts(reflections);

    // Wins: posts with type 'win' (matches CommunityTab)
    const wins = allPosts.filter(post => post.type === 'win');
    setWinPosts(wins);

    console.log(`📊 Filtered posts: ${photos.length} photos, ${reflections.length} reflections, ${wins.length} wins`);
  };

  /**
   * Load more posts (infinite scroll)
   */
  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      await loadPosts(20, lastVisible);
    } catch (error) {
      console.error('❌ Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // ========================================
  // REACTIONS & COMMENTS HANDLERS
  // ========================================

  /**
   * Handle reaction to post (heart, support, celebrate)
   */
  const handleReaction = async (postId, reactionType, postSource) => {
    const auth = window.GLRSApp?.auth || window.auth;
    const db = window.GLRSApp?.db || window.db;
    const user = auth.currentUser;

    if (!user) {
      alert('Please sign in to react to posts.');
      return;
    }

    try {
      const collection = postSource === 'messages' ? 'messages' : 'dailyPosts';
      const postRef = db.collection(collection).doc(postId);

      await db.runTransaction(async (transaction) => {
        const postDoc = await transaction.get(postRef);

        if (!postDoc.exists) {
          throw new Error('Post not found');
        }

        const postData = postDoc.data();
        const currentReaction = postData.reactedBy?.[user.uid];

        // Initialize reactions object if it doesn't exist
        const reactions = postData.reactions || { heart: [], support: [], celebrate: [] };
        const reactedBy = postData.reactedBy || {};

        if (currentReaction === reactionType) {
          // Remove reaction (toggle off)
          reactions[reactionType] = reactions[reactionType].filter(uid => uid !== user.uid);
          delete reactedBy[user.uid];
        } else {
          // Remove from previous reaction if exists
          if (currentReaction) {
            reactions[currentReaction] = reactions[currentReaction].filter(uid => uid !== user.uid);
          }
          // Add new reaction
          if (!reactions[reactionType].includes(user.uid)) {
            reactions[reactionType].push(user.uid);
          }
          reactedBy[user.uid] = reactionType;
        }

        transaction.update(postRef, { reactions, reactedBy });
      });

      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(p => {
          if (p.id === postId) {
            const currentReaction = p.reactedBy?.[user.uid];
            const reactions = p.reactions || { heart: [], support: [], celebrate: [] };
            const reactedBy = p.reactedBy || {};

            if (currentReaction === reactionType) {
              reactions[reactionType] = reactions[reactionType].filter(uid => uid !== user.uid);
              delete reactedBy[user.uid];
            } else {
              if (currentReaction) {
                reactions[currentReaction] = reactions[currentReaction].filter(uid => uid !== user.uid);
              }
              if (!reactions[reactionType].includes(user.uid)) {
                reactions[reactionType].push(user.uid);
              }
              reactedBy[user.uid] = reactionType;
            }

            return { ...p, reactions, reactedBy };
          }
          return p;
        })
      );

    } catch (error) {
      console.error('Error handling reaction:', error);
      alert('Failed to add reaction. Please try again.');
    }
  };

  /**
   * Toggle comments section visibility
   */
  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  /**
   * Add comment to post
   */
  const handleAddComment = async (postId, postSource) => {
    const content = commentText[postId]?.trim();
    const auth = window.GLRSApp?.auth || window.auth;
    const db = window.GLRSApp?.db || window.db;
    const user = auth.currentUser;

    if (!user || !content || submittingComment) return;

    if (content.length > 280) {
      alert('Comment must be 280 characters or less.');
      return;
    }

    setSubmittingComment(true);

    try {
      const userDoc = await db.collection('users').doc(user.uid).get();
      const userData = userDoc.data();
      const displayName = userData?.firstName ?
        `${userData.firstName} ${userData.lastName || ''}`.trim() :
        user.displayName || user.email;

      const collection = postSource === 'messages' ? 'messages' : 'dailyPosts';

      await db.collection(collection).doc(postId).collection('comments').add({
        userId: user.uid,
        userDisplayName: displayName,
        userAvatar: null,
        content: content,
        isAnonymous: false,
        createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        parentCommentId: null
      });

      // Increment comment count
      await db.collection(collection).doc(postId).update({
        commentCount: window.firebase.firestore.FieldValue.increment(1)
      });

      // Clear input
      setCommentText(prev => ({ ...prev, [postId]: '' }));

      console.log('✅ Comment added successfully');

    } catch (error) {
      console.error('❌ Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  /**
   * Delete comment
   */
  const handleDeleteComment = async (postId, commentId, commentUserId, postSource) => {
    const auth = window.GLRSApp?.auth || window.auth;
    const db = window.GLRSApp?.db || window.db;
    const user = auth.currentUser;

    if (!user) return;

    // Check permissions
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    const isCoach = userData?.role === 'coach' || userData?.role === 'admin';

    if (user.uid !== commentUserId && !isCoach) {
      alert('You can only delete your own comments.');
      return;
    }

    if (!confirm('Delete this comment?')) return;

    try {
      const collection = postSource === 'messages' ? 'messages' : 'dailyPosts';

      await db.collection(collection).doc(postId).collection('comments').doc(commentId).delete();

      // Decrement comment count
      await db.collection(collection).doc(postId).update({
        commentCount: window.firebase.firestore.FieldValue.increment(-1)
      });

      console.log('✅ Comment deleted successfully');

    } catch (error) {
      console.error('❌ Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  /**
   * Start reply to comment
   */
  const handleStartReply = (commentId, commentUserName) => {
    setReplyingTo(commentId);
    setReplyText('');
  };

  /**
   * Cancel reply
   */
  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  /**
   * Add reply to comment
   */
  const handleAddReply = async (postId, parentCommentId, parentComment, postSource) => {
    const content = replyText.trim();
    const auth = window.GLRSApp?.auth || window.auth;
    const db = window.GLRSApp?.db || window.db;
    const user = auth.currentUser;

    if (!user || !content || submittingComment) return;

    if (content.length > 280) {
      alert('Reply must be 280 characters or less.');
      return;
    }

    setSubmittingComment(true);

    try {
      const userDoc = await db.collection('users').doc(user.uid).get();
      const userData = userDoc.data();
      const displayName = userData?.firstName ?
        `${userData.firstName} ${userData.lastName || ''}`.trim() :
        user.displayName || user.email;

      const collection = postSource === 'messages' ? 'messages' : 'dailyPosts';

      await db.collection(collection).doc(postId).collection('comments').add({
        userId: user.uid,
        userDisplayName: displayName,
        userAvatar: null,
        content: content,
        isAnonymous: false,
        createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        parentCommentId: parentCommentId
      });

      // Clear reply input
      setReplyText('');
      setReplyingTo(null);

      console.log('✅ Reply added successfully');

    } catch (error) {
      console.error('❌ Error adding reply:', error);
      alert('Failed to add reply. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  /**
   * Toggle replies visibility
   */
  const handleToggleReplies = (postId, commentId, postSource) => {
    // Simply toggle the expanded state
    // Replies are already loaded by the main comments listener
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  /**
   * Handle delete post
   */
  const handleDeletePost = async (postId, post) => {
    const auth = window.GLRSApp?.auth || window.auth;
    const db = window.GLRSApp?.db || window.db;

    // Determine if this is a dailyPost or message
    const isMessage = post.senderId || post.type === 'community';
    const collection = isMessage ? 'messages' : 'dailyPosts';
    const postUserId = isMessage ? post.senderId : post.userId;

    // Verify ownership or coach/admin
    if (postUserId !== currentUser?.uid && !isCoach) {
      alert('You can only delete your own posts.');
      return;
    }

    if (!confirm('Delete this post? This cannot be undone.')) return;

    try {
      // Close menu first
      setOpenPostMenu(null);

      // Delete image from storage if exists
      if (post.imageUrl && post.imageName) {
        try {
          const storageRef = window.firebase.storage().ref();
          const storagePath = isMessage
            ? `communityImages/${postUserId}/${post.imageName}`
            : `dailyPosts/${postUserId}/${post.imageName}`;
          const imageRef = storageRef.child(storagePath);
          await imageRef.delete();
          console.log('🗑️ Image deleted from storage');
        } catch (storageError) {
          console.warn('⚠️ Could not delete image from storage:', storageError);
        }
      }

      // Delete all comments (subcollection)
      const commentsSnapshot = await db.collection(collection).doc(postId).collection('comments').get();
      const batch = db.batch();
      commentsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Delete post document
      await db.collection(collection).doc(postId).delete();

      console.log(`✅ Post deleted successfully from ${collection}`);

      // Remove from local state
      setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));

      // Show success notification
      if (window.GLRSApp?.utils?.showNotification) {
        window.GLRSApp.utils.showNotification('Post deleted successfully', 'success');
      }

    } catch (error) {
      console.error('❌ Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  // ========================================
  // COMPONENT LIFECYCLE
  // ========================================

  useEffect(() => {
    console.log('UserProfileView mounted for userId:', userId);

    // Load all data on mount
    const loadAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load profile data first (required for privacy checks)
        await loadProfileData();

        // Load posts and goals in parallel
        await Promise.all([
          loadPosts(),
          loadGoalsCount()
        ]);

        console.log('✅ All data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading profile data:', error);
        // Error state already set in individual functions
      } finally {
        setLoading(false);
      }
    };

    loadAllData();

    // Cleanup on unmount
    return () => {
      console.log('UserProfileView unmounted');
    };
  }, [userId]);

  // Initialize Lucide icons after render
  useEffect(() => {
    if (typeof window.lucide !== 'undefined') {
      window.lucide.createIcons();
    }
  }, [profileData, activeTab, loading]);

  // Infinite scroll detection (window scroll)
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      // Load more when scrolled to 80% of page
      if (scrollPercentage > 0.8 && !loadingMore && hasMore && activeTab !== 'about') {
        loadMorePosts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, activeTab]);

  // Real-time listener for comments (per expanded post)
  useEffect(() => {
    const db = window.GLRSApp?.db || window.db;
    if (!db) return;

    const unsubscribers = [];

    Object.keys(showComments).forEach(postId => {
      if (showComments[postId] && !postComments[postId]) {
        setLoadingComments(prev => ({ ...prev, [postId]: true }));

        const post = posts.find(p => p.id === postId);
        const collection = post?.source === 'messages' ? 'messages' : 'dailyPosts';

        const unsubscribe = db.collection(collection)
          .doc(postId)
          .collection('comments')
          .orderBy('createdAt', 'asc')
          .limit(50)
          .onSnapshot((snapshot) => {
            const allComments = [];
            snapshot.forEach(doc => {
              allComments.push({ id: doc.id, ...doc.data() });
            });

            // Filter top-level comments (no parentCommentId or parentCommentId is null)
            const topLevelComments = allComments.filter(c => !c.parentCommentId);

            // Organize replies by parent comment ID
            const repliesByParent = {};
            allComments.forEach(comment => {
              if (comment.parentCommentId) {
                if (!repliesByParent[comment.parentCommentId]) {
                  repliesByParent[comment.parentCommentId] = [];
                }
                repliesByParent[comment.parentCommentId].push(comment);
              }
            });

            setPostComments(prev => ({ ...prev, [postId]: topLevelComments }));
            setCommentReplies(prev => ({ ...prev, ...repliesByParent }));
            setLoadingComments(prev => ({ ...prev, [postId]: false }));
          }, (error) => {
            console.error('❌ Error loading comments:', error);
            setLoadingComments(prev => ({ ...prev, [postId]: false }));
          });

        unsubscribers.push(unsubscribe);
      }
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [showComments, posts]);

  // Close post menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openPostMenu) {
        const menuButton = event.target.closest('[data-post-menu-button]');
        const menuDropdown = event.target.closest('[data-post-menu-dropdown]');

        if (!menuButton && !menuDropdown) {
          setOpenPostMenu(null);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openPostMenu]);

  // Initialize Lucide icons when modal opens
  useEffect(() => {
    if (showEditModal && window.lucide) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        window.lucide.createIcons();
      }, 50);
    }
  }, [showEditModal]);

  // Initialize Lucide icons when dropdown menu opens
  useEffect(() => {
    if (showDropdownMenu && window.lucide) {
      setTimeout(() => {
        window.lucide.createIcons();
      }, 50);
    }
  }, [showDropdownMenu]);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdownMenu) {
        const menuButton = event.target.closest('[data-lucide="menu"]')?.parentElement;
        const menuDropdown = event.target.closest('[data-dropdown-menu]');

        if (!menuButton && !menuDropdown) {
          setShowDropdownMenu(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdownMenu]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Smooth scroll to top when tab changes
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      setLoading(true);

      // Upload to Firebase Storage
      const storage = window.GLRSApp?.storage || window.storage;
      const db = window.GLRSApp?.db || window.db;

      if (!storage || !db) {
        throw new Error('Firebase not initialized');
      }

      // Create unique filename
      const timestamp = Date.now();
      const fileName = `profile_pictures/${userId}_${timestamp}.jpg`;
      const storageRef = storage.ref(fileName);

      // Upload file
      const uploadTask = await storageRef.put(file);
      const downloadURL = await uploadTask.ref.getDownloadURL();

      // Update user document
      await db.collection('users').doc(userId).update({
        profileImageUrl: downloadURL,
        profilePhoto: downloadURL,
        profilePicture: downloadURL,
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
      });

      // Update local state
      setProfileData(prev => ({
        ...prev,
        profileImageUrl: downloadURL,
        profilePhoto: downloadURL,
        profilePicture: downloadURL
      }));

      // Clear cache
      sessionStorage.removeItem(getCacheKey(userId));

      console.log('✅ Profile picture updated successfully');
    } catch (error) {
      console.error('❌ Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle saving profile updates from EditProfileModal
   * @param {Object} updates - Profile field updates from modal
   */
  const handleSaveProfile = async (updates) => {
    try {
      const db = window.GLRSApp?.db || window.db;

      if (!db) {
        throw new Error('Firebase not initialized');
      }

      // Update user document in Firestore
      await db.collection('users').doc(userId).update(updates);

      console.log('✅ Profile updated successfully');

      // Reload profile data from Firestore
      const updatedDoc = await db.collection('users').doc(userId).get();
      if (updatedDoc.exists) {
        setProfileData(updatedDoc.data());
      }

      // Clear cache to force fresh data on next load
      sessionStorage.removeItem(getCacheKey(userId));

    } catch (error) {
      console.error('❌ Error saving profile:', error);
      throw error; // Re-throw to let modal handle error display
    }
  };

  /**
   * Handle cover photo upload
   */
  const handleCoverPhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB for cover photos)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    try {
      setLoading(true);

      // Upload to Firebase Storage
      const storage = window.GLRSApp?.storage || window.storage;
      const db = window.GLRSApp?.db || window.db;

      if (!storage || !db) {
        throw new Error('Firebase not initialized');
      }

      // Create unique filename
      const timestamp = Date.now();
      const fileName = `cover_photos/${userId}_${timestamp}.jpg`;
      const storageRef = storage.ref(fileName);

      // Upload file
      const uploadTask = await storageRef.put(file);
      const downloadURL = await uploadTask.ref.getDownloadURL();

      // Update user document
      await db.collection('users').doc(userId).update({
        coverPhotoUrl: downloadURL,
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
      });

      // Update local state
      setProfileData(prev => ({
        ...prev,
        coverPhotoUrl: downloadURL
      }));

      // Clear cache
      sessionStorage.removeItem(getCacheKey(userId));

      console.log('✅ Cover photo updated successfully');
    } catch (error) {
      console.error('❌ Error uploading cover photo:', error);
      alert('Failed to upload cover photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RENDER HELPERS
  // ========================================

  const getCounts = () => {
    return {
      all: posts.length,
      photos: photoPosts.length,
      reflections: reflectionPosts.length,
      wins: winPosts.length
    };
  };

  const renderTabContent = () => {
    if (activeTab === 'about') {
      return (
        <AboutSection
          profileData={profileData}
          canView={canViewField}
          isOwnProfile={isOwnProfile}
          isMobile={isMobile}
        />
      );
    }

    // Determine which posts to show
    let postsToShow = [];
    let emptyType = 'posts';

    switch (activeTab) {
      case 'all':
        postsToShow = posts;
        emptyType = 'posts';
        break;
      case 'photos':
        postsToShow = photoPosts;
        emptyType = 'photos';
        break;
      case 'reflections':
        postsToShow = reflectionPosts;
        emptyType = 'reflections';
        break;
      case 'wins':
        postsToShow = winPosts;
        emptyType = 'wins';
        break;
      default:
        postsToShow = posts;
    }

    // Show empty state if no posts
    if (postsToShow.length === 0) {
      return (
        <EmptyState
          type={emptyType}
          userName={profileData?.firstName}
          isMobile={isMobile}
        />
      );
    }

    // Render posts
    return (
      <div style={{ padding: STYLES.spacing.md }}>
        {postsToShow.map(post => (
          <PostCard
            key={post.id}
            post={post}
            profileData={profileData}
            onImageClick={setViewingImage}
            currentUser={currentUser}
            userData={userData}
            onReaction={handleReaction}
            onToggleComments={toggleComments}
            commentsExpanded={showComments[post.id]}
            commentsLoading={loadingComments[post.id]}
            comments={postComments[post.id]}
            commentInputText={commentText[post.id]}
            onCommentTextChange={(postId, text) => setCommentText(prev => ({ ...prev, [postId]: text }))}
            onAddComment={handleAddComment}
            submittingComment={submittingComment}
            onDeleteComment={handleDeleteComment}
            onStartReply={handleStartReply}
            replyingToId={replyingTo}
            replyInputText={replyText}
            onReplyTextChange={setReplyText}
            onAddReply={handleAddReply}
            onCancelReply={handleCancelReply}
            submittingReply={submittingComment}
            onToggleReplies={handleToggleReplies}
            repliesExpanded={expandedReplies}
            repliesLoading={loadingReplies}
            commentRepliesMap={commentReplies}
            onDeletePost={handleDeletePost}
            isOwnProfile={isOwnProfile}
            isCoachOrAdmin={isCoach}
            onTogglePostMenu={setOpenPostMenu}
            postMenuOpen={openPostMenu}
            STYLES={STYLES}
          />
        ))}

        {/* Loading more indicator */}
        {loadingMore && (
          <div style={{
            textAlign: 'center',
            padding: STYLES.spacing.lg,
            color: STYLES.colors.textSecondary
          }}>
            <i data-lucide="loader-2" style={{
              width: '24px',
              height: '24px',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ ...STYLES.typography.caption, marginTop: STYLES.spacing.sm }}>
              Loading more posts...
            </p>
          </div>
        )}

        {/* End of posts indicator */}
        {!hasMore && postsToShow.length > 0 && (
          <div style={{
            textAlign: 'center',
            padding: STYLES.spacing.lg,
            color: STYLES.colors.textTertiary
          }}>
            <p style={{ ...STYLES.typography.caption }}>
              You've reached the end
            </p>
          </div>
        )}
      </div>
    );
  };

  // ========================================
  // RENDER
  // ========================================

  // Show loading state
  if (loading) {
    return (
      <div style={{
        height: '100vh',
        overflow: 'hidden',
        background: STYLES.colors.background
      }}>
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}
        </style>
        <LoadingState isMobile={isMobile} />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: STYLES.colors.background
      }}>
        <div style={{
          textAlign: 'center',
          padding: STYLES.spacing.xl
        }}>
          <i data-lucide="alert-circle" style={{
            width: '64px',
            height: '64px',
            color: STYLES.colors.error,
            marginBottom: STYLES.spacing.md
          }} />
          <h2 style={{
            ...STYLES.typography.sectionHeader,
            color: STYLES.colors.error,
            margin: `0 0 ${STYLES.spacing.sm} 0`
          }}>
            Error Loading Profile
          </h2>
          <p style={{
            ...STYLES.typography.caption,
            marginBottom: STYLES.spacing.lg
          }}>
            {error}
          </p>
          <button
            onClick={onBack}
            style={{
              padding: '10px 20px',
              background: STYLES.colors.accent,
              color: '#ffffff',
              border: 'none',
              borderRadius: STYLES.borderRadius.medium,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div style={{
      minHeight: '100vh',
      background: STYLES.colors.background
    }}>
      {/* Animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

      {/* Profile Header */}
      <ProfileHeader
        profileData={profileData}
        onBack={onBack}
        isOwnProfile={isOwnProfile}
        onProfilePictureChange={handleProfilePictureChange}
        onCoverPhotoChange={handleCoverPhotoChange}
        onEditProfile={() => setShowEditModal(true)}
        onMenuToggle={() => setShowDropdownMenu(!showDropdownMenu)}
        showDropdown={showDropdownMenu}
        onLogout={() => {
          const auth = window.GLRSApp?.auth || window.auth;
          if (auth) {
            auth.signOut().then(() => {
              window.location.reload();
            });
          }
        }}
        STYLES={STYLES}
        isMobile={isMobile}
        variant={headerVariant || 'default'}
      />

      {/* Edit & Back Buttons - TOP of White Content Area */}
      {isOwnProfile && (
        <div style={{
          position: 'relative',
          background: '#FFFFFF',
          padding: isMobile ? '12px 16px' : '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #E5E7EB'
        }}>
          {/* Back Button - Top Left */}
          <button
            onClick={onBack}
            style={{
              background: '#F3F4F6',
              border: 'none',
              borderRadius: '8px',
              padding: isMobile ? '8px 12px' : '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E5E7EB';
              e.currentTarget.style.transform = 'translateX(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F3F4F6';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <i data-lucide="arrow-left" style={{ width: '16px', height: '16px' }} />
            {!isMobile && <span>Back</span>}
          </button>

          {/* Edit Profile Button - Top Right */}
          <button
            onClick={() => setShowEditModal(true)}
            style={{
              background: 'linear-gradient(135deg, #058585 0%, #047272 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: isMobile ? '8px 12px' : '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: '#FFFFFF',
              transition: 'all 0.2s',
              boxShadow: '0 2px 6px rgba(5, 133, 133, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(5, 133, 133, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(5, 133, 133, 0.3)';
            }}
          >
            <i data-lucide="edit-3" style={{ width: '16px', height: '16px' }} />
            {!isMobile && <span>Edit Profile</span>}
          </button>
        </div>
      )}

      {/* Stats Row */}
      <StatsRow
        profileData={profileData}
        postsCount={posts.length}
        goalsCount={completedGoalsCount}
        canView={canViewField}
        STYLES={STYLES}
        isMobile={isMobile}
      />

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={getCounts()}
        STYLES={STYLES}
      />

      {/* Content Area */}
      <div ref={contentRef}>
        {renderTabContent()}
      </div>

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div
          onClick={() => setViewingImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: STYLES.colors.overlay,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: STYLES.spacing.md
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setViewingImage(null)}
            style={{
              position: 'absolute',
              top: STYLES.spacing.md,
              right: STYLES.spacing.md,
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: STYLES.borderRadius.circle,
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: STYLES.shadows.strong,
              transition: `all ${STYLES.transitions.fast}`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <i data-lucide="x" style={{ width: '24px', height: '24px', color: '#000' }} />
          </button>

          {/* Image */}
          <img
            src={viewingImage}
            alt="Full size"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90%',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: STYLES.borderRadius.medium,
              boxShadow: STYLES.shadows.strong
            }}
          />
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          profileData={profileData}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
          STYLES={STYLES}
        />
      )}
    </div>
  );
};

// ============================================================
// COMPONENT REGISTRATION
// ============================================================

// Initialize GLRSApp namespace if it doesn't exist
if (!window.GLRSApp) {
    window.GLRSApp = {};
}
if (!window.GLRSApp.components) {
    window.GLRSApp.components = {};
}

// Register component in GLRSApp.components namespace
window.GLRSApp.components.UserProfileView = UserProfileView;

console.log('✅ UserProfileView component loaded and registered in GLRSApp.components');
