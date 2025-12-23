# iOS Capacitor Setup - Recovery Compass

## Overview

This document describes the iOS native wrapper implementation using Capacitor for the Recovery Compass PIR Portal.

**App ID:** `com.glrecoveryservices.recoverycompass`
**App Name:** Recovery Compass

## Installed Packages

### Core Capacitor Packages
- `@capacitor/core` - Core runtime
- `@capacitor/cli` - CLI tools
- `@capacitor/ios` - iOS platform

### Plugins
- `@capacitor/keyboard` - Keyboard height tracking and events
- `@capacitor/splash-screen` - Native splash screen control
- `@capacitor/status-bar` - Status bar styling
- `@capacitor/push-notifications` - Push notification support
- `@capacitor/app` - App lifecycle and deep linking

## Project Structure

```
/Index/pir-portal/
├── capacitor.config.ts     # Capacitor configuration
├── ios/                    # iOS native project (auto-generated)
│   └── App/
│       └── App/
│           ├── Info.plist  # iOS app configuration
│           └── public/     # Web assets (copied on sync)
├── src/
│   ├── hooks/
│   │   └── useCapacitor.ts # iOS-specific React hook
│   └── styles/
│       └── globals.css     # iOS safe area and native CSS fixes
└── dist/                   # Built web assets
```

## Configuration

### capacitor.config.ts

