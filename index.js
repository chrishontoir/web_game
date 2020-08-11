const canvas = document.getElementById('canvas1');
const lives = document.getElementById('lives');
const ammo = document.getElementById('ammo');
const reload = document.getElementById('reload');
const ctx = canvas.getContext('2d');

const game = {
    scale: 1
}

canvas.width = 800;
canvas.height = 500;


const keys = [];

const player = {
    x: (canvas.width / 2) - (32 * game.scale / 2),
    y: (canvas.height / 2) - (48 * game.scale / 2),
    width: 32,
    height: 48,
    frameX: 0,
    frameY: 0,
    speed: 6,
    moving: false,
    facing: 'S',
    lives: 3,
    attack: 0,
    ammo: 5,
    reload: 0
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
window.addEventListener("keydown", async function (event){
    if ([37, 38, 39, 40].includes(event.keyCode)){
        if (!keys.includes(event.keyCode)) keys.push(event.keyCode)
    }

    if (event.keyCode === 32){
        player.attack = true;
    }
});

window.addEventListener("keyup", function(event){
    if ([37, 38, 39, 40].includes(event.keyCode)){
        const index = keys.indexOf(event.keyCode)
        keys.splice(index, 1)
    }

    if (event.keyCode === 32){
        player.attack = false;
    }
});

function checkHorizontal(destination){
    let available = true;
    enemies.forEach(enemy => {
        if (player.y > enemy.y + enemy.height || player.y + player.height < enemy.y) {
            return;
        }
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
        if (destination >= enemy.y && destination <= (enemy.y + enemy.height)) available = false;
    })
    return available;
}

function movePlayer(){
    player.moving = keys.length > 0;

    if(keys[keys.length - 1] === 37){
        const destination = player.x - player.speed;
        if (player.x > 0 && checkHorizontal(destination)) player.x -= player.speed;
        // ctx.translate(player.speed, 0);
        player.frameY = 1;
        player.facing = 'W';
    }
    if(keys[keys.length - 1] === 38){
        const destination = player.y - player.speed;
        if (player.y > 0 && checkVertical(destination)) player.y -= player.speed;
        // ctx.translate(0, player.speed)
        player.frameY = 3;
        player.facing = 'N';
    }
    if(keys[keys.length - 1] === 39){
        const destination = player.x + player.width + player.speed;
        if (player.x < (canvas.width - player.width * game.scale) && checkHorizontal(destination)) player.x += player.speed;
        // ctx.translate(- player.speed, 0);
        player.frameY = 2;
        player.facing = 'E';
    }
    if(keys[keys.length - 1] === 40){
        const destination = player.y + player.height + player.speed;
        if (player.y < (canvas.height - player.height * game.scale) && checkVertical(destination)) player.y += player.speed;
        // ctx.translate(0, - player.speed)
        player.frameY= 0;
        player.facing = 'S';
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
        } else {
            if (
                player.x < enemy.x + enemy.width + enemy.range &&
                player.x > enemy.x - enemy.range &&
                player.y < enemy.y + enemy.height + enemy.range &&
                player.y > enemy.y - enemy.range
            ){
                enemy.follow = true;
            }
        }
    })
}

const bullets = [];

function playerAttack() {
    if (player.ammo === 0) {
        player.reload++;
    }
    if (player.reload === 30) {
        console.log('RELOADED')
        player.ammo = 5;
        player.reload = 0;
    }
    if (player.attack && player.ammo > 0){

        bullets.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            facing: player.facing
        })
        player.ammo--;
    }
    if (bullets.length > 0) {
        bullets.forEach(bullet => {
            switch (bullet.facing) {
                case 'N':
                    bullet.y -= 30;
                    bullet.width = 2;
                    bullet.height = 10;
                    break;
                case 'E':
                    bullet.x += 30;
                    bullet.width = 10;
                    bullet.height = 2;
                    break;
                case 'S':
                    bullet.y += 30;
                    bullet.width = 2;
                    bullet.height = 10;
                    break;
                case 'W':
                    bullet.x -= 30;
                    bullet.width = 10;
                    bullet.height = 2;
                    break;
            }
        })
    }
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
        ctx.fillStyle = "#00FF00";
        ctx.fillRect(player.x - 9, player.y - 10, 50, 3);
        drawSprite(playerSprite, player.width * player.frameX, player.height * player.frameY, player.width, player.height, player.x, player.y, player.width, player.height)
        enemies.forEach(enemy => {
            ctx.fillStyle = "#FF0000";
            ctx.font = "14px Comic Sans MS"
            ctx.fillText('30', enemy.x + 18, enemy.y - 14);
            ctx.fillRect(enemy.x, enemy.y - 10, 50, 3)
            drawSprite(enemySprite, enemy.width * enemy.frameX, enemy.height * enemy.frameY, enemy.width, enemy.height, enemy.x, enemy.y, enemy.width, enemy.height)
        });
        movePlayer();
        handlePlayerFrame();
        playerAttack();
        bullets.forEach(bullet => {
            ctx.fillStyle = "#0000FF";
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
        })
        animateEnemies();
        lives.innerText = player.lives;
        ammo.innerText = player.ammo;
        reload.value = player.reload;
        console.log(player.reload)
    }
}

startAnimation(20);
