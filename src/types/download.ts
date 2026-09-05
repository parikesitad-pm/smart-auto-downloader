export type PlatformType =
  | 'youtube'
  | 'instagram'
  | 'tiktok'
  | 'whatsapp'
  | 'generic';

export type VideoQuality =
  | 'best'
  | '2160p'
  | '1440p'
  | '1080p'
  | '720p'
  | '480p';

export type AudioFormat = 'mp3_320k' | 'mp3_192k' | 'm4a' | 'wav';

export type DownloadFormatType = 'video' | 'audio';

export type DownloadStatus =
  | 'idle'
  | 'queued'
  | 'downloading'
  | 'processing' // muxing ffmpeg
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'paused';

export interface DownloadProgress {
  percentage: number;
  downloadedBytes: number;
  totalBytes: number;
  speedBytesPerSec: number;
  etaSeconds: number;
  currentStep?: string; // e.g. "Downloading audio track...", "Muxing with FFmpeg..."
}

export interface DownloadItem {
  id: string;
  url: string;
  title: string;
  thumbnailUrl?: string;
  platform: PlatformType;
  formatType: DownloadFormatType;
  videoQuality?: VideoQuality;
  audioFormat?: AudioFormat;
  status: DownloadStatus;
  progress: DownloadProgress;
  outputPath?: string;
  createdAt: number;
  completedAt?: number;
  errorMessage?: string;
  filesizeApprox?: string;
  duration?: string;
}

export interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  uploader: string;
  platform: PlatformType;
  availableQualities: VideoQuality[];
  url: string;
}

export interface PlaylistItemInfo {
  id: string;
  title: string;
  url: string;
  duration?: string;
  thumbnail?: string;
  selected: boolean;
}

export interface MediaPreviewData {
  isPlaylist: boolean;
  title: string;
  thumbnail?: string;
  uploader?: string;
  duration?: string;
  items?: PlaylistItemInfo[];
}
