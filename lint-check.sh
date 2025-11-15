#!/bin/bash

echo "🔍 LINTING ALL INDEX FILES..."
echo "================================"
echo ""

npx eslint Index/**/*.js --max-warnings 0 --format stylish 2>&1 | tee lint-results.txt

ERRORS=$(grep -c "error" lint-results.txt 2>/dev/null || echo "0")
WARNINGS=$(grep -c "warning" lint-results.txt 2>/dev/null || echo "0")

echo ""
echo "================================"
echo "📊 SUMMARY:"
echo "   Errors: $ERRORS"
echo "   Warnings: $WARNINGS"
echo ""

if [ "$ERRORS" != "0" ]; then
    echo "❌ FAILED - Fix errors above"
    exit 1
else
    echo "✅ PASSED - No errors found"
    exit 0
fi
