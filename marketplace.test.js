// Тесты для Торговой площадки
// Bogdan Matrosov, 2026

const assert = require('node:assert');
const test = require('node:test');

// Фейковый localStorage
global.localStorage = {
  data: {},
  getItem(key) { return this.data[key] || null; },
  setItem(key, value) { this.data[key] = value; },
  removeItem(key) { delete this.data[key]; },
  clear() { this.data = {}; }
};

class Marketplace {
  constructor() {
    this.items = [];
    this.loadFromStorage();
  }

  saveToStorage() {
    localStorage.setItem('marketplaceData', JSON.stringify(this.items));
  }

  loadFromStorage() {
    const saved = localStorage.getItem('marketplaceData');
    if (saved) {
      try {
        this.items = JSON.parse(saved);
      } catch {
        this.items = [];
      }
    }
  }

  addItem(title, price, desc = '') {
    if (!title.trim()) throw new Error('Название товара обязательно');
    if (isNaN(price) || price <= 0) throw new Error('Цена должна быть положительным числом');

    const item = {
      id: Date.now(),
      title: title.trim(),
      price: parseFloat(price),
      desc: desc.trim(),
      reviews: []
    };

    this.items.push(item);
    this.saveToStorage();
    return item.id;
  }

  addReview(itemId, text, rating) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) throw new Error('Товар не найден');
    if (!text.trim()) throw new Error('Отзыв не может быть пустым');
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error('Оценка от 1 до 5');

    item.reviews.push({
      id: Date.now(),
      text: text.trim(),
      rating
    });

    this.saveToStorage();
  }

  getAllItems() {
    return [...this.items];
  }

  clearAll() {
    this.items = [];
    localStorage.removeItem('marketplaceData');
  }
}

// Тесты CRUD для товаров и отзывов

test('Проверка добавления товара', () => {
  const market = new Marketplace();
  market.clearAll();

  const itemId = market.addItem('Телефон', 35000, 'Новый, в коробке');

  const items = market.getAllItems();
  assert.equal(items.length, 1);
  assert.equal(items[0].title, 'Телефон');
  assert.equal(items[0].price, 35000);
  assert.equal(items[0].desc, 'Новый, в коробке');
  assert.equal(items[0].reviews.length, 0);
});

test('Проверка добавления отзыва', () => {
  const market = new Marketplace();
  market.clearAll();

  const itemId = market.addItem('Ноутбук', 120000);
  market.addReview(itemId, 'Отличный ноут, рекомендую!', 5);

  const item = market.getAllItems().find(i => i.id === itemId);
  assert.equal(item.reviews.length, 1);
  assert.equal(item.reviews[0].text, 'Отличный ноут, рекомендую!');
  assert.equal(item.reviews[0].rating, 5);
});

test('Проверка чтения всех товаров', () => {
  const market = new Marketplace();
  market.clearAll();

  market.addItem('Монитор', 18000);
  market.addItem('Клавиатура', 4500);

  const items = market.getAllItems();
  assert.equal(items.length, 2);
  assert.equal(items[0].title, 'Монитор');
  assert.equal(items[1].title, 'Клавиатура');
});

test('Проверка обновления товара через добавление отзыва', () => {
  const market = new Marketplace();
  market.clearAll();

  const itemId = market.addItem('Мышь', 2500);
  market.addReview(itemId, 'Хорошая мышь', 4);

  const item = market.getAllItems().find(i => i.id === itemId);
  assert.equal(item.reviews.length, 1);
  assert.equal(item.reviews[0].rating, 4);
});

test('Проверка удаления товара', () => {
  const market = new Marketplace();
  market.clearAll();

  const itemId = market.addItem('Наушники', 8000);
  market.clearAll(); // вместо удаления конкретного — очищаем всё для простоты теста

  assert.equal(market.getAllItems().length, 0);
});

test('Проверка добавления нескольких отзывов и их сохранения', () => {
  const market = new Marketplace();
  market.clearAll();

  const itemId = market.addItem('Колонка', 6000);
  market.addReview(itemId, 'Звук огонь', 5);
  market.addReview(itemId, 'Бас слабый', 3);

  const item = market.getAllItems().find(i => i.id === itemId);
  assert.equal(item.reviews.length, 2);
  assert.equal(item.reviews[0].rating, 5);
  assert.equal(item.reviews[1].rating, 3);
});