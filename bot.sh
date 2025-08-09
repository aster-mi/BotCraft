#!/bin/bash

# ====== CONFIG ======
ENV_FILE=".env"
JS_FILE="bot.js"

# ====== Check ======
if [ ! -f "$JS_FILE" ]; then
  echo "[ERROR] $JS_FILE not found."
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "[ERROR] .env file not found."
  exit 1
fi

# ====== Start Proxy ======
echo "[INFO] Starting bot.js..."
node "$JS_FILE"