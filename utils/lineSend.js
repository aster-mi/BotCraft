import axios from "axios";

export async function sendMessageToLine(message) {
  const url = "https://api.line.me/v2/bot/message/push";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
  };
  const body = {
    to: process.env.LINE_CHANNEL_ID,
    messages: [{ type: "text", text: message }],
  };
  await axios.post(url, body, { headers });
}
