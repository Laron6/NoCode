// Тесты для Календаря событий
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

class CalendarApp {
  constructor() {
    this.users = [];
    this.events = [];
    this.loadFromStorage();
  }

  saveToStorage() {
    localStorage.setItem('calendarData', JSON.stringify({
      users: this.users,
      events: this.events
    }));
  }

  loadFromStorage() {
    const saved = localStorage.getItem('calendarData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.users = data.users || [];
        this.events = data.events || [];
      } catch {
        this.users = [];
        this.events = [];
      }
    }
  }

  addUser(name) {
    if (!name.trim()) throw new Error('Имя пользователя обязательно');
    const id = Date.now() + Math.random();
    this.users.push({ id, name: name.trim() });
    this.saveToStorage();
    return id;
  }

  addEvent(userId, title, date, time, desc = '') {
    if (!userId) throw new Error('Выберите пользователя');
    if (!title.trim()) throw new Error('Название события обязательно');
    if (!date || !time) throw new Error('Дата и время обязательны');

    const eventDate = new Date(`${date}T${time}`);
    const event = {
      id: Date.now(),
      userId,
      title: title.trim(),
      date,
      time,
      desc: desc.trim(),
      timestamp: eventDate.getTime()
    };

    this.events.push(event);
    this.events.sort((a, b) => a.timestamp - b.timestamp);
    this.saveToStorage();
    return event.id;
  }

  updateEvent(id, title, date, time, desc) {
    const event = this.events.find(e => e.id === id);
    if (!event) throw new Error('Событие не найдено');
    if (title) event.title = title.trim();
    if (date) event.date = date;
    if (time) event.time = time;
    if (desc !== undefined) event.desc = desc.trim();
    const eventDate = new Date(`${event.date}T${event.time}`);
    event.timestamp = eventDate.getTime();
    this.events.sort((a, b) => a.timestamp - b.timestamp);
    this.saveToStorage();
  }

  deleteEvent(id) {
    const index = this.events.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Событие не найдено');
    this.events.splice(index, 1);
    this.saveToStorage();
  }

  getAllEvents() {
    return [...this.events];
  }

  getAllUsers() {
    return [...this.users];
  }

  getStats() {
    const now = new Date();
    const today = now.toDateString();

    const total = this.events.length;
    const todayCount = this.events.filter(e => new Date(e.timestamp).toDateString() === today).length;
    const soonCount = this.events.filter(e => {
      const diff = e.timestamp - now.getTime();
      return diff > 0 && diff <= 24 * 60 * 60 * 1000;
    }).length;

    return { total, today: todayCount, soon: soonCount };
  }

  clearAll() {
    this.events = [];
    this.users = [];
    localStorage.removeItem('calendarData');
  }
}

// Тесты

test('Проверка добавления пользователя и события от него', () => {
  const cal = new CalendarApp();
  cal.clearAll();

  const userId = cal.addUser('Алексей');
  const eventId = cal.addEvent(userId, 'Встреча', '2026-03-01', '14:30');

  const events = cal.getAllEvents();
  assert.equal(events.length, 1);
  assert.equal(events[0].userId, userId);
  assert.equal(events[0].title, 'Встреча');
});

test('Проверка редактирования события', () => {
  const cal = new CalendarApp();
  cal.clearAll();

  const userId = cal.addUser('Марина');
  const eventId = cal.addEvent(userId, 'Старая встреча', '2026-03-01', '10:00', 'Старое описание');

  cal.updateEvent(eventId, 'Новая встреча', '2026-03-02', '15:00', 'Новое описание');

  const event = cal.getAllEvents().find(e => e.id === eventId);
  assert.equal(event.title, 'Новая встреча');
  assert.equal(event.date, '2026-03-02');
  assert.equal(event.time, '15:00');
  assert.equal(event.desc, 'Новое описание');
});

test('Проверка удаления события', () => {
  const cal = new CalendarApp();
  cal.clearAll();

  const userId = cal.addUser('Дмитрий');
  const eventId = cal.addEvent(userId, 'Удаляемое', '2026-03-03', '12:00');

  cal.deleteEvent(eventId);

  assert.equal(cal.getAllEvents().length, 0);
});

test('Проверка сортировки событий по времени', () => {
  const cal = new CalendarApp();
  cal.clearAll();

  const userId = cal.addUser('Тест');

  cal.addEvent(userId, 'Позднее', '2026-03-05', '18:00');
  cal.addEvent(userId, 'Раннее', '2026-03-03', '09:00');
  cal.addEvent(userId, 'Среднее', '2026-03-04', '12:00');

  const events = cal.getAllEvents();

  assert.equal(events[0].title, 'Раннее');
  assert.equal(events[1].title, 'Среднее');
  assert.equal(events[2].title, 'Позднее');
});

test('Проверка сохранения и восстановления из localStorage', () => {
  const cal1 = new CalendarApp();
  cal1.clearAll();

  const userId = cal1.addUser('Сохраняемый');
  cal1.addEvent(userId, 'Событие 1', '2026-04-01', '10:00', 'Важное');

  const cal2 = new CalendarApp();

  assert.equal(cal2.getAllUsers().length, 1);
  assert.equal(cal2.getAllEvents().length, 1);
  assert.equal(cal2.getAllEvents()[0].desc, 'Важное');
});

test('Проверка очистки всех данных', () => {
  const cal = new CalendarApp();
  cal.clearAll();

  cal.addUser('Тест');
  cal.addEvent(cal.getAllUsers()[0].id, 'Тест', '2026-05-01', '00:00');

  cal.clearAll();

  assert.equal(cal.getAllUsers().length, 0);
  assert.equal(cal.getAllEvents().length, 0);
});