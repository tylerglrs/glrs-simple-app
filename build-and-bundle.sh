#!/bin/bash
set -e

PROJECT_ROOT="/Users/tylerroberts/glrs-simple-app/Index"
cd "$PROJECT_ROOT"

echo "🚀 GLRS Build & Bundle Automation"
echo "=================================="

# Check dependencies
echo ""
echo "📦 Step 1: Checking dependencies..."
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npm not found. Install Node.js first."
    exit 1
fi

# Create directories
echo ""
echo "📁 Step 2: Creating directories..."
mkdir -p build/shared build/tabs build/modals build/components bundles

# Install if needed
if [ ! -d "../node_modules/@babel/cli" ]; then
    echo "📦 Installing dependencies..."
    cd ..
    npm install --save-dev @babel/cli @babel/preset-react esbuild
    cd Index
fi

# Pre-transpile JSX
echo ""
echo "⚙️  Step 3: Pre-transpiling JSX files..."
npx babel shared --out-dir build/shared --presets=@babel/preset-react
npx babel Home/HomeTab.js --out-file build/tabs/HomeTab.js --presets=@babel/preset-react
npx babel Journey/JourneyTab.js --out-file build/tabs/JourneyTab.js --presets=@babel/preset-react
npx babel Task/TasksTab.js --out-file build/tabs/TasksTab.js --presets=@babel/preset-react
npx babel Connect/CommunityTab.js --out-file build/tabs/CommunityTab.js --presets=@babel/preset-react
npx babel Resources/ResourcesTab.js --out-file build/tabs/ResourcesTab.js --presets=@babel/preset-react
npx babel Notifications/NotificationsTab.js --out-file build/tabs/NotificationsTab.js --presets=@babel/preset-react
npx babel Profile/ProfileTab.js --out-file build/tabs/ProfileTab.js --presets=@babel/preset-react
npx babel modals --out-dir build/modals --presets=@babel/preset-react
npx babel components --out-dir build/components --presets=@babel/preset-react
npx babel PIRapp.js --out-file build/PIRapp.js --presets=@babel/preset-react
npx babel InlineApp.js --out-file build/InlineApp.js --presets=@babel/preset-react

# Bundle with esbuild
echo ""
echo "📦 Step 4: Bundling into 11 optimized files..."

# Bundle 1: Core
echo "  → Creating core.min.js..."
cat shared/config.js shared/constants.js shared/helpers.js shared/firestore.js shared/storage.js shared/functions.js shared/auth.js > bundles/core.js
npx esbuild bundles/core.js --minify --outfile=bundles/core.min.js

# Bundle 2: Utils
echo "  → Creating utils.min.js..."
cat shared/utils.js shared/state.js shared/calculations.js shared/staticData.js > bundles/utils.js
npx esbuild bundles/utils.js --minify --outfile=bundles/utils.min.js

# Bundle 3: Data
echo "  → Creating data.min.js..."
cat shared/loaders.js shared/listeners.js shared/handlers.js > bundles/data.js
npx esbuild bundles/data.js --minify --outfile=bundles/data.min.js

# Bundle 4: Context
echo "  → Creating context.min.js..."
cat build/shared/AppContext.js build/shared/useAppInitialization.js shared/google.js > bundles/context.js
npx esbuild bundles/context.js --minify --outfile=bundles/context.min.js

# Bundle 5: Actions
echo "  → Creating actions.min.js..."
cat shared/assignmentActions.js shared/messagingActions.js shared/emergencyActions.js shared/exportActions.js shared/notificationActions.js shared/uiActions.js > bundles/actions.js
npx esbuild bundles/actions.js --minify --outfile=bundles/actions.min.js

# Bundle 6: Tabs
echo "  → Creating tabs.min.js..."
cat build/tabs/HomeTab.js build/tabs/JourneyTab.js build/tabs/TasksTab.js build/tabs/CommunityTab.js build/tabs/ResourcesTab.js build/tabs/NotificationsTab.js build/tabs/ProfileTab.js > bundles/tabs.js
npx esbuild bundles/tabs.js --minify --outfile=bundles/tabs.min.js

# Bundle 7: Modals
echo "  → Creating modals.min.js..."
cat build/shared/Modals.js build/modals/* > bundles/modals.js 2>/dev/null || true
npx esbuild bundles/modals.js --minify --outfile=bundles/modals.min.js

# Bundle 8: Components
echo "  → Creating components.min.js..."
cat build/components/* > bundles/components.js 2>/dev/null || true
npx esbuild bundles/components.js --minify --outfile=bundles/components.min.js

# Bundle 9: Utilities
echo "  → Creating utilities.min.js..."
cat shared/touchHandlers.js shared/patternDetection.js > bundles/utilities.js
npx esbuild bundles/utilities.js --minify --outfile=bundles/utilities.min.js

# Bundle 10: App
echo "  → Creating app.min.js..."
npx esbuild build/PIRapp.js --minify --outfile=bundles/app.min.js

# Bundle 11: InlineApp (entry point - App, LoginScreen, PDF exports, ReactDOM.render)
echo "  → Creating inline.min.js..."
npx esbuild build/InlineApp.js --minify --outfile=bundles/inline.min.js

# Report sizes
echo ""
echo "📊 Step 5: Bundle sizes:"
du -h bundles/*.min.js | sort -h
echo ""
TOTAL=$(du -ch bundles/*.min.js | grep total | awk '{print $1}')
echo "📦 Total bundle size: $TOTAL"

echo ""
echo "✅ Build & Bundle Complete!"
echo ""
echo "📁 Output location: Index/bundles/"
echo "📄 Files created:"
ls -1 bundles/*.min.js
echo ""
echo "🎯 Ready for Phase 5: Update index.html"
