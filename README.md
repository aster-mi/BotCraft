# BotCraft

Minecraft Bedrock Edition にて動作するチャットボットです。以下の手順で初期構築を行い、プロジェクトをセットアップできます。

## 必要なもの

- **Docker**（推奨）
- **.env** ファイル（環境変数設定）
- **Git**（リポジトリをクローンするため）

## 初期構築手順

1. **Docker のインストール**

   プロジェクトは Docker コンテナ内で動作します。まず、[Docker](https://www.docker.com/get-started) をインストールしてください。

2. **プロジェクトのクローン**

   GitHub からリポジトリをクローンします。

   ```bash
   git clone git@github.com:aster-mi/BotCraft.git
   cd BotCraft
   ```

3. **`.env` ファイルの設定**

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

4. **Docker コンテナのビルドと起動**

   以下のコマンドで Docker イメージをビルドし、コンテナを起動します。

   ```bash
   docker-compose up --build
   ```

   このコマンドは、必要な依存関係をインストールし、プロジェクトを Docker コンテナ内で起動します。

5. **ボットの起動**

   コンテナ内でボットを起動します。`bot.js` は自動的に起動しますが、手動で実行したい場合は以下のコマンドを使用できます：

   ```bash
   docker exec -it botcraft_container_name bash
   node bot.js
   ```

   `botcraft_container_name` は実際に起動したコンテナの名前に置き換えてください。

## その他の注意点

- **`node-fetch` のバージョン 3.x 以降** は ES モジュール専用となっているため、`import` 文を使用する必要があります。このため、`type: "module"` が `package.json` に含まれています。
- **Docker 使用のメリット**：プロジェクトが依存する環境を Docker コンテナ内で完全に管理するため、ホスト環境に依存せずに動作します。
- **エラーログ**：実行中にエラーが発生した場合は、エラーメッセージを確認し、必要に応じて依存関係を再インストールするか、設定を見直してください。

## 開発環境

- **Docker** を使用した環境構築を推奨します。
- **npm install** で依存関係をインストールしてください。
