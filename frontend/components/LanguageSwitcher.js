import { useLang } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
  const { lang, toggleLang } = useLang();

  return (
    <button
      onClick={toggleLang}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 transition-all"
      aria-label="Switch language"
    >
      {lang === 'en' ? 'AR' : 'EN'}
    </button>
  );
}
