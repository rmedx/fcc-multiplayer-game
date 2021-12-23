require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const helmet = require('helmet');
const cors = require('cors');
const nocache = require("nocache");

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({origin: '*'}));
app.use(helmet());
app.use(nocache());

// lies that website is powered by php 7.4.3 and adds it to the response header
app.use((req, res, next) => {
  res.append('x-powered-by', 'PHP 7.4.3');
  next();
});

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = http.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

// Socket
let currentUsers = 0;
var players = [];
var ballData = {x: 700/2, y: 500/2, radius: 10, width: 700, height: 500};
let directions = [2, -2, 3, -3, 4, -4];
const randomSpeed = () => {
  return directions[Math.floor(Math.random() * directions.length)];
}
io.on('connection', socket => {
  currentUsers++;
  io.emit('user count', currentUsers);
  console.log('A user has connected');
  console.log(socket.id);
  socket.on('disconnect', () => {
    currentUsers--;
    io.emit('user count', currentUsers);
    console.log('A user has disconnected');
  });
  socket.on('new player', player => {
    players.push(player);
    io.emit('players', players);
  })
  socket.on('updated player', player => {
    players.forEach(unit => {
      if (unit.id == player.id) {
        unit.x = player.x;
        unit.y = player.y;
      }
    });
  });
  let interval;
  socket.on('collision', data => {
    let colliderID = data.player.id;
    players.forEach(unit => {
      if (unit.id == colliderID) {
        unit.score = data.player.score;
        if (unit.score >= 4) {
          io.emit('victory', data.player);
        }
      }
    })
    ballData.x = data.coords.x;
    ballData.y = data.coords.y;
    dx = randomSpeed();
    dy = randomSpeed();
    io.emit('collided', {players: players, collider: data.player});
  })
});
let dx = randomSpeed();
let dy = randomSpeed();
const emitGameStates = (data) => {
  interval = setInterval(() => {
    let result = moveBall(data, dx, dy);
    ballData = result.data;
    dx = result.dx;
    dy = result.dy;
    io.emit('updated ball coords', ballData);
    io.emit('updated player coords', players);
  }, 10);
}
const moveBall = (data, dx, dy) => {
  if (data.x + dx > data.width - data.radius || data.x + dx < data.radius) {
    dx = -dx;
  }
  if (data.y + dy > data.height - data.radius || data.y + dy < data.radius + 30) { // 30px is line height in game.mjs
      dy = -dy;
  }
  data.x += dx;
  data.y += dy;
  return ({data, dx, dy});
}
emitGameStates(ballData);
module.exports = app; // For testing
