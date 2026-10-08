/**
 * ApexEngine Programmer Base-N Module
 */

class ProgrammerEngine {
  constructor() {
    this.value = 0; // 32-bit signed integer
    this.currentBase = "DEC";

    this.hexVal = document.getElementById("hexVal");
    this.decVal = document.getElementById("decVal");
    this.octVal = document.getElementById("octVal");
    this.binVal = document.getElementById("binVal");
    this.bitGrid = document.getElementById("bitGrid");

    this.init();
  }

  init() {
    this.renderBits();
    this.updateDisplays();

    document.querySelectorAll(".programmer-keypad button").forEach(btn => {
      btn.addEventListener("click", () => {
        const insert = btn.getAttribute("data-insert");
        const prog = btn.getAttribute("data-prog");

        if (insert) {
          this.handleInput(insert);
        } else if (prog) {
          this.handleOp(prog);
        }
      });
    });

    document.getElementById("progClr")?.addEventListener("click", () => {
      this.value = 0;
      this.updateDisplays();
    });

    document.getElementById("progDel")?.addEventListener("click", () => {
      this.value = Math.floor(this.value / 10);
      this.updateDisplays();
    });
  }

  renderBits() {
    if (!this.bitGrid) return;
    this.bitGrid.innerHTML = "";

    for (let i = 31; i >= 0; i--) {
      const bitCell = document.createElement("div");
      bitCell.className = "bit-cell";
      bitCell.setAttribute("data-bit", i);
      bitCell.textContent = "0";

      bitCell.addEventListener("click", () => {
        this.value ^= (1 << i);
        this.updateDisplays();
      });

      this.bitGrid.appendChild(bitCell);
    }
  }

  handleInput(char) {
    if (this.currentBase === "DEC") {
      const str = String(this.value) + char;
      this.value = parseInt(str, 10) || 0;
    } else if (this.currentBase === "HEX") {
      const str = this.value.toString(16) + char;
      this.value = parseInt(str, 16) || 0;
    }
    this.updateDisplays();
  }

  handleOp(op) {
    if (op === "NOT") this.value = ~this.value;
    if (op === "SHL") this.value = this.value << 1;
    if (op === "SHR") this.value = this.value >> 1;
    this.updateDisplays();
  }

  updateDisplays() {
    const val32 = this.value >>> 0; // Unsigned 32-bit for bitwise formatting

    if (this.hexVal) this.hexVal.textContent = "0x" + val32.toString(16).toUpperCase();
    if (this.decVal) this.decVal.textContent = String(this.value);
    if (this.octVal) this.octVal.textContent = "0o" + val32.toString(8);

    const binStr = val32.toString(2).padStart(32, "0");
    const formattedBin = binStr.match(/.{1,4}/g)?.join(" ") || binStr;
    if (this.binVal) this.binVal.textContent = formattedBin;

    // Update Bit Grid Cells
    if (this.bitGrid) {
      const cells = this.bitGrid.querySelectorAll(".bit-cell");
      cells.forEach(cell => {
        const bitIndex = parseInt(cell.getAttribute("data-bit"));
        const bitOn = (val32 & (1 << bitIndex)) !== 0;
        if (bitOn) {
          cell.classList.add("on");
          cell.textContent = "1";
        } else {
          cell.classList.remove("on");
          cell.textContent = "0";
        }
      });
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.programmerEngine = new ProgrammerEngine();
});
