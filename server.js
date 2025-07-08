const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Initial global state: phase, draft, battle
let globalState = {
  phase: 'draft',
  draft: {
    currentPlayer: 1,
    currentPick: 1,
    maxPicks: 3,
    player1Selections: [],
    player2Selections: [],
    selectedCharacterId: null
  },
  battle: null // Will be set after draft
};

app.use(express.static('.'));

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Send the current global state to the new client
  socket.emit('update', { state: globalState });

  socket.on('updateState', ({ state }) => {
    globalState = state;
    io.emit('update', { state: globalState }); // Broadcast to all
  });

  socket.on('resetGame', () => {
    globalState = {
      phase: 'draft',
      draft: {
        currentPlayer: 1,
        currentPick: 1,
        maxPicks: 3,
        player1Selections: [],
        player2Selections: [],
        selectedCharacterId: null
      },
      battle: null
    };
    io.emit('update', { state: globalState });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 