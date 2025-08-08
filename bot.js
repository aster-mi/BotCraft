// 最初に退避しておく
const originalConsoleLog = console.log;

const chatHistory = []; // 会話履歴を保持（最大10件）

// ログを無効化
console.log = () => {};

function print(message) {
  // ログを復活させてから出力
  console.log = originalConsoleLog;
  console.log(message);
  // 再度ログを無効化
  console.log = () => {};
}

// env ファイルを読み込む
const {
  OPENROUTER_API_KEY,
  OPENROUTER_MODEL,
  BDS_HOST,
  BDS_PORT,
  BEDROCK_VERSION,
} = process.env;

// bedrock-protocol を読み込む
import("bedrock-protocol").then(({ createClient }) => {
  const client = createClient({
    host: BDS_HOST, // 接続先サーバー
    port: BDS_PORT,
    version: BEDROCK_VERSION, // 使用する Bedrock バージョン
    username: "AsterBot",
    offline: false, // 認証不要サーバーならtrue
  });

  client.on("text", async (packet) => {
    if (packet.source_name === client.username) return;

    const userMessage = packet.message;
    print(`[Chat] ${packet.source_name}: ${userMessage}`);

    // 履歴に user の発言を追加
    chatHistory.push({ role: "user", content: userMessage });
    if (chatHistory.length > 5) chatHistory.shift(); // 最大10件まで

    const aiMessage = await fetchAIResponse();

    // 履歴に AI の返答を追加
    chatHistory.push({ role: "assistant", content: aiMessage });
    if (chatHistory.length > 5) chatHistory.shift();

    client.queue("text", {
      type: "chat",
      needs_translation: false,
      source_name: client.username,
      xuid: "",
      platform_chat_id: "",
      filtered_message: "",
      message: aiMessage,
    });
  });
});

async function fetchAIResponse(text, retries = 5) {
  const messages = [
    {
      role: "system",
      content:
        "相手は小学1年生なので、相手のテンションに合わせて「ひらがな」で手短に答えてください。絵文字や括弧の使用は避けてください。",
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
