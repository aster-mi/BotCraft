#!/bin/bash

# ====== CONFIG ======
BDS_DIR="bedrock-server-1.21.100.7"
BDS_EXEC="bedrock_server"

# ====== Check ======
if [ ! -d "$BDS_DIR" ]; then
  echo "[ERROR] $BDS_DIR not found. Place the server folder next to this script."
  exit 1
fi

# ====== Start Bedrock Server ======
echo "[INFO] Starting Bedrock Server..."
cd "$BDS_DIR"
chmod +x "$BDS_EXEC"
./"$BDS_EXEC" > ../bds.log 2>&1 &
cd ..
