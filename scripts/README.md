# Hermes Command Dashboard — Termux Agent

## Quick Start

```bash
# 1. Set your Convex deployment URL
export CONVEX_URL="https://your-deployment.convex.cloud"

# 2. (Optional) Set your device ID
export DEVICE_ID="hermes-primary"

# 3. Run the installer
bash scripts/hermes-dashboard-setup.sh

# 4. Start the agent
bash ~/.hermes-dashboard/start.sh
```

## What Gets Installed

All files go into `~/.hermes-dashboard/`:

| Script | Purpose | Frequency |
|--------|---------|-----------|
| `collect-device.sh` | Battery, CPU, memory, storage, network, uptime | Every 30s |
| `check-models.sh` | AI model health, latency, rate limits | Every 5 min |
| `log-activity.sh` | Log agent events (call from Hermes hooks) | On demand |
| `poll-commands.sh` | Poll Convex for remote commands | Every 15s |
| `agent-loop.sh` | Main loop that runs everything | Continuous |

## Usage

```bash
# Start the monitoring agent in background
bash ~/.hermes-dashboard/start.sh

# Check status
bash ~/.hermes-dashboard/status.sh

# View logs
tail -f ~/.hermes-dashboard/agent.log

# Stop the agent
bash ~/.hermes-dashboard/stop.sh
```

## Log Agent Activity from Hermes

Add these calls to your Hermes agent's hooks or cron jobs:

```bash
# Log a skill execution
bash ~/.hermes-dashboard/log-activity.sh skill_used "Weather skill" "London, UK"

# Log a message handled
bash ~/.hermes-dashboard/log-activity.sh message_handled "Telegram msg from user123"

# Log an error
bash ~/.hermes-dashboard/log-activity.sh error "API timeout" "OpenAI connection failed"

# Log startup/shutdown
bash ~/.hermes-dashboard/log-activity.sh startup "Hermes agent started"
bash ~/.hermes-dashboard/log-activity.sh shutdown "Hermes agent stopping"
```

## Telegram Mini App Setup

To add the dashboard as a Telegram Mini App in your bot:

1. Open BotFather in Telegram
2. Use `/setmenubutton` or `/newapp` to create a Mini App
3. Set the Web App URL to your dashboard URL (e.g. `https://your-app.convex.site`)
4. Users can now access the dashboard directly from your bot

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CONVEX_URL` | (required) | Your Convex deployment URL |
| `DEVICE_ID` | `hermes-primary` | Unique identifier for this device |
| `POLL_INTERVAL` | `30` | Seconds between telemetry posts |
| `HERMES_DIR` | `$HOME/hermes` | Path to your Hermes installation |
