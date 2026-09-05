import React from 'react';
import { AppHeader } from '../organisms/AppHeader';
import { AppFooter } from '../organisms/AppFooter';
import { ChangelogModal } from '../organisms/ChangelogModal';
import { HelpModal } from '../organisms/HelpModal';

export interface MainLayoutProps {
  activeTab: 'downloader' | 'queue' | 'history' | 'settings';
  onTabChange: (tab: 'downloader' | 'queue' | 'history' | 'settings') => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  activeTab,
  onTabChange,
  children,
}) => {
  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Top Application Header */}
      <AppHeader activeTab={activeTab} onTabChange={onTabChange} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 transition-all">
        {children}
      </main>

      {/* Systematic Changelog & Updates Modal */}
      <ChangelogModal />

      {/* Documentation & Help Modal */}
      <HelpModal />

      {/* Bottom Footer Bar */}
      <AppFooter />
    </div>
  );
};
