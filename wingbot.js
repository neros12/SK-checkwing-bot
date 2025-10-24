const fs = require("fs");
const cron = require("node-cron");

const { join_zoom } = require("./utils/action");
const { send_slack_message } = require("./utils/slack");

const schedules = JSON.parse(
  fs.readFileSync("./schedule.config.json", "utf-8")
);

function schedule_meeting(meeting) {
  let [hour, minute, second] = meeting.start_time.split(":").map(Number);
  const totalSeconds = hour * 3600 + minute * 60 + second - 600; // 10분전 실행
  hour = Math.floor(totalSeconds / 3600);
  minute = Math.floor((totalSeconds % 3600) / 60);
  second = totalSeconds % 60;

  send_slack_message(
    `[예약등록완료] 사용자: ${meeting.user_name}  회의 ID: ${meeting.room_id}  예약시간: ${hour}:${minute}`
  );

  const cron_exp = `${second} ${minute} ${hour} * * ${meeting.day}`;
  cron.schedule(cron_exp, () => {
    join_zoom(
      meeting.room_name,
      meeting.room_id,
      meeting.room_pw,
      meeting.user_name,
      meeting.duration
    );
  });
}

// 실행
schedules.forEach(schedule_meeting);
