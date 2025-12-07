/**
 * ProfileHeaderBar Component
 * Shared header bar for Profile tab and UserProfileView
 *
 * Features:
 * - Hamburger menu (opens sidebar)
 * - "Profile" or custom title
 * - User dropdown (Edit Profile, Settings, Logout)
 * - Sidebar panel ("Profile sidebar under construction")
 *
 * Used by:
 * - ProfileTab.js (Settings view)
 * - UserProfileView.js (Profile view)
 *
 * Created: November 24, 2025
 */

const { useState, useEffect } = React;

const ProfileHeaderBar = ({ title = 'Profile', onEditProfile, onShowSettings, onLogout, isMobile }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Re-initialize Lucide icons when sidebar/dropdown changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [showSidebar, showUserDropdown]);

  return (
    <>
      {/* Header Bar - Hamburger + Title + User Dropdown */}
      <div className="header" style={{
        position: 'relative',
        zIndex: 1000
      }}>
        <div className="header-title" style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '8px' : '10px'
        }}>
          <button
            onClick={() => setShowSidebar(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: '#14b8a6'
            }}
            title="Open sidebar"
          >
            <i data-lucide="menu" style={{
              width: isMobile ? '22px' : '24px',
              height: isMobile ? '22px' : '24px'
            }}></i>
          </button>
          <span style={{
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '600'
          }}>
            {title}
          </span>
        </div>

        <div className="header-actions" style={{ position: 'relative' }}>
          <button
            className="header-btn"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            style={{
              width: isMobile ? '36px' : '40px',
              height: isMobile ? '36px' : '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              position: 'relative'
            }}
            title="Profile menu"
          >
            <i data-lucide="user" style={{
              width: isMobile ? '18px' : '20px',
              height: isMobile ? '18px' : '20px'
            }}></i>
          </button>

          {/* User Dropdown Menu */}
          {showUserDropdown && (
            <>
              <div
                onClick={() => setShowUserDropdown(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 998
                }}
              />
              <div style={{
                position: 'absolute',
                top: '50px',
                right: 0,
                width: '200px',
                background: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: 999,
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    if (onEditProfile) onEditProfile();
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#374151',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <i data-lucide="edit-3" style={{ width: '16px', height: '16px' }}></i>
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    if (onShowSettings) onShowSettings();
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#374151',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <i data-lucide="settings" style={{ width: '16px', height: '16px' }}></i>
                  Settings
                </button>
                <div style={{
                  height: '1px',
                  background: '#E5E7EB',
                  margin: '4px 0'
                }} />
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    if (onLogout) {
                      onLogout();
                    } else {
                      // Default logout handler if no callback provided
                      if (window.GLRSApp?.authUtils?.handleLogout) {
                        window.GLRSApp.authUtils.handleLogout();
                      }
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#EF4444',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <i data-lucide="log-out" style={{ width: '16px', height: '16px' }}></i>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sidebar Backdrop */}
      {showSidebar && (
        <div
          onClick={() => setShowSidebar(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9998,
            animation: 'fadeIn 0.2s ease-out'
          }}
        />
      )}

      {/* Sidebar Panel */}
      {showSidebar && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: isMobile ? '280px' : '320px',
            backgroundColor: '#fff',
            zIndex: 9999,
            boxShadow: '2px 0 12px rgba(0, 0, 0, 0.15)',
            animation: 'slideInLeft 0.3s ease-out',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{
            padding: isMobile ? '20px 16px' : '24px 20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i data-lucide="menu" style={{width: '24px', height: '24px', color: '#14b8a6'}}></i>
              <h2 style={{
                margin: 0,
                fontSize: isMobile ? '18px' : '20px',
                fontWeight: '700',
                color: '#1f2937'
              }}>
                Menu
              </h2>
            </div>
            <button
              onClick={() => setShowSidebar(false)}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px',
                cursor: 'pointer',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Close sidebar"
            >
              <i data-lucide="x" style={{width: '24px', height: '24px'}}></i>
            </button>
          </div>
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            Profile sidebar under construction
          </div>
        </div>
      )}
    </>
  );
};

// Register component globally
window.GLRSApp = window.GLRSApp || { components: {} };
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.ProfileHeaderBar = ProfileHeaderBar;

console.log('✅ ProfileHeaderBar component loaded and registered');
