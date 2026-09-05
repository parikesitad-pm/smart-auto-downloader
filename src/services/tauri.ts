import { DownloadItem, DownloadProgress } from '../types/download';

// Detect if running inside a Tauri v2 desktop context
export const isTauriEnvironment = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

// Open folder natively
export const openDownloadFolderNative = async (folderPath?: string): Promise<boolean> => {
  if (isTauriEnvironment()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('open_download_folder', { path: folderPath });
      return true;
    } catch (err) {
      console.error('Failed to open download folder natively:', err);
      return false;
    }
  } else {
    console.info('[Browser Dev Simulation] Open download folder called for:', folderPath);
    return true;
  }
};

// Open external URL in browser
export const openExternalUrl = async (url: string): Promise<void> => {
  if (isTauriEnvironment()) {
    try {
      const { open } = await import('@tauri-apps/plugin-shell');
      await open(url);
    } catch (err) {
      console.error('Failed to open URL with Tauri plugin-shell:', err);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

// Listen to download progress from Tauri backend
export const setupTauriProgressListener = async (
  onProgress: (data: { id: string; progress: Partial<DownloadProgress> }) => void,
  onComplete: (data: { id: string; outputPath: string }) => void,
  onError: (data: { id: string; error: string }) => void
) => {
  if (isTauriEnvironment()) {
    try {
      const { listen } = await import('@tauri-apps/api/event');
      const unlistenProgress = await listen<{ id: string; progress: Partial<DownloadProgress> }>(
        'download-progress',
        (event) => onProgress(event.payload)
      );

      const unlistenComplete = await listen<{ id: string; outputPath: string }>(
        'download-complete',
        (event) => onComplete(event.payload)
      );

      const unlistenError = await listen<{ id: string; error: string }>(
        'download-error',
        (event) => onError(event.payload)
      );

      return () => {
        unlistenProgress();
        unlistenComplete();
        unlistenError();
      };
    } catch (err) {
      console.error('Failed to setup Tauri progress listener:', err);
      return () => {};
    }
  }
  return () => {};
};

// Dispatch download command to Rust backend (or simulate in web mode)
export const triggerDownload = async (
  item: DownloadItem,
  onProgress: (progress: Partial<DownloadProgress>) => void,
  onComplete: (outputPath: string) => void,
  onError: (error: string) => void
): Promise<void> => {
  if (isTauriEnvironment()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('start_download', {
        item: {
          id: item.id,
          url: item.url,
          platform: item.platform,
          format_type: item.formatType,
          video_quality: item.videoQuality,
          audio_format: item.audioFormat,
          output_dir: 'C:/Downloads/SmartAutoDownloader',
        },
      });
    } catch (err: any) {
      console.error('Tauri download invoke failed:', err);
      onError(err?.toString() || 'Failed to start download via Rust backend');
    }
  } else {
    // High-fidelity web simulator for development and instant UI feedback
    console.info(`[Dev Simulator] Simulating download for: ${item.title}`);
    let percent = 0;
    const totalBytes = 45 * 1024 * 1024; // 45 MB mock
    const timer = setInterval(() => {
      percent += Math.floor(Math.random() * 8) + 4;
      if (percent >= 100) {
        clearInterval(timer);
        onProgress({
          percentage: 100,
          downloadedBytes: totalBytes,
          totalBytes,
          speedBytesPerSec: 0,
          etaSeconds: 0,
          currentStep: 'Completed & Muxed',
        });
        onComplete(`C:/Downloads/SmartAutoDownloader/${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`);
      } else {
        const speed = (Math.random() * 3.5 + 4.2) * 1024 * 1024; // ~4.5 - 7.5 MB/s
        const remainingBytes = totalBytes * (1 - percent / 100);
        const eta = Math.ceil(remainingBytes / speed);

        let step = 'Downloading video stream...';
        if (percent > 60 && item.formatType === 'video') {
          step = 'Downloading separate high-res audio track...';
        }
        if (percent > 90 && item.formatType === 'video') {
          step = 'Auto-muxing video & audio with FFmpeg...';
        }

        onProgress({
          percentage: percent,
          downloadedBytes: Math.floor((totalBytes * percent) / 100),
          totalBytes,
          speedBytesPerSec: speed,
          etaSeconds: eta,
          currentStep: step,
        });
      }
    }, 450);
  }
};
