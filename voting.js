// Система голосования с сохранением в localStorage
// Bogdan Matrosov, 2026

class VotingSystem {
  constructor() {
    this.polls = [];
    this.users = new Map();
    this.loadFromStorage(); // сразу загружаем данные из localStorage
  }

  // Сохраняем всё в localStorage
  saveToStorage() {
    const data = {
      polls: this.polls,
      users: Array.from(this.users.entries()).map(([id, user]) => ({
        id,
        name: user.name,
        votedPolls: Array.from(user.votedPolls)
      }))
    };
    localStorage.setItem('votingSystemData', JSON.stringify(data));
  }

  // Загружаем данные из localStorage
  loadFromStorage() {
    const saved = localStorage.getItem('votingSystemData');
    if (!saved) return;

    try {
      const data = JSON.parse(saved);

      // Восстанавливаем опросы
      this.polls = data.polls.map(poll => ({
        ...poll,
        voters: new Set(poll.voters || [])
      }));

      // Восстанавливаем пользователей
      data.users.forEach(u => {
        this.users.set(u.id, {
          name: u.name,
          votedPolls: new Set(u.votedPolls)
        });
      });
    } catch (e) {
      console.error('Ошибка загрузки из localStorage:', e);
      localStorage.removeItem('votingSystemData'); // чистим битые данные
    }
  }

  createPoll(title, options) {
    if (!title || !Array.isArray(options) || options.length < 2) {
      throw new Error('Нужно название и минимум 2 варианта');
    }

    const pollId = this.polls.length + 1;
    const poll = {
      id: pollId,
      title,
      options: options.map(text => ({ text, votes: 0 })),
      voters: new Set()
    };

    this.polls.push(poll);
    this.saveToStorage(); // сохраняем сразу
    return pollId;
  }

  addUser(userId, name) {
    if (this.users.has(userId)) {
      throw new Error('Такой пользователь уже есть');
    }
    this.users.set(userId, { name, votedPolls: new Set() });
    this.saveToStorage();
  }

  vote(pollId, userId, optionIndex) {
    const poll = this.polls.find(p => p.id === pollId);
    if (!poll) throw new Error('Опрос не найден');

    const user = this.users.get(userId);
    if (!user) throw new Error('Пользователь не найден');

    if (user.votedPolls.has(pollId)) {
      throw new Error('Ты уже голосовал в этом опросе');
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      throw new Error('Такого варианта нет');
    }

    poll.voters.add(userId);
    user.votedPolls.add(pollId);
    poll.options[optionIndex].votes++;

    this.saveToStorage(); // сохраняем после голоса
  }

  getPollResults(pollId) {
    const poll = this.polls.find(p => p.id === pollId);
    if (!poll) return null;

    return {
      title: poll.title,
      results: poll.options.map(o => ({ text: o.text, votes: o.votes })),
      totalVotes: poll.voters.size
    };
  }

  deletePoll(pollId) {
    const index = this.polls.findIndex(p => p.id === pollId);
    if (index === -1) throw new Error('Опрос не найден');

    this.polls.splice(index, 1);
    this.users.forEach(user => user.votedPolls.delete(pollId));

    this.saveToStorage(); // сохраняем после удаления
  }

  // Метод для очистки всех данных (на всякий случай)
  clearAll() {
    this.polls = [];
    this.users.clear();
    localStorage.removeItem('votingSystemData');
  }
}