import { create } from 'zustand';

interface SettingsStore {
  audioEnabled: boolean;
  hapticsEnabled: boolean;
  reduceMotion: boolean;
  toggleAudio: () => void;
  toggleHaptics: () => void;
  toggleMotion: () => void;
}

export const useSettingsStore = create()((set) => ({
  audioEnabled: true,
  hapticsEnabled: true,
  reduceMotion: false,
  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
  toggleHaptics: () => {
    set((state) => {
      const newVal = !state.hapticsEnabled;
      if (newVal && navigator.vibrate) navigator.vibrate(50);
      return { hapticsEnabled: newVal };
    });
  },
  toggleMotion: () => {
    set((state) => {
      const newVal = !state.reduceMotion;
      document.documentElement.style.setProperty('--transition-speed', newVal ? '0s' : '0.2s');
      return { reduceMotion: newVal };
    });
  },
}));