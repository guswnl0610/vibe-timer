import React, {useState} from 'react';
import {Timer} from '@/components/timer/Timer';
import {Settings} from '@/components/settings/Settings';
import {useSettings} from '@/hooks/useSettings';

function App() {
  const {settings, loaded} = useSettings();
  const [showSettings, setShowSettings] = useState(false);

  const toggleSettings = () => {
    setShowSettings(prev => !prev);
  };

  // Convert minutes to minute fractions for development/testing
  // In a real app, you'd use the actual minutes
  const getTimerSettings = () => {
    if (!loaded) return undefined;

    return {
      pomodoro: settings.pomodoro / 60, // Convert to minute fractions for testing
      shortBreak: settings.shortBreak / 60,
      longBreak: settings.longBreak / 60,
      sessionsUntilLongBreak: settings.sessionsUntilLongBreak,
    };
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-svh p-4">
      <h1 className="text-4xl font-bold mb-8">Vibe Timer</h1>

      <button
        onClick={toggleSettings}
        className="mb-4 py-2 px-4 text-sm border rounded-md hover:bg-slate-100 transition-colors"
      >
        {showSettings ? '타이머로 돌아가기' : '설정'}
      </button>

      {showSettings ? <Settings /> : <Timer defaultSettings={getTimerSettings()} />}
    </div>
  );
}

export default App;
