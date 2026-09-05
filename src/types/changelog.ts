export interface ChangelogCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

export interface ChangelogRelease {
  version: string;
  releaseDate: string;
  commitHash: string;
  tagline: string;
  isCurrent?: boolean;
  whatsNew: string[];
  improvementsAndFixes: string[];
  commitLog: ChangelogCommit[];
  breakingChanges?: string[];
}

export interface ChangelogData {
  latestVersion: string;
  currentVersion: string;
  releases: ChangelogRelease[];
}
