# PIRApp Manual Extraction Instructions

## ⚠️ CRITICAL: Create Backup First!

Before proceeding, create a backup of index.html:
```bash
cp Index/index.html Index/index.html.backup-before-PIRApp-extraction
```

## Overview

This document provides step-by-step instructions for manually extracting the PIRApp component from `Index/index.html` into `Index/PIRApp.js`.

**Why Manual Extraction?**
- PIRApp is 21,187 lines of complex JSX code
- Automated extraction risks data loss or corruption
- Manual cut/paste ensures you can verify each step
- You maintain full control over the process

## PIRApp Component Boundaries

**Location in Index/index.html:**
- **START LINE**: 1969
- **END LINE**: 23156
- **Total Lines**: 21,187 lines

**Visual Markers:**
- **START**: Comment `// Main PIR App Component` followed by `function PIRApp({ user }) {`
- **END**: Closing brace `}` followed by blank line and comment `// Recovery Resources View Component - No Favorites`

## Step-by-Step Extraction Process

### Step 1: Verify Current State

1. Open `Index/index.html` in your editor
2. Navigate to line 1969
3. Verify you see:
   ```javascript
   // Main PIR App Component
   function PIRApp({ user }) {
   ```
4. Navigate to line 23156
5. Verify you see:
   ```javascript
   );
   }

   // Recovery Resources View Component - No Favorites
   function ResourcesView({ user, userData, onBack }) {
   ```

### Step 2: Select PIRApp Code

1. In `Index/index.html`, go to line 1969
2. Click at the start of line 1969 (before the comment `// Main PIR App Component`)
3. Hold Shift and navigate to line 23156
4. Ensure line 23156 is INCLUDED in the selection (the closing `}` brace)
5. Your selection should be exactly **21,187 lines** long

**Verification Checklist:**
- [ ] Selection starts with `// Main PIR App Component`
- [ ] Selection includes `function PIRApp({ user }) {`
- [ ] Selection ends with a closing `}` brace (line 23156)
- [ ] Next line after selection (23157) is blank
- [ ] Line 23158 shows `// Recovery Resources View Component`
- [ ] Line count: 21,187 lines

### Step 3: Cut the Code

1. With PIRApp code selected (lines 1969-23156)
2. **CUT** the code using:
   - macOS: `Cmd + X`
   - Windows/Linux: `Ctrl + X`
3. **DO NOT** save index.html yet

### Step 4: Paste into PIRApp.js

1. Open `Index/PIRApp.js`
2. Find the comment block:
   ```javascript
   // PASTE PIRApp COMPONENT HERE ↓↓↓
   // ============================================================================
   ```
3. Click on the blank line BELOW this comment (around line 35)
4. **PASTE** the code using:
   - macOS: `Cmd + V`
   - Windows/Linux: `Ctrl + V`

### Step 5: Verify PIRApp.js

1. Verify the first line of pasted code is:
   ```javascript
   // Main PIR App Component
   function PIRApp({ user }) {
   ```
2. Scroll to the bottom and verify the last lines are:
   ```javascript
   );
   }

   // ============================================================================
   // END OF MANUAL PASTE ZONE ↑↑↑
   ```
3. Verify the closing brace is BEFORE the "END OF MANUAL PASTE ZONE" comment
4. Check line count: PIRApp.js should be approximately **21,235 lines** (21,187 PIRApp + 48 wrapper lines)

### Step 6: Verify index.html

1. Open `Index/index.html`
2. Navigate to where PIRApp used to be (around line 1969)
3. You should now see:
   ```html
   <!-- ============================================================ -->
   <!-- PIRApp COMPONENT EXTRACTED TO Index/PIRApp.js -->
   <!-- DO NOT PASTE CODE HERE - Component now in separate file -->
   <!-- ============================================================ -->

   // Recovery Resources View Component - No Favorites
   function ResourcesView({ user, userData, onBack }) {
   ```

