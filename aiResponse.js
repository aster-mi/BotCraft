// aiResponse.js
import dotenv from "dotenv";
import { readFile } from "fs/promises";
dotenv.config();

const { OPENROUTER_API_KEY, OPENROUTER_MODEL } = process.env;

// systemプロンプト読み込み（非同期キャッシュ）
let systemPromptCache = null;
async function getSystemPrompt() {
  if (!systemPromptCache) {
    systemPromptCache = (await readFile("./prompt_system.txt", "utf-8")).trim();
  }
  return systemPromptCache;
}

export async function fetchAIResponse(chatHistory, retries = 5) {
  const systemPrompt = await getSystemPrompt();

  const messages = [{ role: "system", content: systemPrompt }, ...chatHistory];

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: OPENROUTER_MODEL, messages }),
    });

    if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    if (!content || content.trim() === "") throw new Error("Empty content");

    return content;
  } catch (err) {
    if (retries > 0) {
      return await fetchAIResponse(chatHistory, retries - 1);
    }
    console.error(`AI Response error: ${err?.message || err}`);
    return "[こたえられなかったよ]";
  }
}
