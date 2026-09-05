import React, { useState } from 'react';
import {
  Settings,
  Folder,
  Sparkles,
  Info,
  Globe,
  Activity,
  Zap,
} from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { useVersionStore } from '../store/versionStore';
import { useTranslation } from '../store/languageStore';
import { Button } from '../components/atoms/Button';
import { Badge } from '../components/atoms/Badge';
import { LanguageSelector } from '../components/molecules/LanguageSelector';
import { NetworkTestModal } from '../components/organisms/NetworkTestModal';
import { AudioFormat, VideoQuality } from '../types/download';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { edition, toggleEdition, version, commitHash } = useVersionStore();
  const { t } = useTranslation();
  const [isNetworkTestOpen, setIsNetworkTestOpen] = useState(false);

  const isPro = edition === 'Pro Studio';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              {t('settings.title')}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t('settings.subtitle')}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={resetSettings}
          className="text-xs text-muted-foreground cursor-pointer"
        >
          {t('settings.reset')}
        </Button>
      </div>

      {/* Section 1: Edition & Branding */}
      <div className="p-5 rounded-2xl border border-purple-500/30 bg-purple-500/[0.03] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                {t('settings.tierTitle')}
              </span>
              <Badge variant={isPro ? 'edition-pro' : 'edition-free'} size="sm">
                {edition}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('settings.tierDesc')}
            </p>
          </div>

          <Button
            variant={isPro ? 'outline' : 'gemini'}
            size="sm"
            onClick={toggleEdition}
            className="text-xs font-semibold cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Switch to {isPro ? 'Community' : 'Pro Studio'}</span>
          </Button>
        </div>
      </div>

      {/* Section 2: Interface Language */}
      <div className="p-5 rounded-2xl border border-border/70 bg-card space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-bold text-foreground">
                {t('settings.languageTitle')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('settings.languageDesc')}
            </p>
          </div>

          <LanguageSelector />
        </div>
      </div>

      {/* Section 3: Storage Preferences */}
      <div className="p-5 rounded-2xl border border-border/70 bg-card space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-foreground">
              {t('settings.storageTitle')}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('settings.storageDesc')}
            </p>
          </div>

          <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
            Auto-managed
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 rounded-xl bg-muted/50 border border-border font-mono text-xs text-muted-foreground truncate">
            {settings.downloadDirectory || '~/Downloads/SmartAutoDownloader'}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 text-xs font-medium cursor-pointer"
            onClick={() => {
              const newPath = prompt(
                'Masukkan direktori penyimpanan unduhan baru:'
              );
              if (newPath) updateSettings({ downloadDirectory: newPath });
            }}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>{t('settings.browseFolder')}</span>
          </Button>
        </div>
      </div>

      {/* Section 4: Download Engine Preferences */}
      <div className="p-5 rounded-2xl border border-border/70 bg-card space-y-4 shadow-sm">
        <div>
          <div className="text-xs font-bold text-foreground">
            {t('settings.downloadPrefTitle')}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('settings.downloadPrefDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t('settings.defaultVideoQuality')}
            </label>
            <select
              value={settings.defaultVideoQuality}
              onChange={(e) =>
                updateSettings({
                  defaultVideoQuality: e.target.value as VideoQuality,
                })
              }
              className="w-full h-10 px-3 text-xs rounded-xl border border-border bg-background font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
            >
              <option value="best">
                Kualitas Terbaik (Best / 4K / 2K / 1080p)
              </option>
              <option value="1080p">Full HD (1080p)</option>
              <option value="720p">HD (720p)</option>
              <option value="480p">SD (480p)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t('settings.defaultAudioBitrate')}
            </label>
            <select
              value={settings.defaultAudioFormat}
              onChange={(e) =>
                updateSettings({
                  defaultAudioFormat: e.target.value as AudioFormat,
                })
              }
              className="w-full h-10 px-3 text-xs rounded-xl border border-border bg-background font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
            >
              <option value="mp3_320k">MP3 320 kbps (High Quality)</option>
              <option value="mp3_192k">MP3 192 kbps (Standard)</option>
              <option value="m4a">M4A AAC (Apple Ecosystem)</option>
              <option value="wav">WAV (Uncompressed Studio Master)</option>
            </select>
          </div>
        </div>

        {/* Muxing toggle */}
        <div className="pt-2 border-t border-border/40 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-foreground">
              {t('settings.autoMuxingTitle')}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {t('settings.autoMuxingDesc')}
            </div>
          </div>

          <input
            type="checkbox"
            checked={settings.autoMuxing}
            onChange={(e) => updateSettings({ autoMuxing: e.target.checked })}
            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Section 5: Engine Turbo & Network Diagnostics */}
      <div className="p-5 rounded-2xl border border-border/70 bg-card space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-foreground">
                Turbo Engine & Uji Latensi CDN Jaringan
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Optimasi akselerasi multi-thread fragment 8x, buffer 64K, chunk
              10M, dan pengukuran latensi CDN media.
            </p>
          </div>

          <Button
            variant="gemini"
            size="sm"
            onClick={() => setIsNetworkTestOpen(true)}
            className="shrink-0 text-xs font-semibold cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Uji Kecepatan & Latensi</span>
          </Button>
        </div>
      </div>

      {/* Section 6: System & Build Information */}
      <div className="p-5 rounded-2xl border border-border/70 bg-card space-y-3 shadow-sm text-xs">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          <span>{t('settings.systemInfo')}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-0.5">
            <div className="text-[11px] text-muted-foreground">
              {t('settings.version')}
            </div>
            <div className="font-mono font-bold text-foreground">{version}</div>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-0.5">
            <div className="text-[11px] text-muted-foreground">
              {t('settings.commit')}
            </div>
            <div className="font-mono font-bold text-purple-600 dark:text-purple-400">
              #{commitHash}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-0.5">
            <div className="text-[11px] text-muted-foreground">
              {t('settings.architecture')}
            </div>
            <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              Tauri v2 + Tokio + Turbo Engine
            </div>
          </div>
        </div>
      </div>

      {/* Network Test Modal */}
      <NetworkTestModal
        isOpen={isNetworkTestOpen}
        onClose={() => setIsNetworkTestOpen(false)}
      />
    </div>
  );
};
