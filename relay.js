import { Relay } from "bedrock-protocol";

const relay = new Relay({
  version: "1.21.100", // 使用する Bedrock バージョンに合わせて変更
  host: "0.0.0.0", // クライアントが接続するホスト
  port: 19132, // クライアントが接続するポート
  destination: {
    host: "127.0.0.1", // 実際のサーバー
    port: 19131, // 実際のサーバーのポート
  },
});

relay.listen(); // Tell the server to start listening.

relay.on("connect", (player) => {
  console.log("New connection", player.connection.address);

  // Server is sending a message to the client.
  player.on("clientbound", ({ name, params }, des) => {
    if (name === "disconnect") {
      // Intercept kick
      params.message = "Intercepted"; // Change kick message to "Intercepted"
    }
  });
  // Client is sending a message to the server
  player.on("serverbound", ({ name, params }, des) => {
    if (name === "text") {
      // Intercept chat message to server and append time.
      params.message += `, on ${new Date().toLocaleString()}`;
    }

    if (name === "command_request") {
      // Intercept command request to server and cancel if its "/test"
      if (params.command == "/test") {
        des.canceled = true;
      }
    }
  });
});

async function fetchAIResponse(text) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gryphe/mythomist-7b:free",
      messages: [
        {
          role: "system",
          content: "あなたはMinecraftの世界に住んでいるフレンドリーなAIです。",
        },
        { role: "user", content: text },
      ],
    }),
  });

  const json = await res.json();
  return json?.choices?.[0]?.message?.content || "[AIから応答がありません]";
}
