import { AudioFormat, VideoQuality } from './download';

export interface AppSettings {
  downloadDirectory: string;
  defaultVideoQuality: VideoQuality;
  defaultAudioFormat: AudioFormat;
  maxConcurrentDownloads: number;
  autoMuxing: boolean;
  enableNotifications: boolean;
  openFolderAfterDownload: boolean;
  rateLimitKbs: number; // 0 for unlimited
  theme: 'light' | 'dark' | 'system';
}
