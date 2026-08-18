#!/bin/bash
# ══════════════════════════════════════════════════════════════════════
#  Hermes Command Dashboard — Termux Agent Setup
#  Installs device monitoring, model health tracking, and command polling
# ══════════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Configuration (edit these) ────────────────────────────────────────
CONVEX_URL="${CONVEX_URL:-}"          # Your Convex deployment URL (e.g. https://xxx.convex.cloud)
DEVICE_ID="${DEVICE_ID:-hermes-primary}"  # Unique device identifier
POLL_INTERVAL="${POLL_INTERVAL:-30}"      # Seconds between telemetry posts
HERMES_DIR="${HERMES_DIR:-$HOME/hermes}"  # Where Hermes agent lives
INSTALL_DIR="$HOME/.hermes-dashboard"

echo "╔══════════════════════════════════════════════════╗"
echo "║  Hermes Command Dashboard — Agent Setup          ║"
echo "╚══════════════════════════════════════════════════╝"

# ── Validate ──────────────────────────────────────────────────────────
if [ -z "$CONVEX_URL" ]; then
  echo "Error: Set CONVEX_URL environment variable first."
  echo "  export CONVEX_URL=https://your-deployment.convex.cloud"
  exit 1
fi

echo ""
echo "Configuration:"
echo "  Convex URL:    $CONVEX_URL"
echo "  Device ID:     $DEVICE_ID"
echo "  Poll Interval: ${POLL_INTERVAL}s"
echo "  Hermes Dir:    $HERMES_DIR"
echo "  Install Dir:   $INSTALL_DIR"
echo ""

# ── Install dependencies ──────────────────────────────────────────────
echo "Installing dependencies..."
pkg update -y 2>/dev/null || apt update -y
pkg install -y jq curl termux-api 2>/dev/null || true

mkdir -p "$INSTALL_DIR"

# ── Create device info collector script ────────────────────────────────
cat > "$INSTALL_DIR/collect-device.sh" << 'DEVICEEOF'
#!/bin/bash
# Collects device telemetry and posts to Convex API

CONVEX_URL="__CONVEX_URL__"
DEVICE_ID="__DEVICE_ID__"

collect_telemetry() {
  # Battery info (requires termux-api)
  BATTERY_INFO=$(termux-battery-status 2>/dev/null || echo '{"percentage":0,"status":"Unknown","temperature":0}')
  BATTERY_PCT=$(echo "$BATTERY_INFO" | jq -r '.percentage // 0')
  BATTERY_STATUS=$(echo "$BATTERY_INFO" | jq -r '.status // "Unknown"')
  BATTERY_TEMP=$(echo "$BATTERY_INFO" | jq -r '.temperature // 0')

  # CPU usage (average across cores)
  CPU_IDLE=$(top -bn1 2>/dev/null | grep "CPU:" | awk '{print $8}' | tr -d '%' || echo "100")
  CPU_IDLE=${CPU_IDLE:-100}
  CPU_USAGE=$(echo "100 - $CPU_IDLE" | bc 2>/dev/null || echo "0")

  # Number of CPU cores
  CPU_CORES=$(nproc 2>/dev/null || echo "1")

  # Memory info
  MEM_INFO=$(free -m 2>/dev/null | grep Mem || echo "Mem: 0 0 0 0 0 0")
  MEM_TOTAL=$(echo "$MEM_INFO" | awk '{print $2}')
  MEM_USED=$(echo "$MEM_INFO" | awk '{print $3}')
  if [ "$MEM_TOTAL" -gt 0 ] 2>/dev/null; then
    MEM_PCT=$(echo "scale=1; $MEM_USED * 100 / $MEM_TOTAL" | bc 2>/dev/null || echo "0")
  else
    MEM_PCT="0"
  fi

  # Storage info
  STORAGE_INFO=$(df -BM / 2>/dev/null | tail -1 || echo "/ 0M 0M 0M 0% /")
  STORAGE_TOTAL=$(echo "$STORAGE_INFO" | awk '{print $2}' | tr -d 'M')
  STORAGE_USED=$(echo "$STORAGE_INFO" | awk '{print $3}' | tr -d 'M')
  if [ "$STORAGE_TOTAL" -gt 0 ] 2>/dev/null; then
    STORAGE_PCT=$(echo "scale=1; $STORAGE_USED * 100 / $STORAGE_TOTAL" | bc 2>/dev/null || echo "0")
    STORAGE_TOTAL_GB=$(echo "scale=1; $STORAGE_TOTAL / 1024" | bc 2>/dev/null || echo "0")
    STORAGE_USED_GB=$(echo "scale=1; $STORAGE_USED / 1024" | bc 2>/dev/null || echo "0")
  else
    STORAGE_PCT="0"
    STORAGE_TOTAL_GB="0"
    STORAGE_USED_GB="0"
  fi

  # Uptime
  UPTIME_SECONDS=$(awk '{print int($1)}' /proc/uptime 2>/dev/null || echo "0")

  # Load average
  LOAD_AVG=$(cat /proc/loadavg 2>/dev/null | awk '{print $1","$2","$3}' || echo "0,0,0")
  IFS=',' read -ra LOAD_ARRAY <<< "$LOAD_AVG"

  # Hostname
  HOSTNAME=$(hostname 2>/dev/null || echo "unknown")

  # Network check
  NETWORK_UP="false"
  if ping -c 1 -W 2 8.8.8.8 >/dev/null 2>&1; then
    NETWORK_UP="true"
  fi

  # Post to Convex
  PAYLOAD=$(cat <<JSONEOF
{
  "deviceId": "$DEVICE_ID",
  "hostname": "$HOSTNAME",
  "batteryPercent": ${BATTERY_PCT:-0},
  "batteryStatus": "${BATTERY_STATUS:-Unknown}",
  "batteryTemp": ${BATTERY_TEMP:-0},
  "cpuUsagePercent": ${CPU_USAGE:-0},
  "cpuCores": ${CPU_CORES:-1},
  "memUsedMb": ${MEM_USED:-0},
  "memTotalMb": ${MEM_TOTAL:-0},
  "memUsagePercent": ${MEM_PCT:-0},
  "storageUsedGb": ${STORAGE_USED_GB:-0},
  "storageTotalGb": ${STORAGE_TOTAL_GB:-0},
  "storageUsagePercent": ${STORAGE_PCT:-0},
  "uptimeSeconds": ${UPTIME_SECONDS:-0},
  "loadAvg": [${LOAD_ARRAY[0]:-0}, ${LOAD_ARRAY[1]:-0}, ${LOAD_ARRAY[2]:-0}],
  "networkUp": $NETWORK_UP
}
JSONEOF
)

  curl -s -X POST "$CONVEX_URL/api/telemetry" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" >/dev/null 2>&1
}

