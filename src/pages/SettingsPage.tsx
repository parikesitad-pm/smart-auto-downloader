import React from 'react';
import {
  Settings,
  Folder,
  Sparkles,
  Layers,
  Info,
} from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { useVersionStore } from '../store/versionStore';
import { Button } from '../components/atoms/Button';
import { Badge } from '../components/atoms/Badge';
import { AudioFormat, VideoQuality } from '../types/download';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { edition, toggleEdition, version, commitHash } = useVersionStore();

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
            <h2 className="text-base font-bold text-foreground">Preferences & Engine Config</h2>
            <p className="text-xs text-muted-foreground">
              Customize output paths, audio bitrates, and background sidecars
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={resetSettings}
          className="text-xs text-muted-foreground"
        >
          Reset Defaults
        </Button>
      </div>

      {/* Section 1: Edition & Branding */}
      <div className="p-5 rounded-2xl border border-purple-500/30 bg-purple-500/[0.03] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Active Application Tier</span>
              <Badge variant={isPro ? 'edition-pro' : 'edition-free'} size="sm">
                {edition}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Switch between Community Free and Pro Studio edition features.
            </p>
          </div>

          <Button
            variant={isPro ? 'outline' : 'gemini'}
            size="sm"
            onClick={toggleEdition}
            className="text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Switch to {isPro ? 'Community' : 'Pro Studio'}</span>
          </Button>
        </div>
      </div>

      {/* Section 2: Download Directories */}
      <div className="p-5 rounded-2xl border border-border/70 bg-card space-y-4 shadow-sm">
        <div className="space-y-1">
          <label className="text-xs font-bold text-foreground flex items-center gap-2">
            <Folder className="w-4 h-4 text-primary" />
            <span>Save Location</span>
          </label>
          <p className="text-xs text-muted-foreground">
            Target folder where all videos and MP3 files will be stored.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={settings.downloadDirectory}
            onChange={(e) => updateSettings({ downloadDirectory: e.target.value })}
            className="flex-1 h-10 px-3 text-xs rounded-xl border border-border bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => updateSettings({ downloadDirectory: 'C:/Downloads/SmartAutoDownloader' })}
            className="text-xs font-semibold shrink-0"
          >
            Set Default
          </Button>
        </div>
      </div>

      {/* Section 3: Default Formats */}
      <div className="p-5 rounded-2xl border border-border/70 bg-card space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-500" />
          <span>Default Quality & Formats</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Default Video Quality
            </label>
            <select
              value={settings.defaultVideoQuality}
              onChange={(e) =>
                updateSettings({ defaultVideoQuality: e.target.value as VideoQuality })
              }
              className="w-full h-10 px-3 text-xs rounded-xl border border-border bg-background font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
            >
              <option value="best">Best Quality (Auto Max)</option>
              <option value="2160p">4K Ultra HD (2160p)</option>
              <option value="1440p">2K Quad HD (1440p)</option>
              <option value="1080p">Full HD (1080p)</option>
              <option value="720p">HD (720p)</option>
              <option value="480p">SD (480p)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Default Audio Bitrate
            </label>
            <select
              value={settings.defaultAudioFormat}
              onChange={(e) =>
                updateSettings({ defaultAudioFormat: e.target.value as AudioFormat })
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
              Automated FFmpeg Sidecar Muxing
            </div>
            <div className="text-[11px] text-muted-foreground">
              Merges separate video & audio streams into a single MP4 automatically.
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

      {/* Section 4: System & Build Information */}
      <div className="p-5 rounded-2xl border border-border/70 bg-card space-y-3 shadow-sm text-xs">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          <span>System & Build Information</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-0.5">
            <div className="text-[11px] text-muted-foreground">Semantic Version</div>
            <div className="font-mono font-bold text-foreground">{version}</div>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-0.5">
            <div className="text-[11px] text-muted-foreground">Git Commit Hash</div>
            <div className="font-mono font-bold text-purple-600 dark:text-purple-400">
              #{commitHash}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-0.5">
            <div className="text-[11px] text-muted-foreground">Backend Architecture</div>
            <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              Tauri v2 + Tokio
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
