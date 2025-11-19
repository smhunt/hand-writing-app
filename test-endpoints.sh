#!/bin/bash

echo "=== Testing Handwriting App Endpoints ==="
echo

# Colors for output
GREEN='\033[0.32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5001"

# Test 1: Health check
echo "1. Testing health endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" $BASE_URL/api/health)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed (HTTP $HTTP_CODE)${NC}"
fi
echo

# Test 2: Template download
echo "2. Testing template download..."
HTTP_CODE=$(curl -s -o /tmp/test-template.pdf -w "%{http_code}" $BASE_URL/api/template)
if [ "$HTTP_CODE" = "200" ] && [ -f "/tmp/test-template.pdf" ]; then
    FILE_SIZE=$(wc -c < /tmp/test-template.pdf)
    echo -e "${GREEN}✓ Template download passed (${FILE_SIZE} bytes)${NC}"
else
    echo -e "${RED}✗ Template download failed (HTTP $HTTP_CODE)${NC}"
fi
echo

# Test 3: Profile endpoint
echo "3. Testing profile endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" -b /tmp/cookies.txt -c /tmp/cookies.txt $BASE_URL/api/profile)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)
if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q "username"; then
    echo -e "${GREEN}✓ Profile endpoint passed${NC}"
    echo "  User: $(echo $BODY | grep -o '"username":"[^"]*"')"
else
    echo -e "${RED}✗ Profile endpoint failed (HTTP $HTTP_CODE)${NC}"
fi
echo

# Test 4: Font info endpoint
echo "4. Testing font info endpoint..."
HTTP_CODE=$(curl -s -w "%{http_code}" -o /dev/null -b /tmp/cookies.txt $BASE_URL/api/font/info)
if [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Font info endpoint accessible (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}✗ Font info endpoint failed (HTTP $HTTP_CODE)${NC}"
fi
echo

echo "=== Test Summary ==="
echo "All critical endpoints tested"
echo "Backend is running on $BASE_URL"
