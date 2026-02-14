// Тесты для системы голосования
// Bogdan Matrosov, 2026

const assert = require('node:assert');
const test = require('node:test');

// Копируем класс сюда, чтобы тесты работали без импорта
class VotingSystem {
  constructor() {
    this.polls = [];
    this.users = new Map();
  }

  createPoll(title, options) {
    if (!title || !Array.isArray(options) || options.length < 2) {
      throw new Error('Необходимо ввести название и как минимум 2 варианта');
    }
    const pollId = this.polls.length + 1;
    const poll = {
      id: pollId,
      title,
      options: options.map(text => ({ text, votes: 0 })),
      voters: new Set()
    };
    this.polls.push(poll);
    return pollId;
  }

  addUser(userId, name) {
    if (this.users.has(userId)) {
      throw new Error('Такой пользователь уже есть в БД');
    }
    this.users.set(userId, { name, votedPolls: new Set() });
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
  }
}

// Тесты

test('Проверка создания опроса', () => {
  const vs = new VotingSystem();
  const id = vs.createPoll('Любимый цвет?', ['Красный', 'Синий']);
  assert.equal(id, 1);
  assert.equal(vs.polls.length, 1);
  assert.equal(vs.polls[0].title, 'Любимый цвет?');
  assert.equal(vs.polls[0].options.length, 2);
});

test('Проверка добовления пользователя', () => {
  const vs = new VotingSystem();
  vs.addUser('ivan', 'Иван');
  assert.ok(vs.users.has('ivan'));
  assert.equal(vs.users.get('ivan').name, 'Иван');
  assert.throws(() => vs.addUser('ivan', 'Другой'), /уже есть/);
});

test('Проверка работоспособности голосования', () => {
  const vs = new VotingSystem();
  const pollId = vs.createPoll('Тест', ['A', 'B']);
  vs.addUser('user1', 'Юзер');
  vs.vote(pollId, 'user1', 0);
  assert.equal(vs.polls[0].options[0].votes, 1);
  assert.equal(vs.polls[0].voters.size, 1);
});

test('Проверка запрета повторного голоса от одного и того же юзера', () => {
  const vs = new VotingSystem();
  const pollId = vs.createPoll('Тест', ['A', 'B']);
  vs.addUser('user1', 'Юзер');
  vs.vote(pollId, 'user1', 0);
  assert.throws(() => vs.vote(pollId, 'user1', 1), /уже голосовал/);
});

test('Проверка получения результатов', () => {
  const vs = new VotingSystem();
  const pollId = vs.createPoll('Тест', ['A', 'B']);
  vs.addUser('u1', '1'); vs.vote(pollId, 'u1', 0);
  vs.addUser('u2', '2'); vs.vote(pollId, 'u2', 0);
  vs.addUser('u3', '3'); vs.vote(pollId, 'u3', 1);

  const res = vs.getPollResults(pollId);
  assert.equal(res.totalVotes, 3);
  assert.equal(res.results[0].votes, 2);
  assert.equal(res.results[1].votes, 1);
});

test('Проверка возможности удаления опроса', () => {
  const vs = new VotingSystem();
  const pollId = vs.createPoll('Тест', ['A', 'B']);
  vs.addUser('user1', 'Юзер');
  vs.vote(pollId, 'user1', 0);
  vs.deletePoll(pollId);
  assert.equal(vs.polls.length, 0);
  assert.equal(vs.users.get('user1').votedPolls.size, 0);
});