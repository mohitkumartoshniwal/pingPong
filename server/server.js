const http = require('http').createServer();
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});
const { initGame, gameLoop } = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeid } = require('./utils');
const state = {};
const clientRooms = {};
let directions = false;

io.on('connection', client => {

  client.on('keydown', handleKeyDown);
  client.on('newGame', handleNewGame);
  client.on('joinGame', handleJoinGame);

  function handleJoinGame(roomName) {
    const room = io.sockets.adapter.rooms.get(roomName);

    if (!room) {
      client.emit('unknownCode');
      return;
    } else if (room && room.size > 1) {
      client.emit('tooManyPlayers');
      return;
    }

    clientRooms[client.id] = roomName;

    client.join(roomName);
    client.number = 2;
    client.emit('init', 2);
    
    startGameInterval(roomName);
  }

  function handleNewGame() {
    let roomName = makeid(5);
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);

    state[roomName] = initGame();
    client.join(roomName);
    client.number = 1;
    client.emit('init', 1);
    
  }

  function handleKeyDown(keyCode) {
    const roomName = clientRooms[client.id];
    if (!roomName) {
      return;
    }
    try {
      keyCode = parseInt(keyCode);
    } catch(e) {
      console.error(e);
      return;
    }

    if(keyCode == 87 || keyCode == 38) {
      directions = false;
    } else if (keyCode == 40 || keyCode == 83) {
      directions = true;
    }

    if(directions) {
      state[roomName].players[client.number - 1].y += 7;
      if(state[roomName].players[client.number - 1].y +
        state[roomName].players[client.number - 1].height > state[roomName].canvas.height) {
          state[roomName].players[client.number - 1].y = state[roomName].canvas.height - state[roomName].players[client.number - 1].height;
      }
    } else if (!directions) {
      state[roomName].players[client.number - 1].y -= 7;
      if(state[roomName].players[client.number - 1].y < 0) {
        state[roomName].players[client.number - 1].y = 0;
      }
    }
  }
});

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    let winner = undefined;
    winner = gameLoop(state[roomName]);
    
    if (!winner) {
      emitGameState(roomName, state[roomName])
    } else {
      const prevPoints1 = state[roomName].score.p1;
      const prevPoints2 = state[roomName].score.p2;
      const previousNumberOfGames = state[roomName].numberOfGames;

      state[roomName] = null;
      state[roomName] = initGame();
      state[roomName].score.p1 = prevPoints1;
      state[roomName].score.p2 = prevPoints2;
      state[roomName].numberOfGames = previousNumberOfGames;
      
      if(state[roomName].numberOfGames > prevPoints1 && 
        state[roomName].numberOfGames > prevPoints2) {
        emitGameState(roomName, state[roomName]);
      } else {
        console.log('GAMEOVER')
        emitGameOver(roomName, state[roomName]);
        clearInterval(intervalId);
      }
    } 
  }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  io.sockets.in(room)
    .emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, state) {
  io.sockets.in(room)
    .emit('gameOver', JSON.stringify({ state }));
}

http.listen(3000, () => {
    console.log('Listening to port: ', 3000);
})