import { Truck } from "lucide-react";

export default function ResponsibilityCard() {
  return (
    <div className="
      bg-slate-50
      rounded-2xl
      border border-slate-200
      shadow-sm
      p-5 sm:p-6
    ">
      <div className="flex items-center gap-3 mb-3">
        <div className="
          w-8 h-8 rounded-full
          bg-emerald-500/15
          flex items-center justify-center
        ">
          <Truck className="w-4 h-4 text-emerald-600" />
        </div>

        <h3 className="text-sm font-semibold tracking-wide text-slate-900">
          QUALITY IMPACT SOURCE
        </h3>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-slate-700">
          Farm & Lab compliant
        </p>
        <p className="text-xs text-slate-500">
          Transport-stage deviation detected
        </p>
      </div>
    </div>
  );
}
