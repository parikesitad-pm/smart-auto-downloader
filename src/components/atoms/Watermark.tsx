import React from 'react';
import { Github, Heart } from 'lucide-react';
import { openExternalUrl } from '../../services/tauri';
import { useTranslation } from '../../store/languageStore';

export interface WatermarkProps {
  className?: string;
  githubUsername?: string;
}

export const Watermark: React.FC<WatermarkProps> = ({
  className = '',
  githubUsername = 'parikesitad-pm',
}) => {
  const { t } = useTranslation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openExternalUrl(`https://github.com/${githubUsername}`);
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`group inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer select-none rounded-lg px-2 py-1 hover:bg-accent/40 ${className}`}
      title="Open GitHub Profile"
    >
      <Github className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
      <span>
        {t('footer.createdBy')}{' '}
        <span className="font-semibold text-foreground group-hover:text-primary transition-colors underline-offset-4 group-hover:underline">
          {githubUsername}
        </span>
      </span>
      <Heart className="w-3 h-3 text-pink-500 fill-pink-500 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
    </button>
  );
};
