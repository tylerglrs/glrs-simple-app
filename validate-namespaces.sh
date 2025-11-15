#!/bin/bash

echo "🔍 Validating namespace assignments..."

PROJECT_ROOT="/Users/tylerroberts/glrs-simple-app/Index"
ERRORS=0

# Scan for window.GLRSApp assignments
echo "Scanning for window.GLRSApp.* assignments..."

# Extract all assignments
ASSIGNMENTS=$(grep -rn "window\.GLRSApp\.[a-zA-Z_][a-zA-Z0-9_]*\s*=" "$PROJECT_ROOT" --include="*.js" 2>/dev/null | grep -v "^//" | grep -v "^\s*/\*")

# Check for duplicates
DUPLICATES=$(echo "$ASSIGNMENTS" | awk -F':' '{print $3}' | awk -F'=' '{print $1}' | sed 's/window\.GLRSApp\.//g' | sed 's/[[:space:]]//g' | sort | uniq -d)

if [ ! -z "$DUPLICATES" ]; then
    echo "❌ COLLISIONS DETECTED:"
    echo ""
    while IFS= read -r prop; do
        echo "  Property: window.GLRSApp.$prop"
        echo "  Assigned in:"
        grep -rn "window\.GLRSApp\.$prop\s*=" "$PROJECT_ROOT" --include="*.js" 2>/dev/null | while IFS= read -r line; do
            echo "    $line"
        done
        echo ""
        ERRORS=$((ERRORS + 1))
    done <<< "$DUPLICATES"
else
    echo "✅ No namespace collisions detected"
fi

if [ $ERRORS -gt 0 ]; then
    echo "❌ Validation failed: $ERRORS collision(s) found"
    exit 1
else
    echo "✅ Namespace validation passed"
    exit 0
fi
