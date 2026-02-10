import { AlertCircle } from "lucide-react";

export default function KeyVerdictCard() {
  const verdict = "Consume Soon";

  return (
    <div className="bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <AlertCircle className="w-4 h-4 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          VERDICT
        </h3>
      </div>

      <p className="text-xl font-bold text-emerald-600">
        {verdict}
      </p>
      <p className="text-xs text-slate-500 mt-2">
  Final decision backed by immutable event records.
</p>

    </div>
  );
}
