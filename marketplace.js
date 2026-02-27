// Торговая площадка
// Bogdan Matrosov, 2026

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

  deleteItem(id) {
    const index = this.items.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Товар не найден');
    this.items.splice(index, 1);
    this.saveToStorage();
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