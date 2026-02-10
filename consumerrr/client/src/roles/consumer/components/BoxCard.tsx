import { useLanguage } from "../LanguageContext";
import { type HerbBox } from "../mockData";
import { ChevronRight, Leaf, AlertTriangle } from "lucide-react";

interface BoxCardProps {
  box: HerbBox;
  onClick: () => void;
}

export function BoxCard({ box, onClick }: BoxCardProps) {
  const { t } = useLanguage();
  const isRecalled = box.status === "RECALLED";

  return (
    <button
      onClick={onClick}
      data-testid={`card-box-${box.boxId}`}
      className={`
        w-full text-left bg-white dark:bg-slate-900/80 rounded-2xl border shadow-lg p-4 sm:p-5
        transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
        group cursor-pointer
        ${isRecalled ? "border-red-500/40" : "border-slate-200 dark:border-slate-800 hover:border-emerald-500/50"}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${isRecalled ? "bg-red-500/10" : "bg-emerald-500/10"}
            `}>
              {isRecalled ? (
                <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />
              ) : (
                <Leaf className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {box.herbName}
            </h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate mb-3">
            {box.boxId}
          </p>
          <div className="flex items-center gap-3">
            <span className={`
              inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border
              ${isRecalled 
                ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/40" 
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/40"
              }
            `}>
              {isRecalled ? t("statusRecalled") : t("statusSafe")}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {t("demoHint")}
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}
