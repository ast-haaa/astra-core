import { useLanguage } from "../LanguageContext";
import { type Lang } from "../i18n";

const languages: Lang[] = ["EN", "HI", "MR", "GU"];

export function LanguageSelector() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1" data-testid="language-selector">
      {languages.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          data-testid={`button-lang-${l.toLowerCase()}`}
          className={`
            px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200
            ${lang === l 
              ? "bg-emerald-500 text-white" 
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }
          `}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
