import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  CheckCircle2,
  Wrench,
  GitCommit,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import changelogDataRaw from '../../data/changelog.json';
import { ChangelogData, ChangelogRelease } from '../../types/changelog';
import { useVersionStore } from '../../store/versionStore';
import { Badge } from '../atoms/Badge';
import { openExternalUrl } from '../../services/tauri';

const changelogData = changelogDataRaw as ChangelogData;

export const ChangelogModal: React.FC = () => {
  const { isChangelogOpen, setChangelogOpen, version } = useVersionStore();
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);

  if (!isChangelogOpen) return null;

  const currentRelease: ChangelogRelease =
    changelogData.releases[selectedVersionIndex] || changelogData.releases[0];
  const previousRelease: ChangelogRelease | undefined =
    changelogData.releases[selectedVersionIndex + 1];

  return (
    <AnimatePresence>
      {isChangelogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setChangelogOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl border border-border/80 bg-card shadow-2xl overflow-hidden z-10"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    Changelog & Release Notes
                    <Badge variant="gemini" size="sm">
                      {version}
                    </Badge>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Systematic release history and verified Git commit logs
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setChangelogOpen(false)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Version Switcher Tabs (Current vs Previous) */}
            <div className="flex items-center gap-2 px-6 py-3 border-b border-border/40 bg-muted/10 overflow-x-auto">
              <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Releases:
              </span>
              {changelogData.releases.map((rel, idx) => {
                const isSelected = selectedVersionIndex === idx;
                return (
                  <button
                    key={rel.version}
                    type="button"
                    onClick={() => setSelectedVersionIndex(idx)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-500 text-white shadow-sm shadow-purple-500/30'
                        : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/40'
                    }`}
                  >
                    <span>{rel.version}</span>
                    {rel.isCurrent && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-bold">
                        Latest
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Release Highlight Header */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-blue-500/10 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-extrabold text-foreground">
                      {currentRelease.version}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({currentRelease.tagline})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      {currentRelease.releaseDate}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-mono">
                      <GitCommit className="w-3.5 h-3.5 text-pink-400" />
                      Commit #{currentRelease.commitHash}
                    </span>
                  </div>
                </div>

                {previousRelease && (
                  <div className="text-right text-xs bg-card/70 border border-border/50 rounded-xl px-3 py-2">
                    <div className="text-muted-foreground">Comparing Against:</div>
                    <div className="font-semibold text-foreground flex items-center gap-1 justify-end">
                      <span>{previousRelease.version}</span>
                      <ArrowRight className="w-3 h-3 text-purple-400" />
                      <span className="text-purple-600 dark:text-purple-400">
                        {currentRelease.version}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Section: What's New */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">What's New</h3>
                  <span className="text-xs text-muted-foreground">
                    ({currentRelease.whatsNew.length} additions)
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 pl-8">
                  {currentRelease.whatsNew.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-foreground/90 leading-relaxed bg-muted/20 p-2.5 rounded-xl border border-border/40"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Improvements & Fixes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Improvements & Fixes</h3>
                  <span className="text-xs text-muted-foreground">
                    ({currentRelease.improvementsAndFixes.length} patches)
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 pl-8">
                  {currentRelease.improvementsAndFixes.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-foreground/90 leading-relaxed bg-muted/20 p-2.5 rounded-xl border border-border/40"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Commit Log */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-500">
                      <GitCommit className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">Commit Log</h3>
                    <span className="text-xs text-muted-foreground">
                      ({currentRelease.commitLog.length} recent commits)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      openExternalUrl(
                        'https://github.com/parikesitad-pm/smart-auto-downloader/commits'
                      )
                    }
                    className="inline-flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    <span>View GitHub commits</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="pl-8">
                  <div className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden divide-y divide-border/40">
                    {currentRelease.commitLog.map((commit) => (
                      <div
                        key={commit.hash}
                        className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="font-mono text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 shrink-0">
                            #{commit.hash}
                          </span>
                          <span className="truncate text-foreground/90 font-medium">
                            {commit.message}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 text-[11px] text-muted-foreground">
                          <span className="font-medium text-foreground/80">{commit.author}</span>
                          <span>•</span>
                          <span>{commit.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-border/60 bg-muted/30 flex items-center justify-between text-xs">
              <div className="text-muted-foreground">
                Official release builds are signed and verified.
              </div>
              <button
                type="button"
                onClick={() => setChangelogOpen(false)}
                className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
