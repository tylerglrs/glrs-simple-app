#!/bin/bash

MAX_ITERATIONS=20
ITERATION=0
CLI_COMMAND="claude"  # Adjust if your CLI command is different

echo "🤖 FULLY AUTOMATED FIX LOOP"
echo "================================"
echo "This will automatically:"
echo "- Find errors"
echo "- Send to CLI"
echo "- Wait for CLI to finish"
echo "- Re-check"
echo "- Loop until clean"
echo ""
read -p "Press ENTER to start (Ctrl+C to stop)..."

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔄 ITERATION $ITERATION of $MAX_ITERATIONS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Run ESLint
    npx eslint Index/**/*.js --max-warnings 0 --format stylish > lint-results.txt 2>&1
    EXIT_CODE=$?
    ERROR_COUNT=$(grep -c "error" lint-results.txt 2>/dev/null || echo "0")
    
    # Check if clean
    if [ $EXIT_CODE -eq 0 ] && [ "$ERROR_COUNT" = "0" ]; then
        echo ""
        echo "🎉🎉🎉 SUCCESS! ALL FILES CLEAN! 🎉🎉🎉"
        echo ""
        echo "Ready to deploy!"
        exit 0
    fi
    
    # Extract first error
    FIRST_ERROR=$(grep -m 1 "error" lint-results.txt)
    ERROR_FILE=$(echo "$FIRST_ERROR" | awk '{print $1}')
    ERROR_LINE=$(echo "$FIRST_ERROR" | awk -F: '{print $2}')
    ERROR_MSG=$(echo "$FIRST_ERROR" | cut -d' ' -f4-)
    
    echo "📍 Found error in: $ERROR_FILE:$ERROR_LINE"
    echo "📝 Error: $ERROR_MSG"
    echo ""
    echo "🤖 Sending to CLI..."
    
    # Send to CLI automatically
    echo "Fix this ESLint syntax error in $ERROR_FILE at line $ERROR_LINE: $ERROR_MSG. Only fix this one error, do not make any other changes. Respond with 'Fixed' when done." | $CLI_COMMAND
    
    echo ""
    echo "⏳ Waiting 10 seconds for CLI to process..."
    sleep 10
    
    echo "🔍 Re-checking..."
    sleep 2
done

echo ""
echo "⚠️  Reached max iterations ($MAX_ITERATIONS)"
echo "Check lint-results.txt for remaining errors"
exit 1
