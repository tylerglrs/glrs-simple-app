#!/bin/bash

MAX_ITERATIONS=20
ITERATION=0

echo "🤖 FILE-BASED AUTOMATED FIX"
echo "============================"
echo ""
echo "Make sure CLI is watching CLI_TASK.txt in Terminal 1"
echo ""
read -p "Press ENTER to start..."

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))
    
    echo ""
    echo "🔄 Iteration $ITERATION of $MAX_ITERATIONS"
    
    # Run lint
    npx eslint Index/**/*.js --max-warnings 0 --format stylish > lint-results.txt 2>&1
    EXIT_CODE=$?
    ERROR_COUNT=$(grep -c "error" lint-results.txt 2>/dev/null || echo "0")
    
    if [ $EXIT_CODE -eq 0 ] && [ "$ERROR_COUNT" = "0" ]; then
        echo "✅ ALL CLEAN!"
        rm -f CLI_TASK.txt
        exit 0
    fi
    
    # Extract first error
    FIRST_ERROR=$(grep -m 1 "error" lint-results.txt)
    ERROR_FILE=$(echo "$FIRST_ERROR" | awk '{print $1}')
    ERROR_LINE=$(echo "$FIRST_ERROR" | awk -F: '{print $2}')
    ERROR_MSG=$(echo "$FIRST_ERROR" | cut -d' ' -f4-)
    
    # Write task file
    cat > CLI_TASK.txt << ENDTASK
Fix ESLint syntax error at line $ERROR_LINE in $ERROR_FILE: $ERROR_MSG

Only fix this one error. Save the file. Delete CLI_TASK.txt when done.
ENDTASK
    
    echo "📝 Task written to CLI_TASK.txt"
    cat CLI_TASK.txt
    echo ""
    echo "⏳ Waiting 20 seconds for CLI to process..."
    sleep 20
    echo "🔍 Re-checking..."
done

echo "⚠️ Max iterations reached"
exit 1
