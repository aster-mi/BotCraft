// ai-bot.js
import dotenv from "dotenv";
dotenv.config();

import { fetchAIResponse } from "./utils/aiResponse.js";
import { muteConsoleLog, print } from "./utils/logger.js";
import sendOrExecute from "./utils/sendOrExecute.js";

const { BDS_HOST, BDS_PORT, BEDROCK_VERSION } = process.env;

muteConsoleLog();

let lastSentMessage = "";
const chatHistory = [];

// --- Bedrockクライアント ---
import("bedrock-protocol").then(({ createClient }) => {
  const client = createClient({
    host: BDS_HOST,
    port: Number(BDS_PORT),
    version: BEDROCK_VERSION,
    username: "チャッピー",
    offline: false,
  });

  client.on("text", async (packet) => {
    let userName = packet.source_name || "システム";
    const userMessage = packet.message;

    // 自分の発言や特定メッセージは無視
    if (userName === client.username) return;
    if (userMessage.includes("commands.tp.success")) return;

    // 重複抑止
    const sig = userName + userMessage;
    if (sig === lastSentMessage) return;
    lastSentMessage = sig;

    if (userName === "babhsy") userName = "しき";

    // AI へ履歴を構築
    chatHistory.push({ role: "user", content: userMessage });
    if (chatHistory.length > 10) chatHistory.shift();

    const aiMessage = await fetchAIResponse(chatHistory);

    chatHistory.push({ role: "assistant", content: aiMessage });
    if (chatHistory.length > 10) chatHistory.shift();

    // Minecraft へ送信
    sendOrExecute(client, `【チャッピー】${aiMessage}`);
    print(`【${userName}】${userMessage}\n【🤖】${aiMessage}`);
  });

  client.on("command_output", (pkt) => {
    print(JSON.stringify(pkt, null, 2));
  });
});
