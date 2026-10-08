/**
 * History & Memory Manager for ApexEngine
 */

class HistoryManager {
  constructor() {
    this.history = JSON.parse(localStorage.getItem("apex_history") || "[]");
    this.memory = parseFloat(localStorage.getItem("apex_memory") || "0");
    this.drawer = document.getElementById("historyDrawer");
    this.init();
  }

  init() {
    document.getElementById("historyToggle")?.addEventListener("click", () => this.toggleDrawer());
    document.getElementById("closeDrawerBtn")?.addEventListener("click", () => this.toggleDrawer());

    // Drawer Tabs
    document.querySelectorAll(".history-tabs .tab-link").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".history-tabs .tab-link").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".drawer-body .tab-content").forEach(c => c.classList.remove("active"));
        e.target.classList.add("active");
        const target = e.target.getAttribute("data-tab");
        document.getElementById(target)?.classList.add("active");
      });
    });

    document.getElementById("clearHistoryBtn")?.addEventListener("click", () => this.clearHistory());
    document.getElementById("exportHistoryBtn")?.addEventListener("click", () => this.exportCSV());
    document.getElementById("clearMemBtn")?.addEventListener("click", () => this.clearMemory());

    this.renderHistory();
    this.renderMemory();
    this.renderVariables();
  }

  toggleDrawer() {
    this.drawer?.classList.toggle("open");
  }

  addHistory(expr, result) {
    const item = {
      id: Date.now(),
      expr,
      result,
      timestamp: new Date().toLocaleTimeString()
    };
    this.history.unshift(item);
    if (this.history.length > 50) this.history.pop();
    localStorage.setItem("apex_history", JSON.stringify(this.history));
    this.renderHistory();
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem("apex_history");
    this.renderHistory();
  }

  renderHistory() {
    const container = document.getElementById("historyItems");
    if (!container) return;

    if (this.history.length === 0) {
      container.innerHTML = `<div class="empty-state">No history recorded yet.</div>`;
      return;
    }

    container.innerHTML = this.history.map(item => `
      <div class="history-item" data-expr="${item.expr}" data-res="${item.result}">
        <div style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-muted);">${item.expr}</div>
        <div style="font-family: var(--font-mono); font-size: 1.1rem; color: var(--accent-emerald); font-weight: 700; text-align: right;">= ${item.result}</div>
        <span style="font-size: 0.65rem; color: var(--text-dim); display: block; text-align: right;">${item.timestamp}</span>
      </div>
    `).join("");

    container.querySelectorAll(".history-item").forEach(el => {
      el.addEventListener("click", () => {
        const mathInput = document.getElementById("mathInput");
        if (mathInput) {
          mathInput.value = el.getAttribute("data-res");
          mathInput.focus();
        }
      });
    });
  }

  setMemory(val) {
    this.memory = val;
    localStorage.setItem("apex_memory", String(this.memory));
    this.renderMemory();
  }

  clearMemory() {
    this.setMemory(0);
  }

  renderMemory() {
    const memDisplay = document.getElementById("memValueDisplay");
    const memIndicator = document.getElementById("memIndicator");
    if (memDisplay) memDisplay.textContent = this.memory;
    if (memIndicator) {
      memIndicator.style.display = this.memory !== 0 ? "inline-block" : "none";
    }
  }

  renderVariables() {
    const container = document.getElementById("variablesGrid");
    if (!container || !window.mathEngine) return;

    const vars = window.mathEngine.variables;
    container.innerHTML = Object.keys(vars).map(k => `
      <div style="display: flex; justify-content: space-between; padding: 6px; background: var(--bg-input); border-radius: 6px; border: 1px solid var(--border-color); font-family: var(--font-mono); margin-bottom: 4px;">
        <strong style="color: var(--accent-cyan);">${k}:</strong>
        <span>${typeof vars[k] === 'object' ? vars[k].toString() : vars[k]}</span>
      </div>
    `).join("");
  }

  exportCSV() {
    if (this.history.length === 0) return alert("No history to export");
    let csv = "Timestamp,Expression,Result\n";
    this.history.forEach(h => {
      csv += `"${h.timestamp}","${h.expr.replace(/"/g, '""')}","${h.result}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `apex_calculator_history_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.historyManager = new HistoryManager();
});
