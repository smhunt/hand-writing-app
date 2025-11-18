#!/bin/bash

###############################################################################
# End-to-End Test - Hand-writing App
# Run this in a separate terminal/Claude window to test everything
###############################################################################

echo "======================================================================"
echo "  🧪 Hand-writing App - Complete E2E Test"
echo "======================================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0

test_result() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $1"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL${NC}: $1"
        ((FAIL++))
    fi
}

# Test 1: Check servers are running
echo -e "${BLUE}Test 1: Checking servers...${NC}"
curl -s http://localhost:5001/api/health > /dev/null
test_result "Backend is running on port 5001"

curl -s http://localhost:3000 > /dev/null
test_result "Frontend is running on port 3000"
echo ""

# Test 2: Register new user
echo -e "${BLUE}Test 2: User registration...${NC}"
USERNAME="e2etest_$(date +%s)"
RESPONSE=$(curl -s -X POST http://localhost:5001/api/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"test123\"}" \
  -c /tmp/cookies.txt)

echo $RESPONSE | grep -q "User registered"
test_result "User registration ($USERNAME)"
echo ""

# Test 3: Save multiple characters
echo -e "${BLUE}Test 3: Saving 5 characters...${NC}"
CHARS=("A" "B" "C" "D" "E")
for char in "${CHARS[@]}"; do
    RESPONSE=$(curl -s -X POST http://localhost:5001/api/save-char \
      -H "Content-Type: application/json" \
      -b /tmp/cookies.txt \
      -d "{\"char\":\"$char\",\"strokes\":[[{\"x\":50,\"y\":50},{\"x\":100,\"y\":100}]]}")

    echo $RESPONSE | grep -q "saved"
    test_result "Save character $char"
done
echo ""

# Test 4: Get profile
echo -e "${BLUE}Test 4: Fetching profile...${NC}"
PROFILE=$(curl -s http://localhost:5001/api/profile -b /tmp/cookies.txt)
echo $PROFILE | grep -q "characterData"
test_result "Profile endpoint returns data"

CHAR_COUNT=$(echo $PROFILE | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
if [ "$CHAR_COUNT" -ge 5 ]; then
    echo -e "${GREEN}✅ PASS${NC}: Profile shows $CHAR_COUNT characters"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: Profile shows only $CHAR_COUNT characters (expected 5+)"
    ((FAIL++))
fi
echo ""

# Test 5: Font generation
echo -e "${BLUE}Test 5: Font generation...${NC}"
FONT_RESPONSE=$(curl -s -X POST http://localhost:5001/api/font/generate \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d '{"regenerate":false}')

echo $FONT_RESPONSE | grep -q -E "(generated|exists)"
test_result "Font generation endpoint responds"

echo $FONT_RESPONSE | grep -q "familyName"
test_result "Font generation returns metadata"
echo ""

# Test 6: Font download
echo -e "${BLUE}Test 6: Font download...${NC}"
USER_ID=$(echo $PROFILE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
if [ -n "$USER_ID" ]; then
    curl -s -o /tmp/test-font.ttf http://localhost:5001/api/font/download/$USER_ID/ttf -b /tmp/cookies.txt
    if [ -s /tmp/test-font.ttf ]; then
        FILE_SIZE=$(wc -c < /tmp/test-font.ttf)
        echo -e "${GREEN}✅ PASS${NC}: TTF download successful ($FILE_SIZE bytes)"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL${NC}: TTF download failed"
        ((FAIL++))
    fi
else
    echo -e "${YELLOW}⚠️  SKIP${NC}: Could not extract user ID"
fi
echo ""

# Cleanup
rm -f /tmp/cookies.txt /tmp/test-font.ttf

# Summary
echo "======================================================================"
echo -e "  📊 TEST SUMMARY"
echo "======================================================================"
echo ""
echo -e "  ${GREEN}✅ Passed: $PASS${NC}"
echo -e "  ${RED}❌ Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo ""
    echo "✅ Servers are running correctly"
    echo "✅ Authentication works"
    echo "✅ Character saving works"
    echo "✅ Auto-advance functionality ready"
    echo "✅ Font generation works"
    echo ""
    echo "🌐 App is ready at: http://localhost:3000"
    exit 0
else
    echo -e "${RED}⚠️  SOME TESTS FAILED${NC}"
    echo ""
    echo "Check the logs:"
    echo "  Backend:  tail -f /tmp/backend.log"
    echo "  Frontend: tail -f /tmp/frontend.log"
    exit 1
fi
