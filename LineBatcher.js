export class LineBatcher {
  constructor(sendFn, windowMs = 5 * 60 * 1000) {
    this.sendFn = sendFn;
    this.windowMs = windowMs;
    this.queue = [];
    this.lastFlushedAt = 0;
    this.timer = null;
  }

  enqueue(text) {
    this.queue.push(text);
    this.#schedule();
  }

  #schedule() {
    if (this.timer) return;
    const now = Date.now();
    const wait = Math.max(0, this.windowMs - (now - this.lastFlushedAt));
    this.timer = setTimeout(() => this.flush(), wait);
  }

  async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.queue.length === 0) {
      this.lastFlushedAt = Date.now();
      return;
    }

    const message = this.queue.join("\n");
    this.queue = [];
    this.lastFlushedAt = Date.now();

    try {
      await this.sendFn(message);
    } catch (err) {
      const status = err?.response?.status;
      const statusText = err?.response?.statusText;
      console.error(
        `LINE送信エラー: ${status ?? "不明"}${
          statusText ? " " + statusText : ""
        }`
      );
    }
  }
}
