#!/bin/bash

echo "🤖 Starting autonomous error detection and fixing loop..."
echo ""

MAX_ITERATIONS=25
iteration=0

while [ $iteration -lt $MAX_ITERATIONS ]; do
  iteration=$((iteration + 1))
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔄 ITERATION $iteration of $MAX_ITERATIONS"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  
  echo "📦 Deploying to Firebase..."
  firebase deploy --only hosting --non-interactive
  
  echo ""
  echo "⏳ Waiting 90 seconds for deployment..."
  sleep 90
  
  echo ""
  echo "🧪 Running error detection test..."
  node test-and-save-errors.js
  
  if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ SUCCESS! No errors found!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 0
  fi
  
  echo ""
  echo "📝 Errors detected. Preparing fix instructions for CLI..."
  echo ""
  echo "ERRORS FOUND - SEE errors.json" > cli-instructions.txt
  echo "Please read errors.json and fix all errors in index.html" >> cli-instructions.txt
  cat errors.json >> cli-instructions.txt
  
  echo "⚠️  CLI: Please fix the errors listed in errors.json"
  echo "⚠️  Then this script will deploy and test again..."
  echo ""
  echo "Press ENTER after CLI has fixed the errors (or Ctrl+C to stop)"
  read -r
  
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  Reached maximum iterations ($MAX_ITERATIONS)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
