const puppeteer = require("puppeteer");

const { send_slack_message } = require("./slack");

/**
 * Zoom 자동 입장 / 대기 하는 함수
 * @param {string} room_id - 방 ID
 * @param {string} room_pw - 방 비밀번호 (활성화 코드)
 * @param {string} user_name - 사용자 이름
 * @param {string} duration - 머무르는 시간 (ms)
 */
async function join_zoom(room_id, room_pw, user_name, duration) {
  try {
    send_slack_message(
      `*${user_name}* 님이 Zoom 회의 \`${room_id}\` 접속을 시작합니다`
    );
    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();
    await page.goto("https://app.zoom.us/wc/join", {
      waitUntil: "networkidle0",
    });

    await page.waitForSelector('input.join-meetingId[type="text"]');
    await page.type('input.join-meetingId[type="text"]', room_id);
    await page.click(".btn-join.btn.btn-primary");

    await page.waitForSelector("iframe");
    const elementHandle = await page.$("iframe");
    const iframe = await elementHandle.contentFrame();

    await iframe.waitForNavigation({ waitUntil: "networkidle2" });
    const fist_button_element = await iframe.waitForSelector(
      ".continue-without-mic-camera, .pepc-permission-dialog__footer-button"
    );
    await fist_button_element.click();
    const second_button_element = await iframe.waitForSelector(
      ".continue-without-mic-camera, .pepc-permission-dialog__footer-button"
    );
    await second_button_element.click();

    await iframe.waitForSelector("#input-for-pwd");
    await iframe.type("#input-for-pwd", room_pw);
    await iframe.waitForSelector("#input-for-name");
    await iframe.type("#input-for-name", user_name);
    await iframe.waitForSelector('button[tabindex="0"]');
    await iframe.click('button[tabindex="0"]');
    send_slack_message(
      `*${user_name}* 님은 현재 Zoom 회의 \`${room_id}\` 대기중입니다`
    );

    await new Promise((resolve) =>
      setTimeout(resolve, Number(duration) * 1000)
    );

    await browser.close();
    send_slack_message(
      `*${user_name}* 님의 Zoom 회의 \`${room_id}\` 접속 완료`
    );
  } catch (err) {
    send_slack_message(
      `*${user_name}* 님의 Zoom 회의 \`${room_id}\` 접속중 오류 발생\n${err}`
    );
  }
}

module.exports = { join_zoom };
