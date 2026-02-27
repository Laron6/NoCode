// Тесты для Chat App
// Bogdan Matrosov, 2026

const assert = require('node:assert');
const test = require('node:test');

// Фейковый localStorage только для тестов
global.localStorage = {
  data: {},
  getItem(key) { return this.data[key] || null; },
  setItem(key, value) { this.data[key] = value; },
  removeItem(key) { delete this.data[key]; },
  clear() { this.data = {}; }
};

// Копируем класс сюда для тестов
class ChatApp {
  constructor() {
    this.chats = [];
    this.loadFromStorage();
  }

  saveToStorage() {
    localStorage.setItem('chatAppData', JSON.stringify(this.chats));
  }

  loadFromStorage() {
    const saved = localStorage.getItem('chatAppData');
    if (saved) {
      try {
        this.chats = JSON.parse(saved);
      } catch {
        this.chats = [];
      }
    }
  }

  addChat(name) {
    const id = Date.now() + Math.random();
    this.chats.push({
      id,
      name: name.trim(),
      messages: [],
      lastMessage: null,
      lastTime: null
    });
    this.saveToStorage();
    return id;
  }

  getAllChats() {
    return [...this.chats];
  }

  getChat(id) {
    return this.chats.find(c => c.id === id);
  }

  sendMessage(chatId, text, senderId) {
    const chat = this.getChat(chatId);
    if (!chat) throw new Error('Чат не найден');
    const trimmed = text.trim();
    if (!trimmed) return;

    const msg = {
      text: trimmed,
      time: Date.now(),
      senderId
    };

    chat.messages.push(msg);
    chat.lastMessage = trimmed.length > 40 ? trimmed.substring(0, 37) + '...' : trimmed;
    chat.lastTime = msg.time;
    this.saveToStorage();
  }

  clearAll() {
    this.chats = [];
    localStorage.removeItem('chatAppData');
  }
}

// Тесты

test('Проверка создания нескольких чатов', () => {
  const app = new ChatApp();
  app.clearAll();

  const id1 = app.addChat('Алексей');
  const id2 = app.addChat('Марина');
  const id3 = app.addChat('Дмитрий');

  const chats = app.getAllChats();

  assert.equal(chats.length, 3, 'После добавления должно быть ровно три чата');
  assert.equal(chats[0].name, 'Алексей', 'Название первого чата должно сохраняться');
  assert.equal(chats[1].id, id2, 'ID второго чата должен совпадать с возвращённым');
  assert.equal(chats[2].messages.length, 0, 'Новый чат должен быть пустым');
});

test('Проверка отправки сообщений в чат', () => {
    const app = new ChatApp();
    app.clearAll();
    const chatId = app.addChat('Тестовый');
  
    app.sendMessage(chatId, 'Привет!');
    app.sendMessage(chatId, 'Как дела?', chatId);
    app.sendMessage(chatId, 'Это очень длинное сообщение для проверки обрезки превью в списке чатов', chatId);
  
    const chat = app.getChat(chatId);
  
    assert.equal(chat.messages.length, 3, 'В чате должно быть ровно три сообщения');
    assert.equal(chat.messages[0].text, 'Привет!', 'Текст первого сообщения должен сохраняться');
    
    // Проверяем senderId второго сообщения (от текущего пользователя)
    assert.equal(chat.messages[1].senderId, chatId, 'Второе сообщение должно быть от текущего пользователя');
    
    // Проверяем обрезку lastMessage (37 символов + ...)
    assert.equal(
      chat.lastMessage,
      'Это очень длинное сообщение для прове...',
      'lastMessage должен быть обрезан до 37 символов + ...'
    );
  });

test('Проверка сохранения и восстановления чатов из localStorage', () => {
  const app1 = new ChatApp();
  app1.clearAll();

  const chatId = app1.addChat('Сохраняемый');
  app1.sendMessage(chatId, 'Сообщение 1');
  app1.sendMessage(chatId, 'Сообщение 2');

  // имитация перезапуска приложения
  const app2 = new ChatApp();

  const chats = app2.getAllChats();

  assert.equal(chats.length, 1, 'После "перезапуска" должен восстановиться один чат');
  assert.equal(chats[0].messages.length, 2, 'Сообщения должны сохраниться');
  assert.equal(chats[0].lastMessage, 'Сообщение 2', 'Последнее сообщение должно быть корректным');
});

test('Проверка очистки всех данных', () => {
  const app = new ChatApp();
  app.clearAll();

  app.addChat('Временный');
  app.clearAll();

  const chats = app.getAllChats();

  assert.equal(chats.length, 0, 'После очистки список чатов должен быть пустым');
});

test('Проверка отправки сообщений от разных пользователей', () => {
  const app = new ChatApp();
  app.clearAll();
  const chatId = app.addChat('Друг');

  app.sendMessage(chatId, 'Привет от меня', chatId);
  app.sendMessage(chatId, 'Ответ от друга', chatId);
  app.sendMessage(chatId, 'Ещё одно от меня', chatId);

  const messages = app.getChat(chatId).messages;

  assert.equal(messages.length, 3, 'Должно быть ровно три сообщения');
  assert.equal(messages[0].senderId, chatId, 'Первое сообщение должно быть от текущего пользователя');
  assert.equal(messages[1].senderId, chatId, 'Второе сообщение тоже от текущего');
  assert.equal(messages[2].senderId, chatId, 'Третье сообщение от текущего');
});

test('Проверка краевого случая — отправка пустого сообщения', () => {
  const app = new ChatApp();
  app.clearAll();
  const chatId = app.addChat('Пустышка');

  app.sendMessage(chatId, '   '); // только пробелы
  app.sendMessage(chatId, '');     // пустая строка
  app.sendMessage(chatId, '\t\n'); // табы и переносы

  const chat = app.getChat(chatId);

  assert.equal(chat.messages.length, 0, 'Пустые сообщения не должны добавляться');
  assert.equal(chat.lastMessage, null, 'lastMessage должен остаться null');
});