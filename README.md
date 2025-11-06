# GLRS Lighthouse - Modular Architecture

## 🎯 Overview

This modular architecture is **shared across all 3 portals**:
- `index.html` (Full-Service Portal)
- `consumer.html` (Consumer Portal) - *coming soon*
- `alumni.html` (Alumni Portal) - *coming soon*

**Key Principle:** All `.js` files are **reusable libraries**, not standalone apps. Each portal HTML file imports these libraries and uses them.

---

## 📁 Flat Directory Structure

**ALL FILES AT ROOT LEVEL** (same directory as index.html):

```
public/
├── index.html              # Full-Service Portal
├── consumer.html           # Consumer Portal (coming soon)
├── alumni.html             # Alumni Portal (coming soon)
│
├── config.js               # Firebase configuration
├── app.js                  # Shared app initialization
│
├── firestore.js            # Database service
├── storage.js              # File upload service
├── functions.js            # Cloud Functions service
│
├── helpers.js              # Utility functions
├── constants.js            # App constants
│
├── HomeDashboard.js        # Home sub-component
├── HomeWidgets.js          # Home sub-component
├── HomeTab.js              # Home main component
├── JourneyCharts.js        # Journey sub-component
├── JourneyTab.js           # Journey main component
├── TasksTab.js             # Tasks component
├── CommunityTab.js         # Community component
├── ResourcesTab.js         # Resources component
├── ProfileTab.js           # Profile component
│
└── (21 Modal components)
    ├── CheckInModal.js
    ├── MilestoneCalendarModal.js
    ├── GraphSettingsModal.js
    └── ... (18 more modals)
```

**Total: 36 modular JS files + 3 portal HTML files**

---

## 🔄 How It Works

### Every Portal Follows This Pattern:

```html
<!-- index.html, consumer.html, alumni.html -->
<head>
    <!-- React, Firebase CDN -->
</head>
<body>
    <div id="root"></div>
    
    <!-- Load all 36 library files -->
    <script src="config.js"></script>
    <script src="constants.js"></script>
    <script src="helpers.js"></script>
    <script src="firestore.js"></script>
    <script src="storage.js"></script>
    <script src="functions.js"></script>
    <script src="HomeDashboard.js"></script>
    <script src="HomeWidgets.js"></script>
    <script src="HomeTab.js"></script>
    <!-- ... all 36 files ... -->
    <script src="app.js"></script>
    
    <!-- Portal-specific code -->
    <script type="text/babel">
        // THIS CODE STAYS IN THE HTML FILE
        // It USES the components from window.GLRSApp
        
        const App = () => {
            return <window.GLRSApp.components.HomeTab user={user} />;
        };
        
        ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
```

---

## 📦 Loading Strategy

**ALL FILES LOAD WHEN APP OPENS - NO LAZY LOADING**

1. User opens `index.html`
2. Browser downloads all 36 files simultaneously (2-3 seconds)
3. All components compile into `window.GLRSApp` namespace
4. Portal-specific `<script type="text/babel">` runs
5. App renders using pre-loaded components
6. **User clicks tab → INSTANT** (everything already in memory)

### Script Load Order (CRITICAL):

```html
<!-- 1. Config first -->
<script src="config.js"></script>

<!-- 2. Constants & Helpers -->
<script src="constants.js"></script>
<script src="helpers.js"></script>

<!-- 3. Services -->
<script src="firestore.js"></script>
<script src="storage.js"></script>
<script src="functions.js"></script>

<!-- 4. Sub-components BEFORE main components -->
<script src="HomeDashboard.js"></script>
<script src="HomeWidgets.js"></script>
<script src="HomeTab.js"></script>

<!-- 5. All modals -->
<script src="CheckInModal.js"></script>
<!-- ... -->

<!-- 6. App initialization last -->
<script src="app.js"></script>
```

---

## 🌐 Global Namespace

All modules expose themselves via `window.GLRSApp`:

```javascript
window.GLRSApp = {
    firebaseConfig: { ... },
    db: firestore instance,
    auth: auth instance,
    storage: storage instance,
    
    services: {
        firestore: { getUser: async () => {}, ... },
        storage: { uploadFile: async () => {}, ... },
        functions: { ... }
    },
    
    utils: {
        helpers: { ... },
        constants: { ... }
    },
    
    components: {
        HomeTab: () => {},
        JourneyTab: () => {},
        TasksTab: () => {},
        // ... all components
    },
    
    modals: {
        CheckInModal: () => {},
        // ... all modals
    }
};
```

**Backward Compatibility:**
- `window.db` → same as `window.GLRSApp.db`
- `window.auth` → same as `window.GLRSApp.auth`
- `window.storage` → same as `window.GLRSApp.storage`

---

## ✅ SUCCESS CRITERIA

- ✅ All 36 files in root directory (same level as index.html)
- ✅ NO nested directories (NO `js/` folder)
- ✅ All script tags use flat paths (`src="config.js"` not `src="js/config.js"`)
- ✅ Load order preserved (dependencies first)
- ✅ Files accessible via HTTP at `/config.js`, `/HomeTab.js`, etc.
- ✅ Same files reusable by consumer.html and alumni.html

---

## 🚀 Current Status

**Phase 1:** ✅ COMPLETE - Infrastructure flattened  
**Phase 2:** 🔄 IN PROGRESS - Extracting code from index.html into modular files  
**Next:** Extract actual React components from index.html's `<script type="text/babel">` into the 36 placeholder files

---

## ⚠️ Important Notes

- **DO NOT** mount React apps in library files - they're libraries only
- **DO** keep portal-specific React code in each HTML file's `<script type="text/babel">` tag
- **DO** extract shared components from index.html into the flat .js files
- **DO** use the global namespace `window.GLRSApp` for consistency
- **DO NOT** create nested directories - keep everything flat at root level
