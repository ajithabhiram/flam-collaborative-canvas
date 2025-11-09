import { CanvasEngine } from './canvas.js';
import { WSClient } from './websocket.js';
import { genTempId } from './ws_utils.js';

const canvasEl = document.getElementById('canvas');
const engine = new CanvasEngine(canvasEl);
engine.attachPointerHandlers();

const usersEl = document.getElementById('users');
const cursorsEl = document.getElementById('cursors');
const toastContainer = document.getElementById('toast-container');
const userCountEl = document.getElementById('user-count');
const widthPreview = document.getElementById('width-preview');
const colorPreview = document.getElementById('color-preview');

// Toast notification system
function showToast(type, title, message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icons = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
  };
  
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 200);
  }, duration);
}

// Update width preview dynamically
function updateWidthPreview(width) {
  const size = Math.min(Math.max(width, 1), 24);
  widthPreview.style.setProperty('--preview-size', `${size}px`);
}

// Update color preview
function updateColorPreview(color) {
  colorPreview.style.background = color;
}

function usernameFromPrompt() {
  const n = sessionStorage.getItem('username') || prompt('Enter your name (optional):') || '';
  sessionStorage.setItem('username', n);
  return n;
}

function roomFromInput() {
  const v = document.getElementById('room').value.trim();
  return v || 'lobby';
}

document.getElementById('width').addEventListener('input', (e) => {
  const val = Number(e.target.value);
  document.getElementById('width-val').textContent = String(val);
  engine.setWidth(val);
  updateWidthPreview(val);
});

document.getElementById('color').addEventListener('input', (e) => {
  engine.setColor(e.target.value);
  updateColorPreview(e.target.value);
});

document.getElementById('tool-brush').addEventListener('click', (e) => {
  engine.setTool('brush');
  e.target.classList.add('active');
  document.getElementById('tool-eraser').classList.remove('active');
});

document.getElementById('tool-eraser').addEventListener('click', (e) => {
  engine.setTool('eraser');
  e.target.classList.add('active');
  document.getElementById('tool-brush').classList.remove('active');
});

document.getElementById('undo').addEventListener('click', () => ws && ws.undo());
document.getElementById('redo').addEventListener('click', () => ws && ws.redo());

document.getElementById('join-room').addEventListener('click', () => {
  location.href = location.pathname + `?room=${encodeURIComponent(roomFromInput())}`;
});

function getQueryParam(name) {
  const url = new URL(location.href);
  return url.searchParams.get(name);
}

// Initialize UI
document.getElementById('tool-brush').classList.add('active');
updateWidthPreview(6);
updateColorPreview('#111827');

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl+Z for undo
  if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
    e.preventDefault();
    ws && ws.undo();
  }
  // Ctrl+Y or Ctrl+Shift+Z for redo
  if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
    e.preventDefault();
    ws && ws.redo();
  }
  // B for brush
  if (e.key === 'b' || e.key === 'B') {
    document.getElementById('tool-brush').click();
  }
  // E for eraser
  if (e.key === 'e' || e.key === 'E') {
    document.getElementById('tool-eraser').click();
  }
});

let ws = null;
function connect() {
  const room = getQueryParam('room') || 'lobby';
  document.getElementById('room').value = room;
  ws = new WSClient({
    room,
    username: usernameFromPrompt(),
    onState: (state) => {
      // Load snapshot
      engine.ops.clear();
      for (const op of state.ops) {
        engine.upsertOp(op);
      }
      engine.redrawAll();
    },
    onOpAdd: (op) => {
      engine.upsertOp(op);
    },
    onOpUpdate: (opId, point) => engine.updateOpPoint(opId, point),
    onOpActivate: (opId) => engine.setOpActive(opId, true),
    onOpDeactivate: (opId) => engine.setOpActive(opId, false),
    onUsers: (users) => renderUsers(users),
    onCursor: ({ userId, pos }) => renderCursor(userId, pos)
  });
  ws.connect();
}

let previousUserCount = 0;

function renderUsers(users) {
  usersEl.innerHTML = '';
  
  // Update user count
  if (userCountEl) {
    userCountEl.textContent = users.length;
  }
  
  // Show toast for user join/leave
  if (previousUserCount > 0) {
    if (users.length > previousUserCount) {
      const newUser = users[users.length - 1];
      showToast('success', 'User Joined', `${newUser.name || 'Anonymous'} joined the room`);
    } else if (users.length < previousUserCount) {
      showToast('info', 'User Left', 'A user left the room');
    }
  }
  previousUserCount = users.length;
  
  for (const u of users) {
    const li = document.createElement('li');
    const sw = document.createElement('span');
    sw.className = 'swatch';
    sw.style.background = u.color;
    li.appendChild(sw);
    const text = document.createElement('span');
    text.textContent = `${u.name || 'Anonymous'}`;
    li.appendChild(text);
    usersEl.appendChild(li);
  }
}

const cursorEls = new Map();
function renderCursor(userId, pos) {
  if (!pos) {
    const el = cursorEls.get(userId);
    if (el) { el.remove(); cursorEls.delete(userId); }
    return;
  }
  let el = cursorEls.get(userId);
  if (!el) {
    el = document.createElement('div');
    el.className = 'cursor';
    el.innerHTML = `<span class="cursor-dot"></span><span class="cursor-label"></span>`;
    cursorsEl.appendChild(el);
    cursorEls.set(userId, el);
  }
  const dot = el.querySelector('.cursor-dot');
  const label = el.querySelector('.cursor-label');
  // We don't have direct user color/name here; using CSS default; upgraded via users list if desired
  if (pos.color) dot.style.background = pos.color;
  label.textContent = pos.name || '';
  const rect = canvasEl.getBoundingClientRect();
  const x = pos.x / engine.canvas.width * rect.width;
  const y = pos.y / engine.canvas.height * rect.height;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
}


let currentTemp = null;
engine.onPointerDown((p) => {
  currentTemp = genTempId();
  if (ws) {
    ws.startStroke({ tempId: currentTemp, tool: engine.tool, color: engine.color, width: engine.width, point: p });
  }
});
engine.onPointerMove((p) => {
  if (ws) {
    ws.emitCursor({ x: p.x, y: p.y });
  }
  if (!currentTemp) return;
  if (ws) {
    ws.sendPoint({ tempId: currentTemp, point: p });
  }
});
engine.onPointerUp(() => {
  if (!currentTemp) return;
  if (ws) {
    ws.endStroke({ tempId: currentTemp });
  }
  currentTemp = null;
});


connect();

// Show welcome toast
setTimeout(() => {
  const room = getQueryParam('room') || 'lobby';
  showToast('info', 'Welcome!', `You joined room: ${room}`);
}, 500);
