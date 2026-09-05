import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppEdition } from '../types/version';
import { getAppVersion } from '../services/tauri';

interface VersionState {
  edition: AppEdition;
  version: string;
  commitHash: string;
  isChangelogOpen: boolean;
  isHelpOpen: boolean;
  setEdition: (edition: AppEdition) => void;
  toggleEdition: () => void;
  setVersion: (version: string) => void;
  initVersion: () => Promise<void>;
  setChangelogOpen: (open: boolean) => void;
  setHelpOpen: (open: boolean) => void;
}

const defaultVersion = import.meta.env.VITE_APP_VERSION
  ? `v${import.meta.env.VITE_APP_VERSION}`
  : 'v2.0.0';

export const useVersionStore = create<VersionState>()(
  persist(
    (set) => ({
      edition: 'Community Free',
      version: defaultVersion,
      commitHash: import.meta.env.VITE_GIT_COMMIT_HASH || 'a1c3e4f',
      isChangelogOpen: false,
      isHelpOpen: false,
      setEdition: (edition) => set({ edition }),
      toggleEdition: () =>
        set((state) => ({
          edition:
            state.edition === 'Community Free'
              ? 'Pro Studio'
              : 'Community Free',
        })),
      setVersion: (version) => set({ version }),
      initVersion: async () => {
        const v = await getAppVersion();
        if (v) set({ version: v });
      },
      setChangelogOpen: (open) => set({ isChangelogOpen: open }),
      setHelpOpen: (open) => set({ isHelpOpen: open }),
    }),
    {
      name: 'smart-auto-downloader-version',
      partialize: (state) => ({ edition: state.edition }),
    }
  )
);
