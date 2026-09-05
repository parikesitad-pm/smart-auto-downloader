export type AppEdition = 'Community Free' | 'Pro Studio';

export type BackendStatus = 'ready' | 'downloading' | 'error' | 'initializing';

export interface BuildInfo {
  version: string;
  commitHash: string;
  buildTime: string;
  edition: AppEdition;
  platform: 'windows' | 'macos' | 'linux' | 'web';
  rustVersion?: string;
  tauriVersion?: string;
}
