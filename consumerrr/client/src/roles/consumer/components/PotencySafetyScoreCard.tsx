import { Activity } from "lucide-react";

export default function PotencySafetyScoreCard() {
  const score = 68;

  const colorText =
    score >= 75 ? "text-emerald-600" :
    score >= 50 ? "text-emerald-600" :
    "text-red-600";

  const iconBg =
    score >= 75 ? "bg-emerald-500/10" :
    score >= 50 ? "bg-emerald-500/10" :
    "bg-red-500/10";

  return (
    <div className="bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconBg}`}>
          <Activity className={`w-4 h-4 ${colorText}`} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          POTENCY & SAFETY SCORE
        </h3>
      </div>

      <p className={`text-3xl font-bold ${colorText}`}>
        {score} / 100
      </p>

      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Potency reduced due to heat exposure
      </p>

    </div>
  );
}
