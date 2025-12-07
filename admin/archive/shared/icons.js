// ==========================================
// ADMIN ICONS - SHARED ICON COMPONENT LIBRARY
// ==========================================
// Professional Lucide-based icon system for GLRS Admin Portal
// Replaces all emoji usage with consistent, scalable SVG icons
//
// Usage:
//   AdminIcons.Dashboard({ size: 20, color: '#fff' })
//   AdminIcons.renderIcon('dashboard', { size: 24 })
//
// All icons follow Lucide design standards:
// - 24x24 viewBox (scalable)
// - 2px stroke width
// - Round caps and joins
// - currentColor for inheritance
// ==========================================

/**
 * AdminIcons - Complete icon library for admin portal
 *
 * Categories:
 * - Navigation: Icons used in sidebar menu
 * - Status: Success, warning, error indicators
 * - Actions: Buttons and interactive elements
 * - Activity: Activity type indicators
 * - Milestones: Recovery milestone icons
 * - UI: General interface elements
 */
const AdminIcons = {
    // ============================================
    // NAVIGATION ICONS
    // Used in sidebar menu items
    // ============================================

    /**
     * Dashboard - Main overview page
     * Replaces: 📊
     */
    Dashboard: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('rect', { x: '3', y: '3', width: '7', height: '9' }),
            React.createElement('rect', { x: '14', y: '3', width: '7', height: '5' }),
            React.createElement('rect', { x: '14', y: '12', width: '7', height: '9' }),
            React.createElement('rect', { x: '3', y: '16', width: '7', height: '5' })
        )
    ),

    /**
     * Users - User management
     * Replaces: 👥
     */
    Users: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }),
            React.createElement('circle', { cx: '9', cy: '7', r: '4' }),
            React.createElement('path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87' }),
            React.createElement('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
        )
    ),

    /**
     * Target - Goals/My PIRs
     * Replaces: 🎯
     */
    Target: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
            React.createElement('circle', { cx: '12', cy: '12', r: '6' }),
            React.createElement('circle', { cx: '12', cy: '12', r: '2' })
        )
    ),

    /**
     * ClipboardList - Tasks/Check-ins
     * Replaces: ✅ (for check-ins nav)
     */
    ClipboardList: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('rect', { x: '8', y: '2', width: '8', height: '4', rx: '1', ry: '1' }),
            React.createElement('path', { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' }),
            React.createElement('path', { d: 'M12 11h4' }),
            React.createElement('path', { d: 'M12 16h4' }),
            React.createElement('path', { d: 'M8 11h.01' }),
            React.createElement('path', { d: 'M8 16h.01' })
        )
    ),

    /**
     * BookOpen - Guides/Resources
     * Replaces: 📚
     */
    BookOpen: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' }),
            React.createElement('path', { d: 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' })
        )
    ),

    /**
     * MessageSquare - Communication/Community
     * Replaces: 💬
     */
    MessageSquare: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })
        )
    ),

    /**
     * MessageCircle - Chat bubble / Community posts
     * Replaces: speech bubble icon
     */
    MessageCircle: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M7.9 20A9 9 0 1 0 4 16.1L2 22Z' })
        )
    ),

    /**
     * Calendar - Meetings
     * Replaces: 📅
     */
    Calendar: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2', ry: '2' }),
            React.createElement('line', { x1: '16', y1: '2', x2: '16', y2: '6' }),
            React.createElement('line', { x1: '8', y1: '2', x2: '8', y2: '6' }),
            React.createElement('line', { x1: '3', y1: '10', x2: '21', y2: '10' })
        )
    ),

    /**
     * FileTemplate - Templates
     * Replaces: N/A (new feature)
     */
    FileTemplate: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' }),
            React.createElement('polyline', { points: '14 2 14 8 20 8' }),
            React.createElement('line', { x1: '16', y1: '13', x2: '8', y2: '13' }),
            React.createElement('line', { x1: '16', y1: '17', x2: '8', y2: '17' }),
            React.createElement('line', { x1: '10', y1: '9', x2: '8', y2: '9' })
        )
    ),

    /**
     * BarChart3 - Logs & Reports
     * Replaces: 📈
     */
    BarChart3: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M3 3v18h18' }),
            React.createElement('path', { d: 'M18 17V9' }),
            React.createElement('path', { d: 'M13 17V5' }),
            React.createElement('path', { d: 'M8 17v-3' })
        )
    ),

    /**
     * Settings - Settings/Configuration
     * Replaces: ⚙️
     */
    Settings: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' }),
            React.createElement('circle', { cx: '12', cy: '12', r: '3' })
        )
    ),

    /**
     * Shield - Admin header/branding
     * Replaces: 🛡️
     */
    Shield: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' })
        )
    ),

    /**
     * AlertTriangle - Alerts
     * Replaces: 🚨
     */
    AlertTriangle: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' }),
            React.createElement('line', { x1: '12', y1: '9', x2: '12', y2: '13' }),
            React.createElement('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' })
        )
    ),

    // ============================================
    // STATUS ICONS
    // Success, warning, error indicators
    // ============================================

    /**
     * Circle - Empty circle / Not started status
     * Replaces: empty state icon
     */
    Circle: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('circle', { cx: '12', cy: '12', r: '10' })
        )
    ),

    /**
     * CheckCircle - Success status
     * Replaces: ✅ ✓
     */
    CheckCircle: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
            React.createElement('polyline', { points: '22 4 12 14.01 9 11.01' })
        )
    ),

    /**
     * Check - Simple checkmark
     * Replaces: ✓
     */
    Check: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('polyline', { points: '20 6 9 17 4 12' })
        )
    ),

    /**
     * AlertCircle - Warning status
     * Replaces: ⚠️
     */
    AlertCircle: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
            React.createElement('line', { x1: '12', y1: '8', x2: '12', y2: '12' }),
            React.createElement('line', { x1: '12', y1: '16', x2: '12.01', y2: '16' })
        )
    ),

    /**
     * XCircle - Error status
     * Replaces: ❌
     */
    XCircle: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
            React.createElement('line', { x1: '15', y1: '9', x2: '9', y2: '15' }),
            React.createElement('line', { x1: '9', y1: '9', x2: '15', y2: '15' })
        )
    ),

    /**
     * X - Close/dismiss
     * Replaces: ✕ ×
     */
    X: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
            React.createElement('line', { x1: '6', y1: '6', x2: '18', y2: '18' })
        )
    ),

    // ============================================
    // TIME & ACTIVITY ICONS
    // Clocks, timelines, and activity indicators
    // ============================================

    /**
     * Clock - Time indicator
     * Replaces: time-related text
     */
    Clock: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
            React.createElement('polyline', { points: '12 6 12 12 16 14' })
        )
    ),

    /**
     * Activity - Activity feed indicator
     * Replaces: general activity markers
     */
    Activity: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('polyline', { points: '22 12 18 12 15 21 9 3 6 12 2 12' })
        )
    ),

    /**
     * Calendar - Date/schedule indicator
     * Replaces: date-related markers
     */
    Calendar: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2', ry: '2' }),
            React.createElement('line', { x1: '16', y1: '2', x2: '16', y2: '6' }),
            React.createElement('line', { x1: '8', y1: '2', x2: '8', y2: '6' }),
            React.createElement('line', { x1: '3', y1: '10', x2: '21', y2: '10' })
        )
    ),

    // ============================================
    // ACTION ICONS
    // Buttons and interactive elements
    // ============================================

    /**
     * Plus - Add/create
     * Replaces: ➕ +
     */
    Plus: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('line', { x1: '12', y1: '5', x2: '12', y2: '19' }),
            React.createElement('line', { x1: '5', y1: '12', x2: '19', y2: '12' })
        )
    ),

    /**
     * Zap - Quick action/lightning bolt
     * Replaces: Quick actions indicator
     */
    Zap: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('polygon', { points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' })
        )
    ),

    /**
     * UserPlus - Add new user
     * Replaces: Add user action
     */
    UserPlus: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }),
            React.createElement('circle', { cx: '9', cy: '7', r: '4' }),
            React.createElement('line', { x1: '19', y1: '8', x2: '19', y2: '14' }),
            React.createElement('line', { x1: '22', y1: '11', x2: '16', y2: '11' })
        )
    ),

    /**
     * Megaphone - Broadcast/announcement
     * Replaces: Broadcast action
     */
    Megaphone: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'm3 11 18-5v12L3 13v-2z' }),
            React.createElement('path', { d: 'M11.6 16.8a3 3 0 1 1-5.8-1.6' })
        )
    ),

    /**
     * BarChart - Reports/analytics
     * Replaces: Report generation
     */
    BarChart: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('line', { x1: '12', y1: '20', x2: '12', y2: '10' }),
            React.createElement('line', { x1: '18', y1: '20', x2: '18', y2: '4' }),
            React.createElement('line', { x1: '6', y1: '20', x2: '6', y2: '16' })
        )
    ),

    /**
     * Bell - Notifications/alerts
     * Replaces: Alert indicators
     */
    Bell: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' }),
            React.createElement('path', { d: 'M13.73 21a2 2 0 0 1-3.46 0' })
        )
    ),

    /**
     * ExternalLink - Open in new/navigate
     * Replaces: Link indicators
     */
    ExternalLink: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' }),
            React.createElement('polyline', { points: '15 3 21 3 21 9' }),
            React.createElement('line', { x1: '10', y1: '14', x2: '21', y2: '3' })
        )
    ),

    /**
     * RefreshCw - Refresh/reload
     * Replaces: 🔄
     */
    RefreshCw: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('polyline', { points: '23 4 23 10 17 10' }),
            React.createElement('polyline', { points: '1 20 1 14 7 14' }),
            React.createElement('path', { d: 'M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15' })
        )
    ),

    /**
     * LogOut - Logout
     * Replaces: 🚪
     */
    LogOut: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }),
            React.createElement('polyline', { points: '16 17 21 12 16 7' }),
            React.createElement('line', { x1: '21', y1: '12', x2: '9', y2: '12' })
        )
    ),

    /**
     * LogIn - Login
     * Replaces: 🔑
     */
    LogIn: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4' }),
            React.createElement('polyline', { points: '10 17 15 12 10 7' }),
            React.createElement('line', { x1: '15', y1: '12', x2: '3', y2: '12' })
        )
    ),

    /**
     * Menu - Hamburger menu
     * Replaces: ☰
     */
    Menu: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('line', { x1: '3', y1: '12', x2: '21', y2: '12' }),
            React.createElement('line', { x1: '3', y1: '6', x2: '21', y2: '6' }),
            React.createElement('line', { x1: '3', y1: '18', x2: '21', y2: '18' })
        )
    ),

    /**
     * ChevronLeft - Collapse sidebar / back
     * Replaces: ←
     */
    ChevronLeft: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('polyline', { points: '15 18 9 12 15 6' })
        )
    ),

    /**
     * ChevronRight - Expand sidebar / forward
     * Replaces: →
     */
    ChevronRight: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('polyline', { points: '9 18 15 12 9 6' })
        )
    ),

    /**
     * ChevronDown - Dropdown arrow / collapse
     * Replaces: ▼
     */
    ChevronDown: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('polyline', { points: '6 9 12 15 18 9' })
        )
    ),

    /**
     * Scissors - Page Break / Cut
     * For page break block in document templates
     */
    Scissors: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('circle', { cx: '6', cy: '6', r: '3' }),
            React.createElement('circle', { cx: '6', cy: '18', r: '3' }),
            React.createElement('line', { x1: '20', y1: '4', x2: '8.12', y2: '15.88' }),
            React.createElement('line', { x1: '14.47', y1: '14.48', x2: '20', y2: '20' }),
            React.createElement('line', { x1: '8.12', y1: '8.12', x2: '12', y2: '12' })
        )
    ),

    /**
     * Mail - Email
     * Replaces: 📧
     */
    Mail: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' }),
            React.createElement('polyline', { points: '22,6 12,13 2,6' })
        )
    ),

    /**
     * FileText - Documents/Feedback
     * Replaces: 📝
     */
    FileText: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
            React.createElement('polyline', { points: '14 2 14 8 20 8' }),
            React.createElement('line', { x1: '16', y1: '13', x2: '8', y2: '13' }),
            React.createElement('line', { x1: '16', y1: '17', x2: '8', y2: '17' }),
            React.createElement('polyline', { points: '10 9 9 9 8 9' })
        )
    ),

    /**
     * Book - Resources/Reading
     * Replaces: 📚
     */
    Book: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20' }),
            React.createElement('path', { d: 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' })
        )
    ),

    // ============================================
    // MILESTONE ICONS
    // Recovery milestone indicators
    // ============================================

    /**
     * Sunrise - 24 Hours milestone / Morning
     * Replaces: 🌅
     */
    Sunrise: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M17 18a5 5 0 0 0-10 0' }),
            React.createElement('line', { x1: '12', y1: '2', x2: '12', y2: '9' }),
            React.createElement('line', { x1: '4.22', y1: '10.22', x2: '5.64', y2: '11.64' }),
            React.createElement('line', { x1: '1', y1: '18', x2: '3', y2: '18' }),
            React.createElement('line', { x1: '21', y1: '18', x2: '23', y2: '18' }),
            React.createElement('line', { x1: '18.36', y1: '11.64', x2: '19.78', y2: '10.22' }),
            React.createElement('line', { x1: '23', y1: '22', x2: '1', y2: '22' }),
            React.createElement('polyline', { points: '8 6 12 2 16 6' })
        )
    ),

    /**
     * Moon - Evening
     * Replaces: 🌙
     */
    Moon: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' })
        )
    ),

    /**
     * Trophy - Achievement/Goals
     * Replaces: 🏆
     */
    Trophy: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6' }),
            React.createElement('path', { d: 'M18 9h1.5a2.5 2.5 0 0 0 0-5H18' }),
            React.createElement('path', { d: 'M4 22h16' }),
            React.createElement('path', { d: 'M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22' }),
            React.createElement('path', { d: 'M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22' }),
            React.createElement('path', { d: 'M18 2H6v7a6 6 0 0 0 12 0V2Z' })
        )
    ),

    /**
     * PieChart - Analytics/Overview
     * Replaces: chart icon
     */
    PieChart: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M21.21 15.89A10 10 0 1 1 8 2.83' }),
            React.createElement('path', { d: 'M22 12A10 10 0 0 0 12 2v10z' })
        )
    ),

    /**
     * Wallet - Financial/Savings
     * Replaces: money icon
     */
    Wallet: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M21 12V7H5a2 2 0 0 1 0-4h14v4' }),
            React.createElement('path', { d: 'M3 5v14a2 2 0 0 0 2 2h16v-5' }),
            React.createElement('path', { d: 'M18 12a2 2 0 0 0 0 4h4v-4Z' })
        )
    ),

    /**
     * Star - Excellence/Featured
     * Replaces: ⭐ 🌟
     */
    Star: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' })
        )
    ),

    /**
     * Crown - Royalty/Premium Achievement
     * For long-term milestones (1+ years)
     */
    Crown: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z' }),
            React.createElement('path', { d: 'M5 16v4h14v-4' }),
            React.createElement('path', { d: 'M12 4v4' })
        )
    ),

    /**
     * Award - Major achievement
     * Replaces: 🎊
     */
    Award: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('circle', { cx: '12', cy: '8', r: '6' }),
            React.createElement('path', { d: 'M15.477 12.89 17 22l-5-3-5 3 1.523-9.11' })
        )
    ),

    /**
     * PartyPopper - Celebration
     * Replaces: 🎉
     */
    PartyPopper: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M5.8 11.3 2 22l10.7-3.79' }),
            React.createElement('path', { d: 'M4 3h.01' }),
            React.createElement('path', { d: 'M22 8h.01' }),
            React.createElement('path', { d: 'M15 2h.01' }),
            React.createElement('path', { d: 'M22 20h.01' }),
            React.createElement('path', { d: 'm22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10' }),
            React.createElement('path', { d: 'm22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17' }),
            React.createElement('path', { d: 'm11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7' }),
            React.createElement('path', { d: 'M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z' })
        )
    ),

    /**
     * Flame - Streak/Hot
     * Replaces: 🔥
     */
    Flame: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z' })
        )
    ),

    /**
     * Sparkles - Special/New
     * Replaces: ✨
     */
    Sparkles: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'm12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z' }),
            React.createElement('path', { d: 'M5 3v4' }),
            React.createElement('path', { d: 'M19 17v4' }),
            React.createElement('path', { d: 'M3 5h4' }),
            React.createElement('path', { d: 'M17 19h4' })
        )
    ),

    // ============================================
    // ACTIVITY TYPE ICONS
    // Used in activity feeds
    // ============================================

    /**
     * FileCheck - Assignment completed
     * Replaces: 📝 (in activity context)
     */
    FileCheck: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' }),
            React.createElement('polyline', { points: '14 2 14 8 20 8' }),
            React.createElement('path', { d: 'm9 15 2 2 4-4' })
        )
    ),

    /**
     * PanelTop - Header panel
     */
    PanelTop: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }),
            React.createElement('path', { d: 'M3 9h18' })
        )
    ),

    /**
     * PanelBottom - Footer panel
     */
    PanelBottom: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }),
            React.createElement('path', { d: 'M3 15h18' })
        )
    ),

    /**
     * Monitor - Desktop preview
     */
    Monitor: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('rect', { x: '2', y: '3', width: '20', height: '14', rx: '2' }),
            React.createElement('line', { x1: '8', y1: '21', x2: '16', y2: '21' }),
            React.createElement('line', { x1: '12', y1: '17', x2: '12', y2: '21' })
        )
    ),

    /**
     * PenLine - Signature/Writing
     */
    PenLine: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M12 20h9' }),
            React.createElement('path', { d: 'M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z' })
        )
    ),

    /**
     * Facebook - Social link
     */
    Facebook: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' })
        )
    ),

    /**
     * Instagram - Social link
     */
    Instagram: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('rect', { x: '2', y: '2', width: '20', height: '20', rx: '5' }),
            React.createElement('path', { d: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' }),
            React.createElement('line', { x1: '17.5', y1: '6.5', x2: '17.51', y2: '6.5' })
        )
    ),

    /**
     * Image - Image/Photo icon
     */
    Image: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }),
            React.createElement('circle', { cx: '9', cy: '9', r: '2' }),
            React.createElement('path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' })
        )
    ),

    /**
     * Key - Login
     * Replaces: 🔑
     */
    Key: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('circle', { cx: '7.5', cy: '15.5', r: '5.5' }),
            React.createElement('path', { d: 'm21 2-9.6 9.6' }),
            React.createElement('path', { d: 'm15.5 7.5 3 3L22 7l-3-3' })
        )
    ),

    /**
     * User - Profile
     * Replaces: 👤
     */
    User: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' }),
            React.createElement('circle', { cx: '12', cy: '7', r: '4' })
        )
    ),

    /**
     * Handshake - Pledge completed
     * Replaces: 🤝
     */
    Handshake: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'm11 17 2 2a1 1 0 1 0 3-3' }),
            React.createElement('path', { d: 'm14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4' }),
            React.createElement('path', { d: 'm21 3 1 11h-2' }),
            React.createElement('path', { d: 'M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3' }),
            React.createElement('path', { d: 'M3 4h8' })
        )
    ),

    /**
     * Pin - Default activity
     * Replaces: 📌
     */
    Pin: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('line', { x1: '12', y1: '17', x2: '12', y2: '22' }),
            React.createElement('path', { d: 'M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z' })
        )
    ),

    // ============================================
    // UI ICONS
    // General interface elements
    // ============================================

    /**
     * Heart - Health/Wellness
     * Replaces: ❤️ 💚
     */
    Heart: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z' })
        )
    ),

    /**
     * ClipboardCheck - Check-ins/Completed Tasks
     */
    ClipboardCheck: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('rect', { x: '8', y: '2', width: '8', height: '4', rx: '1', ry: '1' }),
            React.createElement('path', { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' }),
            React.createElement('path', { d: 'm9 14 2 2 4-4' })
        )
    ),

    /**
     * Trash2 - Delete action
     */
    Trash2: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M3 6h18' }),
            React.createElement('path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }),
            React.createElement('path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' }),
            React.createElement('line', { x1: '10', y1: '11', x2: '10', y2: '17' }),
            React.createElement('line', { x1: '14', y1: '11', x2: '14', y2: '17' })
        )
    ),

    /**
     * Tag - Category/Label
     */
    Tag: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z' }),
            React.createElement('path', { d: 'M7 7h.01' })
        )
    ),

    /**
     * Flag - Objective/Milestone marker
     */
    Flag: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z' }),
            React.createElement('line', { x1: '4', y1: '22', x2: '4', y2: '15' })
        )
    ),

    /**
     * Smile - Mood indicator
     */
    Smile: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
            React.createElement('path', { d: 'M8 14s1.5 2 4 2 4-2 4-2' }),
            React.createElement('line', { x1: '9', y1: '9', x2: '9.01', y2: '9' }),
            React.createElement('line', { x1: '15', y1: '9', x2: '15.01', y2: '9' })
        )
    ),

    /**
     * Send - Send message
     */
    Send: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('line', { x1: '22', y1: '2', x2: '11', y2: '13' }),
            React.createElement('polygon', { points: '22 2 15 22 11 13 2 9 22 2' })
        )
    ),

    /**
     * MapPin - Location marker
     */
    MapPin: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' }),
            React.createElement('circle', { cx: '12', cy: '10', r: '3' })
        )
    ),

    /**
     * Building - Tenant/Organization
     * Replaces: 🏢
     */
    Building: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('rect', { x: '4', y: '2', width: '16', height: '20', rx: '2', ry: '2' }),
            React.createElement('path', { d: 'M9 22v-4h6v4' }),
            React.createElement('path', { d: 'M8 6h.01' }),
            React.createElement('path', { d: 'M16 6h.01' }),
            React.createElement('path', { d: 'M12 6h.01' }),
            React.createElement('path', { d: 'M12 10h.01' }),
            React.createElement('path', { d: 'M12 14h.01' }),
            React.createElement('path', { d: 'M16 10h.01' }),
            React.createElement('path', { d: 'M16 14h.01' }),
            React.createElement('path', { d: 'M8 10h.01' }),
            React.createElement('path', { d: 'M8 14h.01' })
        )
    ),

    /**
     * TrendingUp - Growth/Progress
     * Replaces: 📈 (in reporting context)
     */
    TrendingUp: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('polyline', { points: '22 7 13.5 15.5 8.5 10.5 2 17' }),
            React.createElement('polyline', { points: '16 7 22 7 22 13' })
        )
    ),

    /**
     * TrendingDown - Decline/Decrease
     * Replaces: 📉 (in reporting context)
     */
    TrendingDown: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('polyline', { points: '22 17 13.5 8.5 8.5 13.5 2 7' }),
            React.createElement('polyline', { points: '16 17 22 17 22 11' })
        )
    ),

    /**
     * Lock - Security/Auth
     * Replaces: 🔐
     */
    Lock: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('rect', { x: '3', y: '11', width: '18', height: '11', rx: '2', ry: '2' }),
            React.createElement('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' })
        )
    ),

    /**
     * GraduationCap - Alumni
     * Replaces: 🎓
     */
    GraduationCap: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M22 10v6M2 10l10-5 10 5-10 5z' }),
            React.createElement('path', { d: 'M6 12v5c3 3 9 3 12 0v-5' })
        )
    ),

    /**
     * CalendarDays - Month view
     * Replaces: 📆
     */
    CalendarDays: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2', ry: '2' }),
            React.createElement('line', { x1: '16', y1: '2', x2: '16', y2: '6' }),
            React.createElement('line', { x1: '8', y1: '2', x2: '8', y2: '6' }),
            React.createElement('line', { x1: '3', y1: '10', x2: '21', y2: '10' }),
            React.createElement('path', { d: 'M8 14h.01' }),
            React.createElement('path', { d: 'M12 14h.01' }),
            React.createElement('path', { d: 'M16 14h.01' }),
            React.createElement('path', { d: 'M8 18h.01' }),
            React.createElement('path', { d: 'M12 18h.01' }),
            React.createElement('path', { d: 'M16 18h.01' })
        )
    ),

    // ============================================
    // ADDITIONAL ICONS (Added for UserDetail page)
    // ============================================

    /**
     * ArrowLeft - Back navigation
     */
    ArrowLeft: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('line', { x1: '19', y1: '12', x2: '5', y2: '12' }),
            React.createElement('polyline', { points: '12 19 5 12 12 5' })
        )
    ),

    /**
     * Edit - Edit/Pencil icon
     */
    Edit: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
            React.createElement('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })
        )
    ),

    /**
     * DollarSign - Financial/Money
     */
    DollarSign: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('line', { x1: '12', y1: '1', x2: '12', y2: '23' }),
            React.createElement('path', { d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' })
        )
    ),

    /**
     * Phone - Telephone/Contact
     */
    Phone: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' })
        )
    ),

    /**
     * Map - Journey/Navigation
     */
    Map: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('polygon', { points: '1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6' }),
            React.createElement('line', { x1: '8', y1: '2', x2: '8', y2: '18' }),
            React.createElement('line', { x1: '16', y1: '6', x2: '16', y2: '22' })
        )
    ),

    /**
     * Globe - Community/World
     */
    Globe: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
            React.createElement('line', { x1: '2', y1: '12', x2: '22', y2: '12' }),
            React.createElement('path', { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' })
        )
    ),

    /**
     * CheckSquare - Task complete
     */
    CheckSquare: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('polyline', { points: '9 11 12 14 22 4' }),
            React.createElement('path', { d: 'M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' })
        )
    ),

    /**
     * Inbox - Empty state
     */
    Inbox: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('polyline', { points: '22 12 16 12 14 15 10 15 8 12 2 12' }),
            React.createElement('path', { d: 'M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z' })
        )
    ),

    /**
     * Folder - File organization, document categories
     */
    Folder: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' })
        )
    ),

    /**
     * Upload - File upload action
     */
    Upload: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
            React.createElement('polyline', { points: '17 8 12 3 7 8' }),
            React.createElement('line', { x1: '12', y1: '3', x2: '12', y2: '15' })
        )
    ),

    /**
     * Link - Connection, integration indicator
     */
    Link: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' }),
            React.createElement('path', { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' })
        )
    ),

    /**
     * Info - Information indicator
     */
    Info: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
            React.createElement('path', { d: 'M12 16v-4' }),
            React.createElement('path', { d: 'M12 8h.01' })
        )
    ),

    /**
     * Lightbulb - Tip/idea indicator
     */
    Lightbulb: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5' }),
            React.createElement('path', { d: 'M9 18h6' }),
            React.createElement('path', { d: 'M10 22h4' })
        )
    ),

    /**
     * Play - Play/start indicator
     */
    Play: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('polygon', { points: '5 3 19 12 5 21 5 3' })
        )
    ),

    /**
     * Pause - Pause/stop indicator
     */
    Pause: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('rect', { width: '4', height: '16', x: '6', y: '4' }),
            React.createElement('rect', { width: '4', height: '16', x: '14', y: '4' })
        )
    ),

    /**
     * Video - Video content indicator
     */
    Video: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'm22 8-6 4 6 4V8Z' }),
            React.createElement('rect', { width: '14', height: '12', x: '2', y: '6', rx: '2', ry: '2' })
        )
    ),

    /**
     * Newspaper - Article/News content indicator
     */
    Newspaper: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2' }),
            React.createElement('path', { d: 'M18 14h-8' }),
            React.createElement('path', { d: 'M15 18h-5' }),
            React.createElement('path', { d: 'M10 6h8v4h-8V6Z' })
        )
    ),

    /**
     * Search - Search/Find
     * Replaces: search input icon
     */
    Search: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('circle', { cx: '11', cy: '11', r: '8' }),
            React.createElement('path', { d: 'm21 21-4.3-4.3' })
        )
    ),

    /**
     * Filter - Filter/Sort
     * Replaces: filter icon
     */
    Filter: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('polygon', { points: '22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' })
        )
    ),

    /**
     * Download - Download/Export
     * Replaces: download icon
     */
    Download: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
            React.createElement('polyline', { points: '7 10 12 15 17 10' }),
            React.createElement('line', { x1: '12', y1: '15', x2: '12', y2: '3' })
        )
    ),

    /**
     * MoreVertical - More options (vertical dots)
     */
    MoreVertical: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('circle', { cx: '12', cy: '12', r: '1' }),
            React.createElement('circle', { cx: '12', cy: '5', r: '1' }),
            React.createElement('circle', { cx: '12', cy: '19', r: '1' })
        )
    ),

    /**
     * Eye - View/Visibility
     */
    Eye: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }),
            React.createElement('circle', { cx: '12', cy: '12', r: '3' })
        )
    ),

    /**
     * EyeOff - Hide/Hidden
     */
    EyeOff: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' }),
            React.createElement('line', { x1: '1', y1: '1', x2: '23', y2: '23' })
        )
    ),

    /**
     * Copy - Copy to clipboard
     */
    Copy: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('rect', { x: '9', y: '9', width: '13', height: '13', rx: '2', ry: '2' }),
            React.createElement('path', { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' })
        )
    ),

    /**
     * Trash2 - Delete/trash icon with lid
     */
    Trash2: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M3 6h18' }),
            React.createElement('path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }),
            React.createElement('path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' }),
            React.createElement('line', { x1: '10', y1: '11', x2: '10', y2: '17' }),
            React.createElement('line', { x1: '14', y1: '11', x2: '14', y2: '17' })
        )
    ),

    /**
     * BarChart3 - Bar chart with 3 bars
     */
    BarChart3: ({ size = 20, color = 'currentColor', style = {} }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: style
        },
            React.createElement('path', { d: 'M3 3v18h18' }),
            React.createElement('path', { d: 'M18 17V9' }),
            React.createElement('path', { d: 'M13 17V5' }),
            React.createElement('path', { d: 'M8 17v-3' })
        )
    )
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Render an icon by name (string lookup)
 * Useful for dynamic icon rendering from data
 *
 * @param {string} name - Icon name (e.g., 'dashboard', 'users')
 * @param {object} props - Props to pass to icon (size, color, style)
 * @returns {React.Element} - Icon component
 *
 * Usage:
 *   AdminIcons.renderIcon('dashboard', { size: 24 })
 */
