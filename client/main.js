import { CanvasEngine } from './canvas.js';
import { WSClient } from './websocket.js';
import { genTempId } from './ws_utils.js';

const canvasEl = document.getElementById('canvas');
const engine = new CanvasEngine(canvasEl);
engine.attachPointerHandlers();

const usersEl = document.getElementById('users');
const cursorsEl = document.getElementById('cursors');

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
});

document.getElementById('color').addEventListener('input', (e) => engine.setColor(e.target.value));

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

document.getElementById('tool-brush').classList.add('active');

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

function renderUsers(users) {
  usersEl.innerHTML = '';
  for (const u of users) {
    const li = document.createElement('li');
    const sw = document.createElement('span');
    sw.className = 'swatch';
    sw.style.background = u.color;
    li.appendChild(sw);
    const text = document.createElement('span');
    text.textContent = `${u.name}`;
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
