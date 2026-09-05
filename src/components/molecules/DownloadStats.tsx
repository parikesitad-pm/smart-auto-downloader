import React from 'react';
import { DownloadProgress } from '../../types/download';

export interface DownloadStatsProps {
  progress: DownloadProgress;
  className?: string;
}

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const formatSpeed = (bytesPerSec: number): string => {
  if (!bytesPerSec || bytesPerSec <= 0) return '0.0 MB/s';
  const mbps = bytesPerSec / (1024 * 1024);
  return `${mbps.toFixed(1)} MB/s`;
};

export const formatETA = (seconds: number): string => {
  if (!seconds || seconds <= 0 || !isFinite(seconds)) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const DownloadStats: React.FC<DownloadStatsProps> = ({ progress, className = '' }) => {
  return (
    <div className={`flex items-center gap-4 text-xs font-mono text-muted-foreground ${className}`}>
      <div>
        <span className="text-foreground font-semibold">
          {formatBytes(progress.downloadedBytes)}
        </span>{' '}
        /{' '}
        <span>{formatBytes(progress.totalBytes || 0)}</span>
      </div>

      <div className="h-3 w-px bg-border" />

      <div className="text-purple-600 dark:text-purple-400 font-semibold">
        {formatSpeed(progress.speedBytesPerSec)}
      </div>

      <div className="h-3 w-px bg-border" />

      <div>
        ETA: <span className="text-foreground font-medium">{formatETA(progress.etaSeconds)}</span>
      </div>
    </div>
  );
};
