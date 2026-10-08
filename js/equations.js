/**
 * ApexEngine Equation Solver Module (Polynomial & Linear Systems)
 */

class EquationSolver {
  constructor() {
    this.currentType = "linear2";
    this.init();
  }

  init() {
    const tabs = document.querySelectorAll(".solver-tab-btn");
    tabs.forEach(tab => {
      tab.addEventListener("click", (e) => {
        tabs.forEach(t => t.classList.remove("active"));
        e.target.classList.add("active");
        this.currentType = e.target.getAttribute("data-type");
        this.renderForm();
      });
    });

    this.renderForm();
  }

  renderForm() {
    const card = document.getElementById("solverFormCard");
    if (!card) return;

    if (this.currentType === "linear2") {
      card.innerHTML = `
        <h3>2x2 System of Linear Equations</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 12px;">a₁X + b₁Y = c₁<br>a₂X + b₂Y = c₂</p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="number" id="a1" value="2" placeholder="a1" style="width:70px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;"> X +
            <input type="number" id="b1" value="3" placeholder="b1" style="width:70px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;"> Y =
            <input type="number" id="c1" value="8" placeholder="c1" style="width:70px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;">
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="number" id="a2" value="1" placeholder="a2" style="width:70px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;"> X +
            <input type="number" id="b2" value="-1" placeholder="b2" style="width:70px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;"> Y =
            <input type="number" id="c2" value="-1" placeholder="c2" style="width:70px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;">
          </div>
        </div>
        <button class="btn-action-sm mt-2 w-100" id="solveBtn">Solve Equation</button>
      `;
    } else if (this.currentType === "linear3") {
      card.innerHTML = `
        <h3>3x3 System of Linear Equations</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 12px;">aX + bY + cZ = d</p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; gap: 6px; align-items: center;">
            <input type="number" id="a1" value="1" style="width:60px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;"> X +
            <input type="number" id="b1" value="2" style="width:60px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;"> Y +
            <input type="number" id="c1" value="3" style="width:60px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;"> Z =
            <input type="number" id="d1" value="14" style="width:60px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;">
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <input type="number" id="a2" value="1" style="width:60px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;"> X −
            <input type="number" id="b2" value="1" style="width:60px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;"> Y +
            <input type="number" id="c2" value="1" style="width:60px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;"> Z =
            <input type="number" id="d2" value="6" style="width:60px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;">
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <input type="number" id="a3" value="2" style="width:60px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;"> X +
            <input type="number" id="b3" value="3" style="width:60px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;"> Y −
            <input type="number" id="c3" value="1" style="width:60px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;"> Z =
            <input type="number" id="d3" value="5" style="width:60px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;">
          </div>
        </div>
        <button class="btn-action-sm mt-2 w-100" id="solveBtn">Solve Equation</button>
      `;
    } else if (this.currentType === "quad") {
      card.innerHTML = `
        <h3>Quadratic Equation Solver</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 12px;">ax² + bx + c = 0</p>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="number" id="qa" value="1" style="width:70px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;"> x² +
          <input type="number" id="qb" value="-5" style="width:70px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;"> x +
          <input type="number" id="qc" value="6" style="width:70px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;"> = 0
        </div>
        <button class="btn-action-sm mt-2 w-100" id="solveBtn">Solve Quadratic</button>
      `;
    } else if (this.currentType === "cubic") {
      card.innerHTML = `
        <h3>Cubic Equation Solver</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 12px;">ax³ + bx² + cx + d = 0</p>
        <div style="display: flex; gap: 6px; align-items: center;">
          <input type="number" id="ca" value="1" style="width:60px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;"> x³ +
          <input type="number" id="cb" value="-6" style="width:60px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;"> x² +
          <input type="number" id="cc" value="11" style="width:60px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;"> x +
          <input type="number" id="cd" value="-6" style="width:60px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;"> = 0
        </div>
        <button class="btn-action-sm mt-2 w-100" id="solveBtn">Solve Cubic</button>
      `;
    } else if (this.currentType === "newton") {
      card.innerHTML = `
        <h3>Numerical Root Finder (Newton-Raphson)</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 12px;">Find root of f(x) = 0 near Initial Guess x₀</p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <label>f(x) Expression: <input type="text" id="nrFn" value="x^3 - 2*x - 5" style="width:100%; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff; font-family:var(--font-mono);"></label>
          <label>Initial Guess (x₀): <input type="number" id="nrX0" value="2" style="width:100px; padding:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff;"></label>
        </div>
        <button class="btn-action-sm mt-2 w-100" id="solveBtn">Find Root</button>
      `;
    }

    document.getElementById("solveBtn")?.addEventListener("click", () => this.solve());
  }

