#!/bin/bash

echo "🔍 Validating script file references..."

INDEX_HTML="/Users/tylerroberts/glrs-simple-app/Index/index.html"
PROJECT_ROOT="/Users/tylerroberts/glrs-simple-app/Index"
ERRORS=0

# Extract all script src paths
echo "Scanning index.html for script tags..."
SCRIPTS=$(grep -o 'src="[^"]*"' "$INDEX_HTML" 2>/dev/null | sed 's/src="//g' | sed 's/"//g' | grep "^/Index")

while IFS= read -r script; do
    if [ -z "$script" ]; then
        continue
    fi
    
    # Convert /Index/... to actual path
    ACTUAL_PATH=$(echo "$script" | sed "s|^/Index|$PROJECT_ROOT|")
    
    if [ ! -f "$ACTUAL_PATH" ]; then
        echo "❌ MISSING FILE: $script"
        echo "   Expected at: $ACTUAL_PATH"
        ERRORS=$((ERRORS + 1))
    fi
done <<< "$SCRIPTS"

if [ $ERRORS -gt 0 ]; then
    echo ""
    echo "❌ Validation failed: $ERRORS missing file(s)"
    exit 1
else
    echo "✅ All script references valid"
    exit 0
fi
