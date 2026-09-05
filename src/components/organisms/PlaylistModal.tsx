import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckSquare, Square, Download, ListVideo, Clock, Play } from 'lucide-react';
import { Button } from '../atoms/Button';
import { PlaylistItemInfo } from '../../types/download';
import { useTranslation } from '../../store/languageStore';

export interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistTitle: string;
  items: PlaylistItemInfo[];
  onConfirmDownload: (selectedItems: PlaylistItemInfo[]) => void;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({
  isOpen,
  onClose,
  playlistTitle,
  items: initialItems,
  onConfirmDownload,
}) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<PlaylistItemInfo[]>(initialItems);

  // Sync state if initialItems change
  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const selectedCount = items.filter((i) => i.selected).length;
  const isAllSelected = selectedCount === items.length && items.length > 0;

  const handleToggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleSelectAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: true })));
  };

  const handleDeselectAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: false })));
  };

  const handleDownload = () => {
    const selected = items.filter((i) => i.selected);
    if (selected.length > 0) {
      onConfirmDownload(selected);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-border/80 bg-card shadow-2xl shadow-purple-500/10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border/60 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-md shadow-purple-500/20">
                <ListVideo className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground line-clamp-1">
                  {playlistTitle || t('playlist.title')}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t('playlist.selectedCount', { count: selectedCount })} / {items.length} total
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Selection Toolbar */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-secondary/40 border-b border-border/40 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={isAllSelected ? handleDeselectAll : handleSelectAll}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card hover:bg-muted border border-border/60 font-medium text-foreground transition-colors cursor-pointer"
              >
                {isAllSelected ? (
                  <>
                    <Square className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{t('playlist.deselectAll')}</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-purple-500" />
                    <span>{t('playlist.selectAll')}</span>
                  </>
                )}
              </button>
            </div>

            <span className="text-[11px] text-muted-foreground font-medium">
              Centang video yang ingin diunduh
            </span>
          </div>

          {/* Video List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-border/20">
            {items.map((item, index) => (
              <div
                key={item.id || index}
                onClick={() => handleToggleItem(item.id)}
                className={`flex items-center gap-3.5 p-3 rounded-2xl transition-all cursor-pointer select-none border ${
                  item.selected
                    ? 'bg-purple-500/[0.06] border-purple-500/30'
                    : 'bg-card/50 hover:bg-muted/40 border-transparent'
                }`}
              >
                {/* Checkbox */}
                <div className="shrink-0 text-purple-600 dark:text-purple-400">
                  {item.selected ? (
                    <CheckSquare className="w-5 h-5 fill-purple-500/20 text-purple-500" />
                  ) : (
                    <Square className="w-5 h-5 text-muted-foreground/60" />
                  )}
                </div>

                {/* Index badge */}
                <span className="text-xs font-mono font-bold text-muted-foreground/60 w-5 text-center shrink-0">
                  {index + 1}
                </span>

                {/* Thumbnail Preview */}
                <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/40">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary">
                      <Play className="w-4 h-4 text-muted-foreground/60" />
                    </div>
                  )}
                  {item.duration && (
                    <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded bg-black/80 text-[9px] font-mono text-white font-semibold">
                      {item.duration}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-foreground line-clamp-1">
                    {item.title}
                  </h4>
                  {item.duration && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{item.duration}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-4 border-t border-border/60 bg-muted/20">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs cursor-pointer"
            >
              {t('changelog.close') || 'Batal'}
            </Button>

            <Button
              type="button"
              variant="gemini"
              size="md"
              disabled={selectedCount === 0}
              onClick={handleDownload}
              className="gap-2 text-xs font-bold rounded-xl shadow-md shadow-purple-500/20 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t('playlist.btnDownloadBatch')} ({selectedCount})</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};