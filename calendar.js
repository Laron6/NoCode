// Calendar App — календарь событий с пользователями, редактированием и уведомлениями
// Bogdan Matrosov, 2026

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

  getAllUsers() {
    return [...this.users];
  }

  getUser(id) {
    return this.users.find(u => u.id === id);
  }

  addEvent(userId, title, date, time, desc = '', creatorName = '') {
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
      timestamp: eventDate.getTime(),
      creatorName: creatorName.trim() || 'Неизвестный пользователь'
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

  getEvent(id) {
    return this.events.find(e => e.id === id);
  }

  checkUpcomingEvents() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const now = Date.now();
    this.events.forEach(ev => {
      const diff = ev.timestamp - now;
      if (diff > 0 && diff <= 30 * 60 * 1000) { // за 30 минут
        new Notification(`Скоро событие`, {
          body: `${ev.title} в ${ev.time} • ${ev.creatorName}`,
          icon: 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png'
        });
      }
    });
  }

  clearAll() {
    this.events = [];
    this.users = [];
    localStorage.removeItem('calendarData');
  }
}