# Real-Time Monitoring

This document explains how to monitor Claude Code agent activity in real-time.

## Quick Start

In a separate terminal window, run:

```bash
./scripts/watch-progress.sh
```

This will display a live feed of all agent activities, color-coded by type:
- 🟢 **Green** - Task starts
- 🔵 **Blue** - Task completions
- 🟡 **Yellow** - Progress updates
- 🔴 **Red** - Errors or issues

## Activity Log

All agent activities are logged to:
```
.claude/logs/activity.log
```

You can also tail this directly:
```bash
tail -f .claude/logs/activity.log
```

## Status API

For programmatic access, check:
```
.claude/logs/status.json
```

This JSON file is updated with each activity and contains:
- `timestamp` - When the activity occurred
- `level` - Activity type (START, PROGRESS, COMPLETE, ERROR, INFO)
- `message` - Description of the activity
- `lastUpdate` - ISO 8601 timestamp

### Example status.json
```json
{
  "timestamp": "2025-11-17 14:23:45",
  "level": "PROGRESS",
  "message": "Installing Tailwind CSS dependencies...",
  "lastUpdate": "2025-11-17T14:23:45Z"
}
```

## Manual Logging

Agents can log activities using:

```bash
./scripts/log-activity.sh "Your message here" "LEVEL"
```

Levels:
- `START` - Beginning a new task
- `PROGRESS` - Working on a task
- `COMPLETE` - Finished a task
- `ERROR` - Error occurred
- `INFO` - General information

## Integration with TodoWrite

The monitoring system is designed to work alongside TodoWrite. When agents:
1. Start a task → TodoWrite sets status to `in_progress` + Log with `START`
2. Make progress → Log with `PROGRESS`
3. Complete task → TodoWrite sets status to `completed` + Log with `COMPLETE`

## Multi-Agent Coordination

When multiple agents are working:
- Each agent logs to the same activity.log
- All activities appear in chronological order
- Status.json shows the most recent activity across all agents

## Watching Specific Tasks

To filter for specific tasks:

```bash
tail -f .claude/logs/activity.log | grep "Tailwind"
```

Or watch for errors only:
```bash
tail -f .claude/logs/activity.log | grep "\[ERROR\]"
```

## Dashboard (Future Enhancement)

Consider building a web dashboard that:
- Displays real-time activity feed
- Shows current todo list status
- Visualizes agent progress
- Provides task history

This could be a simple Express server serving:
- WebSocket for real-time updates
- REST API for status queries
- Simple HTML frontend

## Example Usage

**Terminal 1: Claude Code**
```
User: Add Tailwind CSS
Agent: I'll add Tailwind CSS to the frontend...
```

**Terminal 2: Monitor**
```bash
./scripts/watch-progress.sh

📡 Monitoring agent activity...

[14:23:42] [START] Beginning task: Add Tailwind CSS
[14:23:45] [PROGRESS] Installing Tailwind CSS dependencies...
[14:23:58] [PROGRESS] Configuring tailwind.config.js...
[14:24:12] [PROGRESS] Converting components to Tailwind classes...
[14:24:45] [COMPLETE] Tailwind CSS integration complete
```

## Troubleshooting

**No output appearing:**
- Check that agents are using the logging script
- Verify log file exists: `ls -la .claude/logs/`
- Try manually writing to log: `echo "test" >> .claude/logs/activity.log`

**Watch script not working:**
- Make executable: `chmod +x scripts/watch-progress.sh`
- Check bash is available: `which bash`
- Try running tail directly: `tail -f .claude/logs/activity.log`

**Colors not showing:**
- Your terminal might not support ANSI colors
- Try running without color: `tail -f .claude/logs/activity.log`
