require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const events = require('../utils/events');
const registerDrawHandlers = require('../handlers/drawHandler');
const registerRoomHandlers = require('../handlers/roomHandler');
const registerCursorHandlers = require('../handlers/cursorHandler');

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      process.env.CLIENT_URL
    ],
    methods: ["GET", "POST"]
  }
});

app.get('/', (req, res) => {
  res.send('CollabBoard Server is Running');
});

io.on(events.CONNECT, (socket) => {
  console.log(`Client connected: ${socket.id}`);
  registerDrawHandlers(io, socket);
  registerRoomHandlers(io, socket);
  registerCursorHandlers(io, socket);

  socket.on(events.DISCONNECT, () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});