import { DrawingState } from './drawing-state.js';

const USER_COLORS = [
  '#e11d48', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'
];

class Room {
  constructor(name) {
    this.name = name;
    this.state = new DrawingState();
    this.users = new Map(); // socketId -> { id, name, color }
    this.cursors = new Map(); // socketId -> {x,y}
    this.colorIdx = 0;
  }

  addUser(socketId, name) {
    const color = USER_COLORS[this.colorIdx % USER_COLORS.length];
    this.colorIdx++;
    this.users.set(socketId, { id: socketId, name, color });
  }

  removeUser(socketId) {
    this.users.delete(socketId);
  }

  getUsersPublic() {
    return Array.from(this.users.values()).map(u => ({ id: u.id, name: u.name, color: u.color }));
  }

  setCursor(socketId, pos) {
    this.cursors.set(socketId, pos);
  }

  clearCursor(socketId) {
    this.cursors.delete(socketId);
  }
}

export class Rooms {
  constructor() {
    this.rooms = new Map();
  }

  get(name) {
    if (!this.rooms.has(name)) {
      this.rooms.set(name, new Room(name));
    }
    return this.rooms.get(name);
  }
}
