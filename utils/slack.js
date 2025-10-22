require("dotenv").config({ quiet: true });

const axios = require("axios");
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

/**
 * 메시지를 SLACK으로 보내는 작업
 * @param {string} message
 */
async function send_slack_message(message) {
  try {
    // const now = new Date();
    // const korean_time = now.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
    // const message_with_time = `[${korean_time}] ${message}`;
    await axios.post(SLACK_WEBHOOK_URL, { text: message });
  } catch (err) {
    console.error("[ERROR] Slack 메시지 전송 실패:", err.message);
  }
}

module.exports = { send_slack_message };
