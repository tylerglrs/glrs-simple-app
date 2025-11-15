#!/bin/bash

echo "🔍 Validating script load order..."

INDEX_HTML="/Users/tylerroberts/glrs-simple-app/Index/index.html"
ERRORS=0

# Define critical load order rules
declare -A MUST_LOAD_BEFORE

MUST_LOAD_BEFORE["config.js"]="constants.js,helpers.js,auth.js,utils.js,state.js"
MUST_LOAD_BEFORE["auth.js"]="handlers.js,loaders.js"
MUST_LOAD_BEFORE["utils.js"]="handlers.js,loaders.js"
MUST_LOAD_BEFORE["handlers.js"]="AppContext.js"
MUST_LOAD_BEFORE["loaders.js"]="AppContext.js"
MUST_LOAD_BEFORE["AppContext.js"]="PIRapp.js"

# Extract script order from index.html
SCRIPT_ORDER=$(grep -o 'src="/Index/[^"]*"' "$INDEX_HTML" 2>/dev/null | sed 's|src="/Index/||g' | sed 's|"||g')

echo "Checking dependency order..."

for file in "${!MUST_LOAD_BEFORE[@]}"; do
    dependencies="${MUST_LOAD_BEFORE[$file]}"
    
    # Get line number of file
    file_line=$(echo "$SCRIPT_ORDER" | grep -n "$file" | cut -d: -f1 | head -1)
    
    if [ -z "$file_line" ]; then
        continue
    fi
    
    IFS=',' read -ra DEPS <<< "$dependencies"
    for dep in "${DEPS[@]}"; do
        dep_line=$(echo "$SCRIPT_ORDER" | grep -n "$dep" | cut -d: -f1 | head -1)
        
        if [ ! -z "$dep_line" ] && [ $dep_line -lt $file_line ]; then
            echo "❌ ORDER VIOLATION: $file (line $file_line) loads before its dependency $dep (line $dep_line)"
            ERRORS=$((ERRORS + 1))
        fi
    done
done

if [ $ERRORS -gt 0 ]; then
    echo ""
    echo "❌ Validation failed: $ERRORS load order violation(s)"
    exit 1
else
    echo "✅ Load order validation passed"
    exit 0
fi
