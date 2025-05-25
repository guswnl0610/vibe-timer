import React from 'react';
import {Card, CardContent} from '@/components/ui/card';
import {Progress} from '@/components/ui/progress';
import type {TimerState, TimerMode} from '@/hooks/useTimer';

interface TimerDisplayProps {
  state: TimerState;
  formatTime: (seconds: number) => string;
  totalTime: {
    pomodoro: number;
    shortBreak: number;
    longBreak: number;
  };
}

// Helper to get mode display text
const getModeText = (mode: TimerMode): string => {
  switch (mode) {
    case 'pomodoro':
      return '작업 중';
    case 'shortBreak':
      return '짧은 휴식 중';
    case 'longBreak':
      return '긴 휴식 중';
    default:
      return '';
  }
};

export const TimerDisplay: React.FC<TimerDisplayProps> = ({state, formatTime, totalTime}) => {
  // Calculate progress percentage
  const totalSeconds = totalTime[state.mode];
  const elapsedSeconds = totalSeconds - state.timeLeft;
  const progressPercentage = (elapsedSeconds / totalSeconds) * 100;

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-6">
          {/* Session type */}
          <div className="text-xl font-medium text-center">{getModeText(state.mode)}</div>

          {/* Timer display */}
          <div className="text-7xl font-bold">{formatTime(state.timeLeft)}</div>

          {/* Progress bar */}
          <Progress value={progressPercentage} className="w-full h-2" />
        </div>
      </CardContent>
    </Card>
  );
};