Key settings:
- **webDir:** `dist` - Points to Vite build output
- **contentInset:** `automatic` - Handles safe areas automatically
- **SplashScreen:** 2000ms duration, teal background (#069494)
- **Keyboard:** `resize: 'body'` - Adjusts layout for keyboard
- **StatusBar:** Light style on teal background

### Info.plist Entries

- **NSCameraUsageDescription** - Camera access for photo uploads
- **NSPhotoLibraryUsageDescription** - Photo library access
- **NSPhotoLibraryAddUsageDescription** - Save photos permission
- **UIBackgroundModes** - Background fetch and remote notifications
- **ITSAppUsesNonExemptEncryption** - Set to false (no custom encryption)

## NPM Scripts

```bash
# Sync web build to iOS project
npm run cap:sync

# Open Xcode
npm run cap:open

# Full build + sync for iOS
npm run ios:build

# Build, sync, and open Xcode
npm run ios:dev
```

## Development Workflow

### 1. Make changes to React app

Edit files in `/src/` as normal.

### 2. Build and sync to iOS

```bash
npm run ios:build
```

This:
1. Runs TypeScript compilation
2. Builds with Vite
3. Syncs to iOS project

### 3. Test in Xcode

```bash
npm run cap:open
```

Then in Xcode:
1. Select a simulator or connected device
2. Press Run (Cmd+R)

### 4. Live Reload (Development)

For faster iteration during development, uncomment in `capacitor.config.ts`:

```typescript
server: {
  url: 'http://YOUR_LOCAL_IP:5173',
  cleartext: true,
}
```

Then run `npm run dev` and the app will load from your local server.

## useCapacitor Hook

The `useCapacitor` hook provides:

```typescript
const {
  isNative,        // true when running as native iOS app
  isIOS,           // true when on iOS specifically
  keyboardHeight,  // Current keyboard height in pixels
  keyboardVisible, // Whether keyboard is showing
  hideSplash,      // Function to hide splash screen
  setStatusBarStyle, // Function to change status bar
} = useCapacitor()
```

### Usage Example

```tsx
import { useCapacitor } from '@/hooks'

function MyComponent() {
  const { isNative, keyboardVisible, keyboardHeight } = useCapacitor()

  return (
    <div style={{
      paddingBottom: keyboardVisible ? keyboardHeight : 0
    }}>
      {/* Content adjusts for keyboard */}
    </div>
  )
}
```

## CSS Safe Areas

### CSS Custom Properties

```css
:root {
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-inset-left: env(safe-area-inset-left, 0px);
  --safe-area-inset-right: env(safe-area-inset-right, 0px);
  --keyboard-height: 0px; /* Updated by useCapacitor */
}
```

### Utility Classes

```css
.safe-top     /* padding-top: env(safe-area-inset-top) */
.safe-bottom  /* padding-bottom: env(safe-area-inset-bottom) */
.pb-safe      /* padding-bottom: env(safe-area-inset-bottom) */
.pt-safe      /* padding-top: env(safe-area-inset-top) */
.p-safe       /* padding on all sides */

.ios-safe-area    /* All safe area padding */
.fixed-bottom-nav /* Safe area for bottom nav */
.fixed-top-header /* Safe area for header */
.keyboard-padding /* Animates with keyboard */
```

## iOS-Specific CSS Fixes

The following CSS fixes are applied in `globals.css`:

1. **Input zoom prevention** - Font size 16px minimum
2. **Momentum scrolling** - `-webkit-overflow-scrolling: touch`
3. **Form appearance reset** - Removes default iOS styling
4. **Caret color** - Uses primary teal color
5. **Status bar padding** - For standalone PWA mode
6. **Button text rendering** - Antialiased for clarity

## Building for App Store

### 1. Update version numbers

In Xcode:
- Select App target > General
- Update Version (e.g., 1.0.0)
- Update Build (e.g., 1)

### 2. Create archive

```bash
npm run ios:build
npm run cap:open
```

In Xcode:
1. Select "Any iOS Device" as target
2. Product > Archive
3. Distribute App > App Store Connect

### 3. Required assets

- **App Icons** - Place in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- **Splash Screen** - Configure in `ios/App/App/Assets.xcassets/Splash.imageset/`

## Troubleshooting

### White screen / JS Eval error (CRITICAL)

**Symptom:** App shows white screen with Xcode console error:
```
⚡️  JS Eval error A JavaScript exception occurred
TypeError: undefined is not an object (evaluating 'window.Capacitor.triggerEvent')
```

**Cause:** Capacitor plugins imported at top level before the Capacitor bridge is ready.

**Solution:** The `useCapacitor` hook uses dynamic imports to load plugins only after the bridge is initialized:

```typescript
// WRONG - causes white screen
import { Keyboard } from '@capacitor/keyboard' // Runs before bridge ready!

// CORRECT - dynamic import after bridge ready
const initCapacitor = async () => {
  if (!isCapacitorReady()) return
  const { Keyboard } = await import('@capacitor/keyboard')
  // Now safe to use
}
```

**Fix applied:** Dec 2025 - Rewrote `useCapacitor.ts` with:
- `isCapacitorReady()` check before any Capacitor usage
- Dynamic imports for all plugins inside useEffect
- 100ms delay to ensure bridge is ready
- Graceful fallback to browser mode if Capacitor unavailable

### "No bundle URL present" error
- Run `npm run ios:build` to sync web assets

### Keyboard covers input
- Use `useCapacitor().keyboardHeight` to add padding
- Or use `.keyboard-padding` CSS class

### Status bar text not visible
- Check `StatusBar.setStyle()` matches your header background

### Safe areas not working
- Ensure `viewport-fit=cover` in index.html meta tag
- Use CSS `env()` functions for safe area values

## Files Modified

| File | Changes |
|------|---------|
| `capacitor.config.ts` | Created - Capacitor configuration |
| `ios/App/App/Info.plist` | Modified - Added permissions and settings |
| `src/hooks/useCapacitor.ts` | Created - Native platform hook |
| `src/hooks/index.ts` | Modified - Added useCapacitor export |
| `src/styles/globals.css` | Modified - Added iOS CSS fixes |
| `package.json` | Modified - Added iOS build scripts |

## Next Steps

1. **Add app icons** - Generate all required sizes for App Store
2. **Configure splash screen** - Add branded splash image
3. **Test on real device** - Verify all features work
4. **Configure signing** - Add Apple Developer certificates in Xcode
5. **Submit to App Store** - Create listing and upload build