**Expected Results:**
- index.html reduced from ~28,876 lines to ~7,689 lines
- Gap where PIRApp was should have extraction boundary comments
- Next component (ResourcesView) should start immediately after

### Step 7: Save Both Files

1. Save `Index/PIRApp.js` (`Cmd/Ctrl + S`)
2. Save `Index/index.html` (`Cmd/Ctrl + S`)

### Step 8: Browser Testing

1. Open the app in your browser or run:
   ```bash
   firebase serve
   ```
2. Navigate to http://localhost:5000 (or your local URL)
3. Open browser DevTools Console (F12)
4. Verify you see:
   ```
   ✅ config.js loaded - Firebase initialized
   ✅ helpers.js loaded - 3 helper functions
   ✅ firestore.js loaded - 24 database methods
   ✅ storage.js loaded - 3 storage methods
   ✅ functions.js loaded - Cloud Functions wrapper
   ✅ ImageModal.js loaded
   ✅ DisclaimerModal.js loaded
   ✅ LegalModal.js loaded
   ✅ CrisisModal.js loaded
   ✅ PIRApp.js loaded - Main app component available  <-- NEW
   ```
5. Test key functionality:
   - [ ] Login works
   - [ ] Home view displays
   - [ ] Navigation works (all 6 tabs)
   - [ ] Modals open correctly
   - [ ] No console errors

## Troubleshooting

### Problem: Console error "PIRApp is not defined"

**Solution:**
1. Verify PIRApp.js has the namespace exposure code at the bottom:
   ```javascript
   window.GLRSApp.components.PIRApp = PIRApp;
   window.PIRApp = PIRApp;
   ```
2. Check index.html has the script tag:
   ```html
   <script src="Index/PIRApp.js"></script>
   ```
3. Ensure script tag is BEFORE the closing `</body>` tag

### Problem: Blank screen after extraction

**Solution:**
1. Check browser console for errors
2. Verify PIRApp.js has the complete function definition
3. Ensure closing brace `}` was included in the cut/paste
4. Restore from backup and retry extraction

### Problem: Line numbers don't match

**Cause:** Previous edits may have shifted line numbers

**Solution:**
1. Use visual markers instead of line numbers:
   - START: `// Main PIR App Component` + `function PIRApp({ user }) {`
   - END: Closing `}` before `// Recovery Resources View Component`
2. Search for these text patterns in your editor

### Problem: Missing nested components

**Symptom:** Console errors about undefined components (ResourcesView, ProfileView, etc.)

**Cause:** These are separate top-level functions, NOT part of PIRApp

**Solution:**
- ResourcesView (line 23159), ProfileView (26395), etc. should REMAIN in index.html
- Only PIRApp (lines 1969-23156) should be moved
- Verify these components still exist in index.html after extraction

## Rollback Instructions

If anything goes wrong:

1. Close both files WITHOUT saving
2. Restore from backup:
   ```bash
   cp Index/index.html.backup-before-PIRApp-extraction Index/index.html
   ```
3. Delete the pasted content in PIRApp.js
4. Restart extraction from Step 1

## Success Checklist

- [ ] Backup created before starting
- [ ] PIRApp.js contains 21,187 lines of PIRApp code
- [ ] PIRApp.js shows "✅ PIRApp.js loaded" in console
- [ ] index.html reduced by ~21,187 lines
- [ ] App loads in browser without errors
- [ ] All 6 navigation tabs work
- [ ] Login/logout works
- [ ] Modals open correctly
- [ ] No console errors

## Next Steps

After successful extraction:

1. Test thoroughly in all browsers (Chrome, Safari, Firefox)
2. Commit changes to git:
   ```bash
   git add Index/PIRApp.js Index/index.html EXTRACTION_INSTRUCTIONS.md
   git commit -m "Extract PIRApp component to separate file (21,187 lines)"
   git push
   ```
3. Delete backup file once confirmed working:
   ```bash
   rm Index/index.html.backup-before-PIRApp-extraction
   ```

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review browser console errors
3. Verify file integrity with backup
4. Ask Claude for help with specific error messages
