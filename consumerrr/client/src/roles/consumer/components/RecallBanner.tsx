import { useState } from "react";
import { useLanguage } from "../LanguageContext";
import { type RecallInfo } from "../mockData";
import { AlertTriangle, Trash2, Package } from "lucide-react";

interface RecallBannerProps {
  recall: RecallInfo;
}

export function RecallBanner({ recall }: RecallBannerProps) {
  const { t } = useLanguage();
  const [response, setResponse] = useState<"discard" | "have" | null>(null);

  if (!recall.isRecalled) return null;

  return (
    <div 
      className="bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-300 dark:border-red-500/40 shadow-lg p-4 sm:p-5 md:p-6"
      data-testid="banner-recall"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-red-600 dark:text-red-400">
          {t("recallTitle")}
        </h3>
      </div>
      
      <p className="text-sm">
  This batch has been officially recalled due to quality risk.
</p>

      
      {!response ? (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setResponse("discard")}
            data-testid="button-discard"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-red-400 transition"
          >
            <Trash2 className="w-4 h-4" />
            {t("discardButton")}
          </button>
          <button
            onClick={() => setResponse("have")}
            data-testid="button-still-have"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-400 dark:border-slate-600 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Package className="w-4 h-4" />
            {t("stillHaveButton")}
          </button>
        </div>
      ) : (
        <div className="p-4 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-700 dark:text-slate-200">
            {response === "discard" ? t("recallThanksDiscard") : t("recallThanksHave")}
          </p>
        </div>
      )}
    </div>
  );
}
