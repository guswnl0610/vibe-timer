export type SessionType = 'work' | 'shortBreak' | 'longBreak';

export interface TimerSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsUntilLongBreak: number;
}

export interface TimerState {
  currentSession: SessionType;
  isRunning: boolean;
  timeRemaining: number; // in seconds
  completedSessions: number;
}
