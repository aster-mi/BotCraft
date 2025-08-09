import dotenv from "dotenv";
import axios from "axios"; // axiosをインポート
dotenv.config();

// 最初に退避しておく
const originalConsoleLog = console.log;

const chatHistory = []; // 会話履歴を保持（最大10件）
let lastSentMessage = ""; // 直前に送信したメッセージを保持

// ログを無効化
console.log = () => {};

function print(message) {
  // ログを復活させてから出力
  console.log = originalConsoleLog;
  console.log(message);
  // 再度ログを無効化
  console.log = () => {};
}

const {
  OPENROUTER_API_KEY,
  OPENROUTER_MODEL,
  LINE_CHANNEL_ACCESS_TOKEN,
  LINE_CHANNEL_ID,
  BDS_HOST,
  BDS_PORT,
  BEDROCK_VERSION,
} = process.env;

// bedrock-protocol を読み込む
import("bedrock-protocol").then(({ createClient }) => {
  const logMessage = `Connecting to Bedrock server at ${BDS_HOST}:${BDS_PORT} with version ${BEDROCK_VERSION}`;
  print(logMessage);

  const client = createClient({
    host: BDS_HOST, // 接続先サーバー
    port: Number(BDS_PORT),
    version: BEDROCK_VERSION, // 使用する Bedrock バージョン
    username: "チャッピー",
    offline: false, // 認証不要サーバーならtrue
  });

  client.on("text", async (packet) => {
    const userName = packet.source_name || "システム";
    const userMessage = packet.message;

    // bot自身のメッセージは無視
    if (userName === client.username) return;

    await sendMessageToLine(`[${userName}] ${userMessage}`);

    // 直前のメッセージと同じ場合は送信しない
    if (packet.message === lastSentMessage) return;
    lastSentMessage = userName + userMessage; // 直前のメッセージを更新

    print(`[Chat] ${packet.source_name}: ${userMessage}`);

    // 履歴に user の発言を追加
    chatHistory.push({ role: "user", content: userMessage });
    if (chatHistory.length > 10) chatHistory.shift(); // 最大10件まで

    const aiMessage = await fetchAIResponse();
    print(`[Chat] AI: ${userMessage}`);

    // 履歴に AI の返答を追加
    chatHistory.push({ role: "assistant", content: aiMessage });
    if (chatHistory.length > 10) chatHistory.shift();

    client.queue("text", {
      type: "chat",
      needs_translation: false,
      source_name: "チャッピー",
      xuid: "",
      platform_chat_id: "",
      filtered_message: "",
      message: String(aiMessage),
    });

    // LINEにメッセージを送信
    await sendMessageToLine(`[🤖] ${aiMessage}`);
  });
});

async function fetchAIResponse(text, retries = 5) {
  const messages = [
    {
      role: "system",
      content:
        "あなたは「チャッピー」という名前でMinecraft内に存在する対話botなので動くことはできません。小学生と会話しています。相手のテンションに合わせて「ひらがな」で手短に答えてください。絵文字や括弧の使用は避けてください。Minecraft内のシステムからのメッセージと思われるものを受け取った場合は褒めたり慰めたりアドバイスをしてください。",
    },
    ...chatHistory,
  ];
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
      }),
    });

    print(`AI Response: ${res.status} ${res.statusText}`);

    if (!res.ok) throw new Error("API error");

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;

    if (!content || content.trim() === "") throw new Error("Empty content");

    return content;
  } catch (err) {
    if (retries > 0) {
      return await fetchAIResponse(text, retries - 1);
    }
    return "[こたえられなかったよ]";
  }
}

// LINEにメッセージを送る関数
async function sendMessageToLine(message) {
  const lineApiUrl = "https://api.line.me/v2/bot/message/push";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
  };

  const body = {
    to: LINE_CHANNEL_ID,
    messages: [
      {
        type: "text",
        text: message,
      },
    ],
  };

  try {
    const response = await axios.post(lineApiUrl, body, { headers });
    print(`LINE API Response: ${response.status} ${response.statusText}`);
  } catch (error) {
    print(`Error sending message to LINE: ${error.message}`);
  }
}
