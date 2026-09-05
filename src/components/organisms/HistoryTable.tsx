import React from 'react';
import { History, FolderOpen, Trash2, CheckCircle2, Film, Music2 } from 'lucide-react';
import { useDownloadStore } from '../../store/downloadStore';
import { Button } from '../atoms/Button';
import { openDownloadFolderNative } from '../../services/tauri';
import { formatBytes } from '../molecules/DownloadStats';
import { getPlatformMeta } from '../../services/platformDetector';

export const HistoryTable: React.FC = () => {
  const { history, clearHistory } = useDownloadStore();

  const handleOpenFolder = (path?: string) => {
    openDownloadFolderNative(path);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-secondary text-primary">
            <History className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">
            Download History ({history.length})
          </h3>
        </div>

        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-xs text-muted-foreground hover:text-red-500"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card/40 space-y-2">
          <History className="w-8 h-8 text-muted-foreground/40 mx-auto" />
          <p className="text-xs font-semibold text-foreground/80">No completed downloads yet</p>
          <p className="text-[11px] text-muted-foreground">
            Finished downloads will be recorded here with instant file finder actions.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border/60">
                <tr>
                  <th className="py-3 px-4 font-semibold">Media Title</th>
                  <th className="py-3 px-4 font-semibold">Platform</th>
                  <th className="py-3 px-4 font-semibold">Format</th>
                  <th className="py-3 px-4 font-semibold">Size</th>
                  <th className="py-3 px-4 font-semibold">Completed Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {history.map((item) => {
                  const meta = getPlatformMeta(item.platform);
                  const dateStr = item.completedAt
                    ? new Date(item.completedAt).toLocaleString()
                    : 'Recently';

                  return (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground max-w-xs truncate">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${meta.badgeColor}`}
                        >
                          {meta.displayName}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5 text-muted-foreground">
                          {item.formatType === 'video' ? (
                            <Film className="w-3 h-3 text-blue-500" />
                          ) : (
                            <Music2 className="w-3 h-3 text-purple-500" />
                          )}
                          <span className="font-mono uppercase">
                            {item.formatType === 'video'
                              ? item.videoQuality || 'MP4'
                              : item.audioFormat?.replace('_', ' ') || 'MP3'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {formatBytes(item.progress.totalBytes || 45 * 1024 * 1024)}
                      </td>

                      <td className="py-3 px-4 text-muted-foreground">{dateStr}</td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenFolder(item.outputPath)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary/80 hover:bg-secondary text-foreground text-xs font-medium transition-colors cursor-pointer"
                        >
                          <FolderOpen className="w-3 h-3 text-primary" />
                          <span>Show in Folder</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
