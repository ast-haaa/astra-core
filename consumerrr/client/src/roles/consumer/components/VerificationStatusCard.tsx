import { ShieldCheck } from "lucide-react";

export default function VerificationStatusCard() {
  const status: string = "CONDITIONALLY SAFE";

  let colorText = "text-emerald-600";
  let iconBg = "bg-emerald-500/10";
  let iconColor = "text-emerald-600";

  if (status === "AYUSH-COMPLIANT") {
    colorText = "text-emerald-600";
    iconBg = "bg-emerald-500/10";
    iconColor = "text-emerald-600";
  }

  if (status === "RECALLED / NOT COMPLIANT") {
    colorText = "text-red-600";
    iconBg = "bg-red-500/10";
    iconColor = "text-red-600";
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconBg}`}>
          <ShieldCheck className={`w-4 h-4 ${iconColor}`} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          AYUSH VERIFICATION STATUS
        </h3>
      </div>

      <p className={`text-xl font-bold ${colorText}`}>
        {status}
      </p>
    </div>
  );
}
