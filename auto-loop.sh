#!/bin/bash
for i in {1..25}; do
  echo "━━━ ITERATION $i/25 ━━━"
  firebase deploy --only hosting --non-interactive
  sleep 90
  node test-console-errors.js
  if [ $? -eq 0 ]; then
    echo "✅ SUCCESS!"
    exit 0
  fi
  echo "📋 Errors in errors.json - CLI will fix"
  read -p "Press ENTER after fixes: "
done
