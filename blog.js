// Блог-платформа — с пользователями, авторизацией и правами редактирования
// Bogdan Matrosov, 2026

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