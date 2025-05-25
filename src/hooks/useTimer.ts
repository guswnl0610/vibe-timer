import {useState, useEffect, useRef} from 'react';

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

interface TimerSettings {
  pomodoro: number; // minutes
  shortBreak: number; // minutes
  longBreak: number; // minutes
}

export interface TimerState {
  mode: TimerMode;
  timeLeft: number; // seconds
  isActive: boolean;
  isPaused: boolean;
}

export const useTimer = (settings: TimerSettings) => {
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
  });

  const intervalRef = useRef<number | null>(null);

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
    setState({
      mode: newMode,
      timeLeft: defaultTimes[newMode],
      isActive: false,
      isPaused: false,
    });
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
