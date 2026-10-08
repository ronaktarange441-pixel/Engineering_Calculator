/**
 * ApexEngine Matrix & Vector Operations Module
 */

class MatrixEngine {
  constructor() {
    this.matrices = {
      A: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
      B: [[2, 1, 0], [0, 3, 4], [1, 0, 5]],
      C: [[1, 2], [3, 4]]
    };

    this.activeTarget = "A";
    this.rows = 3;
    this.cols = 3;

    this.init();
  }

  init() {
    const rowsSelect = document.getElementById("matrixRows");
    const colsSelect = document.getElementById("matrixCols");
    const targetSelect = document.getElementById("activeMatrixSelect");

    rowsSelect?.addEventListener("change", (e) => {
      this.rows = parseInt(e.target.value);
      this.resizeMatrixGrid();
    });

    colsSelect?.addEventListener("change", (e) => {
      this.cols = parseInt(e.target.value);
      this.resizeMatrixGrid();
    });

    targetSelect?.addEventListener("change", (e) => {
      this.activeTarget = e.target.value;
      this.rows = this.matrices[this.activeTarget].length;
      this.cols = this.matrices[this.activeTarget][0].length;
      if (rowsSelect) rowsSelect.value = String(this.rows);
      if (colsSelect) colsSelect.value = String(this.cols);
      this.resizeMatrixGrid();
    });

    // Action Buttons
    document.getElementById("matDetBtn")?.addEventListener("click", () => this.calcDeterminant());
    document.getElementById("matInvBtn")?.addEventListener("click", () => this.calcInverse());
    document.getElementById("matTransBtn")?.addEventListener("click", () => this.calcTranspose());
    document.getElementById("matRrefBtn")?.addEventListener("click", () => this.calcRREF());
    document.getElementById("matMulBtn")?.addEventListener("click", () => this.calcMultiply());
    document.getElementById("matAddBtn")?.addEventListener("click", () => this.calcAdd());
    document.getElementById("matSubBtn")?.addEventListener("click", () => this.calcSub());
    document.getElementById("vecDotBtn")?.addEventListener("click", () => this.calcDot());
    document.getElementById("vecCrossBtn")?.addEventListener("click", () => this.calcCross());
    document.getElementById("vecMagBtn")?.addEventListener("click", () => this.calcMagnitude());

    this.resizeMatrixGrid();
  }