AdminIcons.renderIcon = function(name, props = {}) {
    // Capitalize first letter for component lookup
    const componentName = name.charAt(0).toUpperCase() + name.slice(1);
    const IconComponent = AdminIcons[componentName];

    if (IconComponent) {
        return IconComponent(props);
    }

    // Fallback to Pin icon if not found
    console.warn(`AdminIcons: Icon "${name}" not found, using Pin as fallback`);
    return AdminIcons.Pin(props);
};

/**
 * Get SVG string for favicon use
 * Returns raw SVG markup that can be used in data URIs
 *
 * @param {string} name - Icon name
 * @param {string} color - Stroke color (default: white for dark backgrounds)
 * @returns {string} - SVG markup string
 *
 * Usage:
 *   const svgString = AdminIcons.getFaviconSvg('dashboard', '#ffffff');
 *   link.href = 'data:image/svg+xml,' + encodeURIComponent(svgString);
 */
AdminIcons.getFaviconSvg = function(name, color = '#ffffff') {
    const icons = {
        dashboard: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`,
        users: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        target: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
        clipboardList: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>`,
        bookOpen: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
        messageSquare: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
        calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
        fileTemplate: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
        barChart3: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>`,
        settings: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
        alertTriangle: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        lock: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
        graduationCap: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
        fileText: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
    };

    return icons[name] || icons['dashboard'];
};

/**
 * Get all available icon names
 * Useful for documentation and debugging
 *
 * @returns {string[]} - Array of icon names
 */
AdminIcons.getIconNames = function() {
    return Object.keys(AdminIcons).filter(key =>
        typeof AdminIcons[key] === 'function' &&
        key !== 'renderIcon' &&
        key !== 'getFaviconSvg' &&
        key !== 'getIconNames'
    );
};

// ============================================
// EXPORT
// ============================================

// Make available globally
window.AdminIcons = AdminIcons;

// Log successful load (no emoji)
console.log('[AdminIcons] Icon library loaded successfully -', AdminIcons.getIconNames().length, 'icons available');
