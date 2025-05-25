import {useEffect, useRef} from 'react';
import type {SessionType} from '../types';

interface AudioPlayerProps {
  sessionType: SessionType;
  shouldPlay: boolean;
  onPlayComplete?: () => void;
}

/**
 * A hidden audio player component for playing notification sounds
 */
export function AudioPlayer({sessionType, shouldPlay, onPlayComplete}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Set the source based on session type
  useEffect(() => {
    if (audioRef.current) {
      // Create audio context for generating sounds
      // Using type assertion since the polyfill might not be in the type definitions
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Set different frequencies for different session types
      switch (sessionType) {
        case 'work':
          oscillator.frequency.value = 800; // Higher pitch for work end
          break;
        case 'shortBreak':
          oscillator.frequency.value = 600; // Medium pitch for short break
          break;
        case 'longBreak':
          oscillator.frequency.value = 400; // Lower pitch for long break
          break;
      }

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Play the sound if needed
      if (shouldPlay) {
        oscillator.start(0);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1);

        // Stop after 1 second
        setTimeout(() => {
          oscillator.stop();
          if (onPlayComplete) onPlayComplete();
        }, 1000);
      }

      // Cleanup
      return () => {
        if (ctx.state !== 'closed') {
          oscillator.stop();
        }
      };
    }
  }, [sessionType, shouldPlay, onPlayComplete]);

  return null; // No visible component
}
