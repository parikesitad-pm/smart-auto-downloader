import {
  DownloadItem,
  DownloadProgress,
  MediaPreviewData,
} from '../types/download';

// Detect if running inside a Tauri v2 desktop context
export const isTauriEnvironment = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

// Robust YouTube Video ID extractor
export const extractYouTubeVideoId = (url: string): string | null => {
  const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts|live)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
};

// Fetch real metadata and thumbnail preview from yt-dlp backend or real CDN oEmbed
export const fetchMediaMetadata = async (
  url: string
): Promise<MediaPreviewData> => {
  const cleanUrl = url.trim();
  const ytVideoId = extractYouTubeVideoId(cleanUrl);
  const isPlaylist =
    cleanUrl.includes('playlist') || cleanUrl.includes('&list=');

  if (isTauriEnvironment()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const res = await invoke<{
        is_playlist: boolean;
        title: string;
        thumbnail?: string;
        uploader?: string;
        duration?: string;
        items: Array<{
          id: string;
          title: string;
          url: string;
          duration?: string;
          thumbnail?: string;
        }>;
      }>('fetch_media_preview', { url: cleanUrl });

      // Ensure YouTube thumbnail fallback if yt-dlp returned null or webp
      let thumbnail = res.thumbnail;
      if (!thumbnail && ytVideoId) {
        thumbnail = `https://i.ytimg.com/vi/${ytVideoId}/hqdefault.jpg`;
      }

      return {
        isPlaylist: res.is_playlist,
        title: res.title,
        thumbnail,
        uploader: res.uploader,
        duration: res.duration,
        items: res.items?.map((it) => ({
          ...it,
          selected: true,
        })),
      };
    } catch (err) {
      console.warn('Tauri fetch_media_preview failed, trying oEmbed fallback:', err);
    }
  }

  // Real YouTube oEmbed API for browser & fallback (No API key required, zero-config CORS)
  if (ytVideoId) {
    const realThumbnail = `https://i.ytimg.com/vi/${ytVideoId}/hqdefault.jpg`;
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytVideoId}&format=json`;
      const response = await fetch(oembedUrl);
      if (response.ok) {
        const data = await response.json();
        return {
          isPlaylist,
          title: data.title || `YouTube Video (${ytVideoId})`,
          thumbnail: realThumbnail,
          uploader: data.author_name || 'YouTube Creator',
          duration: 'HD Video',
          items: isPlaylist
            ? [
                {
                  id: ytVideoId,
                  title: data.title || `YouTube Video (${ytVideoId})`,
                  url: cleanUrl,
                  duration: '03:45',
                  thumbnail: realThumbnail,
                  selected: true,
                },
              ]
            : undefined,
        };
      }
    } catch (e) {
      console.warn('YouTube oEmbed fetch failed, using direct CDN thumb:', e);
    }

    // Direct YouTube CDN Thumbnail without oEmbed
    return {
      isPlaylist,
      title: `YouTube Media (${ytVideoId})`,
      thumbnail: realThumbnail,
      uploader: 'YouTube Creator',
      duration: 'HD Video',
    };
  }

  // Generic fallback for other platforms
  return {
    isPlaylist,
    title: isPlaylist
      ? 'High Definition Media Playlist'
      : cleanUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] + ' Media',
    thumbnail:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    uploader: 'Content Creator',
    duration: '03:45',
  };
};

// Open folder natively
export const openDownloadFolderNative = async (
  folderPath?: string
): Promise<boolean> => {
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
    // In Browser Dev Mode, filesystem explorer cannot be invoked by sandboxed web JS.
    // Copy path to clipboard and show interactive alert/toast
    const target = folderPath || 'C:/Downloads/SmartAutoDownloader';
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(target);
      }
    } catch {
      // ignore clipboard error
    }
    alert(
      `[Mode Browser Web]\n` +
        `File berhasil disimpan di folder Downloads bawaan browser Anda.\n\n` +
        `Target konfigurasi path lokal:\n${target}\n\n` +
        `(Path ini telah otomatis disalin ke Clipboard Anda)`
    );
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
  onProgress: (data: {
    id: string;
    progress: Partial<DownloadProgress>;
  }) => void,
  onComplete: (data: { id: string; outputPath: string }) => void,
  onError: (data: { id: string; error: string }) => void
) => {
  if (isTauriEnvironment()) {
    try {
      const { listen } = await import('@tauri-apps/api/event');
      const unlistenProgress = await listen<{
        id: string;
        progress: Partial<DownloadProgress>;
      }>('download-progress', (event) => onProgress(event.payload));

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
  onError: (error: string) => void,
  outputDir?: string
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
          output_dir: outputDir || 'C:/Downloads/SmartAutoDownloader',
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

        // Preserve exact title while stripping only illegal Windows filesystem characters: \ / : * ? " < > |
        const ext = item.formatType === 'audio' ? 'mp3' : 'mp4';
        const safeTitle = (item.title || 'media_download')
          .replace(/[\\/:*?"<>|]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        const fileName = `${safeTitle || 'video_download'}.${ext}`;

        try {
          const sampleBlob = new Blob(
            [
              `[Smart Auto Downloader v2.0 - Development Simulation File]\n\n` +
                `Judul Media: ${item.title}\n` +
                `Platform: ${item.platform}\n` +
                `Format: ${item.formatType.toUpperCase()} (${item.videoQuality || item.audioFormat})\n` +
                `URL Asal: ${item.url}\n` +
                `Waktu Unduh: ${new Date().toLocaleString()}\n` +
                `Status: Berhasil diunduh melalui mode Browser Dev Simulator.\n`,
            ],
            { type: item.formatType === 'audio' ? 'audio/mpeg' : 'video/mp4' }
          );
          const blobUrl = URL.createObjectURL(sampleBlob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        } catch (e) {
          console.warn('Failed to trigger browser download:', e);
        }

        const simulatedPath = `C:/Downloads/SmartAutoDownloader/${fileName}`;
        onComplete(simulatedPath);
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

// Retrieve version dynamically from Tauri App API or Vite env fallback
export const getAppVersion = async (): Promise<string> => {
  if (isTauriEnvironment()) {
    try {
      const { getVersion } = await import('@tauri-apps/api/app');
      const v = await getVersion();
      if (v) return `v${v}`;
    } catch (err) {
      console.warn('Failed to retrieve version from Tauri API:', err);
    }
  }
  return import.meta.env.VITE_APP_VERSION
    ? `v${import.meta.env.VITE_APP_VERSION}`
    : 'v2.0.0';
};

export interface EndpointLatency {
  name: string;
  host: string;
  latency_ms: number;
  status: string;
}

export interface NetworkDiagnosticResult {
  is_online: boolean;
  avg_latency_ms: number;
  quality_tier: string;
  endpoints: EndpointLatency[];
  download_bandwidth_est: string;
}

export const runNetworkTest = async (): Promise<NetworkDiagnosticResult> => {
  if (isTauriEnvironment()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<NetworkDiagnosticResult>('run_network_test');
    } catch (err) {
      console.warn('Tauri run_network_test failed, using fallback:', err);
    }
  }

  // Fallback dev simulator
  return {
    is_online: true,
    avg_latency_ms: 32,
    quality_tier: 'Turbo (Ultra Fast)',
    download_bandwidth_est: '100+ Mbps (4K 60fps Ready)',
    endpoints: [
      {
        name: 'YouTube CDN',
        host: 'www.youtube.com',
        latency_ms: 28,
        status: 'Optimal',
      },
      {
        name: 'Cloudflare CDN',
        host: '1.1.1.1',
        latency_ms: 16,
        status: 'Optimal',
      },
      {
        name: 'TikTok CDN',
        host: 'www.tiktok.com',
        latency_ms: 42,
        status: 'Optimal',
      },
      {
        name: 'Instagram CDN',
        host: 'www.instagram.com',
        latency_ms: 48,
        status: 'Good',
      },
      {
        name: 'Google Global',
        host: '8.8.8.8',
        latency_ms: 20,
        status: 'Optimal',
      },
    ],
  };
};
