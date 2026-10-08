/**
 * CODATA Fundamental Physical & Engineering Constants Database
 */

const PHYSICAL_CONSTANTS = [
  { name: "Speed of Light in Vacuum", symbol: "c", value: 299792458, unit: "m/s", category: "Universal" },
  { name: "Planck Constant", symbol: "h", value: 6.62607015e-34, unit: "J·s", category: "Universal" },
  { name: "Reduced Planck Constant (hbar)", symbol: "hbar", value: 1.054571817e-34, unit: "J·s", category: "Universal" },
  { name: "Newtonian Constant of Gravitation", symbol: "G", value: 6.67430e-11, unit: "m³/(kg·s²)", category: "Universal" },
  { name: "Elementary Charge", symbol: "e", value: 1.602176634e-19, unit: "C", category: "Electromagnetism" },
  { name: "Vacuum Electric Permittivity", symbol: "ε0", value: 8.8541878128e-12, unit: "F/m", category: "Electromagnetism" },
  { name: "Vacuum Magnetic Permeability", symbol: "μ0", value: 1.25663706212e-6, unit: "N/A²", category: "Electromagnetism" },
  { name: "Coulomb Constant", symbol: "ke", value: 8.9875517923e9, unit: "N·m²/C²", category: "Electromagnetism" },
  { name: "Avogadro Constant", symbol: "NA", value: 6.02214076e23, unit: "mol⁻¹", category: "Atomic & Nuclear" },
  { name: "Boltzmann Constant", symbol: "kB", value: 1.380649e-23, unit: "J/K", category: "Thermodynamics" },
  { name: "Molar Gas Constant", symbol: "R", value: 8.314462618, unit: "J/(mol·K)", category: "Thermodynamics" },
  { name: "Stefan-Boltzmann Constant", symbol: "σ", value: 5.670374419e-8, unit: "W/(m²·K⁴)", category: "Thermodynamics" },
  { name: "Faraday Constant", symbol: "F", value: 96485.33212, unit: "C/mol", category: "Atomic & Nuclear" },
  { name: "Electron Mass", symbol: "me", value: 9.1093837015e-31, unit: "kg", category: "Atomic & Nuclear" },
  { name: "Proton Mass", symbol: "mp", value: 1.67262192369e-27, unit: "kg", category: "Atomic & Nuclear" },
  { name: "Neutron Mass", symbol: "mn", value: 1.67492749804e-27, unit: "kg", category: "Atomic & Nuclear" },
  { name: "Standard Acceleration of Gravity", symbol: "g", value: 9.80665, unit: "m/s²", category: "Geophysics" },
  { name: "Standard Atmosphere", symbol: "1 atm", value: 101325, unit: "Pa", category: "Thermodynamics" },
  { name: "Electronvolt", symbol: "eV", value: 1.602176634e-19, unit: "J", category: "Energy" },
  { name: "Rydberg Constant", symbol: "Rinf", value: 10973731.56816, unit: "m⁻¹", category: "Atomic & Nuclear" },
  { name: "Bohr Radius", symbol: "a0", value: 5.29177210903e-11, unit: "m", category: "Atomic & Nuclear" }
];

class ConstantsManager {
  constructor() {
    this.modal = document.getElementById("constantsModal");
    this.listEl = document.getElementById("constantsList");
    this.searchInput = document.getElementById("constantSearch");
    this.init();
  }

  init() {
    document.getElementById("constantsBtn")?.addEventListener("click", () => this.openModal());
    document.getElementById("closeConstantsBtn")?.addEventListener("click", () => this.closeModal());
    this.searchInput?.addEventListener("input", (e) => this.filterConstants(e.target.value));
    this.renderConstants(PHYSICAL_CONSTANTS);
  }

  openModal() {
    this.modal?.classList.add("open");
  }

  closeModal() {
    this.modal?.classList.remove("open");
  }

  filterConstants(query) {
    const q = query.toLowerCase();
    const filtered = PHYSICAL_CONSTANTS.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.symbol.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
    this.renderConstants(filtered);
  }

  renderConstants(items) {
    if (!this.listEl) return;
    this.listEl.innerHTML = items.map(c => `
      <div class="constant-item" data-val="${c.value}">
        <div>
          <strong style="color: var(--accent-cyan); font-family: var(--font-mono);">${c.symbol}</strong> - 
          <span>${c.name}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">${c.category}</span>
        </div>
        <div style="text-align: right;">
          <span style="font-family: var(--font-mono); color: var(--accent-emerald); font-weight: 700;">${c.value.toExponential(4)}</span>
          <span style="font-size: 0.75rem; color: var(--text-dim); display: block;">${c.unit}</span>
        </div>
      </div>
    `).join("");

    this.listEl.querySelectorAll(".constant-item").forEach(el => {
      el.addEventListener("click", () => {
        const val = el.getAttribute("data-val");
        const mathInput = document.getElementById("mathInput");
        if (mathInput) {
          mathInput.value += val;
          mathInput.focus();
        }
        this.closeModal();
      });
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.constantsManager = new ConstantsManager();
});
