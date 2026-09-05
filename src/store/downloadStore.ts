import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DownloadItem, DownloadProgress, DownloadStatus } from '../types/download';
import { BackendStatus } from '../types/version';

interface DownloadState {
  backendStatus: BackendStatus;
  statusMessage: string;
  queue: DownloadItem[];
  history: DownloadItem[];
  activeItemId: string | null;

  // Actions
  setBackendStatus: (status: BackendStatus, message?: string) => void;
  addToQueue: (item: Omit<DownloadItem, 'id' | 'createdAt' | 'status' | 'progress'>) => string;
  updateProgress: (id: string, progress: Partial<DownloadProgress>) => void;
  updateStatus: (id: string, status: DownloadStatus, errorMsg?: string, outputPath?: string) => void;
  cancelDownload: (id: string) => void;
  pauseDownload: (id: string) => void;
  resumeDownload: (id: string) => void;
  removeFromQueue: (id: string) => void;
  clearHistory: () => void;
  clearCompletedQueue: () => void;
  retryDownload: (id: string) => void;
}

export const useDownloadStore = create<DownloadState>()(
  persist(
    (set) => ({
      backendStatus: 'ready',
      statusMessage: 'Rust Backend & Sidecars Ready',
      queue: [],
      history: [],
      activeItemId: null,

      setBackendStatus: (status, message) => {
        set({
          backendStatus: status,
          statusMessage: message || (status === 'ready' ? 'Rust Backend & Sidecars Ready' : status === 'downloading' ? 'Active download in progress' : 'Error communicating with backend'),
        });
      },

      addToQueue: (itemData) => {
        const id = `dl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newItem: DownloadItem = {
          ...itemData,
          id,
          createdAt: Date.now(),
          status: 'queued',
          progress: {
            percentage: 0,
            downloadedBytes: 0,
            totalBytes: 0,
            speedBytesPerSec: 0,
            etaSeconds: 0,
            currentStep: 'Waiting in queue...',
          },
        };

        set((state) => ({
          queue: [...state.queue, newItem],
        }));

        return id;
      },

      updateProgress: (id, progressUpdate) => {
        set((state) => {
          const updatedQueue = state.queue.map((item) => {
            if (item.id === id) {
              const updatedProgress = { ...item.progress, ...progressUpdate };
              return {
                ...item,
                status: (item.status === 'queued' ? 'downloading' : item.status) as DownloadStatus,
                progress: updatedProgress,
              };
            }
            return item;
          });

          const isAnyDownloading = updatedQueue.some((i) => i.status === 'downloading');
          return {
            queue: updatedQueue,
            activeItemId: id,
            backendStatus: isAnyDownloading ? 'downloading' : 'ready',
          };
        });
      },

      updateStatus: (id, status, errorMsg, outputPath) => {
        set((state) => {
          let completedItem: DownloadItem | null = null;

          const updatedQueue = state.queue.map((item) => {
            if (item.id === id) {
              const updated: DownloadItem = {
                ...item,
                status,
                errorMessage: errorMsg,
                outputPath: outputPath || item.outputPath,
                completedAt: status === 'completed' ? Date.now() : item.completedAt,
              };
              if (status === 'completed') {
                completedItem = updated;
              }
              return updated;
            }
            return item;
          });

          const newHistory = completedItem ? [completedItem, ...state.history] : state.history;
          const isAnyDownloading = updatedQueue.some((i) => i.status === 'downloading');

          return {
            queue: updatedQueue,
            history: newHistory,
            activeItemId: isAnyDownloading ? state.activeItemId : null,
            backendStatus: status === 'failed' ? 'error' : isAnyDownloading ? 'downloading' : 'ready',
            statusMessage: status === 'failed' ? (errorMsg || 'Download failed') : undefined,
          };
        });
      },

      cancelDownload: (id) => {
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === id ? { ...item, status: 'cancelled' as DownloadStatus } : item
          ),
          backendStatus: 'ready',
        }));
      },

      pauseDownload: (id) => {
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === id ? { ...item, status: 'paused' as DownloadStatus } : item
          ),
        }));
      },

      resumeDownload: (id) => {
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === id ? { ...item, status: 'queued' as DownloadStatus } : item
          ),
        }));
      },

      removeFromQueue: (id) => {
        set((state) => ({
          queue: state.queue.filter((item) => item.id !== id),
        }));
      },

      clearHistory: () => {
        set({ history: [] });
      },

      clearCompletedQueue: () => {
        set((state) => ({
          queue: state.queue.filter((item) => item.status !== 'completed' && item.status !== 'cancelled'),
        }));
      },

      retryDownload: (id) => {
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: 'queued',
                  errorMessage: undefined,
                  progress: {
                    percentage: 0,
                    downloadedBytes: 0,
                    totalBytes: 0,
                    speedBytesPerSec: 0,
                    etaSeconds: 0,
                    currentStep: 'Retrying...',
                  },
                }
              : item
          ),
        }));
      },
    }),
    {
      name: 'smart-auto-downloader-downloads',
      partialize: (state) => ({ history: state.history.slice(0, 50) }),
    }
  )
);
