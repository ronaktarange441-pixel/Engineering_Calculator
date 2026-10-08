/**
 * ApexEngine Evaluator Module
 * High-Precision Math Engine with Complex Numbers, Engineering Notation, & Calculus
 */

class Complex {
  constructor(re, im = 0) {
    this.re = re;
    this.im = im;
  }

  add(c) {
    const o = Complex.toComplex(c);
    return new Complex(this.re + o.re, this.im + o.im);
  }

  sub(c) {
    const o = Complex.toComplex(c);
    return new Complex(this.re - o.re, this.im - o.im);
  }

  mul(c) {
    const o = Complex.toComplex(c);
    return new Complex(
      this.re * o.re - this.im * o.im,
      this.re * o.im + this.im * o.re
    );
  }

  div(c) {
    const o = Complex.toComplex(c);
    const denom = o.re * o.re + o.im * o.im;
    if (denom === 0) throw new Error("Division by zero");
    return new Complex(
      (this.re * o.re + this.im * o.im) / denom,
      (this.im * o.re - this.re * o.im) / denom
    );
  }

  pow(n) {
    if (typeof n === 'number' && this.im === 0) {
      if (this.re < 0 && !Number.isInteger(n)) {
        // Complex power of negative number
        const r = Math.pow(Math.abs(this.re), n);
        const theta = Math.PI * n;
        return new Complex(r * Math.cos(theta), r * Math.sin(theta));
      }
      return new Complex(Math.pow(this.re, n), 0);
    }
    const r = this.abs();
    const theta = this.arg();
    const newR = Math.pow(r, n);
    return new Complex(newR * Math.cos(theta * n), newR * Math.sin(theta * n));
  }

  abs() {
    return Math.hypot(this.re, this.im);
  }

  arg() {
    return Math.atan2(this.im, this.re);
  }

  static toComplex(val) {
    if (val instanceof Complex) return val;
    if (typeof val === 'number') return new Complex(val, 0);
    return new Complex(0, 0);
  }

  toString(precision = 8) {
    if (Math.abs(this.im) < 1e-12) {
      return formatNumber(this.re, precision);
    }
    if (Math.abs(this.re) < 1e-12) {
      return `${formatNumber(this.im, precision)}i`;
    }
    const sign = this.im > 0 ? '+' : '-';
    return `${formatNumber(this.re, precision)} ${sign} ${formatNumber(Math.abs(this.im), precision)}i`;
  }
}

function formatNumber(num, precision = 8) {
  if (isNaN(num)) return "NaN";
  if (!isFinite(num)) return num > 0 ? "Infinity" : "-Infinity";
  if (Math.abs(num) < 1e-12) return "0";
  
  // Clean up floating point representation issues
  const rounded = Number(num.toPrecision(precision));
  return String(rounded);
}

class MathEngine {
  constructor() {
    this.angleMode = 'DEG'; // 'DEG', 'RAD', 'GRAD'
    this.numFormat = 'NORM'; // 'NORM', 'SCI', 'ENG'
    this.rpnMode = false;
    this.variables = {
      Ans: 0,
      A: 0, B: 0, C: 0, D: 0, X: 0, Y: 0,
      pi: Math.PI, e: Math.E, i: new Complex(0, 1)
    };
  }

  toRad(angle) {
    if (this.angleMode === 'DEG') return (angle * Math.PI) / 180;
    if (this.angleMode === 'GRAD') return (angle * Math.PI) / 200;
    return angle;
  }

  fromRad(rad) {
    if (this.angleMode === 'DEG') return (rad * 180) / Math.PI;
    if (this.angleMode === 'GRAD') return (rad * 200) / Math.PI;
    return rad;
  }

  // Engineering Notation Formatter
  formatEng(val) {
    if (val === 0) return "0";
    const prefixes = [
      { exp: 12, symbol: 'T' },
      { exp: 9, symbol: 'G' },
      { exp: 6, symbol: 'M' },
      { exp: 3, symbol: 'k' },
      { exp: 0, symbol: '' },
      { exp: -3, symbol: 'm' },
      { exp: -6, symbol: 'μ' },
      { exp: -9, symbol: 'n' },
      { exp: -12, symbol: 'p' },
      { exp: -15, symbol: 'f' }
    ];

    const absVal = Math.abs(val);
    const exp = Math.floor(Math.log10(absVal));
    const engExp = Math.floor(exp / 3) * 3;

    const prefix = prefixes.find(p => p.exp === engExp);
    const mantissa = val / Math.pow(10, engExp);

    if (prefix) {
      return `${mantissa.toFixed(3)} ${prefix.symbol}`;
    }
    return val.toExponential(4);
  }

  // Tokenize Math Expression String
  tokenize(expr) {
    const tokens = [];
    let i = 0;

    // Clean up input symbols
    expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/π/g, 'pi');

