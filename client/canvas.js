export class CanvasEngine {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.ctx = this.canvas.getContext('2d');
    this.pixelRatio = window.devicePixelRatio || 1;

    this.tool = 'brush';
    this.color = '#111827';
    this.width = 6;

    this.isDrawing = false;
    this.lastPoint = null;

    this.ops = new Map(); // opId -> op

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas);
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  setTool(tool) { this.tool = tool; }
  setColor(color) { this.color = color; }
  setWidth(w) { this.width = w; }

  onPointerDown(cb) { this._onDown = cb; }
  onPointerMove(cb) { this._onMove = cb; }
  onPointerUp(cb) { this._onUp = cb; }

  attachPointerHandlers() {
    const c = this.canvas;
    c.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const p = this._eventPoint(e);
      this.isDrawing = true;
      this.lastPoint = p;
      this._onDown && this._onDown(p);
    });
    window.addEventListener('pointermove', (e) => {
      const p = this._eventPoint(e);
      this._onMove && this._onMove(p);
      if (!this.isDrawing) return;
      this.drawSegmentLocal(this.tool, this.color, this.width, this.lastPoint, p);
      this.lastPoint = p;
    });
    window.addEventListener('pointerup', () => {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      this._onUp && this._onUp();
    });
    window.addEventListener('pointerleave', () => {
      if (this.isDrawing) {
        this.isDrawing = false;
        this._onUp && this._onUp();
      }
    });
  }

  _eventPoint(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
    return { x, y };
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width * this.pixelRatio));
    const h = Math.max(1, Math.floor(rect.height * this.pixelRatio));
    if (this.canvas.width === w && this.canvas.height === h) return;
    this.canvas.width = w;
    this.canvas.height = h;
    this.redrawAll();
  }

  redrawAll() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const op of this.ops.values()) {
      if (!op.isActive) continue;
      this._drawOp(op);
    }
  }

  upsertOp(op) {
    this.ops.set(op.id, op);
    this._drawOpIncremental(op);
  }

  updateOpPoint(opId, point) {
    const op = this.ops.get(opId);
    if (!op) return;
    op.points.push(point);
    const n = op.points.length;
    if (n >= 2) {
      const a = op.points[n - 2];
      const b = op.points[n - 1];
      this.drawSegment(op.tool, op.color, op.width, a, b);
    }
  }

  setOpActive(opId, isActive) {
    const op = this.ops.get(opId);
    if (!op) return;
    op.isActive = isActive;
    this.redrawAll();
  }

  _drawOp(op) {
    if (!op.points || op.points.length < 2) return;
    for (let i = 1; i < op.points.length; i++) {
      this.drawSegment(op.tool, op.color, op.width, op.points[i - 1], op.points[i]);
    }
  }

  _drawOpIncremental(op) {
    if (!op.points || op.points.length < 2) return;
    const lastTwo = op.points.slice(-2);
    this.drawSegment(op.tool, op.color, op.width, lastTwo[0], lastTwo[1]);
  }

  drawSegment(tool, color, width, a, b) {
    const ctx = this.ctx;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = width * this.pixelRatio;
    
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
    }
    
    // Use quadratic curve for smoother strokes
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(a.x, a.y, midX, midY);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    
    // Add anti-aliasing for smoother appearance
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = (width * this.pixelRatio) + 1;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(a.x, a.y, midX, midY);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    
    ctx.restore();
  }

  drawSegmentLocal(tool, color, width, a, b) {
    this.drawSegment(tool, color, width, a, b);
  }
}
