# 既存のDockerfileにGitインストールを追加
FROM node:18-alpine

# 必要なパッケージをインストール
RUN apk add --no-cache bash git g++ cmake make

# プロジェクトファイルをコピー
COPY . /app

# 作業ディレクトリを設定
WORKDIR /app

# npm install実行
RUN npm install

# 必要なパッケージを実行
CMD ["node", "bot.js"]