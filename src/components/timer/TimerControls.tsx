import React from 'react';
import {Button} from '@/components/ui/button';
import type {TimerState} from '@/hooks/useTimer';

interface TimerControlsProps {
  state: TimerState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({state, onStart, onPause, onResume, onReset}) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-6">
      {!state.isActive && !state.isPaused && (
        <Button onClick={onStart} size="lg" className="min-w-32">
          시작
        </Button>
      )}

      {state.isActive && !state.isPaused && (
        <Button onClick={onPause} size="lg" variant="outline" className="min-w-32">
          일시정지
        </Button>
      )}

      {state.isPaused && (
        <Button onClick={onResume} size="lg" className="min-w-32">
          계속
        </Button>
      )}

      <Button
        onClick={onReset}
        size="lg"
        variant="secondary"
        className="min-w-32"
        disabled={!state.isActive && !state.isPaused && state.timeLeft === 0}
      >
        초기화
      </Button>
    </div>
  );
};
