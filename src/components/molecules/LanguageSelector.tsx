import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useTranslation, SupportedLanguage } from '../../store/languageStore';

export interface LanguageSelectorProps {
  className?: string;
  showIcon?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  showIcon = true,
}) => {
  const { language, setLanguage } = useTranslation();

  const languages: { code: SupportedLanguage; label: string; flag: string }[] = [
    { code: 'id', label: 'ID', flag: '🇮🇩' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
  ];

  return (
    <div
      className={`inline-flex items-center gap-1 p-1 rounded-xl bg-secondary/60 border border-border/50 text-xs font-semibold select-none ${className}`}
      title="Switch UI Language / Ganti Bahasa"
    >
      {showIcon && <Globe className="w-3.5 h-3.5 ml-1 text-muted-foreground shrink-0" />}

      <div className="flex items-center gap-0.5">
        {languages.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`relative px-2 py-1 rounded-lg transition-colors cursor-pointer text-xs font-bold ${
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeLangIndicator"
                  className="absolute inset-0 rounded-lg bg-card shadow-sm border border-border/60"
                  transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
