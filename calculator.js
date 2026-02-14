// Калькулятор
// Bogdan Matrosov, 2026

class Calculator {
  constructor() {
    this.current = '0';
    this.previous = null;
    this.operation = null;
  }

  clear() {
    this.current = '0';
    this.previous = null;
    this.operation = null;
  }

  appendNumber(number) {
    if (number === '.' && this.current.includes('.')) return;
    if (this.current === '0' && number !== '.') {
      this.current = number;
    } else {
      this.current = this.current + number;
    }
  }

  chooseOperation(operator) {
    if (this.current === '0') return;
    if (this.previous !== null && this.operation) {
      this.compute();
    }
    this.operation = operator;
    this.previous = this.current;
    this.current = '0';
  }

  compute() {
    if (!this.operation || !this.previous) return;

    const a = parseFloat(this.previous);
    const b = parseFloat(this.current);

    if (isNaN(a) || isNaN(b)) return;

    let result;
    if (this.operation === '+') result = a + b;
    else if (this.operation === '-') result = a - b;
    else if (this.operation === '*') result = a * b;
    else if (this.operation === '/') {
      if (b === 0) {
        this.current = 'Нельзя на 0';
        this.operation = null;
        this.previous = null;
        return;
      }
      result = a / b;
    }

    this.current = result.toString();
    this.operation = null;
    this.previous = null;
  }

  delete() {
    if (this.current.length <= 1) {
      this.current = '0';
    } else {
      this.current = this.current.slice(0, -1);
    }
  }

  getDisplay() {
    return this.current;
  }
}