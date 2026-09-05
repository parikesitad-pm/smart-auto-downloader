import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, ExternalLink, ShieldCheck, Zap, HardDrive, AlertTriangle } from 'lucide-react';
import { useVersionStore } from '../../store/versionStore';
import { openExternalUrl } from '../../services/tauri';

export const HelpModal: React.FC = () => {
  const { isHelpOpen, setHelpOpen } = useVersionStore();

  if (!isHelpOpen) return null;

  return (
    <AnimatePresence>
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setHelpOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-border/80 bg-card shadow-2xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Help & Documentation</h2>
                  <p className="text-xs text-muted-foreground">
                    Quick guide on media downloading, formats, and sidecar engines
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-foreground/90">
              {/* Feature 1 */}
              <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <span>How to Download High-Resolution Media</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Simply copy any link from YouTube (including Shorts), TikTok, or Instagram, paste it into the URL bar, select your desired resolution (up to 4K Ultra HD) or audio format (MP3 320k), and press <strong>"Start Download"</strong>.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>WhatsApp Status Reader</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  The application can inspect your local WhatsApp desktop or mobile cache to export high-definition statuses before the 24-hour expiration window closes.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                  <HardDrive className="w-4 h-4 text-blue-500" />
                  <span>FFmpeg Auto-Muxing Engine</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Modern 4K and 1080p streams are delivered by YouTube as separate video and audio tracks. Smart Auto Downloader automatically utilizes FFmpeg in the background to merge them into a pristine single MP4 file.
                </p>
              </div>

              {/* Feature 4: Error Handling */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Troubleshooting & Rate Limits</span>
                </div>
                <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                  If you encounter an HTTP 429 rate limit or private link error, the system will notify you with a friendly message. Try waiting a few moments, or check if the target post is public.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-border/60 bg-muted/30 flex items-center justify-between">
              <button
                type="button"
                onClick={() => openExternalUrl('https://github.com/parikesitad-pm')}
                className="inline-flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                <span>Report issue on GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium text-xs transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
