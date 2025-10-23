# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CRITICAL DEVELOPMENT RULES

1. **NO placeholder code** - Never use "// TODO", "// rest of code", or "... implementation continues"
2. **Complete implementations only** - If section is too long, explicitly ask to break into smaller parts
3. **All Firebase operations must follow existing patterns in app.js**
4. **Test all changes locally in browser before committing**
5. **Maintain existing React Hooks patterns** (functional components only)
6. **Include error handling for all async operations with try-catch**
7. **Never modify unrelated code sections when making changes**
8. **If instructions are unclear, ask questions before generating code**
9. **Follow the no-placeholder verification**: After generating code, scan for any incomplete sections and complete them

## DOCUMENTATION MAINTENANCE PROTOCOL

### ⚠️ CRITICAL: Update After Every GitHub Push

**MANDATORY RULE:** The CLAUDE.md file MUST be updated immediately after every single push to GitHub to ensure accuracy.

**When to Update:**
- ✅ After adding new components or functions
- ✅ After modifying existing component structure
- ✅ After changing file locations or names
- ✅ After adding new modals or major features
- ✅ After updating CSS variables
- ✅ After completing any work-in-progress tasks
- ✅ After fixing bugs that change component behavior

**What to Update:**
1. **Component Locations** - Add new components with line numbers
2. **Modal References** - Document new modals and their purposes
3. **Firestore Collections** - Add any new collections or fields
4. **Utility Functions** - Document new helper functions
5. **Current Work in Progress** - Mark completed tasks, add new ones
6. **Established Patterns** - Document any new patterns or conventions

**Update Workflow:**
```bash
# 1. Make code changes
# 2. Test thoroughly
# 3. Update CLAUDE.md with changes made
# 4. Commit BOTH code + CLAUDE.md together

git add .
git commit -m "Feature: [description] + Updated CLAUDE.md"
git push origin main
```

**Why This Matters:**
- Keeps documentation synchronized with codebase
- Future Claude sessions have accurate context
- Prevents confusion about component locations
- Maintains accurate line number references
- Ensures work-in-progress section is current

**Verification Checklist:**
- [ ] All new components documented
- [ ] Line numbers updated if file structure changed
- [ ] Work-in-progress section reflects current state
- [ ] New patterns or conventions added
- [ ] CLAUDE.md committed with code changes

**⚠️ NEVER push code without updating CLAUDE.md**

## Project Overview

**GLRS Lighthouse** is a Person in Recovery (PIR) management platform for Guiding Light Recovery Services (GLRS). It's a Firebase-backed single-page application with three role-based portals:

- **PIR Portal** (`index.html`) - Recovery tracking, check-ins, progress visualization, peer connections, coach messaging
- **Coach Portal** (`coach.html`) - Manage assigned PIRs, review check-ins, track progress, send assignments and resources
- **Admin Portal** (`admin.html`) - Create/manage users, system-wide analytics, data exports, bulk operations

### Business Context
- **Company**: Guiding Light Recovery Services (GLRS)
- **Website**: glrecoveryservices.com
- **Service Model**: In-person AND virtual recovery coaching (both options available)
- **Target Market**: Working professionals (25-50), first responders, veterans
- **Current Status**: Live operations with active Facebook advertising campaigns

## FILE STRUCTURE & KEY LOCATIONS

### INDEX.HTML (8,975 lines) - PIR Portal

**Main Components:**
- App (line 1223) - Root component, handles auth
- LoginScreen (line 1291) - Login/signup interface
- PIRApp (line 1422) - Main PIR application

**Navigation Views (Bottom nav, 5 views):**
- Tasks View (line 5917) - Goals and assignments (GoalsTasksView)
- Home View (line 4100+) - Dashboard, check-ins, stats, daily pledge
- Progress View (line 4200+) - Charts (mood, cravings, anxiety, sleep)
- Connect View (line 4450+) - Community chat, topic rooms, support groups
- Profile View (line 6751) - Settings, Google Calendar, data export

**Key Modals:**
- ModalContainer (line 7384) - All modal dialogs
- ResourceViewer (line 5605) - Resource viewing with notes/tracking
- ImageModal (line 2046) - Full-screen image viewer

**Critical Functions:**
- loadGoogleConnection (line 1523) - Google Calendar OAuth
- connectGoogleCalendar (line 1621) - OAuth flow
- setupRealtimeListeners (line 1756) - Firebase real-time data
- calculateSobrietyDays (line 1821) - Sobriety calculation
- loadDailyTasksStatus (line 2308) - Task completion status
- sendCommunityMessage (line 3574) - Community chat posting
- exportDataAsJSON (line 3880) - Data export functionality

