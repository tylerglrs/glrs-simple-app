#!/bin/bash

echo "🚀 Running all validations..."
echo "=============================="
echo ""

SCRIPT_DIR="/Users/tylerroberts/glrs-simple-app"
FAILED=0

# Run each validator
bash "$SCRIPT_DIR/validate-namespaces.sh"
if [ $? -ne 0 ]; then FAILED=$((FAILED + 1)); fi
echo ""

bash "$SCRIPT_DIR/validate-es6.sh"
if [ $? -ne 0 ]; then FAILED=$((FAILED + 1)); fi
echo ""

bash "$SCRIPT_DIR/validate-file-refs.sh"
if [ $? -ne 0 ]; then FAILED=$((FAILED + 1)); fi
echo ""

bash "$SCRIPT_DIR/validate-load-order.sh"
if [ $? -ne 0 ]; then FAILED=$((FAILED + 1)); fi
echo ""

echo "=============================="
if [ $FAILED -eq 0 ]; then
    echo "✅ ALL VALIDATIONS PASSED"
    exit 0
else
    echo "❌ $FAILED VALIDATION(S) FAILED"
    exit 1
fi
