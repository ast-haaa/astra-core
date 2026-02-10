import { useRecalls } from "@/hooks/use-recalls";
import { useLanguage } from "@/lib/i18n";
import { Navbar } from "@/components/layout/Navbar";
import { StatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { AlertTriangle, Bell } from "lucide-react";
import { motion } from "framer-motion";

export default function Recalls() {
  const { data: recalls, isLoading } = useRecalls();
  const { t } = useLanguage();

  const handleNotifyFarmer = (recall: any) => {
    // Toast notification for farmer notification
    alert(`Farmer notified for ${recall.herbName} (Batch: ${recall.batchId})`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-20 md:pb-0 md:pl-64">
      <Navbar />

      <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-3xl font-display font-bold text-red-950">{t("recalls.title")}</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {recalls?.map((recall) => (
              <motion.div
                key={recall.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative"
              >
                {/* Severity Strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${recall.severity === 'critical' || recall.severity === 'high' ? 'bg-red-500' : 'bg-amber-400'
                  }`} />

                <div className="p-6 pl-8">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{recall.herbName}</h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        {t("common.batch")}: <span className="text-foreground">{recall.batchId}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Reported: {recall.date ? format(new Date(recall.date), 'MMM d, yyyy') : '-'}
                      </p>
                      <p className="text-sm mt-3 text-foreground">
                        <span className="font-semibold">Reason: </span>{recall.reason}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        <span className="font-semibold">Action Required: </span>Farmer action pending
                      </p>

                      <p className="text-xs text-muted-foreground mt-2">
                        This recall decision is irreversible once published.
                      </p>

                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-3">
                        <StatusPill status={recall.severity as any} />
                        <StatusPill status={recall.status as any} />

                        {(recall.severity === "critical" || recall.severity === "high") && (
                          <span className="text-green-600 font-semibold text-xs">
                            ✓ Verified
                          </span>
                        )}
                      </div>

                      <Button
                        onClick={() => handleNotifyFarmer(recall)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        size="sm"
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        Trigger Recall Protocol
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {recalls?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground bg-white rounded-2xl border border-dashed">
                {t("samples.no_recalls")}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
