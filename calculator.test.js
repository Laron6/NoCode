// Bogdan Matrosov, 2026

const assert = require('node:assert');
const test = require('node:test');

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
        this.current = 'Деление на 0';
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

test('Начальное значение калькулятора "0"', () => {
  const calc = new Calculator();
  assert.equal(calc.getDisplay(), '0');
});

test('Проверка возможости ввода числа', () => {
  const calc = new Calculator();
  calc.appendNumber('7');
  calc.appendNumber('3');
  assert.equal(calc.getDisplay(), '73');
});

test('Проверка ввода символа "." один раз', () => {
  const calc = new Calculator();
  calc.appendNumber('5');
  calc.appendNumber('.');
  calc.appendNumber('2');
  calc.appendNumber('.');
  assert.equal(calc.getDisplay(), '5.2');
});

test('Проверка сложения чисел', () => {
  const calc = new Calculator();
  calc.appendNumber('5');
  calc.chooseOperation('+');
  calc.appendNumber('8');
  calc.compute();
  assert.equal(calc.getDisplay(), '13');
});

test('Ошибка при вводе значения "0"', () => {
  const calc = new Calculator();
  calc.appendNumber('9');
  calc.chooseOperation('/');
  calc.appendNumber('0');
  calc.compute();
  assert.equal(calc.getDisplay(), 'Деление на 0');
});

test('Проверка вычитания чисел', () => {
  const calc = new Calculator();
  calc.appendNumber('10');
  calc.chooseOperation('-');
  calc.appendNumber('4');
  calc.compute();
  assert.equal(calc.getDisplay(), '6');
});

test('Удаление символов', () => {
  const calc = new Calculator();
  calc.appendNumber('1');
  calc.appendNumber('2');
  calc.appendNumber('3');
  calc.delete();
  assert.equal(calc.getDisplay(), '12');
});

test('Проверка очистки значений', () => {
  const calc = new Calculator();
  calc.appendNumber('999');
  calc.clear();
  assert.equal(calc.getDisplay(), '0');
});