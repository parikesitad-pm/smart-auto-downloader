import React from 'react';
import { GitCommit, Tag } from 'lucide-react';
import { useVersionStore } from '../../store/versionStore';

export interface VersionTagProps {
  className?: string;
  showIcon?: boolean;
  onClick?: () => void;
}

export const VersionTag: React.FC<VersionTagProps> = ({
  className = '',
  showIcon = true,
  onClick,
}) => {
  const { version, commitHash } = useVersionStore();

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      className={`inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground/80 bg-muted/40 hover:bg-muted/80 border border-border/40 rounded-md px-2 py-0.5 transition-colors ${
        onClick ? 'cursor-pointer hover:text-foreground' : ''
      } ${className}`}
      title={`Release ${version} - Git Commit ${commitHash}`}
    >
      {showIcon && <Tag className="w-3 h-3 text-muted-foreground" />}
      <span className="font-semibold text-foreground/90">{version}</span>
      <span className="text-muted-foreground/40">•</span>
      <GitCommit className="w-3 h-3 text-purple-400" />
      <span className="text-purple-600 dark:text-purple-400 font-medium">#{commitHash}</span>
    </div>
  );
};
