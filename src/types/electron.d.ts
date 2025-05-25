interface TimerSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  sessionsUntilLongBreak: number;
}

interface ElectronAPI {
  send: (channel: string, data: unknown) => void;
  receive: (channel: string, func: (...args: unknown[]) => void) => void;
  settings: {
    get: <T>(key: string) => T;
    set: <T>(key: string, value: T) => void;
    getAll: () => TimerSettings;
  };
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
