import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Layers, Trash2 } from 'lucide-react';
import { useDownloadStore } from '../../store/downloadStore';
import { DownloadCard } from './DownloadCard';
import { Button } from '../atoms/Button';

export const QueueList: React.FC = () => {
  const { queue, clearCompletedQueue } = useDownloadStore();

  const hasCompletedOrCancelled = queue.some(
    (i) => i.status === 'completed' || i.status === 'cancelled'
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-secondary text-primary">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">
            Download Queue ({queue.length})
          </h3>
        </div>

        {hasCompletedOrCancelled && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCompletedQueue}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Completed</span>
          </Button>
        )}
      </div>

      {queue.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card/40 space-y-2">
          <Layers className="w-8 h-8 text-muted-foreground/40 mx-auto" />
          <p className="text-xs font-semibold text-foreground/80">No active downloads in queue</p>
          <p className="text-[11px] text-muted-foreground">
            Paste a link on the Downloader page to start instant streaming.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {queue.map((item) => (
              <DownloadCard key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
