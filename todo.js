// To-Do List: система управления задачами (альтернативная версия)
// Bogdan Matrosov, 2026

class TodoList {
  constructor() {
    this.tasks = []; // массив задач
    this.loadFromStorage(); // загружаем из localStorage
  }

  // Сохраняем в localStorage
  saveToStorage() {
    localStorage.setItem('todoData', JSON.stringify(this.tasks));
  }

  // Загружаем из localStorage
  loadFromStorage() {
    const saved = localStorage.getItem('todoData');
    if (saved) {
      try {
        this.tasks = JSON.parse(saved);
      } catch (e) {
        console.error('Ошибка загрузки задач:', e);
        localStorage.removeItem('todoData');
      }
    }
  }

  // Добавляем задачу
  addTask(title, description = '') {
    if (!title.trim()) throw new Error('Название задачи обязательно');
    const taskId = this.tasks.length + 1; // простой последовательный ID
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

  // Редактируем задачу
  updateTask(id, title, description) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) throw new Error('Задача не найдена');
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    this.saveToStorage();
  }

  // Помечаем как выполненную/невыполненную
  toggleCompleted(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) throw new Error('Задача не найдена');
    task.completed = !task.completed;
    this.saveToStorage();
  }

  // Удаляем задачу
  deleteTask(id) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Задача не найдена');
    this.tasks.splice(index, 1);
    this.saveToStorage();
  }

  // Получаем все задачи
  getAllTasks() {
    return [...this.tasks];
  }

  // Получаем выполненные задачи
  getCompletedTasks() {
    return this.tasks.filter(t => t.completed);
  }

  // Очистить все задачи
  clearAll() {
    this.tasks = [];
    localStorage.removeItem('todoData');
  }
}