#!/bin/bash

MAX_ITERATIONS=10
ITERATION=0

echo "🤖 AUTOMATED LINT FIX LOOP"
echo "================================"
echo ""
echo "This script will:"
echo "1. Run ESLint to find errors"
echo "2. Show you the error message for CLI"
echo "3. Wait for you to tell CLI to fix it"
echo "4. Repeat until clean or max iterations"
echo ""
read -p "Press ENTER to start..."

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔄 ITERATION $ITERATION of $MAX_ITERATIONS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Run ESLint and capture output
    npx eslint Index/**/*.js --max-warnings 0 --format stylish > lint-results.txt 2>&1
    EXIT_CODE=$?
    
    # Show results
    cat lint-results.txt
    
    # Count errors
    ERROR_COUNT=$(grep -c "error" lint-results.txt 2>/dev/null || echo "0")
    
    if [ $EXIT_CODE -eq 0 ] && [ "$ERROR_COUNT" = "0" ]; then
        echo ""
        echo "✅ ✅ ✅ SUCCESS! NO ERRORS FOUND! ✅ ✅ ✅"
        echo ""
        echo "All files are clean. Ready to deploy!"
        exit 0
    fi
    
    # Extract first error for CLI
    FIRST_ERROR=$(grep -m 1 "error" lint-results.txt)
    ERROR_FILE=$(echo "$FIRST_ERROR" | awk '{print $1}')
    ERROR_LINE=$(echo "$FIRST_ERROR" | awk -F: '{print $2}')
    ERROR_MSG=$(echo "$FIRST_ERROR" | cut -d' ' -f4-)
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 COPY THIS MESSAGE TO CLI:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Fix this ESLint error:"
    echo ""
    echo "File: $ERROR_FILE"
    echo "Line: $ERROR_LINE"
    echo "Error: $ERROR_MSG"
    echo ""
    echo "Go to line $ERROR_LINE in $ERROR_FILE and fix the syntax error."
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Wait for user confirmation
    echo "After CLI fixes the error:"
    read -p "Press ENTER to run next check (or Ctrl+C to stop)..."
done

echo ""
echo "⚠️  REACHED MAX ITERATIONS ($MAX_ITERATIONS)"
echo "Still have errors. Check lint-results.txt for details."
exit 1
