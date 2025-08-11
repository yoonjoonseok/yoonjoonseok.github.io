    //board
    let board;
    let boardWidth = 360;
    let boardHeight = 640;
    let context;

    //bird
    let birdWidth = 34; //width/height ratio = 408/228 = 17/12
    let birdHeight = 24;
    let birdX = boardWidth / 8;
    let birdY = boardHeight / 2;
    let birdImg;
    let birdImg1;
    let birdImg2;
    let birdImg3;
    let currentBirdImg;

    let bird = {
        x: birdX,
        y: birdY,
        width: birdWidth,
        height: birdHeight
    }

    //pipes
    let pipeArray = [];
    let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
    let pipeHeight = 512;
    let pipeX = boardWidth;
    let pipeY = 0;

    let topPipeImg;
    let bottomPipeImg;

    //items
    let itemArray = [];
    let itemWidth = 34;
    let itemHeight = 34;
    let itemX = boardWidth;
    let itemY = 0;

    let itemImg;

    //physics
    var velocityX = -2; //pipes moving left speed
    let velocityY = 0; //bird jump speed
    let gravity = 0.4;
    var lastVelocityX;

    var invincibility = false;

    let gameOver = false;
    let score = 0;
    var highScore = parseInt(localStorage.getItem('highScore')) || 0;
    document.getElementById("score").textContent = highScore;

    let frameIndex = 0;
    const frames = []; // 프레임 정보를 저장할 배열
    let isLoaded = false;

    window.onload = function () {
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

        //load images
        birdImg1 = new Image();
        birdImg1.src = "https://raw.githubusercontent.com/ImKennyYip/flappy-bird/refs/heads/master/flappybird1.png";

        //load images
        birdImg2 = new Image();
        birdImg2.src = "https://raw.githubusercontent.com/ImKennyYip/flappy-bird/refs/heads/master/flappybird2.png";

        //load images
        birdImg3 = new Image();
        birdImg3.src = "https://raw.githubusercontent.com/ImKennyYip/flappy-bird/refs/heads/master/flappybird3.png";

        birdImg.onload = function () {
            context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
        }

        topPipeImg = new Image();
        topPipeImg.src = "https://raw.githubusercontent.com/ImKennyYip/flappy-bird/refs/heads/master/toppipe.png";

        bottomPipeImg = new Image();
        bottomPipeImg.src = "https://raw.githubusercontent.com/ImKennyYip/flappy-bird/refs/heads/master/bottompipe.png";

        itemImg = new Image();
        itemImg.src = "https://png.pngtree.com/png-clipart/20240501/ourmid/pngtree-red-booster-bubble-png-image_12350593.png";

        requestAnimationFrame(update);
        setInterval(placeItems, 3000); //every 3 seconds
        setInterval(placePipes, 1500); //every 1.5 seconds
        setInterval(speedUp, 1500); //every 1.5 seconds
        document.addEventListener("keydown", moveBird);
    }

    function speedUp() {
        if (!invincibility)
            velocityX -= 0.1;
    }

    function update() {
        requestAnimationFrame(update);
        if (gameOver) {
            if (score > highScore) {
                localStorage.setItem('highScore', score);
                document.getElementById("score").textContent = score;
            }
            velocityX = -2;
            return;
        }
        context.clearRect(0, 0, board.width, board.height);

        //Items
        for (let i = 0; i < itemArray.length; i++) {
            let item = itemArray[i];
            item.x += velocityX;
            context.drawImage(item.img, item.x, item.y, item.width, item.height);

            if (!item.passed && bird.x > item.x + item.width) {
                item.passed = true;
            }

            if (detectCollision(bird, item) && !invincibility) {
                Promise.resolve().then(() => beInvincible());
            }
        }

        //clear Items
        while (itemArray.length > 0 && itemArray[0].x < -itemWidth) {
            itemArray.shift(); //removes first element from the array
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

            if (!invincibility) {
                if (detectCollision(bird, pipe)) {
                    gameOver = true;
                }
            }
        }

        //clear pipes
        while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
            pipeArray.shift(); //removes first element from the array
        }

        //bird
        velocityY += gravity;
        // bird.y += velocityY;
        bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
        switch (getRandomInt(1,4)) {
            case 1:  currentBirdImg = birdImg1; break;
            case 2:  currentBirdImg = birdImg2; break;
            case 2:  currentBirdImg = birdImg3; break;
            default: currentBirdImg = birdImg; break;
        }
        context.drawImage(currentBirdImg, bird.x, bird.y, bird.width, bird.height);

        if (bird.y > board.height) {
            gameOver = true;
        }

        //score
        context.fillStyle = "white";
        context.font = "45px sans-serif";
        context.fillText(score, 5, 45);

        //velocity
        context.fillStyle = "white";
        context.font = "30px sans-serif";
        context.fillText(Math.floor(-velocityX * 10) / 10 + 'cm/s', 220, 40);

        if (gameOver) {
            context.fillText("GAME OVER", 5, 90);
        }
    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; //최댓값 포함
    }

    function beInvincible() {
        invincibility = true;
        console.log('lastVelocityX0 : ' + lastVelocityX + ' velocityX2: ' + velocityX + invincibility);
        lastVelocityX = velocityX;
        console.log('lastVelocityX1 : ' + lastVelocityX + ' velocityX2: ' + velocityX + invincibility);
        velocityX = lastVelocityX * 2;
        setTimeout(() => {
            invincibility = false;
            velocityX = lastVelocityX;
            console.log('lastVelocityX3 : ' + lastVelocityX + ' velocityX4: ' + velocityX + invincibility);
        }, 3000);
    }

    function placePipes() {
        if (gameOver) {
            return;
        }

        //(0-1) * pipeHeight/2.
        // 0 -> -128 (pipeHeight/4)
        // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
        let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
        let openingSpace = board.height / 4;

        let topPipe = {
            img: topPipeImg,
            x: pipeX,
            y: randomPipeY,
            width: pipeWidth,
            height: pipeHeight,
            passed: false
        }
        pipeArray.push(topPipe);

        let bottomPipe = {
            img: bottomPipeImg,
            x: pipeX,
            y: randomPipeY + pipeHeight + openingSpace,
            width: pipeWidth,
            height: pipeHeight,
            passed: false
        }
        pipeArray.push(bottomPipe);
    }

    function placeItems() {
        if (gameOver) {
            return;
        }

        let randomItemY = itemY + Math.random() * 300;
        let openingSpace = board.height / 4;

        let item = {
            img: itemImg,
            x: itemX,
            y: randomItemY,
            width: itemWidth,
            height: itemHeight,
            passed: false
        }
        itemArray.push(item);
    }

    function moveBird(e) {
        if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
            //jump
            velocityY = -6;

            //reset game
            if (gameOver) {
                bird.y = birdY;
                pipeArray = [];
                itemArray = [];
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
