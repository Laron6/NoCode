// Тесты для Expense Tracker
// Bogdan Matrosov, 2026

const assert = require('node:assert');
const test = require('node:test');

// Фейковый localStorage))
global.localStorage = {
    data: {},
    getItem(key) { return this.data[key] || null; },
    setItem(key, value) { this.data[key] = value; },
    removeItem(key) { delete this.data[key]; },
    clear() { this.data = {}; }
};

class ExpenseTracker {
    constructor() {
        this.transactions = [];
        this.loadFromStorage();
    }

    saveToStorage() {
        localStorage.setItem('expenseTrackerData', JSON.stringify(this.transactions));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('expenseTrackerData');
        if (saved) {
            try {
                this.transactions = JSON.parse(saved);
            } catch {
                localStorage.removeItem('expenseTrackerData');
            }
        }
    }

    addTransaction(amount, description = '', type = 'expense') {
        if (typeof amount !== 'number' || amount <= 0) {
            throw new Error('Сумма должна быть положительным числом');
        }
        if (!['income', 'expense'].includes(type)) {
            throw new Error('Тип может быть только "income" или "expense"');
        }

        const id = Date.now();
        const transaction = {
            id,
            amount: Number(amount.toFixed(2)),
            description: description.trim(),
            type,
            createdAt: new Date().toISOString()
        };

        this.transactions.push(transaction);
        this.saveToStorage();
        return id;
    }

    deleteTransaction(id) {
        const index = this.transactions.findIndex(t => t.id === id);
        if (index === -1) {
            throw new Error('Транзакция не найдена');
        }
        this.transactions.splice(index, 1);
        this.saveToStorage();
    }

    getAllTransactions() {
        return [...this.transactions];
    }

getStats() {
    let income = 0;
    let expense = 0;

    this.transactions.forEach(t => {
        if (t.type === 'income') {
            income += Number(t.amount.toFixed(2));
        } else {
            expense += Number(t.amount.toFixed(2));
        }
    });

    return {
        income: Number(income.toFixed(2)),
        expense: Number(expense.toFixed(2)),
        balance: Number((income - expense).toFixed(2))
    };
}

    clearAll() {
        this.transactions = [];
        localStorage.removeItem('expenseTrackerData');
    }
}

test('1. Добавление нескольких транзакций и проверка длины массива и сохранения свойств', () => {
    const tracker = new ExpenseTracker();
    tracker.clearAll();

    tracker.addTransaction(4500.75, 'Зарплата январь', 'income');
    tracker.addTransaction(320, 'Кофе', 'expense');
    tracker.addTransaction(1800, 'Подарок', 'expense');

    const items = tracker.getAllTransactions();

    assert.equal(items.length, 3, 'В массиве должно быть ровно 3 элемента');
    assert.equal(items[0].amount, 4500.75, 'Сумма первой транзакции должна сохраниться точно');
    assert.equal(items[1].type, 'expense', 'Тип второй транзакции должен быть expense');
    assert.equal(items[2].description, 'Подарок', 'Описание третьей транзакции сохраняется');
    assert.ok(items.every(t => typeof t.id === 'number'), 'Каждая транзакция должна иметь числовой id');
});

test('2. Удаление транзакции из середины массива и проверка порядка и количества', () => {
    const tracker = new ExpenseTracker();
    tracker.clearAll();

    const id1 = tracker.addTransaction(10000, 'Аванс', 'income');
    const id2 = tracker.addTransaction(450, 'Обед', 'expense');
    const id3 = tracker.addTransaction(1200, 'Такси', 'expense');

    tracker.deleteTransaction(id2);

    const items = tracker.getAllTransactions();

    assert.equal(items.length, 2, 'После удаления одной записи должно остаться 2');
    assert.equal(items[0].id, id1, 'Первая запись осталась на месте');
    assert.equal(items[1].id, id3, 'Третья запись сдвинулась на второе место');
    assert.equal(items[1].description, 'Такси', 'Описание последней записи не изменилось');
});

test('3. Расчёт статистики при разных типах транзакций и дробных суммах', () => {
    const tracker = new ExpenseTracker();
    tracker.clearAll();

    tracker.addTransaction(12450.60, 'Зарплата', 'income');
    tracker.addTransaction(4789.30, 'Аренда', 'expense');
    tracker.addTransaction(249.99, 'Подписка', 'expense');
    tracker.addTransaction(3500, 'Фриланс', 'income');

    const stats = tracker.getStats();

    assert.equal(stats.income, 15950.60, 'Сумма доходов должна быть точной (с копейками)');
    assert.equal(stats.expense, 5039.29, 'Сумма расходов должна быть точной');
    assert.equal(stats.balance, 10911.31, 'Баланс доыжен рассчитываться правильно');
});

test('4. При пустом состоянии статистика должна быть нылевой, массив пустой', () => {
    const tracker = new ExpenseTracker();
    tracker.clearAll();

    const items = tracker.getAllTransactions();
    const stats = tracker.getStats();

    assert.equal(items.length, 0, 'После clearAll массив транзакций должен быть пустым');
    assert.equal(stats.income, 0, 'Доходы = 0 в пустом состоянии');
    assert.equal(stats.expense, 0, 'Расходы = 0 в пустом состоянии');
    assert.equal(stats.balance, 0, 'Баланс = 0 в пустом состоянии');
});

test('5. Добавление, далее сохранение в localStorage, далее перезагрузка (имитация) = данные сохраняются', () => {
    const tracker1 = new ExpenseTracker();
    tracker1.clearAll();

    tracker1.addTransaction(8000, 'Март зарплата', 'income');
    tracker1.addTransaction(1350, 'Коммуналка', 'expense');

    // Имитируем перезапуск приложения
    const tracker2 = new ExpenseTracker();

    const items = tracker2.getAllTransactions();

    assert.equal(items.length, 2, 'После "перезагрузки" должно восстановиться 2 записи');
    assert.equal(items[0].amount, 8000, 'Сумма первой записи сохранилась');
    assert.equal(items[1].description, 'Коммуналка', 'Описание второй записи сохранилось');
});

test('6. Попытка удалить несуществующую запись и некорректные суммы при добавлении', () => {
    const tracker = new ExpenseTracker();
    tracker.clearAll();

    assert.throws(
        () => tracker.addTransaction(-500, 'Штраф', 'expense'),
        /положительным/,
        'Должна быть ошибка при отрицательной сумме'
    );

    assert.throws(
        () => tracker.addTransaction(1000, 'Тест', 'gift'),
        /"income" или "expense"/,
        'Должна быть ошибка при неверном типе'
    );

    const id = tracker.addTransaction(500, 'Тестовая');
    tracker.deleteTransaction(id);

    assert.throws(
        () => tracker.deleteTransaction(id),
        /не найдена/,
        'Повторное удаление уже удалённой записи = ошибка'
    );
});