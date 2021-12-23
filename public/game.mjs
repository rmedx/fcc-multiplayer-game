import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import helperFunctions from './helperFunctions.mjs';

// remove comment from line below if there is error
/*global io*/
const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

var players;
var ball;
var player;
let collisionCoords = [];
let opponentCollisionCoords = [];

socket.on('connection', () => {
    socket.send("client connected");
});
socket.on('user count', data => {
    console.log('User count: ' + data);
});
socket.on('players', data => {
    players = data;
});
socket.on('updated ball coords', data => {
    ball.x = data.x;
    ball.y = data.y;
});
socket.on('updated player coords', data => {
    players = data;
});
socket.on('collided', data => {
    players = data.players;
    if (data.collider.id == player.id) {
        collisionCoords.push({x: data.collider.x, y: data.collider.y});
    } else {
        opponentCollisionCoords.push({x: data.collider.x, y: data.collider.y});
    }
});
socket.on('victory', data => {
    clearInterval(interval);
    if (data.id == player.id) {
        context.fillStyle = 'white';
        context.font = "15px 'Press Start 2P'";
        context.fillText("VICTORY!", 300, 200);
        context.fillText("refresh page to restart", 200, 250);
    } else {
        context.fillStyle = 'white';
        context.font = "15px 'Press Start 2P'";
        context.fillText("YOU LOSE!", 300, 200);
        context.fillText("refresh page to restart", 200, 250);
    }
});
// set the size of the canvas
canvas.width = 700;
canvas.height = 500;

// instantiate a "collectible" ball with x, y, value, id, radius, dx, and dy
var ballId = 0;
ball = new Collectible(canvas.width / 2, canvas.height / 2, 1, ballId, 10, 2, -2);
const playerId = new Date().toUTCString();
let playerCoord = helperFunctions.playerRandomCoord(ball.x, ball.y, ball.radius, canvas.width, canvas.height);
player = new Player(playerCoord.x, playerCoord.y, 0, playerId);
socket.emit('new player', player);


function oneInterval() {
    collisionCheck();
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawBall();
    drawPlayers();
    if (collisionCoords != null) {
        collisionAnimation();
    }
    if (opponentCollisionCoords != null) {
        opponentCollisionAnimation();
    }
    movePlayer();
    socket.emit('updated player', player);
}
var interval = setInterval(oneInterval, 10);
let drawBackground = () => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, 700, 500);
    context.fillStyle = 'white';
    context.font = "15px 'Press Start 2P'";
    context.fillText("Controls: WASD", 10, 25);
    context.font = "20px 'Press Start 2P'";
    context.fillText("Coin Race", canvas.width / 2 - 85, 30);
    context.font = "15px 'Press Start 2P'";
    context.fillText(player.calculateRank(players), 525, 25);
    context.font = "10px 'Press Start 2P'";
    context.fillText(`Points: ${player.score}/4`, canvas.width - 150, 490);
    context.strokeStyle = 'white';
    context.beginPath();
    context.moveTo(5, 30);
    context.lineTo(695, 30);
    context.stroke();
    context.closePath();
}
let drawBall = () => {
    context.fillStyle = "gold";
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    context.fill();
    context.closePath();
}
let drawPlayers = () => {
    if (players && players.length) {
        players.forEach(player => {
            if (player.id == playerId) {
                context.fillStyle = "green";
                context.beginPath();
                context.arc(player.x, player.y, ball.radius, 0, Math.PI*2);
                context.fill();
                context.closePath();
            } else {
                context.fillStyle = "red";
                context.beginPath();
                context.arc(player.x, player.y, ball.radius, 0, Math.PI*2);
                context.fill();
                context.closePath();
            }
        })
    } else {
        console.log("no players");
    }
}
let collisionAnimation = () => {
    context.fillStyle = 'green';
    context.font = "15px 'Press Start 2P'";
    collisionCoords.forEach(coord => {
        context.fillText("+", coord.x, coord.y);
    });
}
let opponentCollisionAnimation = () => {
    context.fillStyle = 'red';
    context.font = "15px 'Press Start 2P'";
    opponentCollisionCoords.forEach(coord => {
        context.fillText("o", coord.x, coord.y);
    });
}
let collisionCheck = () => {
    if (Math.abs(ball.x - player.x) < 10 && Math.abs(ball.y - player.y) < 10) {
        player.collision();
        const coords = helperFunctions.ballRandomCoord(ball.x, ball.y, ball.radius, canvas.width, canvas.height, players);
        socket.emit('collision', {player, coords});
    }
}
let movePlayer = () => {
    let dx = 0;
    let dy = 0;
    if (keyStates.up == true) {
        dy -= 2;
    }
    if (keyStates.down == true) {
        dy += 2;
    }
    if (keyStates.left == true) {
        dx -= 2;
    }
    if (keyStates.right == true) {
        dx += 2;
    }
    player.movePlayer('dx', dx);
    player.movePlayer('dy', dy);
}
var keyStates = {
    up: false,
    down: false,
    left: false,
    right: false
}
let updateKeyStates = (code, value) => {
    if (code == 39 || code == 68) { // right
        keyStates.right = value;
    } else if (code == 40 || code == 83) { // down
        keyStates.down = value;
    } else if (code == 37 || code == 65) { // left
        keyStates.left = value;
    } else if (code == 38 || code == 87) { // up
        keyStates.up = value;
    }
}
document.addEventListener('keydown', keydown);
document.addEventListener('keyup', keyup)

function keydown(e) {
    updateKeyStates(e.keyCode, true);
}
function keyup(e) {
    updateKeyStates(e.keyCode, false);
}