**Firestore Collections Used:**
users, checkins, goals, assignments, messages, topicRooms, meetings, resources, notifications, broadcasts

---

### ADMIN.HTML (34,611 lines) - Coach/Admin Portal

**Main Components:**
- AdminApp (line 1757) - Root component, auth, view routing
- LoginScreen (line 2693) - Admin/coach login
- TopNav (line 1952) - Top navigation bar
- Header (line 2424) - Enhanced header with search

**12 Main Views (Sidebar Navigation):**

Row 1 - Core Management:
- Dashboard (line 2761) - System stats, charts, active PIRs grid
- Users (line 3646) - User management (PIRs/coaches/admins)
- My PIRs (line 4600) - Coach's detailed PIR tracking dashboard
- My Profile (line 12269) - Personal settings, Google Calendar

Row 2 - Content & Organization:
- Feedback (line 17963) - User feedback and satisfaction tracking
- Resources (line 13227) - Educational content library (videos/articles/tools/worksheets)
- Goals (line 10839) - Goal and assignment system
- Community (line 6185) - Community chat moderation, topic rooms, support groups

Row 3 - Monitoring & Reporting:
- Check-ins (line 14562) - Morning/evening check-in review and analytics
- Alerts (line 18936) - Crisis alerts and automated notifications
- Reports (line 19808) - Comprehensive reporting system with 20+ chart types
- Settings (line 26352) - System configuration and preferences

**Key Features & Line Numbers:**
- Google Calendar Integration (line 4724-4858) - OAuth 2.0, milestone sync
- Milestone Calendar Sync (line 5027-5255) - Auto-create calendar events for milestones
- Impersonation Feature (line 1860) - Admin can view as any user
- Secondary Firebase App (line 27908) - User creation without logout
- Email Templates (line 1344-1738) - 7 HTML email templates
- PIR Notes Modal (line 6070) - Private coach notes
- CreateUserModal (line 27817) - New user creation wizard
- Analytics View Modal (line 16623) - Deep-dive PIR analytics
- Report Automation (line 19828-19858) - Scheduled weekly/monthly reports

**Deprecated/Removed Components:**
- GroupsView (REMOVED) - Support group management now in CommunityView > Support Groups Tab
- AssignmentsView (REMOVED) - Task assignments now in GoalsView > Assignment system

**Key Modals:**
- CreateUserModal (line 27817) - New user creation wizard
- ResourceModal (line 13899) - Add/edit resources
- CommunityCreateModal (line 9531) - Create topic rooms/groups/meetings
- AttendanceModal (line 10615) - Meeting attendance
- PIRNotesModal (line 6070) - Private coach notes
- CreateGoalModal (line 11732) - Hierarchical goal builder
- CheckInDetailModal (line 16258) - Detailed check-in review
- FeedbackDetailModal (line 18682) - Respond to feedback
- AnalyticsView Modal (line 16623) - Deep-dive analytics
- UserDetailModal (line 29007) - Comprehensive PIR detail view with CSS variables
- CoachDetailModal (line 33883) - Coach performance and caseload details with CSS variables
- GroupDetailModal (line 34677) - Group member management with CSS variables

**Utility Functions (line 1107-1343):**
- formatDate(date) - MM/DD/YYYY formatting
- formatDateTime(date) - Full timestamp
- formatTimeAgo(date) - Relative time (e.g., "2 hours ago")
- useDebounce(value, delay) - Debounce search inputs
- batchQuery(collection, field, values) - Handle Firestore 10-item limit
- exportToJSON/CSV/PDF - Multiple export formats

**Firestore Collections Used:**
users, checkins, goals, assignments, messages, topicRooms, supportGroups, meetings, resources, notifications, alerts, feedback, broadcasts, attendance

## CSS VARIABLES REFERENCE

**Admin.html CSS Variables (lines 59-100):**

Colors:
- --primary-color: #667eea (purple)
- --primary-dark: #764ba2 (violet)
- --text-primary: #2d3748 (dark gray)
- --text-secondary: #718096 (medium gray)
- --text-gray: #a0aec0 (light gray)
- --border-color: #e2e8f0 (border)
- --bg-white: #ffffff
- --bg-gray: #f7fafc
- --bg-hover: #edf2f7

Status Colors:
- --success: #48bb78 (green)
- --success-dark: #38a169
- --success-light: #c6f6d5
- --bg-success-light: rgba(72, 187, 120, 0.1)
- --danger: #f56565 (red)
- --danger-dark: #e53e3e
- --danger-light: #fed7d7
- --bg-danger-light: rgba(245, 101, 101, 0.1)
- --warning: #ed8936 (orange)
- --warning-dark: #dd6b20
- --info: #4299e1 (blue)