collect_telemetry
DEVICEEOF

sed -i "s|__CONVEX_URL__|$CONVEX_URL|g" "$INSTALL_DIR/collect-device.sh"
sed -i "s|__DEVICE_ID__|$DEVICE_ID|g" "$INSTALL_DIR/collect-device.sh"
chmod +x "$INSTALL_DIR/collect-device.sh"

# ── Create model health checker script ─────────────────────────────────
cat > "$INSTALL_DIR/check-models.sh" << 'MODELSEOF'
#!/bin/bash
# Checks Hermes model providers and reports health to Convex

CONVEX_URL="__CONVEX_URL__"
DEVICE_ID="__DEVICE_ID__"
HERMES_DIR="__HERMES_DIR__"

# Try to find Hermes config or model list
HERMES_CONFIG="$HERMES_DIR/config.json"
HERMES_MODELS="$HERMES_DIR/models.json"

check_model() {
  local model_name="$1"
  local provider="$2"
  local api_url="$3"
  local api_key="$4"

  local start_time=$(date +%s%3N 2>/dev/null || date +%s)
  local status="unknown"
  local latency=""
  local error_msg=""

  # Simple health check — attempt a minimal request
  local response
  response=$(curl -s -w "\n%{http_code}" --max-time 10 "$api_url" 2>&1)
  local http_code=$(echo "$response" | tail -1)
  local end_time=$(date +%s%3N 2>/dev/null || date +%s)

  latency=$(( end_time - start_time ))

  case "$http_code" in
    200|201|400|401|403|404|422)
      status="healthy"
      ;;
    429)
      status="rate_limited"
      ;;
    503|502|504)
      status="cooldown"
      error_msg="Server unavailable (HTTP $http_code)"
      ;;
    *)
      status="error"
      error_msg="Connection failed (HTTP $http_code)"
      ;;
  esac

  # Post model health
  curl -s -X POST "$CONVEX_URL/api/model-health" \
    -H "Content-Type: application/json" \
    -d "{
      \"deviceId\": \"$DEVICE_ID\",
      \"modelName\": \"$model_name\",
      \"provider\": \"$provider\",
      \"latencyMs\": $latency,
      \"status\": \"$status\",
      \"lastError\": \"$error_msg\"
    }" >/dev/null 2>&1
}

