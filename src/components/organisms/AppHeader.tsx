import React from 'react';
import { Download, Sparkles, Layers, History, Settings } from 'lucide-react';
import { VersionCommitBadge } from '../molecules/VersionCommitBadge';
import { StatusIndicator } from '../atoms/StatusIndicator';
import { ThemeToggle } from '../molecules/ThemeToggle';
import { useDownloadStore } from '../../store/downloadStore';

export interface AppHeaderProps {
  activeTab: 'downloader' | 'queue' | 'history' | 'settings';
  onTabChange: (tab: 'downloader' | 'queue' | 'history' | 'settings') => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ activeTab, onTabChange }) => {
  const { queue, history } = useDownloadStore();
  const activeDownloadsCount = queue.filter(
    (i) => i.status === 'downloading' || i.status === 'queued'
  ).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md transition-colors select-none">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Branding & Edition Badge */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 shadow-md shadow-purple-500/20 text-white font-bold">
            <Download className="w-5 h-5" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500 border-2 border-background" />
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
                Smart Auto Downloader
              </h1>
              {/* Gemini-styled Edition Pill Badge */}
              <VersionCommitBadge />
            </div>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              Cross-Platform Desktop Engine <Sparkles className="w-2.5 h-2.5 text-purple-400" />
            </span>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-secondary/50 border border-border/40 rounded-2xl">
          <button
            type="button"
            onClick={() => onTabChange('downloader')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'downloader'
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Downloader</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('queue')}
            className={`relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Queue</span>
            {activeDownloadsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-purple-500 text-[10px] text-white font-bold animate-pulse">
                {activeDownloadsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('history')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
            {history.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-muted text-[10px] text-muted-foreground">
                {history.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('settings')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Right: Backend Status Indicator & Theme Toggle */}
        <div className="flex items-center gap-3">
          <StatusIndicator />
          <div className="h-4 w-px bg-border/60" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