Layout & Spacing:
- --radius-sm: 6px
- --radius-md: 8px
- --radius-lg: 12px
- --radius-xl: 16px
- --shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
- --shadow-md: 0 4px 6px rgba(0,0,0,0.1)
- --shadow-lg: 0 10px 15px rgba(0,0,0,0.1)

**Usage Pattern:**
Always use CSS variables in inline styles for consistency:
```jsx
// ✅ CORRECT:
style={{ color: 'var(--text-gray)', borderRadius: 'var(--radius-lg)' }}

// ❌ WRONG:
style={{ color: '#a0aec0', borderRadius: '12px' }}
```

## CURRENT WORK IN PROGRESS

### Recent Changes (Latest Session)

**Completed Tasks:**

1. **CSS Variable Refactoring** ✅
   - CoachDetailModal: Replaced 2 hardcoded colors with CSS variables
   - GroupDetailModal: Replaced 11 hardcoded values with CSS variables
   - All modals now use consistent var(--color-name) patterns

2. **Code Cleanup - Deprecated Views Removed** ✅
   - **Deleted GroupsView** (was 401 lines) - Functionality moved to CommunityView > Support Groups Tab
   - **Deleted AssignmentsView** (was 323 lines) - Functionality moved to GoalsView > Assignment system
   - **Total reduction**: 724 lines removed from admin.html
   - **Navigation updated**: Removed from sidebar menu (12 views instead of 14)

3. **Navigation Reorganization** ✅
   - Updated from 14 views to 12 views
   - Removed Row 4 (now only 3 rows of navigation)
   - Updated menu items array and routing logic

**File Size Changes:**
- admin.html: 35,387 lines → 34,611 lines (776 lines removed)

**Pattern to Follow for Future Edits:**
- Only modify inline styles (style={{...}} attributes)
- Use CSS variables from :root definition (lines 59-100)
- Maintain exact visual appearance
- Test after each section

## ESTABLISHED PATTERNS

### Firebase Operations
- ALL database operations use try-catch error handling
- Real-time listeners MUST have cleanup functions (return unsubscribe)
- Use serverTimestamp() for all timestamp fields
- Never use direct Firebase calls in components - create utility functions

### React Patterns
- Functional components with hooks only (no class components)
- useState for component state
- useEffect for side effects with proper cleanup
- useMemo for expensive calculations
- Custom hooks for reusable logic

### Google Calendar Integration
- OAuth 2.0 flow via Google Identity Services
- Token storage in Firestore (encrypted)
- Auto-refresh token management
- Milestone events auto-created at 7, 30, 60, 90, 180, 365, 730+ days
- Support group meetings sync to calendar

### Crisis Detection
- Keyword scanning in check-ins (suicide, relapse, crisis words)
- Immediate alert to assigned coach
- SOS button creates high-priority alert
- Emergency resources display automatically

### Code Generation Standards
- NO placeholder code ("// TODO", "// rest of code", "... implementation continues")
- Complete implementations only
- If section too long, explicitly ask to break into smaller parts
- Include ALL imports and dependencies
- Add error handling for all async operations
- Follow existing component patterns
- Verify no placeholders before submitting code

## Architecture

### Technology Stack
- **Frontend**: Vanilla JavaScript with React 18 (via CDN, using Babel for JSX transpilation)
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Libraries**: Chart.js (visualizations), jsPDF (PDF exports), Google Identity Services (calendar integration)
- **Styling**: Inline CSS with CSS custom properties for theming

### File Structure
```
index.html      - PIR portal (8,975 lines)
admin.html      - Admin portal (35,387 lines)
coach.html      - Coach portal (3,119 lines)
app.js          - Shared utilities and initialization (2,689 lines)
modern-style.css - Global styles (1,096 lines)
```

### Key Architectural Patterns

**Role-Based Access Control**: Each HTML file contains its own Firebase initialization and role-specific logic. User roles (`pir`, `coach`, `admin`) determine which portal they access.

**Firebase Collections**:
- `users` - User profiles with role, tier, recovery dates, assigned coach
- `checkins` - Daily PIR check-ins with mood, cravings, notes
- `messages` - Coach-PIR and peer-to-peer messaging
- `alerts` - Crisis alerts triggered by keywords in check-ins
- `assignments` - Coach-assigned tasks with file uploads
- `connections` - PIR peer connection requests and approvals