# Default provider endpoints
DEFAULT_ENDPOINTS="openai|https://api.openai.com/v1/models
anthropic|https://api.anthropic.com/v1/messages
google|https://generativelanguage.googleapis.com/v1/models
mistral|https://api.mistral.ai/v1/models
groq|https://api.groq.com/openai/v1/models
together|https://api.together.xyz/v1/models";

# Try to detect models from Hermes config (supports multiple formats)
FOUND_MODELS=0

if [ -f "$HERMES_CONFIG" ]; then
  # Format 1: {"models": [{"name": "...", "provider": "...", "endpoint": "..."}]}
  cat "$HERMES_CONFIG" | jq -r '.models[]? | "\(.name)|\(.provider)|\(.endpoint // "")"' 2>/dev/null | \
  while IFS='|' read -r name provider endpoint; do
    if [ -n "$name" ] && [ -n "$provider" ]; then
      [ -z "$endpoint" ] && endpoint=$(echo "$DEFAULT_ENDPOINTS" | grep "^$provider|" | cut -d'|' -f2)
      [ -n "$endpoint" ] && check_model "$name" "$provider" "$endpoint" "" && FOUND_MODELS=$((FOUND_MODELS + 1))
    fi
  done

  # Format 2: {"providers": {"openai": {"models": ["gpt-4o", ...]}}}
  cat "$HERMES_CONFIG" | jq -r '.providers // empty | to_entries[] | .key as $p | .value.models[]? | "\(.)|\($p)|"' 2>/dev/null | \
  while IFS='|' read -r name provider endpoint; do
    if [ -n "$name" ] && [ -n "$provider" ]; then
      [ -z "$endpoint" ] && endpoint=$(echo "$DEFAULT_ENDPOINTS" | grep "^$provider|" | cut -d'|' -f2)
      [ -n "$endpoint" ] && check_model "$name" "$provider" "$endpoint" "" && FOUND_MODELS=$((FOUND_MODELS + 1))
    fi
  done
fi

# Also check for Hermes config in common locations
for CONFIG_PATH in "$HERMES_DIR/config.yaml" "$HERMES_DIR/hermes.json" "$HERMES_DIR/.hermes/config.json"; do
  [ -f "$CONFIG_PATH" ] && cat "$CONFIG_PATH" | jq -r '.models[]? | "\(.name)|\(.provider)|\(.endpoint // "")"' 2>/dev/null | \
  while IFS='|' read -r name provider endpoint; do
    [ -n "$endpoint" ] && check_model "$name" "$provider" "$endpoint" ""
  done
done

# Fallback: if no models found from config, check well-known defaults
if [ "$FOUND_MODELS" -eq 0 ]; then
  check_model "gpt-4o" "openai" "https://api.openai.com/v1/models" ""
  check_model "claude-3.5-sonnet" "anthropic" "https://api.anthropic.com/v1/messages" ""
  check_model "gemini-pro" "google" "https://generativelanguage.googleapis.com/v1/models" ""
  check_model "mistral-large" "mistral" "https://api.mistral.ai/v1/models" ""
  check_model "llama-3.1-70b" "groq" "https://api.groq.com/openai/v1/models" ""
fi
MODELSEOF

sed -i "s|__CONVEX_URL__|$CONVEX_URL|g" "$INSTALL_DIR/check-models.sh"
sed -i "s|__DEVICE_ID__|$DEVICE_ID|g" "$INSTALL_DIR/check-models.sh"
sed -i "s|__HERMES_DIR__|$HERMES_DIR|g" "$INSTALL_DIR/check-models.sh"
chmod +x "$INSTALL_DIR/check-models.sh"

# ── Create activity logger script ──────────────────────────────────────
cat > "$INSTALL_DIR/log-activity.sh" << 'ACTEOF'
#!/bin/bash
# Logs agent activity to Convex (call this from your Hermes hooks)

CONVEX_URL="__CONVEX_URL__"
DEVICE_ID="__DEVICE_ID__"

log_activity() {
  local activity_type="$1"
  local title="$2"
  local detail="${3:-}"

  curl -s -X POST "$CONVEX_URL/api/activity" \
    -H "Content-Type: application/json" \
    -d "{
      \"deviceId\": \"$DEVICE_ID\",
      \"activityType\": \"$activity_type\",
      \"title\": \"$title\",
      \"detail\": \"$detail\"
    }" >/dev/null 2>&1
}

