#!/bin/bash
echo "🚀 Deploying to Firebase..."
firebase deploy
echo "⏳ Waiting 30 seconds..."
sleep 30
echo "🧪 Running tests..."
npx playwright test
