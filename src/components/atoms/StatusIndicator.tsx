import React from 'react';
import { useDownloadStore } from '../../store/downloadStore';
import { useTranslation } from '../../store/languageStore';

export const StatusIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { backendStatus, statusMessage } = useDownloadStore();
  const { t } = useTranslation();

  const config = {
    ready: {
      color: 'bg-emerald-500',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-700 dark:text-emerald-400',
      label: t('header.statusReady'),
      pulse: false,
    },
    downloading: {
      color: 'bg-blue-500',
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10',
      text: 'text-blue-700 dark:text-blue-400',
      label: t('header.statusDownloading'),
      pulse: true,
    },
    error: {
      color: 'bg-red-500',
      border: 'border-red-500/30',
      bg: 'bg-red-500/10',
      text: 'text-red-700 dark:text-red-400',
      label: t('header.statusError'),
      pulse: false,
    },
    initializing: {
      color: 'bg-amber-500',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
      text: 'text-amber-700 dark:text-amber-400',
      label: t('header.statusInitializing'),
      pulse: true,
    },
  }[backendStatus] || {
    color: 'bg-emerald-500',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    label: t('header.statusReady'),
    pulse: false,
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.border} ${config.text} transition-colors ${className}`}
      title={statusMessage}
    >
      <span className="relative flex h-2 w-2">
        {config.pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.color}`} />
      </span>
      <span>{config.label}</span>
    </div>
  );
};
