// Тесты для Блог-платформы
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

class BlogAPI {
  constructor() {
    this.users = [];
    this.posts = [];
    this.currentUser = null;
    this.loadFromStorage();
  }

  saveToStorage() {
    localStorage.setItem('blogData', JSON.stringify({
      users: this.users,
      posts: this.posts,
      currentUser: this.currentUser
    }));
  }

  loadFromStorage() {
    const saved = localStorage.getItem('blogData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.users = data.users || [];
        this.posts = data.posts || [];
        this.currentUser = data.currentUser || null;
      } catch {
        this.users = [];
        this.posts = [];
        this.currentUser = null;
      }
    }
  }

  login(username) {
    let user = this.users.find(u => u.toLowerCase() === username.toLowerCase());
    if (!user) {
      this.users.push(username.trim());
      user = username.trim();
    }
    this.currentUser = user;
    this.saveToStorage();
  }

  logout() {
    this.currentUser = null;
    this.saveToStorage();
  }

  createPost(title, content) {
    if (!this.currentUser) throw new Error('Требуется авторизация');
    if (!title.trim()) throw new Error('Заголовок обязателен');
    if (!content.trim()) throw new Error('Текст поста обязателен');

    const post = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      author: this.currentUser,
      comments: []
    };

    this.posts.push(post);
    this.saveToStorage();
    return post.id;
  }

  getPosts() {
    return [...this.posts];
  }

  addComment(postId, comment) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) throw new Error('Пост не найден');
    if (!comment.trim()) throw new Error('Комментарий не может быть пустым');

    post.comments.push(comment.trim());
    this.saveToStorage();
  }

  deletePost(id) {
    const post = this.posts.find(p => p.id === id);
    if (!post) throw new Error('Пост не найден');
    if (post.author !== this.currentUser) throw new Error('Удалять может только автор');

    const index = this.posts.findIndex(p => p.id === id);
    this.posts.splice(index, 1);
    this.saveToStorage();
  }

  clearAll() {
    this.posts = [];
    this.users = [];
    this.currentUser = null;
    localStorage.removeItem('blogData');
  }
}

// Тесты

test('Проверка авторизации и создание поста', () => {
  const blog = new BlogAPI();
  blog.clearAll();

  blog.login('Алексей');
  const postId = blog.createPost('Первый пост', 'Текст поста');

  const posts = blog.getPosts();
  assert.equal(posts.length, 1);
  assert.equal(posts[0].author, 'Алексей');
  assert.equal(posts[0].title, 'Первый пост');
});

test('Проверка возможности обавления комментария', () => {
  const blog = new BlogAPI();
  blog.clearAll();

  blog.login('Марина');
  const postId = blog.createPost('Пост', 'Текст');
  blog.addComment(postId, 'Хороший пост!');

  const post = blog.getPosts()[0];
  assert.equal(post.comments.length, 1);
  assert.equal(post.comments[0], 'Хороший пост!');
});

test('Проверка возможности удаления поста только автором', () => {
  const blog = new BlogAPI();
  blog.clearAll();

  blog.login('Дмитрий');
  const postId = blog.createPost('Удаляемый', 'Текст');

  blog.deletePost(postId);
  assert.equal(blog.getPosts().length, 0);

  // Попытка удалить несуществующий
  assert.throws(() => blog.deletePost(postId), /не найден/);
});

test('Проверка ограничения редактирования (удаление поста допускается только автором)', () => {
  const blog = new BlogAPI();
  blog.clearAll();

  blog.login('Алексей');
  const postId = blog.createPost('Пост Алексея', 'Текст');

  blog.login('Марина');
  assert.throws(() => blog.deletePost(postId), /Удалять может только автор/);
});

test('Проверка возможности сохранения и восстановления поста', () => {
  const blog1 = new BlogAPI();
  blog1.clearAll();

  blog1.login('Сохраняемый');
  const postId = blog1.createPost('Сохраняемый пост', 'Текст');
  blog1.addComment(postId, 'Сохраняемый коммент');

  const blog2 = new BlogAPI();

  assert.equal(blog2.currentUser, 'Сохраняемый');
  assert.equal(blog2.getPosts().length, 1);
  assert.equal(blog2.getPosts()[0].comments.length, 1);
});

test('Проверка очистки данных', () => {
  const blog = new BlogAPI();
  blog.clearAll();

  blog.login('Тест');
  blog.createPost('Тест', 'Текст');

  blog.clearAll();

  assert.equal(blog.users.length, 0);
  assert.equal(blog.posts.length, 0);
  assert.equal(blog.currentUser, null);
});