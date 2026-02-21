// Тесты для To-Do List
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
class TodoList {
  constructor() {
    this.tasks = [];
    this.loadFromStorage();
  }

  saveToStorage() {
    localStorage.setItem('todoData', JSON.stringify(this.tasks));
  }

  loadFromStorage() {
    const saved = localStorage.getItem('todoData');
    if (saved) {
      try {
        this.tasks = JSON.parse(saved);
      } catch (e) {
        localStorage.removeItem('todoData');
      }
    }
  }

  addTask(title, description = '') {
    if (!title.trim()) throw new Error('Название задачи обязательно');
    const taskId = this.tasks.length + 1;
    const task = {
      id: taskId,
      title: title.trim(),
      description: description.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    this.tasks.push(task);
    this.saveToStorage();
    return taskId;
  }

  updateTask(id, title, description) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) throw new Error('Задача не найдена');
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    this.saveToStorage();
  }

  toggleCompleted(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) throw new Error('Задача не найдена');
    task.completed = !task.completed;
    this.saveToStorage();
  }

  deleteTask(id) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Задача не найдена');
    this.tasks.splice(index, 1);
    this.saveToStorage();
  }

  getAllTasks() {
    return [...this.tasks];
  }

  getCompletedTasks() {
    return this.tasks.filter(t => t.completed);
  }

  clearAll() {
    this.tasks = [];
    localStorage.removeItem('todoData');
  }
}

test('Проверка добавления новой задачи', () => {
  const todo = new TodoList();
  todo.clearAll();

  todo.addTask('Купить молоко', '1 литр');

  assert.equal(todo.tasks.length, 1, 'После добавления должна быть ровно одна задача');
  assert.equal(todo.tasks[0].title, 'Купить молоко', 'Название задачи должно сохраняться');
  assert.equal(todo.tasks[0].completed, false, 'Новая задача по умолчанию не должна быть выполнена');
});

test('Проверка редактирования существующей задачи', () => {
  const todo = new TodoList();
  todo.clearAll();

  const id = todo.addTask('Старая задача', 'Старая опис');
  todo.updateTask(id, 'Новая задача', 'Новое опис');

  assert.equal(todo.tasks[0].title, 'Новая задача', 'Название задачи должно обновиться');
  assert.equal(todo.tasks[0].description, 'Новое опис', 'Описание задачи должно обновиться');
});

test('Проверка переключения статуса выполнения задачи', () => {
  const todo = new TodoList();
  todo.clearAll();

  const id = todo.addTask('Задача 1');

  todo.toggleCompleted(id);
  assert.equal(todo.tasks[0].completed, true, 'После первого переключения задача должна стать выполненной');

  todo.toggleCompleted(id);
  assert.equal(todo.tasks[0].completed, false, 'После второго переключения задача должна снова стать невыполненной');
});

test('Проверка удаления задачи', () => {
  const todo = new TodoList();
  todo.clearAll();

  const id = todo.addTask('Удаляемая задача');
  todo.deleteTask(id);

  assert.equal(todo.tasks.length, 0, 'После удаления список задач должен быть пустым');

  // Проверяем, что удалённую задачу нельзя удалить повторно
  assert.throws(
    () => todo.deleteTask(id),
    /не найдена/,
    'При попытке удалить несуществующую задачу должна возникнуть ошибка'
  );
});

test('Проверка получения списка всех задач', () => {
  const todo = new TodoList();
  todo.clearAll();

  todo.addTask('Задача 1');
  todo.addTask('Задача 2');

  const all = todo.getAllTasks();

  assert.equal(all.length, 2, 'Должно вернуться ровно две задачи');
  assert.deepEqual(
    all.map(t => t.title),
    ['Задача 1', 'Задача 2'],
    'Список названий задач должен соответствовать добавленным'
  );
});

test('Проверка получения списка только выполненных задач', () => {
  const todo = new TodoList();
  todo.clearAll();
  localStorage.clear(); // дополнительная очистка для независимости теста

  const id1 = todo.addTask('Невыполненная задача');
  const id2 = todo.addTask('Выполненная задача');

  todo.toggleCompleted(id2);

  const completed = todo.getCompletedTasks();

  assert.equal(completed.length, 1, 'В списке выполненных должна быть ровно одна задача');
  assert.equal(
    completed[0].title,
    'Выполненная задача',
    'В списке выполненных должна быть именно та задача, которую мы отметили'
  );
  assert.equal(
    completed[0].id,
    id2,
    'ID выполненной задачи должен совпадать с той, которую мы переключали'
  );
});