# Usage examples (call from Hermes hooks/cron):
# ./log-activity.sh skill_used "Weather skill executed" "London, UK"
# ./log-activity.sh message_handled "Telegram message from user123"
# ./log-activity.sh error "API timeout" "Connection to openai.com timed out"
# ./log-activity.sh startup "Hermes agent started"
# ./log-activity.sh shutdown "Hermes agent stopping"

# If called with arguments, log them
if [ $# -ge 2 ]; then
  log_activity "$@"
fi
ACTEOF

sed -i "s|__CONVEX_URL__|$CONVEX_URL|g" "$INSTALL_DIR/log-activity.sh"
sed -i "s|__DEVICE_ID__|$DEVICE_ID|g" "$INSTALL_DIR/log-activity.sh"
chmod +x "$INSTALL_DIR/log-activity.sh"

# ── Create command poller script ───────────────────────────────────────
cat > "$INSTALL_DIR/poll-commands.sh" << 'POLLEOF'
#!/bin/bash
# Polls Convex for pending commands and executes them

CONVEX_URL="__CONVEX_URL__"
DEVICE_ID="__DEVICE_ID__"
HERMES_DIR="__HERMES_DIR__"

poll_commands() {
  local response
  response=$(curl -s "$CONVEX_URL/api/commands?deviceId=$DEVICE_ID" 2>/dev/null)

  local commands=$(echo "$response" | jq -c '.commands[]?' 2>/dev/null)

  if [ -z "$commands" ]; then
    return
  fi

  echo "$commands" | while read -r cmd; do
    local cmd_id=$(echo "$cmd" | jq -r '._id')
    local cmd_type=$(echo "$cmd" | jq -r '.commandType')
    local payload=$(echo "$cmd" | jq -r '.payload')

    echo "Executing command: $cmd_type ($cmd_id)"

    local result=""
    local success="true"

    case "$cmd_type" in
      restart_hermes)
        # Restart Hermes process
        if [ -f "$HERMES_DIR/restart.sh" ]; then
          bash "$HERMES_DIR/restart.sh" 2>&1 || true
          result="Restart initiated"
        else
          # Try pm2 or direct process management
          pkill -f "hermes" 2>/dev/null && sleep 2 && cd "$HERMES_DIR" && nohup ./start.sh >/dev/null 2>&1 &
          result="Process restarted via kill/start"
        fi
        ;;
      get_status)
        # Report back status
        result="{\"uptime\": $(awk '{print int($1)}' /proc/uptime 2>/dev/null || echo 0), \"status\": \"ok\"}"
        ;;
      run_skill)
        result="Skill execution not yet implemented — add your skill runner here"
        ;;
      custom)
        # Execute custom payload as a shell command (careful!)
        result=$(eval "$payload" 2>&1) || success="false"
        ;;
      *)
        result="Unknown command type: $cmd_type"
        success="false"
        ;;
    esac

    # Report result back
    curl -s -X POST "$CONVEX_URL/api/command-result" \
      -H "Content-Type: application/json" \
      -d "{
        \"commandId\": \"$cmd_id\",
        \"result\": \"$result\",
        \"success\": $success
      }" >/dev/null 2>&1
  done
}

poll_commands
POLLEOF

sed -i "s|__CONVEX_URL__|$CONVEX_URL|g" "$INSTALL_DIR/poll-commands.sh"
sed -i "s|__DEVICE_ID__|$DEVICE_ID|g" "$INSTALL_DIR/poll-commands.sh"
sed -i "s|__HERMES_DIR__|$HERMES_DIR|g" "$INSTALL_DIR/poll-commands.sh"
chmod +x "$INSTALL_DIR/poll-commands.sh"

# ── Create main loop script ────────────────────────────────────────────
cat > "$INSTALL_DIR/agent-loop.sh" << 'LOOPEOF'
#!/bin/bash
# Main monitoring loop — runs all collectors on schedule

INSTALL_DIR="__INSTALL_DIR__"
POLL_INTERVAL="__POLL_INTERVAL__"

echo "Hermes Dashboard Agent starting..."
echo "Telemetry interval: ${POLL_INTERVAL}s"
echo "Model check interval: 300s (every 5 min)"
echo "Command poll interval: 15s"

MODEL_COUNTER=0

while true; do
  # Always: send telemetry
  bash "$INSTALL_DIR/collect-device.sh" 2>/dev/null &

  # Every 15 seconds: poll for commands
  bash "$INSTALL_DIR/poll-commands.sh" 2>/dev/null &

  # Every 5 minutes: check model health
  MODEL_COUNTER=$((MODEL_COUNTER + POLL_INTERVAL))
  if [ "$MODEL_COUNTER" -ge 300 ]; then
    bash "$INSTALL_DIR/check-models.sh" 2>/dev/null &
    MODEL_COUNTER=0
  fi

  wait
  sleep "$POLL_INTERVAL"
