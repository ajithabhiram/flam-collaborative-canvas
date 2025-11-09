# Collaborative Canvas

Minimal multi-user real-time drawing app using vanilla JS, HTML5 Canvas, and Node.js + Socket.io.

## Setup

- Prereqs: Node.js LTS 18+
- Install and run:

```
npm install
npm start
```

Open http://localhost:3000 in multiple tabs to test.

## Features

- Brush and eraser
- Color and stroke width
- Real-time streaming strokes (see while drawing)
- Online users list (name + color)
- Cursor indicators
- Global undo/redo across all users
- Rooms via `?room=name` (input in UI)

## How to test multi-user

- Open two browser tabs/windows to http://localhost:3000
- Optionally set different rooms via the Room input or URL `?room=team1`
- Draw in one tab and watch it appear in the other in real time
- Try Undo/Redo in any tab; it affects the global canvas state for that room

## Known limitations

- No persistence across server restarts (in-memory only)
- Cursor labels don't show user names/colors in the overlay (kept minimal)
- Basic conflict resolution: eraser uses compositing; overlapping strokes both apply
- No mobile gesture UI tweaks; pointer events should work on touch devices

## Time spent

- Scaffolding + server: ~45m
- Canvas engine + client WS: ~75m
- Docs + polish: ~30m

## Scripts

- `npm start` – start server on port 3000
- `npm run dev` – start with nodemon reload
