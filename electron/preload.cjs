// Minimal preload script to debug loading issues
const {contextBridge, ipcRenderer} = require('electron');

// Simple in-memory store for testing
const inMemoryStore = {
  timerSettings: {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4,
  },
};

contextBridge.exposeInMainWorld('api', {
  // IPC functions
  send: (channel, data) => {
    const validChannels = ['message-from-renderer', 'show-notification'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    const validChannels = ['message-from-main'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  // Simple settings API using in-memory storage
  settings: {
    get: key => {
      console.log('Getting setting:', key, inMemoryStore[key]);
      return inMemoryStore[key];
    },
    set: (key, value) => {
      console.log('Setting:', key, value);
      if (key === 'timerSettings') {
        // Make a deep copy to ensure changes are detected
        inMemoryStore.timerSettings = JSON.parse(JSON.stringify(value));
        console.log('Updated timerSettings:', inMemoryStore.timerSettings);
      } else {
        inMemoryStore[key] = value;
      }
      return true;
    },
    getAll: () => {
      console.log('Getting all settings:', inMemoryStore.timerSettings);
      return inMemoryStore.timerSettings;
    },
  },
});
