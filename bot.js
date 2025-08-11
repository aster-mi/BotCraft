// main.js
import dotenv from "dotenv";
dotenv.config();

import { LineBatcher } from "./LineBatcher.js";
import { sendMessageToLine } from "./lineSend.js";
import { fetchAIResponse } from "./aiResponse.js";
import { muteConsoleLog, print } from "./logger.js";

const { BDS_HOST, BDS_PORT, BEDROCK_VERSION } = process.env;

// --- 5分まとめ送信バッチャー ---
const batcher = new LineBatcher(sendMessageToLine, 5 * 60 * 1000);

// --- 会話履歴 & 重複抑止 ---
const chatHistory = [];
let lastSentMessage = "";

// --- 最初にconsole.logを無効化 ---
muteConsoleLog();

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
    const userName = packet.source_name || "システム";
    const userMessage = packet.message;

    // 自分の発言は無視
    if (userName === client.username) return;

    // 同一メッセージ連投の抑止
    if (userName + userMessage === lastSentMessage) return;
    lastSentMessage = userName + userMessage;

    // 履歴に追加
    chatHistory.push({ role: "user", content: userMessage });
    if (chatHistory.length > 10) chatHistory.shift();

    // AI 応答
    const aiMessage = await fetchAIResponse(chatHistory);

    chatHistory.push({ role: "assistant", content: aiMessage });
    if (chatHistory.length > 10) chatHistory.shift();

    // BDS側に送信
    sendOrExecute(client, String(aiMessage));

    // LINEへは5分バッチで送信
    const logMessage = `[${userName}] ${userMessage}\n[🤖] ${aiMessage}`;
    print(logMessage);
    batcher.enqueue(logMessage);
  });

  client.on("command_output", (pkt) => {
    print(JSON.stringify(pkt, null, 2));
  });
});

function sendOrExecute(client, text) {
  if (typeof text !== "string") return;

  const msg = text.trim();

  if (msg.startsWith("/")) {
    // コマンドとして実行
    // うまく動かないので一旦prompt側でdeadLogic化
    client.queue("command_request", {
      command: msg,
      origin: { type: 0, uuid: client.profile?.uuid || "", request_id: "" }, // type=0 は player
      internal: false,
    });
  } else {
    // チャットとして送信
    client.queue("text", {
      type: "chat",
      needs_translation: false,
      source_name: "チャッピー",
      xuid: "",
      platform_chat_id: "",
      filtered_message: "",
      message: msg,
    });
  }
}

// 終了時に残りを送信
process.on("beforeExit", () => batcher.flush());
process.on("SIGINT", async () => {
  await batcher.flush();
  process.exit(0);
});
