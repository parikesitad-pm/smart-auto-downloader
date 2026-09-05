import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import idLocale from '../locales/id.json';
import enLocale from '../locales/en.json';

export type SupportedLanguage = 'id' | 'en';

type LocaleSchema = typeof idLocale;

const translations: Record<SupportedLanguage, LocaleSchema> = {
  id: idLocale,
  en: enLocale,
};

interface LanguageState {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: (keyPath: string, params?: Record<string, string | number>) => string;
}

// Helper to resolve nested keys like "header.appName"
const getNestedTranslation = (obj: any, path: string): string | undefined => {
  return path.split('.').reduce((prev, curr) => prev?.[curr], obj);
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'id', // Default to Indonesian
      setLanguage: (lang) => set({ language: lang }),
      toggleLanguage: () =>
        set((state) => ({
          language: state.language === 'id' ? 'en' : 'id',
        })),
      t: (keyPath, params) => {
        const lang = get().language;
        const dict = translations[lang] || translations.id;
        let text = getNestedTranslation(dict, keyPath);

        // Fallback to English then keyPath
        if (!text && lang !== 'en') {
          text = getNestedTranslation(translations.en, keyPath);
        }

        if (!text) return keyPath;

        if (params) {
          Object.entries(params).forEach(([k, v]) => {
            text = text!.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
          });
        }

        return text;
      },
    }),
    {
      name: 'smart-auto-downloader-language',
    }
  )
);

// Convenient custom hook for functional components
export const useTranslation = () => {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);
  const t = useLanguageStore((state) => state.t);

  return { language, setLanguage, toggleLanguage, t };
};
