import { Sample } from "@shared/schema";
import { StatusPill } from "@/components/ui/StatusPill";
import { useLanguage } from "@/lib/i18n";
import { useRecalls } from "@/hooks/use-recalls";
import { format } from "date-fns";
import { Thermometer, Droplets, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export function SampleCard({ sample, onClick }: { sample: Sample; onClick: () => void }) {
  const { t } = useLanguage();
  const { data: recalls } = useRecalls();

  const isRecalled = recalls?.some(r => r.batchId === sample.batchId);

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="herb-card cursor-pointer p-5 relative overflow-hidden"
    >
      {/* Decorative colored strip on left */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isRecalled ? 'bg-red-500' :
          sample.status === 'completed' ? 'bg-green-500' :
            sample.status === 'rejected' ? 'bg-red-500' :
              sample.status === 'in_testing' ? 'bg-blue-500' : 'bg-slate-300'
        }`}>
        {isRecalled && (
          <div className="absolute left-0 top-0 bottom-0 w-1.5 flex items-center justify-center">
            <span
              className="text-red-500 font-bold text-[10px] whitespace-nowrap"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              ONE TOUCH
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-start mb-3 ml-2">
        <div>
          <h3 className="text-lg font-bold text-foreground">{sample.herbName}</h3>
          <p className="text-sm text-muted-foreground font-medium">
            {t("common.batch")}: {sample.batchId}
          </p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          {isRecalled && (
            <div className="flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded-md border border-red-200">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span className="text-xs font-semibold text-red-700">{t("status.recalled")}</span>
            </div>
          )}
          <StatusPill status={sample.status as any} />
          {/* ADD THIS */}

        </div>
      </div>

      <div className="flex gap-4 mb-1 ml-2">
        {sample.temperature && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-slate-50 px-2 py-0.5 rounded-md">
            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
            <span>{sample.temperature}</span>
          </div>
        )}
        {sample.humidity && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-slate-50 px-2 py-0.5 rounded-md">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            <span>{sample.humidity}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3 ml-2">
        {sample.hubId && (
          <div className="text-[10px] text-muted-foreground bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
            Hub: {sample.hubId}
          </div>
        )}
        {sample.boxId && (
          <div className="text-[10px] text-muted-foreground bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
            Box: {sample.boxId}
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground ml-2 mt-2">
  Lab result will finalize batch compliance
</p>

      <div className="text-xs text-muted-foreground border-t pt-3 mt-1 ml-2 flex justify-between">
        <span>
        Chain verified: {sample.assignedDate ? format(new Date(sample.assignedDate), 'MMM d, yyyy') : '-'}
        </span>

        <span className="font-semibold text-primary">View Details &rarr;</span>
      </div>
    </motion.div>
  );
}

// Global Info Note Component
export function SampleAutoCreationInfo() {
  const { t } = useLanguage();
  return (
    <div className="text-xs text-muted-foreground px-5 pb-4 italic">
      {t("samples.auto_creation_info")}
    </div>
  );
}
