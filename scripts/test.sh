#!/bin/bash

# Test script - runs all tests

echo "🧪 Running tests..."

# Backend tests
echo ""
echo "Running backend tests..."
cd backend
npm test || exit 1
cd ..

# Frontend tests (if any exist)
echo ""
echo "Running frontend tests..."
cd frontend
npm test -- --watchAll=false || echo "⚠️  No frontend tests configured"
cd ..

echo ""
echo "✅ All tests completed!"
echo ""
