import { create } from 'zustand';

interface SettingsStore {
  audioEnabled: boolean;
  hapticsEnabled: boolean;
  reduceMotion: boolean;

  toggleAudio: () => void;
  toggleHaptics: () => void;
  toggleMotion: () => void;

  resetSave: () => void;
}

interface StoredSettings {
  audioEnabled: boolean;
  hapticsEnabled: boolean;
  reduceMotion: boolean;
}

const SETTINGS_KEY =
  'grand_line_settings';

const readSettings =
  (): StoredSettings => {
    const defaults: StoredSettings =
      {
        audioEnabled: true,
        hapticsEnabled: true,
        reduceMotion: false,
      };

    if (
      typeof localStorage ===
      'undefined'
    ) {
      return defaults;
    }

    try {
      const raw =
        localStorage.getItem(
          SETTINGS_KEY,
        );

      if (!raw) {
        return defaults;
      }

      const parsed =
        JSON.parse(raw);

      return {
        audioEnabled:
          typeof parsed.audioEnabled ===
          'boolean'
            ? parsed.audioEnabled
            : defaults.audioEnabled,

        hapticsEnabled:
          typeof parsed.hapticsEnabled ===
          'boolean'
            ? parsed.hapticsEnabled
            : defaults.hapticsEnabled,

        reduceMotion:
          typeof parsed.reduceMotion ===
          'boolean'
            ? parsed.reduceMotion
            : defaults.reduceMotion,
      };
    } catch {
      return defaults;
    }
  };

const persistSettings = (
  settings: StoredSettings,
): void => {
  if (
    typeof localStorage ===
    'undefined'
  ) {
    return;
  }

  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify(settings),
  );
};

const initial =
  readSettings();

export const useSettingsStore =
  create<SettingsStore>()(
    (set, get) => ({
      ...initial,

      toggleAudio: () => {
        const next =
          !get().audioEnabled;

        set({
          audioEnabled: next,
        });

        persistSettings({
          audioEnabled: next,
          hapticsEnabled:
            get().hapticsEnabled,
          reduceMotion:
            get().reduceMotion,
        });
      },

      toggleHaptics: () => {
        const next =
          !get().hapticsEnabled;

        if (
          next &&
          typeof navigator !==
            'undefined' &&
          'vibrate' in navigator
        ) {
          navigator.vibrate(50);
        }

        set({
          hapticsEnabled: next,
        });

        persistSettings({
          audioEnabled:
            get().audioEnabled,
          hapticsEnabled: next,
          reduceMotion:
            get().reduceMotion,
        });
      },

      toggleMotion: () => {
        const next =
          !get().reduceMotion;

        document.documentElement.style.setProperty(
          '--transition-speed',
          next ? '0s' : '0.2s',
        );

        set({
          reduceMotion: next,
        });

        persistSettings({
          audioEnabled:
            get().audioEnabled,
          hapticsEnabled:
            get().hapticsEnabled,
          reduceMotion: next,
        });
      },

      resetSave: () => {
        if (
          typeof localStorage !==
          'undefined'
        ) {
          localStorage.removeItem(
            'grand_line_v1',
          );
          localStorage.removeItem(
            'grand_line_backup',
          );
        }

        window.location.reload();
      },
    }),
  );