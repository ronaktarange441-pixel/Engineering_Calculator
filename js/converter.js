/**
 * ApexEngine Unit Converter Module
 */

const UNIT_DATABASE = {
  length: {
    name: "Length & Distance",
    units: {
      "m": 1,
      "km": 1000,
      "cm": 0.01,
      "mm": 0.001,
      "μm": 1e-6,
      "nm": 1e-9,
      "in": 0.0254,
      "ft": 0.3048,
      "yd": 0.9144,
      "mi": 1609.344,
      "AU": 1.495978707e11,
      "ly": 9.4607304725808e15
    }
  },
  mass: {
    name: "Mass & Weight",
    units: {
      "kg": 1,
      "g": 0.001,
      "mg": 1e-6,
      "μg": 1e-9,
      "lb": 0.45359237,
      "oz": 0.028349523125,
      "ton (metric)": 1000,
      "amu": 1.6605390666e-27
    }
  },
  force: {
    name: "Force",
    units: {
      "N": 1,
      "kN": 1000,
      "MN": 1e6,
      "dyn": 1e-5,
      "lbf": 4.4482216152605,
      "kgf": 9.80665
    }
  },
  pressure: {
    name: "Pressure & Stress",
    units: {
      "Pa": 1,
      "kPa": 1000,
      "MPa": 1e6,
      "bar": 1e5,
      "psi": 6894.757293168,
      "atm": 101325,
      "mmHg": 133.322368421,
      "Torr": 133.322368421
    }
  },
  energy: {
    name: "Energy & Work",
    units: {
      "J": 1,
      "kJ": 1000,
      "MJ": 1e6,
      "cal": 4.184,
      "kcal": 4184,
      "eV": 1.602176634e-19,
      "kWh": 3.6e6,
      "BTU": 1055.05585262
    }
  },
  power: {
    name: "Power",
    units: {
      "W": 1,
      "kW": 1000,
      "MW": 1e6,
      "hp (mechanical)": 745.6998715822702,
      "cal/s": 4.184
    }
  },
  temperature: {
    name: "Temperature",
    isTemp: true,
    units: ["Celsius (°C)", "Fahrenheit (°F)", "Kelvin (K)", "Rankine (°R)"]
  },
  elec_r: {
    name: "Electrical Resistance",
    units: { "Ω": 1, "kΩ": 1000, "MΩ": 1e6, "mΩ": 0.001 }
  },
  elec_c: {
    name: "Electrical Capacitance",
    units: { "F": 1, "mF": 0.001, "μF": 1e-6, "nF": 1e-9, "pF": 1e-12 }
  },
  elec_v: {
    name: "Voltage",
    units: { "V": 1, "mV": 0.001, "kV": 1000, "MV": 1e6 }
  },
  speed: {
    name: "Velocity / Speed",
    units: {
      "m/s": 1,
      "km/h": 0.2777777777777778,
      "mph": 0.44704,
      "knot": 0.5144444444444445,
      "c": 299792458
    }
  },
  data: {
    name: "Digital Storage",
    units: {
      "Byte": 1,
      "Bit": 0.125,
      "KB": 1024,
      "MB": 1048576,
      "GB": 1073741824,
      "TB": 1099511627776
    }
  }
};

class UnitConverter {
  constructor() {
    this.catSelect = document.getElementById("convCategory");
    this.fromUnit = document.getElementById("convFromUnit");
    this.toUnit = document.getElementById("convToUnit");
    this.fromVal = document.getElementById("convFromVal");
    this.toVal = document.getElementById("convToVal");
    this.swapBtn = document.getElementById("convSwapBtn");
    this.factorDisplay = document.getElementById("convFactorDisplay");

    this.init();
  }

  init() {
    this.catSelect?.addEventListener("change", () => this.populateUnits());
    this.fromUnit?.addEventListener("change", () => this.convert());
    this.toUnit?.addEventListener("change", () => this.convert());
    this.fromVal?.addEventListener("input", () => this.convert());
    this.swapBtn?.addEventListener("click", () => this.swap());

    this.populateUnits();
  }

  populateUnits() {
    const cat = this.catSelect.value;
    const db = UNIT_DATABASE[cat];
    if (!db) return;

    let keys = [];
    if (db.isTemp) {
      keys = db.units;
    } else {
      keys = Object.keys(db.units);
    }

    this.fromUnit.innerHTML = keys.map(k => `<option value="${k}">${k}</option>`).join("");
    this.toUnit.innerHTML = keys.map(k => `<option value="${k}">${k}</option>`).join("");

    if (keys.length > 1) {
      this.toUnit.selectedIndex = 1;
    }

    this.convert();
  }

  swap() {
    const tmp = this.fromUnit.selectedIndex;
    this.fromUnit.selectedIndex = this.toUnit.selectedIndex;
    this.toUnit.selectedIndex = tmp;
    this.convert();
  }

  convert() {
    const cat = this.catSelect.value;
    const db = UNIT_DATABASE[cat];
    const val = parseFloat(this.fromVal.value) || 0;
    const u1 = this.fromUnit.value;
    const u2 = this.toUnit.value;

    if (db.isTemp) {
      const res = this.convertTemp(val, u1, u2);
      this.toVal.value = res.toFixed(4);
      if (this.factorDisplay) this.factorDisplay.textContent = `Temperature Scale Transformation`;
      return;
    }

    const factor1 = db.units[u1];
    const factor2 = db.units[u2];

    const baseVal = val * factor1;
    const finalVal = baseVal / factor2;

    this.toVal.value = Number(finalVal.toPrecision(8));
    if (this.factorDisplay) {
      this.factorDisplay.textContent = `1 ${u1} = ${(factor1 / factor2).toPrecision(6)} ${u2}`;
    }
  }

  convertTemp(val, from, to) {
    let kelvin = 0;
    if (from.includes("Celsius")) kelvin = val + 273.15;
    else if (from.includes("Fahrenheit")) kelvin = (val - 32) * 5 / 9 + 273.15;
    else if (from.includes("Kelvin")) kelvin = val;
    else if (from.includes("Rankine")) kelvin = val * 5 / 9;

    if (to.includes("Celsius")) return kelvin - 273.15;
    if (to.includes("Fahrenheit")) return (kelvin - 273.15) * 9 / 5 + 32;
    if (to.includes("Kelvin")) return kelvin;
    if (to.includes("Rankine")) return kelvin * 9 / 5;
    return val;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.unitConverter = new UnitConverter();
});
