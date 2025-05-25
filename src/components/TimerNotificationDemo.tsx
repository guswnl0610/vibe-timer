import {useState} from 'react';
import {useNotification} from '../hooks/useNotification';
import {AudioPlayer} from './AudioPlayer';
import type {SessionType} from '../types';

/**
 * A demo component to show how the notification system works
 */
export function TimerNotificationDemo() {
  const [selectedType, setSelectedType] = useState<SessionType>('work');
  const {
    notify,
    shouldPlaySound,
    currentSessionType,
    handleSoundComplete,
    notificationsSupported,
    notificationsEnabled,
  } = useNotification();

  const handleNotify = () => {
    notify(selectedType);
  };

  return (
    <div className="p-4 border rounded-lg bg-slate-50 max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">알림 시스템 테스트</h2>

      {!notificationsSupported && (
        <div className="bg-yellow-100 p-2 rounded mb-4">이 브라우저는 알림을 지원하지 않습니다.</div>
      )}

      {notificationsSupported && !notificationsEnabled && (
        <div className="bg-yellow-100 p-2 rounded mb-4">
          알림 권한이 필요합니다. 브라우저 설정에서 알림을 허용해주세요.
        </div>
      )}

      <div className="mb-4">
        <label className="block mb-2 font-medium">세션 유형 선택:</label>
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value as SessionType)}
          className="w-full p-2 border rounded"
        >
          <option value="work">작업 세션</option>
          <option value="shortBreak">짧은 휴식</option>
          <option value="longBreak">긴 휴식</option>
        </select>
      </div>

      <button onClick={handleNotify} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        알림 테스트
      </button>

      {/* Hidden audio player component for sound */}
      {shouldPlaySound && currentSessionType && (
        <AudioPlayer
          sessionType={currentSessionType}
          shouldPlay={shouldPlaySound}
          onPlayComplete={handleSoundComplete}
        />
      )}
    </div>
  );
}
