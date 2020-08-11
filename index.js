const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 500;

const keys = [];

const game = {
    scale: 1
}

const player = {
    x: (canvas.width / 2) - (32 * game.scale / 2),
    y: (canvas.height / 2) - (48 * game.scale / 2),
    width: 32,
    height: 48,
    frameX: 0,
    frameY: 0,
    speed: 6,
    moving: false
};

const enemy1 = {
    x: 100,
    y: 100,
    width: 50,
    height: 48,
    frameX: 0,
    frameY: 0,
    speed: 2,
    follow: false,
    range: 80
};

const enemy2 = {
    x: 600,
    y: 360,
    width: 50,
    height: 48,
    frameX: 0,
    frameY: 0,
    speed: 2,
    follow: false,
    range: 80
};

const enemies = [enemy1, enemy2]

const playerSprite = new Image();
playerSprite.src = "./assets/player_model.png";

const enemySprite = new Image();
enemySprite.src = "./assets/reaper_model.png";

function drawSprite(img, sX, sY, sW, sH, dX, dY, dW, dH){
    ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW * game.scale, dH * game.scale);
}
window.addEventListener("keydown", function(event){
    if ([37, 38, 39, 40].includes(event.keyCode)){
        if (!keys.includes(event.keyCode)) keys.push(event.keyCode)
    }
});

window.addEventListener("keyup", function(event){
    const index = keys.indexOf(event.keyCode)
    keys.splice(index, 1)
});

function checkHorizontal(destination){
    let available = true;
    enemies.forEach(enemy => {
        if (player.y > enemy.y + enemy.height || player.y + player.height < enemy.y) {
            return;
        }
        if (destination + enemy.range >= enemy.x && destination - enemy.range <= (enemy.x + enemy.width)) enemy.follow = true;
        if (destination >= enemy.x && destination <= (enemy.x + enemy.width)) available = false;
    })
    return available;
}

function checkVertical(destination) {
    let available = true;
    enemies.forEach(enemy => {
        if (player.x > enemy.x + enemy.width || player.x + player.width < enemy.x) {
            return;
        }
        if (destination + enemy.range >= enemy.y && destination - enemy.range + (enemy.y + enemy.height)) enemy.follow = true;
        if (destination >= enemy.y && destination <= (enemy.y + enemy.height)) available = false;
    })
    return available;
}

function movePlayer(){
    player.moving = keys.length > 0;

    if(keys[keys.length - 1] === 37){
        const destination = player.x - player.speed;
        if (player.x > 0 && checkHorizontal(destination)) player.x -= player.speed;
        ctx.translate(player.speed, 0);
        player.frameY = 1;
    }
    if(keys[keys.length - 1] === 38){
        const destination = player.y - player.speed;
        if (player.y > 0 && checkVertical(destination)) player.y -= player.speed;
        ctx.translate(0, player.speed)
        player.frameY = 3;
    }
    if(keys[keys.length - 1] === 39){
        const destination = player.x + player.width + player.speed;
        if (player.x < (canvas.width - player.width * game.scale) && checkHorizontal(destination)) player.x += player.speed;
        ctx.translate(- player.speed, 0);
        player.frameY = 2;
    }
    if(keys[keys.length - 1] === 40){
        const destination = player.y + player.height + player.speed;
        if (player.y < (canvas.height - player.height * game.scale) && checkVertical(destination)) player.y += player.speed;
        ctx.translate(0, - player.speed)
        player.frameY= 0;
    }
}

function handlePlayerFrame(){
    if (player.frameX < 3 && player.moving){
        player.frameX++;
    } else {
        player.frameX = 0;
    }
}

function animateEnemies(){
    enemies.forEach(enemy => {
        if(enemy.follow){
            if (player.y + player.height < enemy.y){
                enemy.frameY = 3;
                enemy.y -= enemy.speed;
            }
            if (player.y > enemy.y + enemy.height){
                enemy.frameY = 0;
                enemy.y += enemy.speed;
            }
            if (player.x + player.width < enemy.x){
                enemy.frameY = 1;
                enemy.x -= enemy.speed;
            }
            if (player.x > enemy.x + enemy.width) {
                enemy.frameY = 2;
                enemy.x += enemy.speed;
            }
        }
    })
}

let fps, fpsInterval, startTime, now, then, elapsed;

function startAnimation(fps){
    fpsInterval = 1000/fps;
    then = Date.now();
    startTime = then;
    animate();
}

function animate(){
    requestAnimationFrame(animate);
    now = Date.now();
    elapsed = now - then;
    if (elapsed > fpsInterval){
        then = now - (elapsed % fpsInterval);
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawSprite(playerSprite, player.width * player.frameX, player.height * player.frameY, player.width, player.height, player.x, player.y, player.width, player.height)
        enemies.forEach(enemy => {
            drawSprite(enemySprite, enemy.width * enemy.frameX, enemy.height * enemy.frameY, enemy.width, enemy.height, enemy.x, enemy.y, enemy.width, enemy.height)
        });
        movePlayer();
        handlePlayerFrame();
        animateEnemies();
    }
}

startAnimation(20);
