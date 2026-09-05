import React, { useState, useEffect } from 'react';
import { Clipboard, X, Link2, Sparkles } from 'lucide-react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { detectPlatform, getPlatformMeta } from '../../services/platformDetector';
import { PlatformType } from '../../types/download';
import { useTranslation } from '../../store/languageStore';

export interface URLInputBarProps {
  url: string;
  onChange: (value: string) => void;
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

export const URLInputBar: React.FC<URLInputBarProps> = ({
  url,
  onChange,
  onSubmit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [detectedPlatform, setDetectedPlatform] = useState<PlatformType>('generic');

  useEffect(() => {
    setDetectedPlatform(detectPlatform(url));
  }, [url]);

  const platformMeta = getPlatformMeta(detectedPlatform);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(text.trim());
      }
    } catch (err) {
      console.warn('Clipboard read permission denied or unavailable:', err);
    }
  };

  const handleClear = () => {
    onChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="relative flex items-center group">
        <div className="absolute left-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          <Link2 className="w-5 h-5" />
        </div>

        <Input
          type="text"
          value={url}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder={t('downloader.inputPlaceholder')}
          className="pl-11 pr-24 h-13 text-sm rounded-2xl bg-card border-border/80 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-purple-500/40 focus-visible:border-purple-500"
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {url ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
              title={t('downloader.clearButton')}
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handlePaste}
              className="h-8 text-xs font-medium rounded-xl gap-1.5 cursor-pointer"
              title={t('downloader.pasteButton')}
            >
              <Clipboard className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{t('downloader.pasteButton')}</span>
            </Button>
          )}
        </div>
      </div>

      {url && (
        <div className="flex items-center justify-between px-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{t('downloader.detectedSource')}</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold border ${platformMeta.badgeColor}`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: platformMeta.iconColor }}
              />
              {platformMeta.displayName}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-muted-foreground/70">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>{platformMeta.features.join(' • ')}</span>
          </div>
        </div>
      )}
    </div>
  );
};
