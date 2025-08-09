# BotCraft

Minecraft Bedrock Edition のプロキシサーバーを操作するためのボットです。以下の手順で初期構築を行い、プロジェクトをセットアップできます。

## 必要なもの

- **Node.js v18.20.8**（推奨）
- **npm**（Node.js とともにインストールされます）
- **.env** ファイル（環境変数設定）

## 初期構築手順

1. **Node.js のインストール**

   Node.js v18.20.8 をインストールします。推奨バージョンは `v18.20.8` ですが、他のバージョンでも動作する場合があります。以下のリンクからインストールできます。

   [Node.js v18.x ダウンロードページ](https://nodejs.org/en/download/)

   **バージョン確認**：

   ```bash
   node -v
   ```

   出力例：

   ```
   v18.20.8
   ```

2. **プロジェクトのクローン**

   GitHub からリポジトリをクローンします。

   ```bash
   git clone <リポジトリのURL>
   cd minecraft_ai_server_js
   ```

3. **依存パッケージのインストール**

   プロジェクトディレクトリ内で `npm install` を実行して依存関係をインストールします。

   ```bash
   npm install
   ```

4. **`.env` ファイルの設定**

   プロジェクトには `.env` ファイルが必要です。以下の環境変数を設定してください。

   ```plaintext
   OPENROUTER_API_KEY=<OpenRouterより発行したkey>
   OPENROUTER_MODEL=<OpenRouterにて利用するModelのID>
   LINE_CHANNEL_ACCESS_TOKEN=<LINE Messaging APIのアクセスkey>
   LINE_CHANNEL_ID=<LINEの送信先USER/GROUP ID>
   BDS_HOST=<Minecraft Bedrock Serverのホスト>
   BDS_PORT=<Minecraft Bedrock Serverのポート>
   BEDROCK_VERSION=<Minecraft Bedrock Version>
   ```

   **例**：

   ```plaintext
   OPENROUTER_API_KEY=sk-or-v1-...
   OPENROUTER_MODEL=openai/gpt-5-chat
   LINE_CHANNEL_ACCESS_TOKEN=NugDAfWBH...
   LINE_CHANNEL_ID=Ca3bc...a98a054f2
   BDS_HOST=192.168.68.68
   BDS_PORT=19132
   BEDROCK_VERSION=1.21.100
   ```

5. **プロジェクトの起動**

   起動用のスクリプト `bot.sh` を使用して、ボットを開始します。

   ```bash
   ./bot.sh
   ```

   このスクリプトは `bot.js` を Node.js で起動します。`bot.js` の実行時に環境変数と依存関係が読み込まれ、ボットが動作を開始します。

## その他の注意点

- **`node-fetch` のバージョン 3.x 以降** は ES モジュール専用となっているため、`import` 文を使用する必要があります。このため、`type: "module"` が `package.json` に含まれています。
- **Node.js のバージョン**：推奨バージョンは `v18.20.8` です。それ以外のバージョンでも動作する場合がありますが、バージョンの不一致による問題は発生する可能性があります。
- **エラーログ**：実行中にエラーが発生した場合は、エラーメッセージを確認し、必要に応じて依存関係を再インストールするか、設定を見直してください。

## 開発環境

- **Node.js v18.20.8** 以上が推奨されます。
- **npm install** で依存関係をインストールしてください。
