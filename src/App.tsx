import React, {useState, useEffect} from 'react';
import {Timer} from '@/components/timer/Timer';
import {Settings} from '@/components/settings/Settings';
import {useSettings} from '@/hooks/useSettings';

function App() {
  const {settings, loadSettings, loaded} = useSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [settingsVersion, setSettingsVersion] = useState(0); // 설정 변경 추적을 위한 버전

  // 컴포넌트 마운트 시 설정 로드
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // 설정 페이지에서 타이머로 돌아올 때 설정 다시 로드
  const toggleSettings = () => {
    if (showSettings) {
      // 설정 페이지에서 타이머로 돌아올 때 설정 다시 로드하고 버전 증가
      loadSettings();
      setSettingsVersion(prev => prev + 1);
    }
    setShowSettings(prev => !prev);
  };

  // 타이머에 전달할 설정값 계산
  const getTimerSettings = () => {
    if (!loaded) return undefined;

    console.log('App: 타이머에 전달할 설정', settings);
    return {
      pomodoro: settings.pomodoro,
      shortBreak: settings.shortBreak,
      longBreak: settings.longBreak,
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

      {showSettings ? (
        <Settings />
      ) : (
        <Timer
          key={`timer-${settingsVersion}`} // key를 사용하여 설정 변경 시 컴포넌트 다시 마운트
          defaultSettings={getTimerSettings()}
        />
      )}
    </div>
  );
}

export default App;
