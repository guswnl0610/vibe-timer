import React from 'react';

interface SessionCounterProps {
  completedSessions: number;
  sessionsUntilLongBreak: number;
}

export const SessionCounter: React.FC<SessionCounterProps> = ({completedSessions, sessionsUntilLongBreak}) => {
  // Create an array of session indicators
  const sessionIndicators = Array.from({length: sessionsUntilLongBreak}, (_, index) => {
    const isCompleted = index < completedSessions;
    return (
      <div
        key={index}
        className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-primary' : 'bg-muted'}`}
        aria-label={`Session ${index + 1}${isCompleted ? ' completed' : ''}`}
      />
    );
  });

  return <div className="flex justify-center items-center space-x-2 mt-2 mb-4">{sessionIndicators}</div>;
};
