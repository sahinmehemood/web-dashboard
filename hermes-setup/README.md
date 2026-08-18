# Hermes Agent — Full Setup Reference

Complete documentation for the Hermes AI agent running on Android (Termux + Pixel 7).

## What's Here

| File | Description |
|------|-------------|
| `Setup.md` | Full system architecture: Crown (runit), StackGov health governor, NOUS vault, agent fleet, 7 API providers, 4 Telegram bots, 6 cron jobs, and all Termux scripts |
| `integrations.md` | Third-party integration setup and API key configuration |

## Quick Start (Termux Device)

```bash
# 1. Install Crown (runit process supervisor)
bash crown.sh install

# 2. Install Hermes bots (Telegram gateways)
bash install_bot.sh hermesthehdbot
bash install_bot.sh Hermesagenths_bot

# 3. Install dashboard collector (sends data to Convex)
bash hermes-dashboard-setup.sh
bash ~/.hermes-dashboard/start.sh
```

## Architecture

```
Termux Device (Pixel 7)
├── Crown (runit) — 7 services: bot, bot2, web, search, tunnel, proxy, scraper
├── Hermes Agent — AI gateway with Telegram integration
├── NOUS Vault — Second brain (Obsidian-style)
├── StackGov — 6-department health governor
├── 7 API Providers — kilocode, openrouter, nvidia, opencode-zen, zai, gemini, ollama
├── 4 Telegram Bots — main, secondary, alerts, legacy
└── 6 Cron Jobs — gov, health, brain-git, brain-autosave, brain-ingest, brain-safety-net
```

## Dashboard

The web dashboard at `minimalist-web-style` connects to this device via Convex:
- Real-time device telemetry (battery, CPU, RAM, storage, network)
- Crown service health monitoring
- API provider status with per-model latency
- Cron job status and history
- NOUS vault statistics
- Remote command execution
- Activity feed

## License

Personal use — this is your private agent setup.
