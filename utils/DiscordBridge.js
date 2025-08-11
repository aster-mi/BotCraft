// DiscordBridge.js
import "dotenv/config";
import { Client, GatewayIntentBits, Partials } from "discord.js";

// ======== 環境変数をまとめて定義 ========
const { DISCORD_TOKEN, DEFAULT_CHANNEL_ID } = process.env;

if (!DISCORD_TOKEN) {
  throw new Error("DISCORD_TOKEN が未設定です (.env を確認してください)");
}

/**
 * Discordとの双方向ブリッジ（最小構成）
 */
class DiscordBridge {
  /**
   * @param {object} options
   * @param {(msg: {
   *   channelId: string,
   *   content: string,
   *   authorId: string,
   *   authorName: string,
   *   messageId: string,
   *   isDM: boolean
   * }) => Promise<void>|void} options.onMessage
   */
  constructor({ onMessage }) {
    if (typeof onMessage !== "function") {
      throw new Error("onMessage が必要です");
    }

    this.onMessage = onMessage;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
      ],
      partials: [Partials.Channel], // DMで必要
    });

    // Discord → JS
    this.client.on("messageCreate", async (msg) => {
      if (msg.author?.bot) return; // Bot自身や他Botは無視

      const payload = {
        channelId: msg.channelId,
        content: msg.content ?? "",
        authorId: msg.author?.id ?? "",
        authorName: msg.author?.username ?? "",
        messageId: msg.id,
        isDM: msg.guildId == null,
      };

      await this.onMessage(payload);
    });

    this.client.once("ready", () => {
      console.log(`✅ DiscordBridge: Logged in as ${this.client.user.tag}`);
    });
  }

  /** 接続開始 */
  async start() {
    await this.client.login(DISCORD_TOKEN);
  }

  /** JS → Discord: メッセージ送信 */
  async sendMessage(channelId, content) {
    const channel = await this.client.channels.fetch(channelId);
    if (!channel?.isTextBased?.()) {
      throw new Error("テキスト送信不可のチャンネルです");
    }
    return channel.send({ content: String(content ?? "") });
  }

  /** JS → Discord: 返信 */
  async reply(channelId, messageId, content) {
    const channel = await this.client.channels.fetch(channelId);
    if (!channel?.isTextBased?.()) {
      throw new Error("テキスト送信不可のチャンネルです");
    }
    const msg = await channel.messages.fetch(messageId);
    return msg.reply({ content: String(content ?? "") });
  }

  /** デフォルトチャンネルへ送信（.envで指定） */
  async sendToDefault(content) {
    if (!DEFAULT_CHANNEL_ID) {
      throw new Error("DEFAULT_CHANNEL_ID が未設定です");
    }
    return this.sendMessage(DEFAULT_CHANNEL_ID, content);
  }

  /** 接続終了 */
  async stop() {
    await this.client.destroy();
  }
}

export default DiscordBridge;
