# Architecture

## Data Flow

- Pointer events on client generate streamed stroke events:
  - `stroke:start` with tool/color/width and first point
  - `stroke:point` for subsequent points
  - `stroke:end` when finished
- Server attaches each stream to an operation (op) and broadcasts:
  - `op:add` on start (with initial point)
  - `op:update` for each new point
  - `op:finalize` at end
- Clients render incrementally as updates arrive. On reconnect/join, server sends `state:full` snapshot.

## WebSocket Protocol

Events from client to server:
- `cursor:move` { x, y }
- `stroke:start` { tempId, tool, color, width, point, ts }
- `stroke:point` { tempId, point, ts }
- `stroke:end` { tempId, ts }
- `undo`
- `redo`

Events from server to clients:
- `state:full` { ops }
- `op:add` { id, userId, tool, color, width, points:[p], isActive }
- `op:update` { opId, point }
- `op:finalize` { opId }
- `op:activate` { opId }
- `op:deactivate` { opId }
- `users:update` [{ id, name, color }]
- `cursor:update` { userId, pos }
- `cursor:remove` { userId }

## Undo/Redo Strategy (Global)

- Server maintains op log per room with an `activeCount` pointer.
- Undo deactivates the last active op and decrements `activeCount`.
- Redo reactivates the next op at `activeCount` and increments it.
- If a new op is started after an undo (i.e., `activeCount < ops.length`), the redo tail is truncated (standard editor behavior).
- Server broadcasts minimal diffs: `op:deactivate`/`op:activate`.

## State Consistency & Conflict Resolution

- Single source of truth for op history lives on the server per room.
- Live drawing is streamed; server appends points to the current op and broadcasts updates to all clients.
- Overlaps are composited in draw order. Eraser uses `destination-out` blending on clients to remove pixels from previous content.
- On join/reconnect, full snapshot ensures consistency.

## Performance Decisions

- Points streamed individually with throttling on cursor moves; could batch per-frame using `requestAnimationFrame` for heavier loads.
- Canvas uses round caps/joins for smooth strokes; incremental drawing for incoming updates.
- Full redraw happens only on resize and undo/redo; otherwise incremental segments are drawn to avoid re-rendering the whole history.

## Rooms

- Simple rooms keyed by name (default `lobby`). Each room has its own users, cursors, and drawing state.

## Future Improvements

- Persist ops to storage and lazy-replay on join
- Server-side rasterization for authoritative bitmap (optional)
- Show user-colored cursors with names
- Batch points per-frame to reduce message count
- Add shapes/text tools and selection
