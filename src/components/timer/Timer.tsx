import React from 'react';
import {useTimer} from '@/hooks/useTimer';
import {TimerDisplay} from './TimerDisplay';
import {TimerControls} from './TimerControls';
import {TimerModeSelector} from './TimerModeSelector';

interface TimerProps {
  defaultSettings?: {
    pomodoro: number;
    shortBreak: number;
    longBreak: number;
  };
}

export const Timer: React.FC<TimerProps> = ({
  defaultSettings = {
    pomodoro: 25, // 25분
    shortBreak: 5, // 5분
    longBreak: 15, // 15분
  },
}) => {
  const {state, startTimer, pauseTimer, resumeTimer, resetTimer, changeMode, formatTime} = useTimer(defaultSettings);

  // Total seconds for each mode (for progress bar calculation)
  const totalSeconds = {
    pomodoro: defaultSettings.pomodoro * 60,
    shortBreak: defaultSettings.shortBreak * 60,
    longBreak: defaultSettings.longBreak * 60,
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <TimerModeSelector
        currentMode={state.mode}
        onModeChange={changeMode}
        disabled={state.isActive && !state.isPaused}
      />

      <TimerDisplay state={state} formatTime={formatTime} totalTime={totalSeconds} />

      <TimerControls
        state={state}
        onStart={startTimer}
        onPause={pauseTimer}
        onResume={resumeTimer}
        onReset={resetTimer}
      />
    </div>
  );
};
