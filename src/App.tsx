import React, { useState, useEffect } from 'react';
import { MainLayout } from './components/templates/MainLayout';
import { DownloaderPage } from './pages/DownloaderPage';
import { QueuePage } from './pages/QueuePage';
import { SettingsPage } from './pages/SettingsPage';
import { HistoryTable } from './components/organisms/HistoryTable';
import { setupTauriProgressListener } from './services/tauri';
import { useDownloadStore } from './store/downloadStore';
import { useThemeStore } from './store/themeStore';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'downloader' | 'queue' | 'history' | 'settings'>('downloader');
  const { updateProgress, updateStatus } = useDownloadStore();
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Re-synchronize theme on mount
    setTheme(theme);

    // Setup Tauri v2 backend event listener
    let cleanup: (() => void) | undefined;
    setupTauriProgressListener(
      ({ id, progress }) => {
        updateProgress(id, progress);
      },
      ({ id, outputPath }) => {
        updateStatus(id, 'completed', undefined, outputPath);
      },
      ({ id, error }) => {
        updateStatus(id, 'failed', error);
      }
    ).then((unlisten) => {
      cleanup = unlisten;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'downloader' && (
        <DownloaderPage onNavigateToQueue={() => setActiveTab('queue')} />
      )}
      {activeTab === 'queue' && <QueuePage />}
      {activeTab === 'history' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <HistoryTable />
        </div>
      )}
      {activeTab === 'settings' && <SettingsPage />}
    </MainLayout>
  );
};

export default App;
