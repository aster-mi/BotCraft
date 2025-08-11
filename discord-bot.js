// discord-bot.js
import dotenv from "dotenv";
dotenv.config();

import { muteConsoleLog, print } from "./logger.js";
import DiscordBridge from "./DiscordBridge.js";
import sendOrExecute from "./utils/sendOrExecute.js";

const { BDS_HOST, BDS_PORT, BEDROCK_VERSION, DEFAULT_CHANNEL_ID } = process.env;

muteConsoleLog();

let mcClient = null;

// --- Discord Bridge 準備 ---
const discordBridge = new DiscordBridge({
  // Discord → Minecraft（AI へは送らない）
  onMessage: ({ content, authorName }) => {
    print(`【DISCORD】<${authorName}> ${content}`);
    if (!mcClient || !content) return;
    sendOrExecute(mcClient, `【パパ】${content}`);
  },
});

discordBridge.start().catch((e) => {
  console.error("Discord login failed:", e);
});

// --- Bedrockクライアント ---
import("bedrock-protocol").then(({ createClient }) => {
  const client = createClient({
    host: BDS_HOST,
    port: Number(BDS_PORT),
    version: BEDROCK_VERSION,
    username: "チャッピー",
    offline: false,
  });
  mcClient = client;

  client.on("text", (packet) => {
    let userName = packet.source_name || "システム";
    const userMessage = packet.message;

    // 自分発言や特定メッセージは無視
    if (userName === client.username) return;
    if (userMessage.includes("commands.tp.success")) return;

    if (userName === "babhsy") userName = "しき";

    // Minecraft → Discord
    if (DEFAULT_CHANNEL_ID && userName !== "システム") {
      discordBridge
        .sendMessage(DEFAULT_CHANNEL_ID, `【${userName}】${userMessage}`)
        .catch((e) => print(`【DISCORD ERROR】${e}`));
    }
  });

  client.on("command_output", (pkt) => {
    print(JSON.stringify(pkt, null, 2));
  });
});
