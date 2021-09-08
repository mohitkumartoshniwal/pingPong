const { GRID_SIZE } = require('./constants');

module.exports = {
  initGame,
  gameLoop,
}

function initGame() {
  const state = createGameState();
  return state;
}

function createGameState() {
  return {
    players: [
    {
      x: 10,
      y: (320-75)/2,
      width: 10,
      height: 75,
      velY: 7
    }, 
    {
      x: (480-10)-10,
      y: (320-75)/2,
      width: 10,
      height: 75,
      velY: 7
    }],
    ball: {
      x: 30,
      y: 320/2,
      dx: 2,
      dy: -2,
      radius: 10
    },
    canvas: {
      height: 320,
      width: 480
    },
    score: {
      p1: 0,
      p2: 0
    },
    numberOfGames: 5
  };
}

function gameLoop(state) {
  if (!state) {
    return;
  }
  return updateBall(state);;
} 

function updateBall(state) {
  if(state.ball.x + state.ball.dx < (state.players[0].width + state.ball.radius)) {
    if((state.ball.y > state.players[0].y) && (state.ball.y < state.players[0].y + state.players[0].height)) {
      state.ball.dx = -state.ball.dx;
    } else {
        state.score.p2++;
        return 2;
    }
} else if (state.ball.x + state.ball.dx > state.canvas.width-state.ball.radius-state.players[1].width) {
    if(state.ball.y > state.players[1].y && state.ball.y < state.players[1].y + state.players[1].height) {
      state.ball.dx = -state.ball.dx;
    } else {
        state.score.p1++;
        return 1;
    }
  } else if(state.ball.y + state.ball.dy < state.ball.radius || state.ball.y + state.ball.dy > state.canvas.height-state.ball.radius) {
    state.ball.dy = -state.ball.dy;
  }
  state.ball.x += state.ball.dx;
  state.ball.y += state.ball.dy;

  return false;
}