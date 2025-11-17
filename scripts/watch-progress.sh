#!/bin/bash

# Watch Progress - Real-time activity monitor for Claude Code agents
# Run this in a separate terminal to see live updates

LOG_FILE=".claude/logs/activity.log"
STATUS_FILE=".claude/logs/status.json"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

clear
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Claude Code - Real-Time Activity Monitor          ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${YELLOW}📡 Monitoring agent activity...${NC}"
echo -e "${YELLOW}📂 Log file: $LOG_FILE${NC}"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create log file if it doesn't exist
touch "$LOG_FILE"

# Watch the log file with color coding
tail -f "$LOG_FILE" | while read line; do
    timestamp=$(date '+%H:%M:%S')

    if [[ $line == *"[START]"* ]]; then
        echo -e "${GREEN}[$timestamp] $line${NC}"
    elif [[ $line == *"[COMPLETE]"* ]]; then
        echo -e "${BLUE}[$timestamp] $line${NC}"
    elif [[ $line == *"[ERROR]"* ]]; then
        echo -e "${RED}[$timestamp] $line${NC}"
    elif [[ $line == *"[PROGRESS]"* ]]; then
        echo -e "${YELLOW}[$timestamp] $line${NC}"
    elif [[ $line == *"[INFO]"* ]]; then
        echo -e "[$timestamp] $line"
    else
        echo -e "[$timestamp] $line"
    fi
done
