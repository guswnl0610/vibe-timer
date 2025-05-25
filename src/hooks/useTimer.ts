import {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {useNotification} from './useNotification';
import type {SessionType} from '../types';

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

interface TimerSettings {
  pomodoro: number; // seconds
  shortBreak: number; // seconds
  longBreak: number; // seconds
  sessionsUntilLongBreak?: number; // number of pomodoro sessions until long break
}

export interface TimerState {
  mode: TimerMode;
  timeLeft: number; // seconds
  isActive: boolean;
  isPaused: boolean;
  completedSessions: number; // number of completed pomodoro sessions in current cycle
  totalCompletedSessions: number; // total number of completed pomodoro sessions
}

// Map TimerMode to SessionType for notifications
const mapModeToSessionType = (mode: TimerMode): SessionType => {
  switch (mode) {
    case 'pomodoro':
      return 'work';
    case 'shortBreak':
      return 'shortBreak';
    case 'longBreak':
      return 'longBreak';
  }
};

export const useTimer = (initialSettings: TimerSettings) => {
  // 설정 상태를 내부 상태로 관리하여 업데이트 가능하게 함
  const [settings, setSettings] = useState(initialSettings);
  const sessionsUntilLongBreak = settings.sessionsUntilLongBreak || 4; // Default: 4 sessions

  // Initialize notification system
  const {notify} = useNotification();

  // Use the provided seconds directly - memoize to prevent recreation on each render
  const defaultTimes = useMemo(
    () => ({
      pomodoro: settings.pomodoro,
      shortBreak: settings.shortBreak,
      longBreak: settings.longBreak,
    }),
    [settings.pomodoro, settings.shortBreak, settings.longBreak]
  );

  const [state, setState] = useState<TimerState>({
    mode: 'pomodoro',
    timeLeft: defaultTimes.pomodoro,
    isActive: false,
    isPaused: false,
    completedSessions: 0,
    totalCompletedSessions: 0,
  });

  // 타이머 ID 관리를 위한 refs
  const intervalRef = useRef<number | null>(null);
  const modeChangeTimeoutRef = useRef<number | null>(null);
  const hasNotifiedRef = useRef<boolean>(false);

  // 설정 업데이트 함수 - 타이머 설정이 변경되었을 때 호출됨
  const updateSettings = useCallback(
    (newSettings: TimerSettings) => {
      console.log('타이머 설정 업데이트:', newSettings);

      // 내부 설정 상태 업데이트
      setSettings(newSettings);

      // 현재 모드에 따라 남은 시간도 새로운 설정에 맞게 업데이트
      // 단, 타이머가 실행 중이 아닐 때만 업데이트
      if (!state.isActive) {
        setState(prev => ({
          ...prev,
          timeLeft: newSettings[prev.mode],
          // 설정이 변경되면 완료된 세션 카운터를 초기화 (선택적)
          // completedSessions: 0
        }));
      }
    },
    [state.isActive]
  );

  // 초기 설정이 변경되면 내부 설정 상태도 업데이트
  useEffect(() => {
    setSettings(initialSettings);
  }, [
    initialSettings.pomodoro,
    initialSettings.shortBreak,
    initialSettings.longBreak,
    initialSettings.sessionsUntilLongBreak,
  ]);

  // This effect updates the timer state when settings change
  useEffect(() => {
    if (!state.isActive) {
      setState(prev => ({
        ...prev,
        timeLeft: defaultTimes[prev.mode],
      }));
    }
  }, [defaultTimes, state.isActive]);

  // 다음 상태 계산 함수 - setState 내부에서 사용하기 위해 추출
  const calculateNextState = (prevState: TimerState): TimerState => {
    if (prevState.mode === 'pomodoro') {
      // 작업 모드가 끝났으면 세션 카운터 증가
      const newCompletedSessions = prevState.completedSessions + 1;
      const newTotalCompleted = prevState.totalCompletedSessions + 1;

      console.log(`⚡ 완료된 세션: ${newCompletedSessions}/${sessionsUntilLongBreak}`);

      // 설정된 세션 수에 도달했으면 긴 휴식으로 전환
      if (newCompletedSessions >= sessionsUntilLongBreak) {
        console.log('⚡ 긴 휴식으로 전환');
        return {
          ...prevState,
          mode: 'longBreak' as TimerMode,
          timeLeft: defaultTimes.longBreak,
          isActive: true,
          isPaused: false,
          completedSessions: newCompletedSessions,
          totalCompletedSessions: newTotalCompleted,
        };
      } else {
        // 그렇지 않으면 짧은 휴식으로 전환
        console.log('⚡ 짧은 휴식으로 전환');
        return {
          ...prevState,
          mode: 'shortBreak' as TimerMode,
          timeLeft: defaultTimes.shortBreak,
          isActive: true,
          isPaused: false,
          completedSessions: newCompletedSessions,
          totalCompletedSessions: newTotalCompleted,
        };
      }
    } else if (prevState.mode === 'shortBreak') {
      // 짧은 휴식이 끝났으면 다시 작업 모드로
      console.log('⚡ 짧은 휴식 후 작업으로 전환');
      return {
        ...prevState,
        mode: 'pomodoro' as TimerMode,
        timeLeft: defaultTimes.pomodoro,
        isActive: true,
        isPaused: false,
      };
    } else if (prevState.mode === 'longBreak') {
      // 긴 휴식이 끝났으면 세션 카운터 초기화하고 작업 모드로
      console.log('⚡ 긴 휴식 후 작업으로 전환, 세션 카운터 초기화');
      return {
        ...prevState,
        mode: 'pomodoro' as TimerMode,
        timeLeft: defaultTimes.pomodoro,
        isActive: true,
        isPaused: false,
        completedSessions: 0, // 세션 카운터 초기화
      };
    }

    return prevState;
  };

  // 모든 타이머 및 timeout 정리 함수
  const clearAllTimers = () => {
    // 진행 중인 인터벌 타이머 정리
    if (intervalRef.current) {
      console.log('인터벌 타이머 정리');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 모드 전환 타이머 정리
    if (modeChangeTimeoutRef.current) {
      console.log('모드 전환 타이머 정리');
      clearTimeout(modeChangeTimeoutRef.current);
      modeChangeTimeoutRef.current = null;
    }
  };

  // 컴포넌트 언마운트 시 모든 타이머 정리
  useEffect(() => {
    return clearAllTimers;
  }, []);

  // 타이머 완료 후 다음 세션으로 전환하는 함수
  const handleTimerComplete = useCallback(
    (prevMode: TimerMode) => {
      console.log('⏰ 타이머 완료 처리 - 모드:', prevMode);

      // 알림 표시
      if (!hasNotifiedRef.current) {
        notify(mapModeToSessionType(prevMode));
        hasNotifiedRef.current = true;
      }

      // 모드 전환을 위한 타이머 설정 (기존 타이머가 있으면 정리)
      if (modeChangeTimeoutRef.current) {
        clearTimeout(modeChangeTimeoutRef.current);
      }

      // 잠시 후 다음 모드로 전환
      modeChangeTimeoutRef.current = window.setTimeout(() => {
        console.log('⚡ 다음 모드로 전환 실행');
        setState(prevState => calculateNextState(prevState));
        modeChangeTimeoutRef.current = null;
      }, 1500);
    },
    [notify, defaultTimes.pomodoro, defaultTimes.shortBreak, defaultTimes.longBreak, sessionsUntilLongBreak]
  );

  // Timer tick logic - 단일 useEffect로 통합
  useEffect(() => {
    // 타이머가 활성화된 경우에만 인터벌 설정
    if (state.isActive && !state.isPaused) {
      console.log('타이머 실행 중:', state.mode, state.timeLeft);

      // 기존 인터벌이 있으면 정리
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // 새 인터벌 설정
      intervalRef.current = window.setInterval(() => {
        setState(prevState => {
          // 타이머 종료 조건
          if (prevState.timeLeft <= 1) {
            console.log('⏰ 타이머 종료됨:', prevState.mode);

            // 인터벌 정리
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }

            // 타이머 완료 처리 함수 호출
            handleTimerComplete(prevState.mode);

            // 타이머 상태 업데이트 (비활성화)
            return {
              ...prevState,
              timeLeft: 0,
              isActive: false,
              isPaused: false,
            };
          }

          // 타이머 진행 중 - 1초씩 감소
          return {
            ...prevState,
            timeLeft: prevState.timeLeft - 1,
          };
        });
      }, 1000);
    } else if (intervalRef.current) {
      // 타이머가 비활성화되면 인터벌 정리
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 클린업 함수
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isActive, state.isPaused, handleTimerComplete]);

  // 수동으로 다음 모드로 전환하는 함수
  const switchToNextMode = useCallback(() => {
    console.log('수동으로 다음 모드 전환');

    // 모든 타이머 정리
    clearAllTimers();

    // 다음 모드로 전환
    setState(prevState => calculateNextState(prevState));

    // 알림 플래그 초기화
    hasNotifiedRef.current = false;
  }, []);

  // Start timer
  const startTimer = () => {
    setState(prevState => ({
      ...prevState,
      isActive: true,
      isPaused: false,
    }));
  };

  // Pause timer
  const pauseTimer = () => {
    setState(prevState => ({
      ...prevState,
      isPaused: true,
    }));
  };

  // Resume timer
  const resumeTimer = () => {
    setState(prevState => ({
      ...prevState,
      isPaused: false,
    }));
  };

  // Reset timer
  const resetTimer = () => {
    // 모든 타이머 정리
    clearAllTimers();

    setState(prevState => ({
      ...prevState,
      timeLeft: defaultTimes[prevState.mode],
      isActive: false,
      isPaused: false,
    }));

    hasNotifiedRef.current = false;
  };

  // Change mode
  const changeMode = (newMode: TimerMode) => {
    // 모든 타이머 정리
    clearAllTimers();

    setState(prevState => ({
      ...prevState,
      mode: newMode,
      timeLeft: defaultTimes[newMode],
      isActive: false,
      isPaused: false,
    }));

    hasNotifiedRef.current = false;
  };

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    state,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    changeMode,
    formatTime,
    updateSettings,
    switchToNextMode,
  };
};
