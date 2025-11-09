import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { Rooms } from './rooms.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

// Static client
app.use(express.static(path.join(__dirname, '..', 'client')));

// Root serves index.html
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

const rooms = new Rooms();

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

io.on('connection', (socket) => {
  const { room: roomName = 'lobby', username = '' } = socket.handshake.query;
  const name = (username && String(username)) || `User-${genId().slice(0,4)}`;
  const room = rooms.get(roomName);

  room.addUser(socket.id, name);
  socket.join(roomName);

  // Send initial state
  socket.emit('state:full', room.state.getSerializable());
  io.to(roomName).emit('users:update', room.getUsersPublic());

  // Cursor updates
  socket.on('cursor:move', (pos) => {
    room.setCursor(socket.id, pos);
    const user = room.users.get(socket.id);
    const enriched = user ? { ...pos, name: user.name, color: user.color } : pos;
    socket.to(roomName).emit('cursor:update', { userId: socket.id, pos: enriched });
  });

  // Stroke lifecycle: stream points for real-time drawing
  socket.on('stroke:start', (payload) => {
    // payload: { tempId, tool, color, width, point: {x,y}, ts }
    const op = room.state.startOp({
      userId: socket.id,
      tool: payload.tool,
      color: payload.color,
      width: payload.width,
      ts: payload.ts || Date.now(),
      tempId: payload.tempId,
      firstPoint: payload.point,
    });
    // Map tempId->opId resolved for others
    io.to(roomName).emit('op:add', { ...op, points: [payload.point] });
  });

  socket.on('stroke:point', (payload) => {
    // payload: { tempId, point, ts }
    const update = room.state.appendPointByTempId(socket.id, payload.tempId, payload.point);
    if (update) {
      io.to(roomName).emit('op:update', update);
    }
  });

  socket.on('stroke:end', (payload) => {
    // payload: { tempId, ts }
    const op = room.state.finishOpByTempId(socket.id, payload.tempId);
    if (op) {
      io.to(roomName).emit('op:finalize', { opId: op.id });
    }
  });

  // Global undo/redo
  socket.on('undo', () => {
    const res = room.state.undo();
    if (res) io.to(roomName).emit('op:deactivate', { opId: res.opId });
  });

  socket.on('redo', () => {
    const res = room.state.redo();
    if (res) io.to(roomName).emit('op:activate', { opId: res.opId });
  });

  socket.on('disconnect', () => {
    room.removeUser(socket.id);
    io.to(roomName).emit('users:update', room.getUsersPublic());
    room.clearCursor(socket.id);
    socket.to(roomName).emit('cursor:remove', { userId: socket.id });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
