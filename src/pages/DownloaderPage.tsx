import React, { useState } from 'react';
import {
  Download,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  PlaySquare,
  Share2,
  FolderSync,
} from 'lucide-react';
import { URLInputBar } from '../components/molecules/URLInputBar';
import { FormatSelector } from '../components/molecules/FormatSelector';
import { Button } from '../components/atoms/Button';
import { useDownloadStore } from '../store/downloadStore';
import { triggerDownload } from '../services/tauri';
import { AudioFormat, DownloadFormatType, VideoQuality } from '../types/download';
import { detectPlatform } from '../services/platformDetector';

export interface DownloaderPageProps {
  onNavigateToQueue: () => void;
}

export const DownloaderPage: React.FC<DownloaderPageProps> = ({ onNavigateToQueue }) => {
  const [url, setUrl] = useState('');
  const [formatType, setFormatType] = useState<DownloadFormatType>('video');
  const [videoQuality, setVideoQuality] = useState<VideoQuality>('best');
  const [audioFormat, setAudioFormat] = useState<AudioFormat>('mp3_320k');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const { addToQueue, updateProgress, updateStatus } = useDownloadStore();

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleStartDownload = async () => {
    if (!url.trim()) {
      showToast('error', 'Please enter or paste a valid media URL first.');
      return;
    }

    const platform = detectPlatform(url);

    // Generate descriptive media title based on platform and time
    const cleanUrl = url.trim();
    let mediaTitle = 'High Quality Stream';
    if (platform === 'youtube') mediaTitle = 'YouTube Video Stream';
    else if (platform === 'tiktok') mediaTitle = 'TikTok No-Watermark Clip';
    else if (platform === 'instagram') mediaTitle = 'Instagram Reel Video';
    else if (platform === 'whatsapp') mediaTitle = 'WhatsApp Status Media';

    setIsProcessing(true);

    const itemId = addToQueue({
      url: cleanUrl,
      title: mediaTitle,
      platform,
      formatType,
      videoQuality: formatType === 'video' ? videoQuality : undefined,
      audioFormat: formatType === 'audio' ? audioFormat : undefined,
    });

    showToast('success', `Download initialized for ${mediaTitle}!`);
    setUrl('');

    // Trigger download execution via Tauri sidecar (or web simulation)
    triggerDownload(
      {
        id: itemId,
        url: cleanUrl,
        title: mediaTitle,
        platform,
        formatType,
        videoQuality,
        audioFormat,
        status: 'downloading',
        createdAt: Date.now(),
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
        showToast('error', `Download failed: ${errorMessage}`);
      }
    );

    // Navigate to Queue page so user sees the active download
    setTimeout(() => {
      onNavigateToQueue();
    }, 400);
  };

  const handleSampleClick = (sampleUrl: string) => {
    setUrl(sampleUrl);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero Banner with Gemini Glow */}
      <div className="relative rounded-3xl p-6 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-blue-500/10 border border-purple-500/20 overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-semibold text-purple-600 dark:text-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
            <span>Smart Multi-Platform Engine v1</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Download Any Video or Audio in Maximum Quality
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
            Directly supports YouTube (4K & Shorts), Instagram Reels, TikTok (No-Watermark), and WhatsApp Status with instant FFmpeg auto-muxing.
          </p>
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
          <span>Media Source Link</span>
        </label>

        <URLInputBar
          url={url}
          onChange={setUrl}
          onSubmit={handleStartDownload}
          isLoading={isProcessing}
        />

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground/70">Quick tests:</span>
          <button
            type="button"
            onClick={() => handleSampleClick('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
            className="px-2 py-0.5 rounded-md bg-secondary hover:bg-secondary/80 border border-border/40 cursor-pointer text-foreground/80 hover:text-foreground"
          >
            YouTube Sample
          </button>
          <button
            type="button"
            onClick={() => handleSampleClick('https://www.tiktok.com/@sample/video/123456789')}
            className="px-2 py-0.5 rounded-md bg-secondary hover:bg-secondary/80 border border-border/40 cursor-pointer text-foreground/80 hover:text-foreground"
          >
            TikTok Sample
          </button>
          <button
            type="button"
            onClick={() => handleSampleClick('https://www.instagram.com/reel/C3abcxyz/')}
            className="px-2 py-0.5 rounded-md bg-secondary hover:bg-secondary/80 border border-border/40 cursor-pointer text-foreground/80 hover:text-foreground"
          >
            Instagram Reel
          </button>
        </div>
      </div>

      {/* Format & Quality Selector */}
      <FormatSelector
        formatType={formatType}
        onFormatTypeChange={setFormatType}
        videoQuality={videoQuality}
        onVideoQualityChange={setVideoQuality}
        audioFormat={audioFormat}
        onAudioFormatChange={setAudioFormat}
      />

      {/* Action Button */}
      <div className="pt-2">
        <Button
          type="button"
          variant="gemini"
          size="lg"
          onClick={handleStartDownload}
          isLoading={isProcessing}
          className="w-full h-13 text-sm font-bold rounded-2xl gap-2 shadow-lg shadow-purple-500/25 cursor-pointer"
        >
          <Download className="w-5 h-5" />
          <span>Start Download & Muxing</span>
        </Button>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3.5 rounded-2xl border border-border/60 bg-card/60 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>4K Ultra HD Engine</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Extracts pristine 2160p resolution with zero compression artefacts.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl border border-border/60 bg-card/60 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Share2 className="w-3.5 h-3.5 text-blue-500" />
            <span>No-Watermark TikTok</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Removes brand overlays and saves videos directly in crisp MP4 format.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl border border-border/60 bg-card/60 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <FolderSync className="w-3.5 h-3.5 text-emerald-500" />
            <span>WhatsApp Status Extractor</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Reads local status cache before 24h expiration automatically.
          </p>
        </div>
      </div>
    </div>
  );
};