    while (i < expr.length) {
      const char = expr[i];

      if (/\s/.test(char)) {
        i++;
        continue;
      }

      // Numbers & Decimals
      if (/[0-9.]/.test(char)) {
        let numStr = '';
        while (i < expr.length && /[0-9.eE]/.test(expr[i])) {
          if ((expr[i] === 'e' || expr[i] === 'E') && i + 1 < expr.length && /[+-]/.test(expr[i + 1])) {
            numStr += expr[i] + expr[i + 1];
            i += 2;
          } else {
            numStr += expr[i];
            i++;
          }
        }
        tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
        continue;
      }

      // Identifiers / Functions / Variables
      if (/[a-zA-Z_]/.test(char)) {
        let idStr = '';
        while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
          idStr += expr[i];
          i++;
        }
        if (idStr === 'i') {
          tokens.push({ type: 'COMPLEX', value: new Complex(0, 1) });
        } else if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'ln', 'log', 'sqrt', 'cbrt', 'abs', 'fact', 'derivative', 'integral', 'nCr', 'nPr', 'pol', 'rec', 'rnd'].includes(idStr)) {
          tokens.push({ type: 'FUNCTION', value: idStr });
        } else if (this.variables.hasOwnProperty(idStr)) {
          tokens.push({ type: 'VARIABLE', value: idStr });
        } else {
          tokens.push({ type: 'VARIABLE', value: idStr });
        }
        continue;
      }

      // Operators
      if (['+', '-', '*', '/', '^', '!', ',', '(', ')'].includes(char)) {
        tokens.push({ type: 'OPERATOR', value: char });
        i++;
        continue;
      }

      i++;
    }
    return tokens;
  }

  // Shunting-Yard Algorithm for Infix to RPN Conversion
  parseToRPN(tokens) {
    const outputQueue = [];
    const operatorStack = [];

    const precedence = {
      '+': 2, '-': 2,
      '*': 3, '/': 3,
      '^': 4,
      '!': 5
    };

    const rightAssociative = { '^': true };

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === 'NUMBER' || token.type === 'COMPLEX') {
        outputQueue.push(token);
      } else if (token.type === 'VARIABLE') {
        const val = this.variables[token.value] !== undefined ? this.variables[token.value] : 0;
        outputQueue.push({ type: 'NUMBER', value: val });
      } else if (token.type === 'FUNCTION') {
        operatorStack.push(token);
      } else if (token.type === 'OPERATOR') {
        if (token.value === ',') {
          while (operatorStack.length && operatorStack[operatorStack.length - 1].value !== '(') {
            outputQueue.push(operatorStack.pop());
          }
        } else if (token.value === '(') {
          operatorStack.push(token);
        } else if (token.value === ')') {
          while (operatorStack.length && operatorStack[operatorStack.length - 1].value !== '(') {
            outputQueue.push(operatorStack.pop());
          }
          operatorStack.pop(); // Pop '('
          if (operatorStack.length && operatorStack[operatorStack.length - 1].type === 'FUNCTION') {
            outputQueue.push(operatorStack.pop());
          }
        } else {
          // Check unary minus
          const isUnary = (token.value === '-') && (
            i === 0 ||
            tokens[i - 1].value === '(' ||
            tokens[i - 1].value === ',' ||
            (tokens[i - 1].type === 'OPERATOR' && tokens[i - 1].value !== ')')
          );

          if (isUnary) {
            operatorStack.push({ type: 'FUNCTION', value: 'negate' });
          } else {
            while (
              operatorStack.length &&
              operatorStack[operatorStack.length - 1].type === 'OPERATOR' &&
              operatorStack[operatorStack.length - 1].value !== '(' &&
              (
                (precedence[operatorStack[operatorStack.length - 1].value] > precedence[token.value]) ||
                (precedence[operatorStack[operatorStack.length - 1].value] === precedence[token.value] && !rightAssociative[token.value])
              )
            ) {
              outputQueue.push(operatorStack.pop());
            }
            operatorStack.push(token);
          }
        }
      }
    }

    while (operatorStack.length) {
      outputQueue.push(operatorStack.pop());
    }

    return outputQueue;
  }

  // RPN Evaluator
  evaluateRPN(rpn) {
    const stack = [];

    for (const token of rpn) {
      if (token.type === 'NUMBER') {
        stack.push(token.value);
      } else if (token.type === 'COMPLEX') {
        stack.push(token.value);
      } else if (token.type === 'OPERATOR') {
        if (token.value === '!') {
          const a = stack.pop();
          stack.push(this.factorial(a));
        } else {
          const b = stack.pop();
          const a = stack.pop();
          stack.push(this.applyOp(token.value, a, b));
        }
      } else if (token.type === 'FUNCTION') {
        if (token.value === 'negate') {
          const a = stack.pop();
          stack.push(typeof a === 'number' ? -a : a.mul(-1));
        } else if (['derivative', 'integral', 'nCr', 'nPr', 'pol', 'rec'].includes(token.value)) {
          // Multi-argument functions
          if (token.value === 'nCr') {
            const r = stack.pop();
            const n = stack.pop();
            stack.push(this.combination(n, r));
          } else if (token.value === 'nPr') {
            const r = stack.pop();
            const n = stack.pop();
            stack.push(this.permutation(n, r));
          } else if (token.value === 'pol') {
            const y = stack.pop();
            const x = stack.pop();
            const r = Math.hypot(x, y);
            const theta = this.fromRad(Math.atan2(y, x));
            stack.push(`r=${formatNumber(r)}, θ=${formatNumber(theta)}°`);
          } else if (token.value === 'rec') {
            const theta = stack.pop();
            const r = stack.pop();
            const rad = this.toRad(theta);
            const x = r * Math.cos(rad);
            const y = r * Math.sin(rad);
            stack.push(`X=${formatNumber(x)}, Y=${formatNumber(y)}`);
          }
        } else {
          const a = stack.pop();
          stack.push(this.applyFunc(token.value, a));
        }
      }
    }

    return stack[0];
  }

  applyOp(op, a, b) {
    if (a instanceof Complex || b instanceof Complex) {
      const ca = Complex.toComplex(a);
      const cb = Complex.toComplex(b);
      switch (op) {
        case '+': return ca.add(cb);
        case '-': return ca.sub(cb);
        case '*': return ca.mul(cb);
        case '/': return ca.div(cb);
        case '^': return ca.pow(typeof b === 'number' ? b : cb.re);
      }
    }

    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': 
        if (b === 0) throw new Error("Division by Zero");
        return a / b;
      case '^': return Math.pow(a, b);
      default: return 0;
    }
  }

  applyFunc(fn, a) {
    if (a instanceof Complex) {
      if (fn === 'abs') return a.abs();
    }

    switch (fn) {
      case 'sin': return Math.sin(this.toRad(a));
      case 'cos': return Math.cos(this.toRad(a));
      case 'tan': return Math.tan(this.toRad(a));
      case 'asin': return this.fromRad(Math.asin(a));
      case 'acos': return this.fromRad(Math.acos(a));
      case 'atan': return this.fromRad(Math.atan(a));
      case 'sinh': return Math.sinh(a);
      case 'cosh': return Math.cosh(a);
      case 'tanh': return Math.tanh(a);
      case 'ln': return Math.log(a);
      case 'log': return Math.log10(a);
      case 'sqrt': 
        if (a < 0) return new Complex(0, Math.sqrt(Math.abs(a)));
        return Math.sqrt(a);
      case 'cbrt': return Math.cbrt(a);
      case 'abs': return Math.abs(a);
      case 'fact': return this.factorial(a);
      case 'rnd': return Math.random();
      default: return a;
    }
  }

  factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= Math.floor(n); i++) res *= i;
    return res;
  }

  combination(n, r) {
    if (r < 0 || r > n) return 0;
    return this.factorial(n) / (this.factorial(r) * this.factorial(n - r));
  }

  permutation(n, r) {
    if (r < 0 || r > n) return 0;
    return this.factorial(n) / this.factorial(n - r);
  }

  // Evaluate Expression String
  evaluate(expr) {
    try {
      if (!expr || expr.trim() === '') return 0;
      const tokens = this.tokenize(expr);
      const rpn = this.parseToRPN(tokens);
      const res = this.evaluateRPN(rpn);

      if (typeof res === 'number') {
        this.variables.Ans = res;
        if (this.numFormat === 'ENG') return this.formatEng(res);
        if (this.numFormat === 'SCI') return res.toExponential(6);
        return formatNumber(res);
      } else if (res instanceof Complex) {
        this.variables.Ans = res;
        return res.toString();
      }
      return String(res);
    } catch (err) {
      return `Error: ${err.message}`;
    }
  }

  // Numerical Derivative d/dx f(x) at x0
  derivative(fnStr, x0, h = 1e-5) {
    const f = (x) => {
      const oldX = this.variables.X;
      this.variables.X = x;
      const val = this.evaluate(fnStr);
      this.variables.X = oldX;
      return typeof val === 'number' ? val : parseFloat(val);
    };

    // Central difference formula
    return (f(x0 + h) - f(x0 - h)) / (2 * h);
  }

  // Numerical Integration Simpson's 1/3 Rule
  integral(fnStr, a, b, n = 100) {
    if (n % 2 !== 0) n++; // Must be even
    const h = (b - a) / n;

    const f = (x) => {
      const oldX = this.variables.X;
      this.variables.X = x;
      const val = this.evaluate(fnStr);
      this.variables.X = oldX;
      return typeof val === 'number' ? val : parseFloat(val);
    };

    let sum = f(a) + f(b);

    for (let i = 1; i < n; i++) {
      const x = a + i * h;
      sum += (i % 2 === 0 ? 2 : 4) * f(x);
    }

    return (h / 3) * sum;
  }
}

// Global instance export
window.mathEngine = new MathEngine();