**Tier System**: PIRs are automatically assigned tiers (Bronze/Silver/Gold/Platinum/Diamond) based on recovery duration. Tiers unlock features like peer connections and mentoring (see `calculateTier()` in app.js:284).

**Crisis Detection**: Check-ins are scanned for crisis keywords (suicide, relapse, overdose, etc.) which trigger alerts to assigned coaches (see `checkForCrisisKeywords()` in app.js:467).

**Authentication Flow**:
1. Firebase auth state change detected
2. User document loaded from Firestore
3. First-time users prompted for password change
4. Terms acceptance required before app access
5. Role-based interface loaded

## Firebase Configuration

All three portals use the same Firebase project (`glrs-pir-system`) but have slightly different configurations embedded in their HTML files around line 1091-1162. The configuration includes:
- Project ID: `glrs-pir-system`
- Auth domain: `glrs-pir-system.firebaseapp.com`
- Storage bucket varies slightly between files

## Development Workflow

### Running the Application
This is a static site deployed via GitHub Pages to `app.glrecoveryservices.com`. To test locally:
```bash
# Serve locally (use any static server)
python3 -m http.server 8000
# or
npx serve .
```
Then navigate to:
- `http://localhost:8000/index.html` (PIR portal)
- `http://localhost:8000/coach.html` (Coach portal)
- `http://localhost:8000/admin.html` (Admin portal)

### Deployment
Push to the `main` branch to deploy automatically via GitHub Pages:
```bash
git add .
git commit -m "Description of changes"
git push origin main
```

### Testing Accounts
Create test accounts via the Admin portal. Each user needs:
- Email/password authentication
- Role (`pir`, `coach`, or `admin`)
- For PIRs: assigned coach, recovery start date
- For Coaches: firstName, lastName, email

### Working with Large Files
The HTML files are extremely large (admin.html is 35,000+ lines). When editing:
1. Use `Read` with offset/limit to view specific sections
2. Use `Grep` to search for specific functions or patterns
3. The React components are defined inline within `<script type="text/babel">` tags
4. Firebase initialization occurs early in each file's script section

## Key Functions by Location

### app.js
- `loadUserData(uid)` - Loads user from Firestore, determines role/tier
- `calculateTier(recoveryDate)` - Assigns tier based on sobriety days
- `checkForCrisisKeywords(text)` - Scans for crisis-related terms
- `saveCheckin()` - Saves daily check-in, triggers crisis alerts if needed
- `loadPIRDashboard()` - Loads PIR-specific interface
- `loadCoachDashboard()` - Loads coach-specific interface

### index.html (PIR Portal)
- React component `PIRApp` - Main PIR application around line 1200+
- Progress tracking with Chart.js integration
- Peer connection system for building support networks
- Weekly check-in tracking with streak visualization
- Message center for coach communication

### coach.html (Coach Portal)
- React component `CoachApp` - Main coach application around line 915+
- PIR roster management with real-time status
- Check-in review system with alert prioritization
- Assignment and resource distribution
- Messaging interface for all assigned PIRs

### admin.html (Admin Portal)
- React components for user management around line 1100+
- Bulk data export to PDF with comprehensive analytics
- User creation with secondary Firebase app to avoid logout
- System-wide reporting and visualization
- Role and permission management

## Common Tasks

### Adding a New Feature to a Portal
1. Locate the appropriate React component in the HTML file
2. Add new state variables using `useState` hook
3. Create the UI in the component's JSX return statement
4. Add corresponding Firestore operations
5. Update navigation if adding a new section

### Modifying Crisis Keywords
Edit the `checkForCrisisKeywords()` function in app.js. Keywords are checked case-insensitively against check-in notes.

### Adjusting Tier Thresholds
Edit `calculateTier()` in app.js:284. Tiers are based on days sober:
- Bronze: 0-89 days
- Silver: 90-179 days
- Gold: 180-364 days
- Platinum: 365-729 days
- Diamond: 730+ days

### Updating Styles
Global styles are in `modern-style.css`. Portal-specific styles are inline in each HTML file's `<style>` section. The admin portal uses CSS custom properties extensively (see `:root` around line 59+).

## Important Notes

- **No Build Process**: This is a zero-build app - all dependencies loaded via CDN
- **CSP Headers**: admin.html has Content Security Policy meta tags for enhanced security
- **Google Calendar Integration**: Uses Google Identity Services (not deprecated Google Sign-In)
- **Secondary Firebase App**: Admin portal creates a secondary Firebase app when creating users to avoid logging out the current admin (see around line 28310)
- **Firestore Security**: Ensure Firestore rules match role-based access patterns
- **Large File Caveat**: Be cautious with full-file operations on admin.html due to size
