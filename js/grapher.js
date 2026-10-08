/**
 * ApexEngine 2D Graphing Engine with Canvas 2D
 */

class GrapherEngine {
  constructor() {
    this.canvas = document.getElementById("graphCanvas");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    this.xMin = -10;
    this.xMax = 10;
    this.yMin = -6;
    this.yMax = 6;

    this.functions = [
      { id: 1, expr: "sin(x)", color: "#00e5ff" },
      { id: 2, expr: "cos(x)", color: "#ff4081" }
    ];

    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.mouseCoords = { x: 0, y: 0 };

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());

    // Controls
    document.getElementById("xMin")?.addEventListener("change", (e) => { this.xMin = parseFloat(e.target.value); this.render(); });
    document.getElementById("xMax")?.addEventListener("change", (e) => { this.xMax = parseFloat(e.target.value); this.render(); });
    document.getElementById("yMin")?.addEventListener("change", (e) => { this.yMin = parseFloat(e.target.value); this.render(); });
    document.getElementById("yMax")?.addEventListener("change", (e) => { this.yMax = parseFloat(e.target.value); this.render(); });

    document.getElementById("zoomInBtn")?.addEventListener("click", () => this.zoom(0.8));
    document.getElementById("zoomOutBtn")?.addEventListener("click", () => this.zoom(1.25));
    document.getElementById("resetGraphBtn")?.addEventListener("click", () => this.resetView());
    document.getElementById("addFunctionBtn")?.addEventListener("click", () => this.addFunctionRow());
    document.getElementById("findRootsBtn")?.addEventListener("click", () => this.findRoots());

    // Mouse Interaction
    this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.canvas.addEventListener("mouseup", () => this.isDragging = false);
    this.canvas.addEventListener("wheel", (e) => this.onWheel(e));

