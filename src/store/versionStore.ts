import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppEdition } from '../types/version';

interface VersionState {
  edition: AppEdition;
  version: string;
  commitHash: string;
  isChangelogOpen: boolean;
  isHelpOpen: boolean;
  setEdition: (edition: AppEdition) => void;
  toggleEdition: () => void;
  setChangelogOpen: (open: boolean) => void;
  setHelpOpen: (open: boolean) => void;
}

export const useVersionStore = create<VersionState>()(
  persist(
    (set) => ({
      edition: 'Community Free',
      version: 'v1.0.0',
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
      setChangelogOpen: (open) => set({ isChangelogOpen: open }),
      setHelpOpen: (open) => set({ isHelpOpen: open }),
    }),
    {
      name: 'smart-auto-downloader-version',
      partialize: (state) => ({ edition: state.edition }),
    }
  )
);
