# Dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app

# よく使うネイティブビルド系（必要なければ省いてOK）
RUN apk add --no-cache bash git g++ make cmake

# 依存のみ先に入れてビルドキャッシュを効かせる
COPY package*.json ./
RUN npm ci