  resizeMatrixGrid() {
    const grid = document.getElementById("matrixGridInput");
    if (!grid) return;

    grid.style.gridTemplateColumns = `repeat(${this.cols}, 60px)`;
    grid.innerHTML = "";

    let currentMat = this.matrices[this.activeTarget];
    // Adjust matrix storage size
    const newMat = Array.from({ length: this.rows }, (_, r) =>
      Array.from({ length: this.cols }, (_, c) => (currentMat[r] && currentMat[r][c] !== undefined) ? currentMat[r][c] : 0)
    );
    this.matrices[this.activeTarget] = newMat;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const input = document.createElement("input");
        input.type = "number";
        input.className = "matrix-cell";
        input.value = newMat[r][c];
        input.step = "any";
        input.addEventListener("input", (e) => {
          this.matrices[this.activeTarget][r][c] = parseFloat(e.target.value) || 0;
        });
        grid.appendChild(input);
      }
    }
  }

  displayResult(title, matOrVal) {
    const display = document.getElementById("matrixResultDisplay");
    if (!display) return;

    if (typeof matOrVal === "number" || typeof matOrVal === "string") {
      display.innerHTML = `
        <h4 style="color: var(--accent-cyan); margin-bottom: 8px;">${title}</h4>
        <div style="font-size: 1.5rem; color: var(--accent-emerald); font-weight: 700;">${matOrVal}</div>
      `;
    } else if (Array.isArray(matOrVal)) {
      const rows = matOrVal.length;
      const cols = matOrVal[0].length;
      let html = `<h4 style="color: var(--accent-cyan); margin-bottom: 8px;">${title}</h4>`;
      html += `<div style="display: inline-grid; grid-template-columns: repeat(${cols}, auto); gap: 8px; padding: 12px; border-left: 3px solid var(--accent-cyan); border-right: 3px solid var(--accent-cyan); background: rgba(0,0,0,0.3); border-radius: 6px;">`;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = typeof matOrVal[r][c] === 'number' ? Number(matOrVal[r][c].toFixed(4)) : matOrVal[r][c];
          html += `<span style="padding: 6px 10px; text-align: center; color: var(--text-main); font-weight: 600;">${val}</span>`;
        }
      }
      html += `</div>`;
      display.innerHTML = html;
    }
  }

  // Determinant calculation (Recursive expansion)
  determinant(m) {
    if (m.length !== m[0].length) throw new Error("Matrix must be square");
    const n = m.length;
    if (n === 1) return m[0][0];
    if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];

    let det = 0;
    for (let c = 0; c < n; c++) {
      const subMat = m.slice(1).map(row => row.filter((_, colIdx) => colIdx !== c));
      det += Math.pow(-1, c) * m[0][c] * this.determinant(subMat);
    }
    return det;
  }

  calcDeterminant() {
    try {
      const mat = this.matrices[this.activeTarget];
      const det = this.determinant(mat);
      this.displayResult(`det(${this.activeTarget})`, det);
    } catch (e) {
      this.displayResult("Error", e.message);
    }
  }

  calcTranspose() {
    const mat = this.matrices[this.activeTarget];
    const trans = mat[0].map((_, c) => mat.map(r => r[c]));
    this.displayResult(`${this.activeTarget}ᵀ (Transpose)`, trans);
  }

  calcInverse() {
    try {
      const mat = this.matrices[this.activeTarget];
      const det = this.determinant(mat);
      if (Math.abs(det) < 1e-12) throw new Error("Matrix is Singular (det = 0), Inverse does not exist");

      const n = mat.length;
      if (n === 2) {
        const inv = [
          [mat[1][1] / det, -mat[0][1] / det],
          [-mat[1][0] / det, mat[0][0] / det]
        ];
        return this.displayResult(`${this.activeTarget}⁻¹ (Inverse)`, inv);
      }

      // Adjugate matrix approach for higher dimensions
      const adj = Array.from({ length: n }, () => Array(n).fill(0));
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          const subMat = mat.filter((_, rowIdx) => rowIdx !== r).map(row => row.filter((_, colIdx) => colIdx !== c));
          adj[c][r] = Math.pow(-1, r + c) * this.determinant(subMat) / det;
        }
      }
      this.displayResult(`${this.activeTarget}⁻¹ (Inverse)`, adj);
    } catch (e) {
      this.displayResult("Error", e.message);
    }
  }

  calcRREF() {
    const mat = this.matrices[this.activeTarget].map(row => [...row]);
    const rows = mat.length;
    const cols = mat[0].length;
    let lead = 0;

    for (let r = 0; r < rows; r++) {
      if (cols <= lead) break;
      let i = r;
      while (Math.abs(mat[i][lead]) < 1e-12) {
        i++;
        if (rows === i) {
          i = r;
          lead++;
          if (cols === lead) break;
        }
      }
      if (cols === lead) break;

      // Swap rows
      [mat[i], mat[r]] = [mat[r], mat[i]];

      let val = mat[r][lead];
      mat[r] = mat[r].map(x => x / val);

      for (let i = 0; i < rows; i++) {
        if (i !== r) {
          val = mat[i][lead];
          mat[i] = mat[i].map((x, colIdx) => x - val * mat[r][colIdx]);
        }
      }
      lead++;
    }

    this.displayResult(`RREF(${this.activeTarget})`, mat);
  }

  calcMultiply() {
    try {
      const mA = this.matrices.A;
      const mB = this.matrices.B;
      if (mA[0].length !== mB.length) throw new Error(`Dimension mismatch: A is ${mA.length}x${mA[0].length}, B is ${mB.length}x${mB[0].length}`);

      const res = Array.from({ length: mA.length }, () => Array(mB[0].length).fill(0));
      for (let r = 0; r < mA.length; r++) {
        for (let c = 0; c < mB[0].length; c++) {
          for (let k = 0; k < mA[0].length; k++) {
            res[r][c] += mA[r][k] * mB[k][c];
          }
        }
      }
      this.displayResult("A × B", res);
    } catch (e) {
      this.displayResult("Error", e.message);
    }
  }

  calcAdd() {
    try {
      const mA = this.matrices.A;
      const mB = this.matrices.B;
      if (mA.length !== mB.length || mA[0].length !== mB[0].length) throw new Error("Matrices must have identical dimensions for addition");

      const res = mA.map((row, r) => row.map((val, c) => val + mB[r][c]));
      this.displayResult("A + B", res);
    } catch (e) {
      this.displayResult("Error", e.message);
    }
  }

  calcSub() {
    try {
      const mA = this.matrices.A;
      const mB = this.matrices.B;
      if (mA.length !== mB.length || mA[0].length !== mB[0].length) throw new Error("Matrices must have identical dimensions for subtraction");

      const res = mA.map((row, r) => row.map((val, c) => val - mB[r][c]));
      this.displayResult("A − B", res);
    } catch (e) {
      this.displayResult("Error", e.message);
    }
  }

  calcDot() {
    const vA = this.matrices.A.flat();
    const vB = this.matrices.B.flat();
    if (vA.length !== vB.length) return this.displayResult("Error", "Vector lengths must match");
    const dot = vA.reduce((sum, val, idx) => sum + val * vB[idx], 0);
    this.displayResult("Vector A · B", dot);
  }

  calcCross() {
    const vA = this.matrices.A.flat();
    const vB = this.matrices.B.flat();
    if (vA.length < 3 || vB.length < 3) return this.displayResult("Error", "3D Vectors required for cross product");

    const cross = [
      [vA[1] * vB[2] - vA[2] * vB[1]],
      [vA[2] * vB[0] - vA[0] * vB[2]],
      [vA[0] * vB[1] - vA[1] * vB[0]]
    ];
    this.displayResult("Vector A × B", cross);
  }

  calcMagnitude() {
    const vA = this.matrices[this.activeTarget].flat();
    const mag = Math.hypot(...vA);
    this.displayResult(`|${this.activeTarget}| Magnitude`, mag.toFixed(5));
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.matrixEngine = new MatrixEngine();
});
