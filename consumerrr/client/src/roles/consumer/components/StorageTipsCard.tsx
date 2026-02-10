import { useLanguage } from "../LanguageContext";
import { Lightbulb, Sun, Snowflake, Clock } from "lucide-react";

export function StorageTipsCard() {
  const { t } = useLanguage();

  const tips = [
    { icon: Snowflake, text: t("storageTip1") },
    { icon: Sun, text: t("storageTip2") },
    { icon: Clock, text: t("storageTip3") },
  ];

  return (
    <div 
      className="bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-4 sm:p-5 md:p-6"
      data-testid="card-storage-tips"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50">
          {t("storageTipsTitle")}
        </h3>
      </div>
      
      <ul className="space-y-3">
        {tips.map((tip, index) => {
          const Icon = tip.icon;
          return (
            <li 
              key={index}
              className="flex items-start gap-3 text-sm sm:text-base text-slate-700 dark:text-slate-200/90"
            >
              <Icon className="w-4 h-4 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <span>{tip.text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
