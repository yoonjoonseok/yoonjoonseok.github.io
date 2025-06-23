document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("navbar");
  if (nav) {
    fetch("/common/navbar/navbar.html")
      .then(res => res.text())
      .then(html => {
        nav.innerHTML = html;
      });
  }

  const canvas = document.getElementById("canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let radius = canvas.height / 2;
  ctx.translate(radius, radius);
  radius *= 0.9;
  timeInit();
  setInterval(() => drawClock(ctx, radius), 1000);

  const elements = document.querySelectorAll('#leftTimeText');
    elements.forEach(element => {
      const randomDelay = Math.random() * 2; // 0에서 2초 사이의 무작위 값
      element.style.animationDelay = `${randomDelay}s`;
    });

  setInterval(updateLeftTime, 1000);
});

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function updateLeftTime() {
  //const el = document.getElementById("leftTimeText");
  const elements = document.querySelectorAll('#leftTimeText');
  if (!elements) return;
  const ms = getTimeDiff();
  const { hours, minutes, seconds } = convertMS(ms);
  const textContent = ms < 0
    ? "퇴근따리 퇴근따 ㅋㅋㄹㅃㅃ"
    : `퇴근까지 ${hours > 0 ? hours + "시간 " : ""}${minutes > 0 ? minutes + "분 " : ""}${seconds}초 남았따리 ㅋㅋ`;
  for(let i = 0; i < elements.length; i++){
      elements[i].textContent = textContent;
  }
}

function getTimeDiff() {
  const val = document.getElementById("workTime")?.value || "17:30";
  const [h, m] = val.split(":");
  const now = new Date();
  const target = new Date();
  target.setHours(+h, +m, 0, 0);
  return target - now;
}

function convertMS(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  return { hours, minutes, seconds };
}

function timeInit() {
  const now = new Date();
  if (now.getDay() === 5) {
    const input = document.getElementById("workTime");
    if (input) input.value = "16:30";
  }
}

function drawClock(ctx, radius) {
  drawFace(ctx, radius);
  drawNumbers(ctx, radius);
  drawTime(ctx, radius);
}

function drawFace(ctx, radius) {
  const grad = ctx.createRadialGradient(0,0,radius*0.95, 0,0,radius*1.05);
  grad.addColorStop(0, '#000');
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
  for (let num = 1; num < 13; num++) {
    const ang = num * Math.PI / 6;
    ctx.rotate(ang);
    ctx.translate(0, -radius * 0.85);
    ctx.rotate(-ang);
    ctx.fillText(num.toString(), 0, 0);
    ctx.rotate(ang);
    ctx.translate(0, radius * 0.85);
    ctx.rotate(-ang);
  }
}

function drawTime(ctx, radius) {
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
