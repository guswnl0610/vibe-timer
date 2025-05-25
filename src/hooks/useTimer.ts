import {useState, useEffect, useRef, useCallback} from 'react';

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

interface TimerSettings {
  pomodoro: number; // minutes
  shortBreak: number; // minutes
  longBreak: number; // minutes
  sessionsUntilLongBreak?: number; // number of pomodoro sessions until long break
}

export interface TimerState {
  mode: TimerMode;
  timeLeft: number; // seconds
  isActive: boolean;
  isPaused: boolean;
  completedSessions: number; // number of completed pomodoro sessions in current cycle
  totalCompletedSessions: number; // total number of completed pomodoro sessions
}

export const useTimer = (settings: TimerSettings) => {
  const sessionsUntilLongBreak = settings.sessionsUntilLongBreak || 4; // Default: 4 sessions

  // Convert minutes to seconds for internal state
  const defaultTimes = {
    pomodoro: settings.pomodoro * 60,
    shortBreak: settings.shortBreak * 60,
    longBreak: settings.longBreak * 60,
  };

  const [state, setState] = useState<TimerState>({
    mode: 'pomodoro',
    timeLeft: defaultTimes.pomodoro,
    isActive: false,
    isPaused: false,
    completedSessions: 0,
    totalCompletedSessions: 0,
  });

  const intervalRef = useRef<number | null>(null);

  // Automatically switch to the next mode when timer completes
  const switchToNextMode = useCallback(() => {
    setState(prevState => {
      if (prevState.mode === 'pomodoro') {
        // Increment completed sessions counter
        const newCompletedSessions = prevState.completedSessions + 1;
        const newTotalCompleted = prevState.totalCompletedSessions + 1;

        // Check if we should switch to long break
        if (newCompletedSessions >= sessionsUntilLongBreak) {
          return {
            ...prevState,
            mode: 'longBreak',
            timeLeft: defaultTimes.longBreak,
            isActive: true,
            isPaused: false,
            completedSessions: newCompletedSessions,
            totalCompletedSessions: newTotalCompleted,
          };
        } else {
          // Switch to short break
          return {
            ...prevState,
            mode: 'shortBreak',
            timeLeft: defaultTimes.shortBreak,
            isActive: true,
            isPaused: false,
            completedSessions: newCompletedSessions,
            totalCompletedSessions: newTotalCompleted,
          };
        }
      } else if (prevState.mode === 'shortBreak') {
        // After short break, switch back to pomodoro
        return {
          ...prevState,
          mode: 'pomodoro',
          timeLeft: defaultTimes.pomodoro,
          isActive: true,
          isPaused: false,
        };
      } else if (prevState.mode === 'longBreak') {
        // After long break, reset completed sessions counter and switch to pomodoro
        return {
          ...prevState,
          mode: 'pomodoro',
          timeLeft: defaultTimes.pomodoro,
          isActive: true,
          isPaused: false,
          completedSessions: 0, // Reset counter after long break
        };
      }

      return prevState;
    });
  }, [defaultTimes, sessionsUntilLongBreak]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Timer tick logic
  useEffect(() => {
    if (state.isActive && !state.isPaused) {
      intervalRef.current = window.setInterval(() => {
        setState(prevState => {
          if (prevState.timeLeft <= 1) {
            // Timer completed
            if (intervalRef.current) clearInterval(intervalRef.current);
            return {
              ...prevState,
              timeLeft: 0,
              isActive: false,
              isPaused: false,
            };
          }
          return {
            ...prevState,
            timeLeft: prevState.timeLeft - 1,
          };
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isActive, state.isPaused]);

  // Watch for timer completion and auto-switch
  useEffect(() => {
    if (state.timeLeft === 0 && !state.isActive && !state.isPaused) {
      // Timer has completed, switch to next mode after a short delay
      const timeoutId = setTimeout(() => {
        switchToNextMode();
      }, 500); // Small delay before switching modes

      return () => clearTimeout(timeoutId);
    }
  }, [state.timeLeft, state.isActive, state.isPaused, switchToNextMode]);

  // Start timer
  const startTimer = () => {
    setState(prevState => ({
      ...prevState,
      isActive: true,
      isPaused: false,
    }));
  };

  // Pause timer
  const pauseTimer = () => {
    setState(prevState => ({
      ...prevState,
      isPaused: true,
    }));
  };

  // Resume timer
  const resumeTimer = () => {
    setState(prevState => ({
      ...prevState,
      isPaused: false,
    }));
  };

  // Reset timer
  const resetTimer = () => {
    setState(prevState => ({
      ...prevState,
      timeLeft: defaultTimes[prevState.mode],
      isActive: false,
      isPaused: false,
    }));
  };

  // Change mode
  const changeMode = (newMode: TimerMode) => {
    setState(prevState => ({
      ...prevState,
      mode: newMode,
      timeLeft: defaultTimes[newMode],
      isActive: false,
      isPaused: false,
    }));
  };

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    state,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    changeMode,
    formatTime,
  };
};
