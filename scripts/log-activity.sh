#!/bin/bash

# Helper script to log agent activities
# Usage: ./scripts/log-activity.sh "MESSAGE" [LEVEL]

MESSAGE="$1"
LEVEL="${2:-INFO}"
LOG_FILE=".claude/logs/activity.log"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Get timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Write to log
echo "[$LEVEL] $TIMESTAMP - $MESSAGE" >> "$LOG_FILE"

# Also update status JSON for programmatic access
STATUS_FILE=".claude/logs/status.json"
cat > "$STATUS_FILE" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "level": "$LEVEL",
  "message": "$MESSAGE",
  "lastUpdate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
