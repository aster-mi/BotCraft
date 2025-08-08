import { createServer, createClient } from "bedrock-protocol";
import fetch from "node-fetch";
import "dotenv/config";
import fs from "fs";

const { OPENROUTER_API_KEY, BDS_HOST, BDS_PORT, LISTEN_PORT, BEDROCK_VERSION } =
  process.env;

const server = createServer({
  host: "0.0.0.0",
  port: Number(LISTEN_PORT),
  version: BEDROCK_VERSION,
  offline: true,
  // ,
  // proxy: true, // ← プロキシモードON！
  // destination: {
  //   host: BDS_HOST,
  //   port: Number(BDS_PORT)
  // }
});

server.on("connect", (client) => {
  console.log("[DEBUG] New connection established.");

  client.on("login", () => {
    // console.log('[DEBUG] Login packet details:', client.profile)
    // // StartGame packetをクライアントに送る
    // // const startGameData = JSON.parse(fs.readFileSync('./packets/start_game.json', 'utf-8'))
    // findUndefinedFields(startGameData)
    // client.queue('start_game', startGameData)
    // console.log('[DEBUG] Sent START_GAME packet to client.')
  });
  client.on("text", async (packet) => {
    console.log(`[CHAT] <${client.profile?.name}> ${packet.message}`);
    console.log("[DEBUG] Full text packet:", packet);

    if (packet.message.startsWith("!")) {
      const query = packet.message.slice(1).trim();
      console.log(`[DEBUG] AI Query: "${query}"`);

      const aiMessage = await fetchAIResponse(query);
      console.log("[DEBUG] AI Response:", aiMessage);

      if (aiMessage) {
        client.queue("text", {
          type: "chat",
          needs_translation: false,
          source_name: "AI",
          message: aiMessage,
          xuid: "",
          platform_chat_id: "",
        });
        console.log("[DEBUG] Sent message back to client.");
      }
    }
  });

  client.on("disconnect", ({ reason }) => {
    console.log(`[DISCONNECT] ${client.username || "Unknown"}: ${reason}`);
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
