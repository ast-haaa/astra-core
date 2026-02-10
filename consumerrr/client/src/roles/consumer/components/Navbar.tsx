import { useLanguage } from "../LanguageContext";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeToggle } from "./ThemeToggle";
import { Leaf } from "lucide-react";

export function Navbar() {
  const { t } = useLanguage();

  return (
    <nav 
      className="w-full border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-20"
      data-testid="navbar"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 px-4 lg:px-6 py-3">
        <div className="flex items-center gap-2" data-testid="navbar-brand">
          <Leaf className="w-5 h-5 text-emerald-500" />
          <span className="text-lg sm:text-xl font-semibold text-emerald-600 dark:text-emerald-400" data-testid="text-app-title">
            {t("appTitle")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </div>
    </nav>
  );
}
