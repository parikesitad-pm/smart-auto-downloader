import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { Watermark } from '../atoms/Watermark';
import { VersionTag } from '../atoms/VersionTag';
import { useVersionStore } from '../../store/versionStore';

export const AppFooter: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  const { setChangelogOpen, setHelpOpen } = useVersionStore();

  return (
    <footer
      className={`w-full border-t border-border/60 bg-background/90 backdrop-blur-md px-4 sm:px-6 py-2.5 transition-colors select-none ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Left: Watermark permanen "Created by parikesitad-pm" */}
        <div className="flex items-center gap-3">
          <Watermark githubUsername="parikesitad-pm" />
          <span className="hidden sm:inline text-border">•</span>
          <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Tauri v2 + Rust Core</span>
          </div>
        </div>

        {/* Right: Version Commit Tag + Interactive Triggers [Changelog & Updates] & [Help & Docs] */}
        <div className="flex items-center gap-2">
          {/* Version + Commit Hash */}
          <VersionTag onClick={() => setChangelogOpen(true)} />

          {/* Interactive Trigger: Changelog & Updates */}
          <button
            type="button"
            onClick={() => setChangelogOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300 hover:bg-purple-500/20 font-medium transition-colors cursor-pointer active:scale-95"
            title="View update history, new features, and git commits"
          >
            <Sparkles className="w-3 h-3 text-pink-500" />
            <span>Changelog & Updates</span>
          </button>

          {/* Interactive Trigger: Help & Docs */}
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/60 bg-secondary/60 text-secondary-foreground hover:bg-secondary font-medium transition-colors cursor-pointer active:scale-95"
            title="Open user guide and supported platforms"
          >
            <BookOpen className="w-3 h-3 text-muted-foreground" />
            <span>Help & Docs</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
