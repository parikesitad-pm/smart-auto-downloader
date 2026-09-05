import React from 'react';
import { Film, Music2, Check, Sparkles } from 'lucide-react';
import { AudioFormat, DownloadFormatType, VideoQuality } from '../../types/download';

export interface FormatSelectorProps {
  formatType: DownloadFormatType;
  onFormatTypeChange: (type: DownloadFormatType) => void;
  videoQuality: VideoQuality;
  onVideoQualityChange: (quality: VideoQuality) => void;
  audioFormat: AudioFormat;
  onAudioFormatChange: (format: AudioFormat) => void;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  formatType,
  onFormatTypeChange,
  videoQuality,
  onVideoQualityChange,
  audioFormat,
  onAudioFormatChange,
}) => {
  const videoQualities: { id: VideoQuality; label: string; badge?: string }[] = [
    { id: 'best', label: 'Best Quality', badge: 'Auto Max' },
    { id: '2160p', label: '4K Ultra HD', badge: '2160p' },
    { id: '1440p', label: '2K Quad HD', badge: '1440p' },
    { id: '1080p', label: 'Full HD', badge: '1080p' },
    { id: '720p', label: 'HD 720p', badge: '720p' },
    { id: '480p', label: 'SD 480p', badge: '480p' },
  ];

  const audioFormats: { id: AudioFormat; label: string; description: string }[] = [
    { id: 'mp3_320k', label: 'MP3 320 kbps', description: 'Studio High Bitrate' },
    { id: 'mp3_192k', label: 'MP3 192 kbps', description: 'Standard Balanced' },
    { id: 'm4a', label: 'M4A (AAC)', description: 'Native Apple Lossless' },
    { id: 'wav', label: 'WAV Uncompressed', description: 'Raw Studio Master' },
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
      {/* Format Category Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Select Output Format
        </span>

        <div className="inline-flex rounded-xl bg-muted/60 p-1 border border-border/40">
          <button
            type="button"
            onClick={() => onFormatTypeChange('video')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              formatType === 'video'
                ? 'bg-card text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-blue-500" />
            <span>Video (MP4)</span>
          </button>

          <button
            type="button"
            onClick={() => onFormatTypeChange('audio')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              formatType === 'audio'
                ? 'bg-card text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Music2 className="w-3.5 h-3.5 text-purple-500" />
            <span>Audio Only</span>
          </button>
        </div>
      </div>

      {/* Video Qualities */}
      {formatType === 'video' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {videoQualities.map((item) => {
            const isSelected = videoQuality === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onVideoQualityChange(item.id)}
                className={`relative flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-purple-500/80 bg-purple-500/10 text-foreground ring-1 ring-purple-500/30'
                    : 'border-border/60 bg-muted/20 hover:bg-muted/50 hover:border-border text-muted-foreground'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-foreground flex items-center gap-1">
                    {item.label}
                    {item.id === '2160p' && (
                      <Sparkles className="w-3 h-3 text-pink-500 fill-pink-500" />
                    )}
                  </div>
                  {item.badge && (
                    <span className="text-[10px] text-muted-foreground">{item.badge}</span>
                  )}
                </div>
                {isSelected && <Check className="w-4 h-4 text-purple-500" />}
              </button>
            );
          })}
        </div>
      ) : (
        /* Audio Formats */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {audioFormats.map((item) => {
            const isSelected = audioFormat === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onAudioFormatChange(item.id)}
                className={`relative flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-purple-500/80 bg-purple-500/10 text-foreground ring-1 ring-purple-500/30'
                    : 'border-border/60 bg-muted/20 hover:bg-muted/50 hover:border-border text-muted-foreground'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-foreground">{item.label}</div>
                  <span className="text-[10px] text-muted-foreground">{item.description}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-purple-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
