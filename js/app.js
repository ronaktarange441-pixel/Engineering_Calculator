/**
 * ApexEngine Main Application Controller
 */

class ApexCalculatorApp {
  constructor() {
    this.soundEnabled = true;
    this.shiftActive = false;
    this.hypActive = false;
    this.audioCtx = null;

    this.init();
  }

  init() {
    this.setupThemeToggle();
    this.setupNavigation();
    this.setupKeypad();
    this.setupKeyboardListeners();
    this.setupStatusControls();
    this.setupSoundSynthesizer();
  }

  setupThemeToggle() {
    const themeBtn = document.getElementById("themeToggle");
    themeBtn?.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
    });
  }

  setupNavigation() {
    const navBtns = document.querySelectorAll("#modeNav .nav-btn");
    const views = document.querySelectorAll(".mode-view");

    navBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        navBtns.forEach(b => b.classList.remove("active"));
        views.forEach(v => v.classList.remove("active"));

        btn.classList.add("active");
        const targetId = btn.getAttribute("data-tab");
        const targetView = document.getElementById(targetId);

        if (targetView) {
          targetView.classList.add("active");
          // Re-render graph canvas if switched to graph view
          if (targetId === "graph-mode" && window.grapherEngine) {
            setTimeout(() => window.grapherEngine.resizeCanvas(), 50);
          }
        }
      });
    });
  }

  setupStatusControls() {
    const angleBtn = document.getElementById("angleModeBtn");
    const formatBtn = document.getElementById("numFormatBtn");

    angleBtn?.addEventListener("click", () => {
      const modes = ['DEG', 'RAD', 'GRAD'];
      const next = modes[(modes.indexOf(window.mathEngine.angleMode) + 1) % modes.length];
      window.mathEngine.angleMode = next;
      angleBtn.textContent = next;
    });

    formatBtn?.addEventListener("click", () => {
      const formats = ['NORM', 'SCI', 'ENG'];
      const next = formats[(formats.indexOf(window.mathEngine.numFormat) + 1) % formats.length];
      window.mathEngine.numFormat = next;
      formatBtn.textContent = next;
      this.calculate();
    });

    document.getElementById("shiftBtn")?.addEventListener("click", (e) => {
      this.shiftActive = !this.shiftActive;
      e.target.classList.toggle("active", this.shiftActive);
      this.updateShiftLabels();
    });

    document.getElementById("hypBtn")?.addEventListener("click", (e) => {
      this.hypActive = !this.hypActive;
      e.target.classList.toggle("active", this.hypActive);
    });
  }

  updateShiftLabels() {
    const sinBtn = document.querySelector('[data-insert="sin("]');
    const cosBtn = document.querySelector('[data-insert="cos("]');
    const tanBtn = document.querySelector('[data-insert="tan("]');

    if (this.shiftActive) {
      if (sinBtn) { sinBtn.textContent = "asin"; sinBtn.setAttribute("data-insert", "asin("); }
      if (cosBtn) { cosBtn.textContent = "acos"; cosBtn.setAttribute("data-insert", "acos("); }
      if (tanBtn) { tanBtn.textContent = "atan"; tanBtn.setAttribute("data-insert", "atan("); }
    } else {
      if (sinBtn) { sinBtn.textContent = "sin"; sinBtn.setAttribute("data-insert", "sin("); }
      if (cosBtn) { cosBtn.textContent = "cos"; cosBtn.setAttribute("data-insert", "cos("); }
      if (tanBtn) { tanBtn.textContent = "tan"; tanBtn.setAttribute("data-insert", "tan("); }
    }
  }

  setupSoundSynthesizer() {
    document.getElementById("soundToggle")?.addEventListener("click", (e) => {
      this.soundEnabled = !this.soundEnabled;
      e.currentTarget.style.opacity = this.soundEnabled ? "1" : "0.4";
    });
  }

  playClickSound() {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch (e) {}
  }

  setupKeypad() {
    const input = document.getElementById("mathInput");
    const keypad = document.getElementById("scientificKeypad");

    keypad?.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        this.playClickSound();

        const insertText = btn.getAttribute("data-insert");
        const action = btn.getAttribute("data-action");

        if (insertText !== null) {
          this.insertAtCursor(input, insertText);
          this.livePreview();
        } else if (action === "all-clear") {
          input.value = "";
          document.getElementById("calcResult").textContent = "0";
          document.getElementById("calcHistoryPreview").textContent = "";
        } else if (action === "backspace") {
          this.backspace(input);
          this.livePreview();
        } else if (action === "calculate") {
          this.calculate();
        } else if (action === "negate") {
          if (input.value.startsWith("-")) {
            input.value = input.value.substring(1);
          } else {
            input.value = "-" + input.value;
          }
          this.livePreview();
        }
      });
    });

    // Quick Memory buttons
    document.querySelectorAll(".quick-mem-bar button").forEach(btn => {
      btn.addEventListener("click", () => {
        this.playClickSound();
        const act = btn.getAttribute("data-action");
        const curVal = parseFloat(document.getElementById("calcResult").textContent) || 0;

        if (act === "mc") window.historyManager?.clearMemory();
        if (act === "mr" && window.historyManager) {
          this.insertAtCursor(input, String(window.historyManager.memory));
          this.livePreview();
        }
        if (act === "m-add" && window.historyManager) {
          window.historyManager.setMemory(window.historyManager.memory + curVal);
        }
        if (act === "m-sub" && window.historyManager) {
          window.historyManager.setMemory(window.historyManager.memory - curVal);
        }
        if (act === "ms" && window.historyManager) {
          window.historyManager.setMemory(curVal);
        }
      });
    });

    input?.addEventListener("input", () => this.livePreview());
  }

  insertAtCursor(input, text) {
    if (!input) return;
    const start = input.selectionStart || input.value.length;
    const end = input.selectionEnd || input.value.length;
    input.value = input.value.substring(0, start) + text + input.value.substring(end);
    input.selectionStart = input.selectionEnd = start + text.length;
    input.focus();
  }

  backspace(input) {
    if (!input) return;
    const start = input.selectionStart || input.value.length;
    if (start === 0) return;
    input.value = input.value.substring(0, start - 1) + input.value.substring(start);
    input.selectionStart = input.selectionEnd = start - 1;
    input.focus();
  }

  livePreview() {
    const expr = document.getElementById("mathInput")?.value;
    const resEl = document.getElementById("calcResult");
    if (!expr || expr.trim() === "") {
      if (resEl) resEl.textContent = "0";
      return;
    }

    const res = window.mathEngine.evaluate(expr);
    if (resEl && !res.startsWith("Error")) {
      resEl.textContent = res;
    }
  }

  calculate() {
    const input = document.getElementById("mathInput");
    const expr = input?.value;
    if (!expr || expr.trim() === "") return;

    const res = window.mathEngine.evaluate(expr);
    document.getElementById("calcResult").textContent = res;
    document.getElementById("calcHistoryPreview").textContent = `${expr} =`;

    if (window.historyManager && !res.startsWith("Error")) {
      window.historyManager.addHistory(expr, res);
      window.historyManager.renderVariables();
    }
  }

  setupKeyboardListeners() {
    window.addEventListener("keydown", (e) => {
      const activeElement = document.activeElement;

      // Allow default input behavior for grapher, matrix, solver input fields
      if (activeElement && activeElement.tagName === "INPUT" && activeElement.id !== "mathInput") {
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        this.calculate();
      } else if (e.key === "Escape") {
        const input = document.getElementById("mathInput");
        if (input) input.value = "";
        document.getElementById("calcResult").textContent = "0";
      }
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.app = new ApexCalculatorApp();
});
