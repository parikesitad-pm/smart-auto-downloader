import React, { useState, useRef } from 'react';
import {
  Download,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  PlaySquare,
  Share2,
  FolderSync,
  ListVideo,
  Clock,
  User,
  Loader2,
  Activity,
} from 'lucide-react';
import { URLInputBar } from '../components/molecules/URLInputBar';
import { FormatSelector } from '../components/molecules/FormatSelector';
import { PlaylistModal } from '../components/organisms/PlaylistModal';
import { NetworkTestModal } from '../components/organisms/NetworkTestModal';
import { Button } from '../components/atoms/Button';
import { useDownloadStore } from '../store/downloadStore';
import { useSettingsStore } from '../store/settingsStore';
import { useTranslation } from '../store/languageStore';
import { triggerDownload, fetchMediaMetadata } from '../services/tauri';
import {
  AudioFormat,
  DownloadFormatType,
  MediaPreviewData,
  PlaylistItemInfo,
  VideoQuality,
} from '../types/download';
import { detectPlatform, getPlatformMeta } from '../services/platformDetector';

export interface DownloaderPageProps {
  onNavigateToQueue: () => void;
}

export const DownloaderPage: React.FC<DownloaderPageProps> = ({
  onNavigateToQueue,
}) => {
  const { t } = useTranslation();
  const { settings } = useSettingsStore();
  const { addToQueue, updateProgress, updateStatus } = useDownloadStore();

  const [url, setUrl] = useState('');
  const [formatType, setFormatType] = useState<DownloadFormatType>('video');
  const [videoQuality, setVideoQuality] = useState<VideoQuality>(
    settings.defaultVideoQuality || 'best'
  );
  const [audioFormat, setAudioFormat] = useState<AudioFormat>(
    settings.defaultAudioFormat || 'mp3_320k'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<MediaPreviewData | null>(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isNetworkTestOpen, setIsNetworkTestOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const debounceTimerRef = useRef<any>(null);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Analyze URL for thumbnail & media info
  const handleAnalyzeUrl = async (inputUrl: string) => {
    const trimmed = inputUrl.trim();
    if (!trimmed || !trimmed.startsWith('http')) {
      setPreviewData(null);
      setIsFetchingPreview(false);
      return;
    }

    setIsFetchingPreview(true);
    try {
      const data = await fetchMediaMetadata(trimmed);
      setPreviewData(data);
    } catch (err) {
      console.warn('Failed to fetch media preview:', err);
    } finally {
      setIsFetchingPreview(false);
    }
  };

  // Trigger analysis when URL changes (with debounce)
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!newUrl.trim()) {
      setPreviewData(null);
      setIsFetchingPreview(false);
      return;
    }

    if (newUrl.trim().startsWith('http')) {
      debounceTimerRef.current = setTimeout(() => {
        handleAnalyzeUrl(newUrl);
      }, 500);
    }
  };

  const handleStartDownload = async () => {
    if (!url.trim()) {
      showToast('error', 'Masukkan atau tempel link media terlebih dahulu.');
      return;
    }

    // If it's a playlist, open the playlist selection modal
    if (
      previewData?.isPlaylist &&
      previewData.items &&
      previewData.items.length > 0
    ) {
      setIsPlaylistModalOpen(true);
      return;
    }

    executeSingleDownload(url.trim(), previewData?.title);
  };

  const executeSingleDownload = (targetUrl: string, itemTitle?: string) => {
    const platform = detectPlatform(targetUrl);
    const cleanTitle =
      itemTitle ||
      (previewData?.title ? previewData.title : 'High Quality Media');

    setIsProcessing(true);

    const itemId = addToQueue({
      url: targetUrl,
      title: cleanTitle,
      platform,
      formatType,
      videoQuality: formatType === 'video' ? videoQuality : undefined,
      audioFormat: formatType === 'audio' ? audioFormat : undefined,
      thumbnailUrl: previewData?.thumbnail,
      duration: previewData?.duration,
    });

    showToast('success', `Memulai unduhan: ${cleanTitle}!`);
    setUrl('');
    setPreviewData(null);

    triggerDownload(
      {
        id: itemId,
        url: targetUrl,
        title: cleanTitle,
        platform,
        formatType,
        videoQuality,
        audioFormat,
        status: 'downloading',
        createdAt: Date.now(),
        thumbnailUrl: previewData?.thumbnail,
        duration: previewData?.duration,
        progress: {
          percentage: 0,
          downloadedBytes: 0,
          totalBytes: 0,
          speedBytesPerSec: 0,
          etaSeconds: 0,
        },
      },
      (progress) => {
        updateProgress(itemId, progress);
      },
      (outputPath) => {
        updateStatus(itemId, 'completed', undefined, outputPath);
        setIsProcessing(false);
      },
      (errorMessage) => {
        updateStatus(itemId, 'failed', errorMessage);
        setIsProcessing(false);
        showToast('error', `Download gagal: ${errorMessage}`);
      },
      settings.downloadDirectory
    );

    setTimeout(() => {
      onNavigateToQueue();
    }, 400);
  };

  // Batch download from Playlist Modal
  const handlePlaylistBatchDownload = (selectedItems: PlaylistItemInfo[]) => {
    if (selectedItems.length === 0) return;

    showToast(
      'success',
      `Menambahkan ${selectedItems.length} video playlist ke antrean unduhan...`
    );
    setUrl('');
    setPreviewData(null);

    selectedItems.forEach((item, index) => {
      const platform = detectPlatform(item.url);
      const itemId = addToQueue({
        url: item.url,
        title: item.title,
        platform,
        formatType,
        videoQuality: formatType === 'video' ? videoQuality : undefined,
        audioFormat: formatType === 'audio' ? audioFormat : undefined,
        thumbnailUrl: item.thumbnail,
        duration: item.duration,
      });

      // Stagger downloads slightly to prevent resource starvation
      setTimeout(() => {
        triggerDownload(
          {
            id: itemId,
            url: item.url,
            title: item.title,
            platform,
            formatType,
            videoQuality,
            audioFormat,
            status: 'downloading',
            createdAt: Date.now(),
            thumbnailUrl: item.thumbnail,
            duration: item.duration,
            progress: {
              percentage: 0,
              downloadedBytes: 0,
              totalBytes: 0,
              speedBytesPerSec: 0,
              etaSeconds: 0,
            },
          },
          (progress) => updateProgress(itemId, progress),
          (outputPath) =>
            updateStatus(itemId, 'completed', undefined, outputPath),
          (errorMessage) => updateStatus(itemId, 'failed', errorMessage),
          settings.downloadDirectory
        );
      }, index * 400);
    });

    setTimeout(() => {
      onNavigateToQueue();
    }, 400);
  };

  const handleSampleClick = (sampleUrl: string) => {
    setUrl(sampleUrl);
    handleAnalyzeUrl(sampleUrl);
  };

  const detectedPlatform = detectPlatform(url);
  const platformMeta = getPlatformMeta(detectedPlatform);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero Banner with Gemini Glow */}
      <div className="relative rounded-3xl p-6 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-blue-500/10 border border-purple-500/20 overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-semibold text-purple-600 dark:text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
              <span>{t('downloader.heroTag')}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {t('downloader.heroTitle')}
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
              {t('downloader.heroSubtitle')}
            </p>
          </div>

          <div className="flex sm:flex-col items-start gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsNetworkTestOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card/80 hover:bg-card border border-border/80 hover:border-purple-500/50 text-xs font-bold text-foreground transition-all shadow-sm group cursor-pointer"
            >
              <Activity className="w-4 h-4 text-blue-500 group-hover:animate-pulse" />
              <span>Diagnostik Jaringan</span>
            </button>
          </div>
        </div>

        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Toast notification banner */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-medium border flex items-center justify-between transition-all ${
            toastMessage.type === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
              : toastMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* URL Input Bar */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <PlaySquare className="w-3.5 h-3.5 text-purple-500" />
          <span>{t('downloader.sourceLinkLabel')}</span>
        </label>

        <URLInputBar
          url={url}
          onChange={handleUrlChange}
          onSubmit={handleStartDownload}
          isLoading={isProcessing || isFetchingPreview}
        />

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground/70">
            {t('downloader.quickTests')}
          </span>
          <button
            type="button"
            onClick={() =>
              handleSampleClick('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
            }
            className="px-2 py-0.5 rounded-md bg-secondary hover:bg-secondary/80 border border-border/40 cursor-pointer text-foreground/80 hover:text-foreground"
          >
            YouTube 4K Sample
          </button>
          <button
            type="button"
            onClick={() =>
              handleSampleClick(
                'https://www.tiktok.com/@sample/video/123456789'
              )
            }
            className="px-2 py-0.5 rounded-md bg-secondary hover:bg-secondary/80 border border-border/40 cursor-pointer text-foreground/80 hover:text-foreground"
          >
            TikTok Sample
          </button>
          <button
            type="button"
            onClick={() =>
              handleSampleClick('https://www.instagram.com/reel/C3abcxyz/')
            }
            className="px-2 py-0.5 rounded-md bg-secondary hover:bg-secondary/80 border border-border/40 cursor-pointer text-foreground/80 hover:text-foreground"
          >
            Instagram Reel
          </button>
        </div>
      </div>

      {/* Loading Shimmer while fetching metadata */}
      {isFetchingPreview && (
        <div className="p-5 rounded-3xl border border-purple-500/30 bg-purple-500/[0.03] animate-pulse flex items-center gap-4">
          <div className="w-24 h-16 rounded-2xl bg-muted/80 flex items-center justify-center shrink-0">
            <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted/80 rounded-md w-3/4" />
            <div className="h-3 bg-muted/60 rounded-md w-1/3" />
          </div>
        </div>
      )}

      {/* Media Preview Card (Single Video or Playlist Overview) */}
      {previewData && !isFetchingPreview && (
        <div className="rounded-3xl border border-purple-500/30 bg-card p-5 shadow-sm space-y-4 transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Thumbnail */}
            <div className="relative w-full sm:w-48 aspect-video sm:aspect-video rounded-2xl overflow-hidden bg-muted shrink-0 border border-border/60 group">
              {previewData.thumbnail ? (
                <img
                  src={previewData.thumbnail}
                  alt={previewData.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <PlaySquare className="w-8 h-8 text-muted-foreground/60" />
                </div>
              )}
              {previewData.duration && (
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/85 text-[10px] font-mono text-white font-bold flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{previewData.duration}</span>
                </span>
              )}
            </div>

            {/* Video Info */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${platformMeta.badgeColor}`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: platformMeta.iconColor }}
                  />
                  {platformMeta.displayName}
                </span>

                {previewData.isPlaylist && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/30">
                    <ListVideo className="w-3 h-3" />
                    <span>
                      Playlist ({previewData.items?.length || 0} videos)
                    </span>
                  </span>
                )}
              </div>

              <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug line-clamp-2">
                {previewData.title}
              </h3>

              {previewData.uploader && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="w-3.5 h-3.5" />
                  <span>{previewData.uploader}</span>
                </div>
              )}

              {/* Playlist Action Trigger */}
              {previewData.isPlaylist &&
                previewData.items &&
                previewData.items.length > 0 && (
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPlaylistModalOpen(true)}
                      className="gap-1.5 text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      <ListVideo className="w-3.5 h-3.5 text-purple-500" />
                      <span>
                        Pilih Item Video Playlist ({previewData.items.length})
                      </span>
                    </Button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Format & Quality Selector (Contextual: Appears after preview or when link is entered) */}
      {(previewData || url.trim()) && (
        <div className="space-y-4 animate-fadeIn">
          <FormatSelector
            formatType={formatType}
            onFormatTypeChange={setFormatType}
            videoQuality={videoQuality}
            onVideoQualityChange={setVideoQuality}
            audioFormat={audioFormat}
            onAudioFormatChange={setAudioFormat}
          />

          {/* Action Button */}
          <div className="pt-1">
            <Button
              type="button"
              variant="gemini"
              size="lg"
              onClick={handleStartDownload}
              isLoading={isProcessing || isFetchingPreview}
              className="w-full h-13 text-sm font-bold rounded-2xl gap-2 shadow-lg shadow-purple-500/25 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>
                {isProcessing
                  ? t('downloader.btnAnalyzing')
                  : previewData?.isPlaylist
                    ? `Download Playlist (${previewData.items?.length || 0} Video)`
                    : formatType === 'video'
                      ? `Start Download (${videoQuality.toUpperCase()} MP4)`
                      : `Start Download (${audioFormat.toUpperCase()})`}
              </span>
            </Button>
          </div>
        </div>
      )}

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3.5 rounded-2xl border border-border/60 bg-card/60 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('downloader.feature4kTitle')}</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {t('downloader.feature4kDesc')}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl border border-border/60 bg-card/60 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Share2 className="w-3.5 h-3.5 text-blue-500" />
            <span>{t('downloader.featureTiktokTitle')}</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {t('downloader.featureTiktokDesc')}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl border border-border/60 bg-card/60 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <FolderSync className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t('downloader.featureWaTitle')}</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {t('downloader.featureWaDesc')}
          </p>
        </div>
      </div>

      {/* Playlist Selection Modal */}
      {previewData?.isPlaylist && previewData.items && (
        <PlaylistModal
          isOpen={isPlaylistModalOpen}
          onClose={() => setIsPlaylistModalOpen(false)}
          playlistTitle={previewData.title}
          items={previewData.items}
          onConfirmDownload={handlePlaylistBatchDownload}
        />
      )}

      {/* Network Test & Speed Diagnostic Modal */}
      <NetworkTestModal
        isOpen={isNetworkTestOpen}
        onClose={() => setIsNetworkTestOpen(false)}
      />
    </div>
  );
};
