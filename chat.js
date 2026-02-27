class ChatApp {
    constructor() {
      this.chats = [];
      this.loadFromStorage();
      if (this.chats.length === 0) {
        this.addChat('Алексей');
        this.addChat('Марина');
        this.addChat('Дмитрий');
      }
    }
  
    saveToStorage() {
      localStorage.setItem('chatAppData', JSON.stringify(this.chats));
    }
  
    loadFromStorage() {
      const saved = localStorage.getItem('chatAppData');
      if (saved) {
        try {
          this.chats = JSON.parse(saved);
        } catch {
          this.chats = [];
        }
      }
    }
  
    addChat(name) {
      const id = Date.now() + Math.random();
      this.chats.push({
        id,
        name: name.trim(),
        messages: [],
        lastMessage: null,
        lastTime: null
      });
      this.saveToStorage();
      return id;
    }
  
    getAllChats() {
      return [...this.chats];
    }
  
    getChat(id) {
      return this.chats.find(c => c.id === id);
    }
  
    sendMessage(chatId, text, senderId) {
      const chat = this.getChat(chatId);
      if (!chat) throw new Error('Чат не найден');
      const trimmed = text.trim();
      if (!trimmed) return;
  
      const msg = {
        text: trimmed,
        time: Date.now(),
        senderId
      };
  
      chat.messages.push(msg);
      chat.lastMessage = trimmed.length > 40 ? trimmed.substring(0, 37) + '...' : trimmed;
      chat.lastTime = msg.time;
      this.saveToStorage();
    }
  
    clearAll() {
      this.chats = [];
      localStorage.removeItem('chatAppData');
    }
  }