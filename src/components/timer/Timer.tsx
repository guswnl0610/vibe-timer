import React, {useEffect, useRef} from 'react';
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
    pomodoro: 25, // Default 25 minutes
    shortBreak: 5, // Default 5 minutes
    longBreak: 15, // Default 15 minutes
    sessionsUntilLongBreak: 4, // Default 4 sessions
  },
}) => {
  console.log('Timer 컴포넌트 렌더링, 설정:', defaultSettings);
  console.log('Timer 컴포넌트 렌더링, 설정:222', defaultSettings);

  // defaultSettings 변경을 추적하기 위한 ref
  const settingsRef = useRef(defaultSettings);

  // Convert minutes to seconds for internal use in the timer hook
  const timerSettings = {
    pomodoro: defaultSettings.pomodoro * 60, // Convert minutes to seconds
    shortBreak: defaultSettings.shortBreak * 60,
    longBreak: defaultSettings.longBreak * 60,
    sessionsUntilLongBreak: defaultSettings.sessionsUntilLongBreak || 4,
  };

  const {state, startTimer, pauseTimer, resumeTimer, resetTimer, changeMode, formatTime, updateSettings} =
    useTimer(timerSettings);
  const {shouldPlaySound, currentSessionType, handleSoundComplete} = useNotification();

  // defaultSettings가 변경될 때 타이머 설정 업데이트
  useEffect(() => {
    // 설정이 변경되었는지 확인
    const prevSettings = settingsRef.current;
    const settingsChanged =
      prevSettings.pomodoro !== defaultSettings.pomodoro ||
      prevSettings.shortBreak !== defaultSettings.shortBreak ||
      prevSettings.longBreak !== defaultSettings.longBreak ||
      prevSettings.sessionsUntilLongBreak !== defaultSettings.sessionsUntilLongBreak;

    if (settingsChanged) {
      console.log('Timer: defaultSettings 변경 감지', defaultSettings);

      const updatedSettings = {
        pomodoro: defaultSettings.pomodoro * 60,
        shortBreak: defaultSettings.shortBreak * 60,
        longBreak: defaultSettings.longBreak * 60,
        sessionsUntilLongBreak: defaultSettings.sessionsUntilLongBreak || 4,
      };

      updateSettings(updatedSettings);
      settingsRef.current = defaultSettings;
    }
  }, [defaultSettings, updateSettings]);

  // Total seconds for each mode (for progress bar calculation)
  const totalSeconds = {
    pomodoro: timerSettings.pomodoro,
    shortBreak: timerSettings.shortBreak,
    longBreak: timerSettings.longBreak,
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
