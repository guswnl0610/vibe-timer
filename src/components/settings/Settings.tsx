import React, {useState, useEffect} from 'react';
import {useSettings} from '@/hooks/useSettings';

export const Settings: React.FC = () => {
  const {settings, saveSettings, loaded} = useSettings();

  const [formValues, setFormValues] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4,
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (loaded && settings) {
      setFormValues(settings);
    }
  }, [settings, loaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    let numValue = parseInt(value, 10);

    // Ensure the value is a positive number and within reasonable limits
    if (isNaN(numValue) || numValue < 1) {
      numValue = 1;
    } else if (name === 'pomodoro' && numValue > 60) {
      numValue = 60; // Max 60 minutes for work
    } else if ((name === 'shortBreak' || name === 'longBreak') && numValue > 30) {
      numValue = 30; // Max 30 minutes for breaks
    } else if (name === 'sessionsUntilLongBreak' && numValue > 10) {
      numValue = 10; // Max 10 sessions
    }

    setFormValues(prev => ({
      ...prev,
      [name]: numValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(formValues);
    // You could add a success notification here
  };

  if (!loaded) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">타이머 설정</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="pomodoro" className="block text-sm font-medium mb-1">
              작업 시간 (분)
            </label>
            <input
              type="number"
              id="pomodoro"
              name="pomodoro"
              value={formValues.pomodoro}
              onChange={handleChange}
              min="1"
              max="60"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label htmlFor="shortBreak" className="block text-sm font-medium mb-1">
              짧은 휴식 시간 (분)
            </label>
            <input
              type="number"
              id="shortBreak"
              name="shortBreak"
              value={formValues.shortBreak}
              onChange={handleChange}
              min="1"
              max="30"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label htmlFor="longBreak" className="block text-sm font-medium mb-1">
              긴 휴식 시간 (분)
            </label>
            <input
              type="number"
              id="longBreak"
              name="longBreak"
              value={formValues.longBreak}
              onChange={handleChange}
              min="1"
              max="30"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label htmlFor="sessionsUntilLongBreak" className="block text-sm font-medium mb-1">
              긴 휴식 전 세션 수
            </label>
            <input
              type="number"
              id="sessionsUntilLongBreak"
              name="sessionsUntilLongBreak"
              value={formValues.sessionsUntilLongBreak}
              onChange={handleChange}
              min="1"
              max="10"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          설정 저장
        </button>
      </form>
    </div>
  );
};
