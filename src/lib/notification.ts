// Notification utility functions
import {SessionType} from '../types';

// Audio instances for different notification sounds
let workEndSound: HTMLAudioElement;
let shortBreakEndSound: HTMLAudioElement;
let longBreakEndSound: HTMLAudioElement;

// Initialize audio elements when in browser environment
const initSounds = () => {
  if (typeof window !== 'undefined') {
    workEndSound = new Audio('/sounds/work-end.mp3');
    shortBreakEndSound = new Audio('/sounds/short-break-end.mp3');
    longBreakEndSound = new Audio('/sounds/long-break-end.mp3');
  }
};

// Get notification title and body based on session type
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

// Play notification sound based on session type
const playNotificationSound = (sessionType: SessionType): void => {
  switch (sessionType) {
    case 'work':
      workEndSound?.play().catch(err => console.error('Sound play error:', err));
      break;
    case 'shortBreak':
      shortBreakEndSound?.play().catch(err => console.error('Sound play error:', err));
      break;
    case 'longBreak':
      longBreakEndSound?.play().catch(err => console.error('Sound play error:', err));
      break;
  }
};

// Show desktop notification
const showNotification = (sessionType: SessionType): void => {
  const {title, body} = getNotificationContent(sessionType);

  // Play notification sound
  playNotificationSound(sessionType);

  // Show desktop notification if supported
  if ('Notification' in window) {
    // Check if we need permission and if we can request it
    if (Notification.permission === 'granted') {
      new Notification(title, {body});
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, {body});
        }
      });
    }
  }

  // For Electron, use the window.api (defined in preload.js)
  if (window.api) {
    window.api.send('show-notification', {title, body});
  }
};

// Initialize sounds on module load
initSounds();

export {showNotification};
