import { create } from 'zustand';

interface SettingsStore {
  audioEnabled: boolean;
  hapticsEnabled: boolean;
  reduceMotion: boolean;
  toggleAudio: () => void;
  toggleHaptics: () => void;
  toggleMotion: () => void;
}

export const useSettingsStore = create<SettingsStore>()((set) => ({
  audioEnabled: true,
  hapticsEnabled: true,
  reduceMotion: false,

  toggleAudio: () => {
    set((state) => ({
      audioEnabled: !state.audioEnabled,
    }));
  },

  toggleHaptics: () => {
    set((state) => {
      const newValue = !state.hapticsEnabled;

      if (newValue && navigator.vibrate) {
        navigator.vibrate(50);
      }

      return {
        hapticsEnabled: newValue,
      };
    });
  },

  toggleMotion: () => {
    set((state) => {
      const newValue = !state.reduceMotion;

      document.documentElement.style.setProperty(
        '--transition-speed',
        newValue ? '0s' : '0.2s',
      );

      return {
        reduceMotion: newValue,
      };
    });
  },
}));