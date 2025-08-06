
//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
var velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //draw flappy bird
    // context.fillStyle = "green";
    // context.fillRect(bird.x, bird.y, bird.width, bird.height);

    //load images
    birdImg = new Image();
    birdImg.src = "https://raw.githubusercontent.com/ImKennyYip/flappy-bird/refs/heads/master/flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "https://raw.githubusercontent.com/ImKennyYip/flappy-bird/refs/heads/master/toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "https://raw.githubusercontent.com/ImKennyYip/flappy-bird/refs/heads/master/bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1.5 seconds
    setInterval(speedUp, 1500); //every 1.5 seconds
    document.addEventListener("keydown", moveBird);
}

function addDataToTable(data) {
  const tableBody = document.querySelector("#myTable tbody"); // 테이블의 body 요소 선택
  const newRow = tableBody.insertRow(); // 새로운 행 추가

  // 데이터 객체의 각 키에 대해 반복
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const newCell = newRow.insertCell(); // 새로운 셀 추가
      newCell.textContent = data[key]; // 셀에 데이터 값 할당
    }
  }
}

function sortTable(column, order) {
  const table = document.getElementById("myTable");
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.rows); // NodeList를 Array로 변환

  // 정렬 함수
  const compare = (rowA, rowB) => {
    const cellA = rowA.cells[column].textContent;
    const cellB = rowB.cells[column].textContent;

    // 숫자 비교 (필요에 따라 문자열 비교로 변경)
    if (isNaN(cellA) || isNaN(cellB)) {
      // 문자열 비교
      return order === "asc" ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
    } else {
      // 숫자 비교
      return order === "asc" ? Number(cellA) - Number(cellB) : Number(cellB) - Number(cellA);
    }
  };

  // 정렬
  rows.sort(compare);

  // 정렬된 행을 테이블에 다시 추가
  rows.forEach(row => tbody.appendChild(row));
}

function speedUp(){
    velocityX -= 0.1;
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        addDataToTable({"score" : score});
        //sortTable(0,"asc");
        velocityX = -2;
        if(confirm("한판 더?")){
		    return;
	    }else{
		    alert("접어");
	    }
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += gravity;
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //score
    context.fillStyle = "white";
    context.font="45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        //jump
        velocityY = -6;

        //reset game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}