done
LOOPEOF

sed -i "s|__INSTALL_DIR__|$INSTALL_DIR|g" "$INSTALL_DIR/agent-loop.sh"
sed -i "s|__POLL_INTERVAL__|$POLL_INTERVAL|g" "$INSTALL_DIR/agent-loop.sh"
chmod +x "$INSTALL_DIR/agent-loop.sh"

# ── Create systemd/Termux-service entry ────────────────────────────────
cat > "$INSTALL_DIR/start.sh" << 'STARTEOF'
#!/bin/bash
# Start the Hermes Dashboard Agent in background
INSTALL_DIR="__INSTALL_DIR__"

echo "Starting Hermes Dashboard Agent..."
nohup bash "$INSTALL_DIR/agent-loop.sh" > "$INSTALL_DIR/agent.log" 2>&1 &
echo $! > "$INSTALL_DIR/agent.pid"
echo "Agent started (PID: $(cat "$INSTALL_DIR/agent.pid"))"
echo "Logs: tail -f $INSTALL_DIR/agent.log"
STARTEOF

sed -i "s|__INSTALL_DIR__|$INSTALL_DIR|g" "$INSTALL_DIR/start.sh"
chmod +x "$INSTALL_DIR/start.sh"

cat > "$INSTALL_DIR/stop.sh" << 'STOPEOF'
#!/bin/bash
# Stop the Hermes Dashboard Agent
INSTALL_DIR="__INSTALL_DIR__"

if [ -f "$INSTALL_DIR/agent.pid" ]; then
  PID=$(cat "$INSTALL_DIR/agent.pid")
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID"
    echo "Agent stopped (PID: $PID)"
  else
    echo "Agent was not running"
  fi
  rm -f "$INSTALL_DIR/agent.pid"
else
  echo "No PID file found"
fi
STOPEOF

sed -i "s|__INSTALL_DIR__|$INSTALL_DIR|g" "$INSTALL_DIR/stop.sh"
chmod +x "$INSTALL_DIR/stop.sh"

# ── Create status check ────────────────────────────────────────────────
cat > "$INSTALL_DIR/status.sh" << 'STATUSEOF'
#!/bin/bash
INSTALL_DIR="__INSTALL_DIR__"

echo "=== Hermes Dashboard Agent Status ==="
if [ -f "$INSTALL_DIR/agent.pid" ]; then
  PID=$(cat "$INSTALL_DIR/agent.pid")
  if kill -0 "$PID" 2>/dev/null; then
    echo "Status: RUNNING (PID: $PID)"
  else
    echo "Status: STOPPED (stale PID file)"
  fi
else
  echo "Status: NOT STARTED"
fi

if [ -f "$INSTALL_DIR/agent.log" ]; then
  echo ""
  echo "=== Last 10 log lines ==="
  tail -10 "$INSTALL_DIR/agent.log"
fi
STATUSEOF

sed -i "s|__INSTALL_DIR__|$INSTALL_DIR|g" "$INSTALL_DIR/status.sh"
chmod +x "$INSTALL_DIR/status.sh"

# ── Done ──────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  ✅ Setup Complete!                               ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║                                                  ║"
echo "║  Files installed to: $INSTALL_DIR                ║"
echo "║                                                  ║"
echo "║  Start agent:  bash $INSTALL_DIR/start.sh       ║"
echo "║  Stop agent:   bash $INSTALL_DIR/stop.sh        ║"
echo "║  Check status: bash $INSTALL_DIR/status.sh      ║"
echo "║  View logs:    tail -f $INSTALL_DIR/agent.log   ║"
echo "║                                                  ║"
echo "║  Scripts:                                        ║"
echo "║  • collect-device.sh  — Device telemetry        ║"
echo "║  • check-models.sh    — Model health check      ║"
echo "║  • log-activity.sh    — Log agent activity      ║"
echo "║  • poll-commands.sh   — Poll for commands       ║"
echo "║  • agent-loop.sh      — Main monitoring loop    ║"
echo "║                                                  ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "To integrate with Hermes, add this to your agent hooks:"
echo "  bash $INSTALL_DIR/log-activity.sh skill_used \"Skill name\" \"Details\""
echo ""
echo "Start now? Run:  bash $INSTALL_DIR/start.sh"
