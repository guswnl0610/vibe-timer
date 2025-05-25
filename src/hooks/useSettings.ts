import {useState, useEffect, useCallback} from 'react';

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

  // Load settings - memoized to prevent recreation
  const loadSettings = useCallback(async () => {
    try {
      // Check if we're in Electron environment
      if (window.api?.settings) {
        console.log('Attempting to load settings from store');
        const storedSettings = await window.api.settings.getAll();
        console.log('Loaded settings:', storedSettings);

        if (storedSettings) {
          setSettings(storedSettings);
          console.log('Settings updated in state');
        }
      } else {
        console.log('API not available, using default settings');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Save settings to store
  const saveSettings = async (newSettings: TimerSettings) => {
    try {
      console.log('Saving settings:', newSettings);

      // Save to electron store if available
      if (window.api?.settings) {
        const result = await window.api.settings.set('timerSettings', newSettings);
        console.log('Settings saved to store, result:', result);
      } else {
        console.log("API not available, can't save settings");
        return false;
      }

      // Update local state
      setSettings(newSettings);
      console.log('Settings updated in state');

      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  };

  return {
    settings,
    saveSettings,
    loadSettings, // Expose loadSettings so components can refresh settings
    loaded,
  };
};
