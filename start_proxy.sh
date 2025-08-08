#!/bin/bash

# ====== CONFIG ======
ENV_FILE=".env"
PROXY_SCRIPT="mc_ai_proxy.js"

# ====== Check ======
if [ ! -f "$PROXY_SCRIPT" ]; then
  echo "[ERROR] $PROXY_SCRIPT not found."
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "[ERROR] .env file not found."
  exit 1
fi

# ====== Start Proxy ======
echo "[INFO] Starting mc_ai_proxy.js..."
node "$PROXY_SCRIPT"