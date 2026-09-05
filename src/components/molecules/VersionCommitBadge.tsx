import React from 'react';
import { Sparkles } from 'lucide-react';
import { Badge } from '../atoms/Badge';
import { useVersionStore } from '../../store/versionStore';

export const VersionCommitBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { edition, version, toggleEdition } = useVersionStore();

  const isPro = edition === 'Pro Studio';

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <button
        type="button"
        onClick={toggleEdition}
        title="Click to toggle between Community Free & Pro Studio edition"
        className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full transition-transform active:scale-95"
      >
        <Badge
          variant={isPro ? 'edition-pro' : 'edition-free'}
          size="sm"
          className="shadow-sm transition-all hover:scale-105"
        >
          {isPro ? (
            <>
              <Sparkles className="w-3 h-3 text-pink-400 animate-pulse" />
              <span>{version} Pro Studio</span>
            </>
          ) : (
            <>
              <span>{version} Community</span>
            </>
          )}
        </Badge>
      </button>
    </div>
  );
};
