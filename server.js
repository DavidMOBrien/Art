const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

let games = {}; // { roomId: { state, players: [] } }

app.use(express.static('.'));

io.on('connection', (socket) => {
  let currentRoom = null;

  socket.on('join', (roomId) => {
    currentRoom = roomId;
    socket.join(roomId);
    if (!games[roomId]) {
      games[roomId] = { state: null, players: [] };
    }
    if (!games[roomId].players.includes(socket.id)) {
      games[roomId].players.push(socket.id);
    }
    // Assign player number
    const playerNum = games[roomId].players.indexOf(socket.id) + 1;
    socket.emit('playerNumber', { playerNum });
    // If two players, start the game
    if (games[roomId].players.length === 2) {
      // Notify both players to start the game
      io.to(roomId).emit('startGame');
      // If state exists, send it
      if (games[roomId].state) {
        io.to(roomId).emit('update', { state: games[roomId].state });
      }
    }
    // If state exists, send it to new player
    if (games[roomId].state) {
      socket.emit('update', { state: games[roomId].state });
    }
  });

  socket.on('startGame', ({ roomId, state }) => {
    games[roomId] = { state, players: games[roomId]?.players || [] };
    io.to(roomId).emit('update', { state });
  });

  socket.on('move', ({ roomId, move }) => {
    // Update state (in a real game, validate move here)
    if (games[roomId]) {
      // You'd want to apply the move to games[roomId].state here
      // For now, just broadcast the move
      io.to(roomId).emit('move', { move });
    }
  });

  socket.on('updateState', ({ roomId, state }) => {
    if (games[roomId]) {
      games[roomId].state = state;
      io.to(roomId).emit('update', { state });
    }
  });

  socket.on('disconnect', () => {
    if (currentRoom && games[currentRoom]) {
      games[currentRoom].players = games[currentRoom].players.filter(id => id !== socket.id);
      if (games[currentRoom].players.length === 0) {
        delete games[currentRoom];
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 