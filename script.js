const canvas = document.getElementById("canvas");
const ctx = canvas?.getContext("2d");
if (ctx) {
  let radius = canvas.height / 2;
  ctx.translate(radius, radius);
  radius *= 0.9;
  timeInit();
  setInterval(() => drawClock(ctx, radius), 1000);
  setInterval(getLeftTimeText, 1000);
}

function calculateTimeDifference() {
  const selectedTimeInput = document.getElementById("workTime");
  let selectedTimeValue = selectedTimeInput?.value || "17:30";
  const now = new Date();
  const selectedDate = new Date();
  const [h, m] = selectedTimeValue.split(":");
  selectedDate.setHours(+h, +m, 0, 0);
  return selectedDate.getTime() - now.getTime();
}

function millisecondsToTime(ms) {
  let seconds = Math.floor((ms / 1000) % 60);
  let minutes = Math.floor((ms / (1000 * 60)) % 60);
  let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  return { hours, minutes, seconds };
}

function timeInit() {
  const today = new Date();
  if (today.getDay() === 5) {
    const input = document.getElementById("workTime");
    if (input) input.value = "16:30";
  }
}

function getLeftTimeText() {
  const el = document.getElementById("leftTimeText");
  if (!el) return;
  const diff = calculateTimeDifference();
  const { hours, minutes, seconds } = millisecondsToTime(diff);
  el.textContent = diff < 0 ? "퇴근따리 퇴근따 ㅋㅋㄹㅃㅃ" :
    `퇴근까지 ${hours > 0 ? hours + "시간 " : ""}${minutes > 0 ? minutes + "분 " : ""}${seconds}초 남았따리 ㅋㅋ`;
}

function drawClock(ctx, radius) {
  drawFace(ctx, radius);
  drawNumbers(ctx, radius);
  drawTime(ctx, radius);
}

function drawFace(ctx, radius) {
  const grad = ctx.createRadialGradient(0,0,radius*0.95, 0,0,radius*1.05);
  grad.addColorStop(0, '#eee');
  grad.addColorStop(0.5, '#fff');
  grad.addColorStop(1, '#eee');
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = grad;
  ctx.lineWidth = radius * 0.1;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
  ctx.fillStyle = '#333';
  ctx.fill();
}

function drawNumbers(ctx, radius) {
  ctx.font = radius * 0.15 + "px arial";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  for(let num = 1; num < 13; num++){
    let ang = num * Math.PI / 6;
    ctx.rotate(ang);
    ctx.translate(0, -radius * 0.85);
    ctx.rotate(-ang);
    ctx.fillText(num.toString(), 0, 0);
    ctx.rotate(ang);
    ctx.translate(0, radius * 0.85);
    ctx.rotate(-ang);
  }
}

function drawTime(ctx, radius){
  const now = new Date();
  let hour = now.getHours();
  let minute = now.getMinutes();
  let second = now.getSeconds();
  hour %= 12;
  hour = (hour * Math.PI / 6) +
         (minute * Math.PI / (6 * 60)) +
         (second * Math.PI / (360 * 60));
  drawHand(ctx, hour, radius * 0.5, radius * 0.07);
  minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
  drawHand(ctx, minute, radius * 0.8, radius * 0.07);
  second = (second * Math.PI / 30);
  drawHand(ctx, second, radius * 0.9, radius * 0.02);
}

function drawHand(ctx, pos, length, width) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.moveTo(0, 0);
  ctx.rotate(pos);
  ctx.lineTo(0, -length);
  ctx.stroke();
  ctx.rotate(-pos);
}