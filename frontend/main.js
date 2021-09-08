let canvas, ctx;
let playerNumber;
let gameActive = false;
let score;
const BG_COLOUR = '#eee';
const BALL_COLOUR = '#FF8C00';
const PADDLE_COLOUR1 = '#0095DD';
const PADDLE_COLOUR2 = 'red';
const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const GameCode = document.getElementById('GameCode');
const scoreCard = document.getElementById('scoreBoard');
const socket = io('http://localhost:3000');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('restart', handleRestart);

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);


function newGame() {
  socket.emit('newGame');
  init();
}
function joinGame() {
  const code = gameCodeInput.value;

  socket.emit('joinGame', code);
  init();
}

function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  canvas.width = 480;
  canvas.height = 320;
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  document.addEventListener("keydown", keydown, false);
  document.addEventListener("keyup", keyup, false);
  gameActive = true;
}

function keydown(e) {
  socket.emit('keydown', e.keyCode);
}

function keyup(e) {
    socket.emit('keyup', e.keyCode);
}

function handleGameState(gameState) {
  if (!gameActive) {
    return;
  }
  gameState = JSON.parse(gameState);
  if(!score) {
    score = document.createElement('h1');
    score.setAttribute('id','scores');
    scoreCard.appendChild(score);
  } else {
    score = document.getElementById('scores');
  }
  
  score.innerText = `${gameState.score.p1} : ${gameState.score.p2}`;
  requestAnimationFrame(() => {
      paintGame(gameState)
  });
}

function paintGame(state) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const ball = state.ball;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
  ctx.fillStyle = BALL_COLOUR;
  ctx.fill();
  ctx.closePath();
  paintPlayer(state.players[0], PADDLE_COLOUR1);
  paintPlayer(state.players[1], PADDLE_COLOUR2);
}

function paintPlayer(playerState, colour) {
  const paddle = playerState;

  ctx.fillStyle = colour;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function handleInit(number) {
  playerNumber = number;
  if(playerNumber == 2) {
    console.log(GameCode, "GameCode");
    GameCode.style.display = 'none';
  }
}

function handleRestart(scores) {
  console.log(scores, "SCORES");
  if(scores) {
    if(playerNumber==1){
      scoreCard.innerText = `${scores.playerNumber} : ${scores[2]}`
    }else if(playerNumber==2){
      scoreCard.innerText = `${scores.playerNumber} : ${scores[1]}`
    }
    init();
  }
}

function handleGameOver(data) {
  if (!gameActive) {
    return;
  }
  data = JSON.parse(data);
  const state = data.state;
  let winner;
  if(state.score.p1 > state.score.p2) {
    winner = 1;
  } else {
    winner = 2;
  }
  gameActive = false;

  if (winner === playerNumber) {
    alert('You Win!');
    document.location.reload();
  } else {
    alert('You Lose :(');
    document.location.reload();
  }
}

function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}

function handleUnknownCode() {
  reset();
  alert('Unknown Game Code')
}

function handleTooManyPlayers() {
  reset();
  alert('This game is already in progress');
}

function reset() {
  playerNumber = null;
  gameCodeInput.value = '';
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}