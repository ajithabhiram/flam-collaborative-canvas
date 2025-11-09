import { throttle } from './ws_utils.js';

export class WSClient {
  constructor({ room, username, onState, onOpAdd, onOpUpdate, onOpActivate, onOpDeactivate, onUsers, onCursor }) {
    this.room = room || 'lobby';
    this.username = username;
    this.socket = null;

    this.onState = onState;
    this.onOpAdd = onOpAdd;
    this.onOpUpdate = onOpUpdate;
    this.onOpActivate = onOpActivate;
    this.onOpDeactivate = onOpDeactivate;
    this.onUsers = onUsers;
    this.onCursor = onCursor;
  }

  connect() {
    this.socket = io({ query: { room: this.room, username: this.username } });

    this.socket.on('connect', () => {
      // console.log('Connected', this.socket.id);
    });

    this.socket.on('state:full', (state) => this.onState && this.onState(state));
    this.socket.on('op:add', (op) => this.onOpAdd && this.onOpAdd(op));
    this.socket.on('op:update', ({ opId, point }) => this.onOpUpdate && this.onOpUpdate(opId, point));
    this.socket.on('op:finalize', () => {});
    this.socket.on('op:activate', ({ opId }) => this.onOpActivate && this.onOpActivate(opId));
    this.socket.on('op:deactivate', ({ opId }) => this.onOpDeactivate && this.onOpDeactivate(opId));

    this.socket.on('users:update', (users) => this.onUsers && this.onUsers(users));
    this.socket.on('cursor:update', (payload) => this.onCursor && this.onCursor(payload));
    this.socket.on('cursor:remove', (payload) => this.onCursor && this.onCursor(payload));

    this._emitCursor = throttle((pos) => this.socket.emit('cursor:move', pos), 16);
  }

  emitCursor(pos) {
    if (!this.socket) return;
    this._emitCursor(pos);
  }

  startStroke({ tempId, tool, color, width, point }) {
    if (!this.socket) return;
    this.socket.emit('stroke:start', { tempId, tool, color, width, point, ts: Date.now() });
  }
  sendPoint({ tempId, point }) {
    if (!this.socket) return;
    this.socket.emit('stroke:point', { tempId, point, ts: Date.now() });
  }
  endStroke({ tempId }) {
    if (!this.socket) return;
    this.socket.emit('stroke:end', { tempId, ts: Date.now() });
  }

  undo() { this.socket.emit('undo'); }
  redo() { this.socket.emit('redo'); }
}
