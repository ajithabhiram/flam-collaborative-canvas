function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export class DrawingState {
  constructor() {
    this.ops = []; // [{id, userId, tool, color, width, points: [{x,y}], isActive: true}]
    this.activeCount = 0; // number of leading ops that are active; tail after activeCount may be inactive (redo stack)
    this.tempToOp = new Map(); // key `${userId}:${tempId}` -> opId
  }

  startOp({ userId, tool, color, width, ts, tempId, firstPoint }) {
    // If we had undone, drop redo tail
    if (this.activeCount < this.ops.length) {
      this.ops = this.ops.slice(0, this.activeCount);
    }
    const op = {
      id: genId(),
      userId,
      tool, // 'brush' | 'eraser'
      color,
      width,
      ts,
      points: [],
      isActive: true,
    };
    this.ops.push(op);
    this.activeCount++;
    if (tempId) this.tempToOp.set(`${userId}:${tempId}`, op.id);
    if (firstPoint) {
      op.points.push(firstPoint);
    }
    return { ...op };
  }

  appendPointByTempId(userId, tempId, point) {
    const opId = this.tempToOp.get(`${userId}:${tempId}`);
    if (!opId) return null;
    const op = this.ops.find(o => o.id === opId);
    if (!op) return null;
    op.points.push(point);
    return { opId: op.id, point };
  }

  finishOpByTempId(userId, tempId) {
    const opId = this.tempToOp.get(`${userId}:${tempId}`);
    if (!opId) return null;
    this.tempToOp.delete(`${userId}:${tempId}`);
    const op = this.ops.find(o => o.id === opId);
    return op || null;
  }

  undo() {
    // deactivate last active op
    for (let i = this.activeCount - 1; i >= 0; i--) {
      const op = this.ops[i];
      if (op && op.isActive) {
        op.isActive = false;
        this.activeCount = i; // number of active ops becomes i
        return { opId: op.id };
      }
    }
    return null;
  }

  redo() {
    // reactivate next op if exists
    if (this.activeCount < this.ops.length) {
      const op = this.ops[this.activeCount];
      if (op && !op.isActive) {
        op.isActive = true;
        this.activeCount++;
        return { opId: op.id };
      }
    }
    return null;
  }

  getSerializable() {
    return {
      ops: this.ops.map(o => ({
        id: o.id,
        userId: o.userId,
        tool: o.tool,
        color: o.color,
        width: o.width,
        points: o.points,
        isActive: o.isActive,
      }))
    };
  }
}
