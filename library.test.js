// Тесты для Library Management System
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

class LibrarySystem {
  constructor() {
    this.books = [];
    this.readers = [];
    this.loadFromStorage();
  }

  saveToStorage() {
    localStorage.setItem('libraryData', JSON.stringify({
      books: this.books,
      readers: this.readers
    }));
  }

  loadFromStorage() {
    const saved = localStorage.getItem('libraryData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.books = data.books || [];
        this.readers = data.readers || [];
      } catch {
        localStorage.removeItem('libraryData');
      }
    }
  }

  addBook(title, author = '') {
    if (!title.trim()) throw new Error('Название книги обязательно');
    const id = this.books.length + 1;
    const book = { id, title: title.trim(), author: author.trim(), borrowedBy: null };
    this.books.push(book);
    this.saveToStorage();
    return id;
  }

  deleteBook(id) {
    const index = this.books.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Книга не найдена');
    const book = this.books[index];
    if (book.borrowedBy) {
      const reader = this.readers.find(r => r.id === book.borrowedBy);
      if (reader) reader.borrowedBooks = reader.borrowedBooks.filter(bid => bid !== id);
    }
    this.books.splice(index, 1);
    this.saveToStorage();
  }

  addReader(name) {
    if (!name.trim()) throw new Error('Имя читателя обязательно');
    const id = this.readers.length + 1;
    const reader = { id, name: name.trim(), borrowedBooks: [] };
    this.readers.push(reader);
    this.saveToStorage();
    return id;
  }

  deleteReader(id) {
    const index = this.readers.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Читатель не найден');
    const reader = this.readers[index];
    if (reader.borrowedBooks.length > 0) throw new Error('Читатель имеет взятые книги');
    this.readers.splice(index, 1);
    this.saveToStorage();
  }

  borrowBook(bookId, readerId) {
    const book = this.books.find(b => b.id === bookId);
    const reader = this.readers.find(r => r.id === readerId);
    if (!book) throw new Error('Книга не найдена');
    if (!reader) throw new Error('Читатель не найден');
    if (book.borrowedBy) throw new Error('Книга уже взята');
    book.borrowedBy = readerId;
    reader.borrowedBooks.push(bookId);
    this.saveToStorage();
  }

  returnBook(bookId) {
    const book = this.books.find(b => b.id === bookId);
    if (!book) throw new Error('Книга не найдена');
    if (!book.borrowedBy) throw new Error('Книга не была взята');
    const reader = this.readers.find(r => r.id === book.borrowedBy);
    if (reader) {
      reader.borrowedBooks = reader.borrowedBooks.filter(bid => bid !== bookId);
    }
    book.borrowedBy = null;
    this.saveToStorage();
  }

  getAllBooks() { return [...this.books]; }
  getAvailableBooks() { return this.books.filter(b => !b.borrowedBy); }
  getAllReaders() { return [...this.readers]; }
  getReader(id) { return this.readers.find(r => r.id === id); }

  clearAll() {
    this.books = [];
    this.readers = [];
    localStorage.removeItem('libraryData');
  }
}

test('Проверка возможности добавления книги', () => {
  const lib = new LibrarySystem();
  lib.clearAll();
  const bookId = lib.addBook('451 по Фаренгейту', 'Рэй Брэдбери');
  const books = lib.getAllBooks();
  assert.equal(books.length, 1);
  assert.equal(books[0].title, '451 по Фаренгейту');
  assert.equal(books[0].borrowedBy, null);
});

test('Проверка возможности добавления и удаления читателя', () => {
  const lib = new LibrarySystem();
  lib.clearAll();
  const readerId = lib.addReader('Анна Каренина');
  assert.equal(lib.getAllReaders().length, 1);
  assert.equal(lib.getAllReaders()[0].name, 'Анна Каренина');
  lib.deleteReader(readerId);
  assert.equal(lib.getAllReaders().length, 0);
});

test('Проверка возможности выдачи и возврата книги конкретному читателю', () => {
  const lib = new LibrarySystem();
  lib.clearAll();

  const bookId = lib.addBook('Мастер и Маргарита');
  const readerId = lib.addReader('Воланд');

  lib.borrowBook(bookId, readerId);

  let books = lib.getAllBooks();
  assert.equal(books[0].borrowedBy, readerId);

  let readers = lib.getAllReaders();
  assert.equal(readers[0].borrowedBooks[0], bookId);

  lib.returnBook(bookId);

  books = lib.getAllBooks();
  assert.equal(books[0].borrowedBy, null);

  readers = lib.getAllReaders();
  assert.equal(readers[0].borrowedBooks.length, 0);
});

test('Проверка запрета удалить читателя с взятыми книгами', () => {
  const lib = new LibrarySystem();
  lib.clearAll();

  const bookId = lib.addBook('Тестовая книга');
  const readerId = lib.addReader('Тестовый читатель');

  lib.borrowBook(bookId, readerId);

  assert.throws(
    () => lib.deleteReader(readerId),
    /имеет взятые книги/,
    'Должна быть ошибка при попытке удалить читателя с книгами'
  );
});

test('Проверка, чтобы при очистки книги она очищена была и у читателя', () => {
  const lib = new LibrarySystem();
  lib.clearAll();

  const bookId = lib.addBook('Книга для удаления');
  const readerId = lib.addReader('Читатель');

  lib.borrowBook(bookId, readerId);

  lib.deleteBook(bookId);

  const reader = lib.getAllReaders()[0];
  assert.equal(reader.borrowedBooks.length, 0, 'У читателя не должно остаться удалённой книги');
});

test('Проверка списка доступных книг', () => {
  const lib = new LibrarySystem();
  lib.clearAll();

  lib.addBook('Свободная книга');
  const bookId2 = lib.addBook('Занятая книга');
  const readerId = lib.addReader('Кто-то');

  lib.borrowBook(bookId2, readerId);

  const available = lib.getAvailableBooks();
  assert.equal(available.length, 1);
  assert.equal(available[0].title, 'Свободная книга');
});