  solve() {
    const out = document.getElementById("solverOutput");
    if (!out) return;

    if (this.currentType === "linear2") {
      const a1 = parseFloat(document.getElementById("a1").value);
      const b1 = parseFloat(document.getElementById("b1").value);
      const c1 = parseFloat(document.getElementById("c1").value);
      const a2 = parseFloat(document.getElementById("a2").value);
      const b2 = parseFloat(document.getElementById("b2").value);
      const c2 = parseFloat(document.getElementById("c2").value);

      const det = a1 * b2 - a2 * b1;
      if (Math.abs(det) < 1e-12) {
        out.innerHTML = `<span style="color:var(--accent-coral);">No unique solution (Determinant = 0)</span>`;
        return;
      }
      const x = (c1 * b2 - c2 * b1) / det;
      const y = (a1 * c2 - a2 * c1) / det;

      out.innerHTML = `
        <strong style="color:var(--accent-cyan);">Solution:</strong><br>
        X = <span style="color:var(--accent-emerald); font-weight:700;">${x.toFixed(6)}</span><br>
        Y = <span style="color:var(--accent-emerald); font-weight:700;">${y.toFixed(6)}</span>
      `;
    } else if (this.currentType === "quad") {
      const a = parseFloat(document.getElementById("qa").value);
      const b = parseFloat(document.getElementById("qb").value);
      const c = parseFloat(document.getElementById("qc").value);

      if (a === 0) {
        out.innerHTML = `Linear Equation Root: x = ${(-c / b).toFixed(6)}`;
        return;
      }

      const disc = b * b - 4 * a * c;
      if (disc >= 0) {
        const x1 = (-b + Math.sqrt(disc)) / (2 * a);
        const x2 = (-b - Math.sqrt(disc)) / (2 * a);
        out.innerHTML = `
          Discriminant Δ = ${disc.toFixed(4)} (Real Roots)<br>
          x₁ = <span style="color:var(--accent-emerald); font-weight:700;">${x1.toFixed(6)}</span><br>
          x₂ = <span style="color:var(--accent-emerald); font-weight:700;">${x2.toFixed(6)}</span>
        `;
      } else {
        const re = -b / (2 * a);
        const im = Math.sqrt(-disc) / (2 * a);
        out.innerHTML = `
          Discriminant Δ = ${disc.toFixed(4)} (Complex Conjugate Roots)<br>
          x₁ = <span style="color:var(--accent-emerald); font-weight:700;">${re.toFixed(6)} + ${im.toFixed(6)}i</span><br>
          x₂ = <span style="color:var(--accent-emerald); font-weight:700;">${re.toFixed(6)} - ${im.toFixed(6)}i</span>
        `;
      }
    } else if (this.currentType === "newton") {
      const fn = document.getElementById("nrFn").value;
      let x = parseFloat(document.getElementById("nrX0").value);

      for (let i = 0; i < 20; i++) {
        const fx = window.mathEngine.evaluate(fn.replace(/x/g, `(${x})`));
        const dfx = window.mathEngine.derivative(fn, x);
        if (Math.abs(dfx) < 1e-12) break;
        const nextX = x - parseFloat(fx) / dfx;
        if (Math.abs(nextX - x) < 1e-8) {
          x = nextX;
          break;
        }
        x = nextX;
      }

      out.innerHTML = `Converged Root: x = <span style="color:var(--accent-emerald); font-weight:700;">${x.toFixed(8)}</span>`;
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.equationSolver = new EquationSolver();
});
