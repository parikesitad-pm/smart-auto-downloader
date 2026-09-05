import { PlatformType } from '../types/download';

export interface PlatformMetadata {
  type: PlatformType;
  displayName: string;
  badgeColor: string;
  iconColor: string;
  features: string[];
}

export const detectPlatform = (url: string): PlatformType => {
  const trimmed = url.trim().toLowerCase();

  if (!trimmed) return 'generic';

  if (
    trimmed.includes('youtube.com') ||
    trimmed.includes('youtu.be') ||
    trimmed.includes('yt.be')
  ) {
    return 'youtube';
  }

  if (trimmed.includes('instagram.com') || trimmed.includes('instagr.am')) {
    return 'instagram';
  }

  if (trimmed.includes('tiktok.com')) {
    return 'tiktok';
  }

  if (
    trimmed.includes('whatsapp') ||
    trimmed.startsWith('wa:') ||
    trimmed.includes('status')
  ) {
    return 'whatsapp';
  }

  return 'generic';
};

export const getPlatformMeta = (type: PlatformType): PlatformMetadata => {
  switch (type) {
    case 'youtube':
      return {
        type: 'youtube',
        displayName: 'YouTube / Shorts',
        badgeColor: 'bg-red-500/10 text-red-500 border-red-500/20',
        iconColor: '#ef4444',
        features: ['4K / 2K / 1080p', 'Audio 320k', 'Subtitles'],
      };
    case 'instagram':
      return {
        type: 'instagram',
        displayName: 'Instagram Reels / Post',
        badgeColor: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
        iconColor: '#ec4899',
        features: ['1080p Reels', 'Original Audio', 'High Bitrate'],
      };
    case 'tiktok':
      return {
        type: 'tiktok',
        displayName: 'TikTok (No Watermark)',
        badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        iconColor: '#06b6d4',
        features: ['No Watermark HD', 'Original Audio', 'Fast Scrape'],
      };
    case 'whatsapp':
      return {
        type: 'whatsapp',
        displayName: 'WhatsApp Status',
        badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        iconColor: '#10b981',
        features: ['Local Cache', 'Images & Videos', 'No Compression'],
      };
    default:
      return {
        type: 'generic',
        displayName: 'Direct Media Link',
        badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        iconColor: '#a855f7',
        features: ['Auto Detect Format', 'Direct Stream'],
      };
  }
};
