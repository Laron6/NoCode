// Library Management System — Bogdan Matrosov, 2026

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
            } catch (e) {
                localStorage.removeItem('libraryData');
            }
        }
    }

    addBook(title, author = '') {
        if (!title.trim()) throw new Error('Название книги обязательно');
        const id = this.books.length + 1;
        this.books.push({
            id,
            title: title.trim(),
            author: author.trim(),
            borrowedBy: null
        });
        this.saveToStorage();
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
        this.readers.push({
            id,
            name: name.trim(),
            borrowedBooks: []
        });
        this.saveToStorage();
    }

    deleteReader(id) {
        const index = this.readers.findIndex(r => r.id === id);
        if (index === -1) throw new Error('Читатель не найден');
        const reader = this.readers[index];
        if (reader.borrowedBooks.length > 0) throw new Error('Нельзя удалить читателя с взятыми книгами');
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

    getAllBooks()    { return [...this.books]; }
    getAvailableBooks() { return this.books.filter(b => !b.borrowedBy); }
    getAllReaders()  { return [...this.readers]; }
    getReader(id)    { return this.readers.find(r => r.id === id); }

    clearAll() {
        this.books = [];
        this.readers = [];
        localStorage.removeItem('libraryData');
    }
}