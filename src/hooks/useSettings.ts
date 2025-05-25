import {useState, useEffect} from 'react';

// Use the TimerSettings interface from our declaration file
interface TimerSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  sessionsUntilLongBreak: number;
}

// Default settings if store is not available
const defaultSettings: TimerSettings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsUntilLongBreak: 4,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<TimerSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Check if we're in Electron environment
        if (window.api?.settings) {
          const storedSettings = await window.api.settings.getAll();
          if (storedSettings) {
            setSettings(storedSettings);
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoaded(true);
      }
    };

    loadSettings();
  }, []);

  // Save settings to store
  const saveSettings = async (newSettings: TimerSettings) => {
    try {
      // Update local state
      setSettings(newSettings);

      // Save to electron store if available
      if (window.api?.settings) {
        await window.api.settings.set('timerSettings', newSettings);
      }

      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  };

  return {
    settings,
    saveSettings,
    loaded,
  };
};