    this.setupFunctionListeners();
    this.render();
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    this.canvas.width = parent.clientWidth;
    this.canvas.height = parent.clientHeight;
    this.render();
  }

  resetView() {
    this.xMin = -10; this.xMax = 10;
    this.yMin = -6; this.yMax = 6;
    this.updateInputFields();
    this.render();
  }

  updateInputFields() {
    const xMinEl = document.getElementById("xMin");
    const xMaxEl = document.getElementById("xMax");
    const yMinEl = document.getElementById("yMin");
    const yMaxEl = document.getElementById("yMax");
    if (xMinEl) xMinEl.value = this.xMin.toFixed(1);
    if (xMaxEl) xMaxEl.value = this.xMax.toFixed(1);
    if (yMinEl) yMinEl.value = this.yMin.toFixed(1);
    if (yMaxEl) yMaxEl.value = this.yMax.toFixed(1);
  }

  zoom(factor) {
    const xCenter = (this.xMin + this.xMax) / 2;
    const yCenter = (this.yMin + this.yMax) / 2;
    const xSpan = (this.xMax - this.xMin) * factor;
    const ySpan = (this.yMax - this.yMin) * factor;

    this.xMin = xCenter - xSpan / 2;
    this.xMax = xCenter + xSpan / 2;
    this.yMin = yCenter - ySpan / 2;
    this.yMax = yCenter + ySpan / 2;

    this.updateInputFields();
    this.render();
  }

  onMouseDown(e) {
    this.isDragging = true;
    this.dragStart = { x: e.clientX, y: e.clientY };
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const mathX = this.toMathX(px);
    const mathY = this.toMathY(py);
    this.mouseCoords = { x: mathX, y: mathY };

    const coordsDisplay = document.getElementById("graphCoords");
    if (coordsDisplay) {
      coordsDisplay.textContent = `X: ${mathX.toFixed(3)} | Y: ${mathY.toFixed(3)}`;
    }

    if (this.isDragging) {
      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;

      const xSpan = this.xMax - this.xMin;
      const ySpan = this.yMax - this.yMin;

      const xShift = (dx / this.canvas.width) * xSpan;
      const yShift = (dy / this.canvas.height) * ySpan;

      this.xMin -= xShift;
      this.xMax -= xShift;
      this.yMin += yShift;
      this.yMax += yShift;

      this.dragStart = { x: e.clientX, y: e.clientY };
      this.updateInputFields();
      this.render();
    }
  }

  onWheel(e) {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    this.zoom(factor);
  }

  toPixelX(x) {
    return ((x - this.xMin) / (this.xMax - this.xMin)) * this.canvas.width;
  }

  toPixelY(y) {
    return this.canvas.height - ((y - this.yMin) / (this.yMax - this.yMin)) * this.canvas.height;
  }

  toMathX(px) {
    return this.xMin + (px / this.canvas.width) * (this.xMax - this.xMin);
  }

  toMathY(py) {
    return this.yMin + ((this.canvas.height - py) / this.canvas.height) * (this.yMax - this.yMin);
  }

  setupFunctionListeners() {
    const list = document.getElementById("functionList");
    if (!list) return;

    list.querySelectorAll(".fn-input").forEach((input, index) => {
      input.addEventListener("input", () => {
        if (this.functions[index]) {
          this.functions[index].expr = input.value;
          this.render();
        }
      });
    });

    list.querySelectorAll(".remove-fn-btn").forEach((btn, index) => {
      btn.onclick = () => {
        if (this.functions.length > 1) {
          this.functions.splice(index, 1);
          this.syncUI();
          this.render();
        }
      };
    });
  }

  addFunctionRow() {
    const colors = ["#7c4dff", "#00e676", "#ffab00", "#ff5252"];
    const newColor = colors[this.functions.length % colors.length];
    this.functions.push({
      id: Date.now(),
      expr: "0.5*x",
      color: newColor
    });
    this.syncUI();
    this.render();
  }

  syncUI() {
    const list = document.getElementById("functionList");
    if (!list) return;

    list.innerHTML = this.functions.map((fn, idx) => `
      <div class="function-row" data-id="${fn.id}">
        <span class="color-badge" style="background:${fn.color};"></span>
        <span class="fn-label">y${idx + 1} =</span>
        <input type="text" class="fn-input" value="${fn.expr}" placeholder="Function of x">
        <button class="btn-icon remove-fn-btn">✕</button>
      </div>
    `).join("");

    this.setupFunctionListeners();
  }

  render() {
    if (!this.ctx) return;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear background
    this.ctx.fillStyle = "#0a0e17";
    this.ctx.fillRect(0, 0, w, h);

    // Draw Grid & Axes
    this.drawGrid();
    this.drawAxes();

    // Plot Functions
    this.functions.forEach(fn => {
      if (!fn.expr || fn.expr.trim() === '') return;
      this.plotFunction(fn.expr, fn.color);
    });
  }

  drawGrid() {
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    this.ctx.lineWidth = 1;

    const xStep = Math.pow(10, Math.floor(Math.log10(this.xMax - this.xMin))) / 2;
    const startX = Math.floor(this.xMin / xStep) * xStep;

    for (let x = startX; x <= this.xMax; x += xStep) {
      const px = this.toPixelX(x);
      this.ctx.beginPath();
      this.ctx.moveTo(px, 0);
      this.ctx.lineTo(px, this.canvas.height);
      this.ctx.stroke();
    }

    const yStep = Math.pow(10, Math.floor(Math.log10(this.yMax - this.yMin))) / 2;
    const startY = Math.floor(this.yMin / yStep) * yStep;

    for (let y = startY; y <= this.yMax; y += yStep) {
      const py = this.toPixelY(y);
      this.ctx.beginPath();
      this.ctx.moveTo(0, py);
      this.ctx.lineTo(this.canvas.width, py);
      this.ctx.stroke();
    }
  }

  drawAxes() {
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    this.ctx.lineWidth = 2;

    const zeroX = this.toPixelX(0);
    const zeroY = this.toPixelY(0);

    // Y Axis
    this.ctx.beginPath();
    this.ctx.moveTo(zeroX, 0);
    this.ctx.lineTo(zeroX, this.canvas.height);
    this.ctx.stroke();

    // X Axis
    this.ctx.beginPath();
    this.ctx.moveTo(0, zeroY);
    this.ctx.lineTo(this.canvas.width, zeroY);
    this.ctx.stroke();
  }

  plotFunction(expr, color) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();

    let isFirst = true;
    const steps = this.canvas.width;

    for (let i = 0; i <= steps; i++) {
      const px = i;
      const x = this.toMathX(px);

      try {
        window.mathEngine.variables.X = x;
        const res = window.mathEngine.evaluate(expr);
        const y = typeof res === 'number' ? res : parseFloat(res);

        if (isNaN(y) || !isFinite(y)) {
          isFirst = true;
          continue;
        }

        const py = this.toPixelY(y);

        if (isFirst) {
          this.ctx.moveTo(px, py);
          isFirst = false;
        } else {
          this.ctx.lineTo(px, py);
        }
      } catch (e) {
        isFirst = true;
      }
    }

    this.ctx.stroke();
  }

  findRoots() {
    const fn = this.functions[0];
    if (!fn || !fn.expr) return;

    const roots = [];
    const step = (this.xMax - this.xMin) / 200;

    for (let x = this.xMin; x < this.xMax; x += step) {
      window.mathEngine.variables.X = x;
      const y1 = parseFloat(window.mathEngine.evaluate(fn.expr));
      window.mathEngine.variables.X = x + step;
      const y2 = parseFloat(window.mathEngine.evaluate(fn.expr));

      if (y1 * y2 <= 0) {
        // Sign change -> Newton-Raphson approximation
        let root = x;
        for (let k = 0; k < 10; k++) {
          window.mathEngine.variables.X = root;
          const fx = parseFloat(window.mathEngine.evaluate(fn.expr));
          const dfx = window.mathEngine.derivative(fn.expr, root);
          if (Math.abs(dfx) < 1e-12) break;
          root = root - fx / dfx;
        }
        if (!roots.some(r => Math.abs(r - root) < 1e-4)) {
          roots.push(root);
        }
      }
    }

    const out = document.getElementById("analysisOutput");
    if (out) {
      if (roots.length === 0) {
        out.innerHTML = `No real roots found in current view window [${this.xMin.toFixed(1)}, ${this.xMax.toFixed(1)}].`;
      } else {
        out.innerHTML = `<strong>Roots for y = ${fn.expr}:</strong><br>` +
          roots.map(r => `x = ${r.toFixed(5)}`).join("<br>");
      }
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.grapherEngine = new GrapherEngine();
});
