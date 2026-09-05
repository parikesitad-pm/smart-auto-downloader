import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings } from '../types/settings';

interface SettingsState {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  downloadDirectory: 'C:/Downloads/SmartAutoDownloader',
  defaultVideoQuality: 'best',
  defaultAudioFormat: 'mp3_320k',
  maxConcurrentDownloads: 3,
  autoMuxing: true,
  enableNotifications: true,
  openFolderAfterDownload: false,
  rateLimitKbs: 0,
  theme: 'dark',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'smart-auto-downloader-settings',
    }
  )
);
