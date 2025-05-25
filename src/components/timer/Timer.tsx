import React from 'react';
import {useTimer} from '@/hooks/useTimer';
import {TimerDisplay} from './TimerDisplay';
import {TimerControls} from './TimerControls';
import {TimerModeSelector} from './TimerModeSelector';
import {SessionCounter} from './SessionCounter';
import {AudioPlayer} from '../AudioPlayer';
import {useNotification} from '@/hooks/useNotification';

interface TimerProps {
  defaultSettings?: {
    pomodoro: number;
    shortBreak: number;
    longBreak: number;
    sessionsUntilLongBreak?: number;
  };
}

export const Timer: React.FC<TimerProps> = ({
  defaultSettings = {
    pomodoro: 25 / 60, // 25초 (25/60분)
    shortBreak: 5 / 60, // 5초 (5/60분)
    longBreak: 15 / 60, // 15초 (15/60분)
    sessionsUntilLongBreak: 4, // 긴 휴식 전까지 4회의 작업 세션
  },
}) => {
  const {state, startTimer, pauseTimer, resumeTimer, resetTimer, changeMode, formatTime} = useTimer(defaultSettings);
  const {shouldPlaySound, currentSessionType, handleSoundComplete} = useNotification();

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

      <SessionCounter
        completedSessions={state.completedSessions}
        sessionsUntilLongBreak={defaultSettings.sessionsUntilLongBreak || 4}
      />

      <TimerDisplay state={state} formatTime={formatTime} totalTime={totalSeconds} />

      <TimerControls
        state={state}
        onStart={startTimer}
        onPause={pauseTimer}
        onResume={resumeTimer}
        onReset={resetTimer}
      />

      {/* 총 완료된 세션 수 표시 */}
      <div className="mt-4 text-sm text-muted-foreground">총 완료한 세션: {state.totalCompletedSessions}</div>

      {/* Audio player for notification sounds */}
      {shouldPlaySound && currentSessionType && (
        <AudioPlayer
          sessionType={currentSessionType}
          shouldPlay={shouldPlaySound}
          onPlayComplete={handleSoundComplete}
        />
      )}
    </div>
  );
};
