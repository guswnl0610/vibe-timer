const Store = require('electron-store');

const store = new Store({
  defaults: {
    timerSettings: {
      pomodoro: 25, // minutes
      shortBreak: 5, // minutes
      longBreak: 15, // minutes
      sessionsUntilLongBreak: 4,
    },
  },
});

module.exports = store;
