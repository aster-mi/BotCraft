# 開発端末側（PC）

### 1. コードを編集したら…

```bash
# イメージをビルド（必要に応じてタグ更新）
BOT_TAG=1.0.1
IMAGE_NS={docker-hubの名前}
docker buildx build --platform linux/arm64 \
  -t ${IMAGE_NS}/botcraft:${BOT_TAG} \
  --push .
```
