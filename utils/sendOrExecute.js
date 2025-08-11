// utils/sendOrExecute.js

/**
 * Minecraft への送信ユーティリティ
 * 先頭が "/" の場合はコマンドとして実行し、それ以外はチャット送信します。
 *
 * @param {import('bedrock-protocol').Client} client - bedrock-protocol のクライアント
 * @param {string} text - 送信メッセージ（"/" で始まればコマンド）
 */
export default function sendOrExecute(client, text) {
  if (!client || typeof client.queue !== "function") return;
  if (typeof text !== "string") return;

  const msg = text.trim();
  if (!msg) return;

  if (msg.startsWith("/")) {
    // コマンド実行
    client.queue("command_request", {
      command: msg,
      // type=0: player（bot名での実行）。profile?.uuid は存在しないケースもあるので空文字フォールバック
      origin: { type: 0, uuid: client.profile?.uuid || "", request_id: "" },
      internal: false,
    });
    return;
  }

  // チャット送信
  client.queue("text", {
    type: "chat",
    needs_translation: false,
    source_name: client.username || "BOT",
    xuid: "",
    platform_chat_id: "",
    filtered_message: "",
    message: msg,
  });
}
