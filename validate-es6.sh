#!/bin/bash

echo "🔍 Validating ES6 module syntax..."

PROJECT_ROOT="/Users/tylerroberts/glrs-simple-app/Index"
ERRORS=0

# Search for ES6 export statements
echo "Scanning for ES6 export statements..."
EXPORTS=$(grep -rn "^\s*export\s\+\(const\|function\|default\|class\)" "$PROJECT_ROOT" --include="*.js" 2>/dev/null | grep -v node_modules | grep -v build)

if [ ! -z "$EXPORTS" ]; then
    echo "❌ ES6 EXPORTS FOUND (not supported in browser without build tools):"
    echo ""
    echo "$EXPORTS"
    echo ""
    ERRORS=$((ERRORS + 1))
else
    echo "✅ No ES6 export statements found"
fi

# Search for ES6 import statements
echo "Scanning for ES6 import statements..."
IMPORTS=$(grep -rn "^\s*import\s" "$PROJECT_ROOT" --include="*.js" 2>/dev/null | grep -v node_modules | grep -v build | grep -v "//")

if [ ! -z "$IMPORTS" ]; then
    echo "❌ ES6 IMPORTS FOUND (not supported in browser without build tools):"
    echo ""
    echo "$IMPORTS"
    echo ""
    ERRORS=$((ERRORS + 1))
else
    echo "✅ No ES6 import statements found"
fi

if [ $ERRORS -gt 0 ]; then
    echo "❌ Validation failed: ES6 module syntax detected"
    exit 1
else
    echo "✅ ES6 validation passed"
    exit 0
fi
