import {useCallback, useEffect, useState} from 'react';
import type {SessionType} from '../types';

// Notification content based on session type
const getNotificationContent = (sessionType: SessionType): {title: string; body: string} => {
  switch (sessionType) {
    case 'work':
      return {
        title: '작업 세션 완료!',
        body: '잘 하셨습니다! 이제 휴식 시간입니다.',
      };
    case 'shortBreak':
      return {
        title: '짧은 휴식 완료!',
        body: '다시 작업을 시작할 시간입니다.',
      };
    case 'longBreak':
      return {
        title: '긴 휴식 완료!',
        body: '새로운 포모도로 사이클을 시작할 시간입니다.',
      };
    default:
      return {
        title: '타이머 완료',
        body: '다음 세션으로 이동합니다.',
      };
  }
};

export function useNotification() {
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');
  const [shouldPlaySound, setShouldPlaySound] = useState(false);
  const [currentSessionType, setCurrentSessionType] = useState<SessionType | null>(null);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);

      if (Notification.permission === 'default') {
        Notification.requestPermission().then(perm => {
          setPermission(perm);
        });
      }
    }
  }, []);

  // Function to trigger a notification
  const notify = useCallback(
    (sessionType: SessionType) => {
      const {title, body} = getNotificationContent(sessionType);

      // Play sound
      setCurrentSessionType(sessionType);
      setShouldPlaySound(true);

      // Show browser notification if permission granted
      if ('Notification' in window && permission === 'granted') {
        new Notification(title, {body});
      }

      // Show Electron notification if available
      if (window.api) {
        window.api.send('show-notification', {title, body});
      }
    },
    [permission]
  );

  // Reset sound state after playing
  const handleSoundComplete = useCallback(() => {
    setShouldPlaySound(false);
  }, []);

  return {
    notify,
    shouldPlaySound,
    currentSessionType,
    handleSoundComplete,
    notificationsSupported: 'Notification' in window,
    notificationsEnabled: permission === 'granted',
  };
}
