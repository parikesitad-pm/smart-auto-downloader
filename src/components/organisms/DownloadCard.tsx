import React from 'react';
import { motion } from 'framer-motion';
import {
  X,
  FolderOpen,
  Pause,
  Play,
  RotateCcw,
  AlertCircle,
  Film,
  Music,
} from 'lucide-react';
import { DownloadItem } from '../../types/download';
import { DownloadStats } from '../molecules/DownloadStats';
import { openDownloadFolderNative } from '../../services/tauri';
import { useDownloadStore } from '../../store/downloadStore';
import { getPlatformMeta } from '../../services/platformDetector';

export interface DownloadCardProps {
  item: DownloadItem;
}

export const DownloadCard: React.FC<DownloadCardProps> = ({ item }) => {
  const { cancelDownload, pauseDownload, resumeDownload, retryDownload } = useDownloadStore();
  const platformMeta = getPlatformMeta(item.platform);

  const isDownloading = item.status === 'downloading';
  const isCompleted = item.status === 'completed';
  const isFailed = item.status === 'failed';
  const isPaused = item.status === 'paused';

  const handleOpenFolder = () => {
    openDownloadFolderNative(item.outputPath);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-all ${
        isDownloading
          ? 'border-purple-500/50 shadow-purple-500/5 ring-1 ring-purple-500/20'
          : isCompleted
          ? 'border-emerald-500/40 bg-emerald-500/[0.02]'
          : isFailed
          ? 'border-red-500/40 bg-red-500/[0.02]'
          : 'border-border/70'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Thumbnail & Media Details */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Thumbnail Preview Box */}
          <div className="relative w-16 h-12 rounded-xl bg-muted/70 flex items-center justify-center shrink-0 overflow-hidden border border-border/60">
            {item.thumbnailUrl ? (
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : item.formatType === 'audio' ? (
              <Music className="w-6 h-6 text-purple-500" />
            ) : (
              <Film className="w-6 h-6 text-blue-500" />
            )}

            <div
              className="absolute top-1 left-1 w-2 h-2 rounded-full"
              style={{ backgroundColor: platformMeta.iconColor }}
            />
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-foreground truncate max-w-md">
                {item.title}
              </h4>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-medium border shrink-0 ${platformMeta.badgeColor}`}
              >
                {platformMeta.displayName}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="capitalize font-medium text-foreground/80">
                {item.formatType === 'video'
                  ? `Video (${item.videoQuality?.toUpperCase() || '1080P'})`
                  : `Audio (${item.audioFormat?.replace('_', ' ').toUpperCase() || 'MP3'})`}
              </span>
              <span>•</span>
              <span className="italic">{item.progress.currentStep || 'Processing...'}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {isCompleted && (
            <button
              type="button"
              onClick={handleOpenFolder}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Open File</span>
            </button>
          )}

          {isFailed && (
            <button
              type="button"
              onClick={() => retryDownload(item.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}

          {isDownloading && (
            <button
              type="button"
              onClick={() => pauseDownload(item.id)}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Pause download"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}

          {isPaused && (
            <button
              type="button"
              onClick={() => resumeDownload(item.id)}
              className="p-2 rounded-xl text-purple-600 hover:bg-purple-500/10 transition-colors cursor-pointer"
              title="Resume download"
            >
              <Play className="w-4 h-4" />
            </button>
          )}

          {(isDownloading || item.status === 'queued') && (
            <button
              type="button"
              onClick={() => cancelDownload(item.id)}
              className="p-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Cancel download"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar & Live Stats (when active/downloading) */}
      {(isDownloading || isPaused || item.status === 'processing') && (
        <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
          {/* Shimmer Progress Bar */}
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/80">
            <div
              className="h-full rounded-full transition-all duration-300 shimmer-bg animate-shimmer"
              style={{ width: `${Math.max(item.progress.percentage, 2)}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <DownloadStats progress={item.progress} />
            <span className="font-mono text-xs font-bold text-foreground">
              {Math.round(item.progress.percentage)}%
            </span>
          </div>
        </div>
      )}

      {/* Error Message banner */}
      {isFailed && item.errorMessage && (
        <div className="mt-2.5 p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{item.errorMessage}</span>
        </div>
      )}
    </motion.div>
  );
};
