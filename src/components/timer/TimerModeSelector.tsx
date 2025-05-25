import React from 'react';
import {Button} from '@/components/ui/button';
import type {TimerMode} from '@/hooks/useTimer';

interface TimerModeSelectorProps {
  currentMode: TimerMode;
  onModeChange: (mode: TimerMode) => void;
  disabled?: boolean;
}

export const TimerModeSelector: React.FC<TimerModeSelectorProps> = ({currentMode, onModeChange, disabled = false}) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-6">
      <Button
        variant={currentMode === 'pomodoro' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('pomodoro')}
        disabled={disabled}
        className="min-w-28"
      >
        작업
      </Button>
      <Button
        variant={currentMode === 'shortBreak' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('shortBreak')}
        disabled={disabled}
        className="min-w-28"
      >
        짧은 휴식
      </Button>
      <Button
        variant={currentMode === 'longBreak' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('longBreak')}
        disabled={disabled}
        className="min-w-28"
      >
        긴 휴식
      </Button>
    </div>
  );
};
