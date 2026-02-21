// Expense Tracker — отслеживание доходов и расходов
// Bogdan Matrosov, 2026

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
            } catch (e) {
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
            if (t.type === 'income') income += t.amount;
            else expense += t.amount;
        });

        return {
            income,
            expense,
            balance: income - expense
        };
    }

    clearAll() {
        this.transactions = [];
        localStorage.removeItem('expenseTrackerData');
    }
}