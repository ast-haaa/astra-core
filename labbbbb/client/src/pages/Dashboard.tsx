import { useSamples } from "@/hooks/use-samples";
import { useRecalls } from "@/hooks/use-recalls";
import { useLanguage } from "@/lib/i18n";
import { Navbar } from "@/components/layout/Navbar";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { FileText, AlertCircle, CheckCircle2, Activity } from "lucide-react";
import { format } from "date-fns";
import { SampleCard } from "@/components/samples/SampleCard";
import { useState, useEffect } from "react";
import { EditSampleDialog } from "@/components/samples/EditSampleDialog";
import { type Sample } from "@shared/schema";

export default function Dashboard() {
  const { data: samples, isLoading } = useSamples();
  const { data: recalls } = useRecalls();
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [actionBanner, setActionBanner] = useState<{
    type: "warning" | "critical" | "info";
    message: string;
  } | null>(null);
  const handleSampleClick = (sample: Sample) => {
    setSelectedSample(sample);
    setEditOpen(true);
  };
   const recentSamples = [...(samples || [])].sort((a, b) =>
    new Date(b.assignedDate || 0).getTime() - new Date(a.assignedDate || 0).getTime()
  ).slice(0, 3);
  const pendingCount = samples?.filter(s => s.status === "pending").length || 0;
  const testingCount = samples?.filter(s => s.status === "in_testing").length || 0;
  const completedCount = samples?.filter(s => s.status === "completed").length || 0;
  const recallCount = recalls?.filter(r => r.status === "open").length || 0;

  // ✅ ADD: ACTION BANNER LOGIC (STATE BASED, NO SPAM)
  useEffect(() => {
    if (recallCount > 0) {
      setActionBanner({
        type: "critical",
        message: "Critical temperature issue detected. Immediate action required.",
      });
      return;
    }

    if (pendingCount > 0) {
      setActionBanner({
        type: "warning",
        message: "Temperature is high. Please turn ON the Peltier cooling system.",
      });
      return;
    }

    setActionBanner(null);
  }, [recallCount, pendingCount]);
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-20 md:pb-0 md:pl-64">
      <Navbar />

      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">

        {/* Offline Banner (AS IS) */}
        {!navigator.onLine && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg text-sm font-medium text-center border border-amber-200"
          >
            {t("common.offline")}
          </motion.div>
        )}

        {/* ✅ ADD: ACTION BANNER (PURE ADDITION) */}
        {actionBanner && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg px-4 py-2 text-sm font-medium border
              ${
                actionBanner.type === "critical"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : actionBanner.type === "warning"
                  ? "bg-amber-50 border-amber-200 text-amber-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
              }
            `}
          >
            {actionBanner.message}
          </motion.div>
        )}

        {/* Welcome Section (AS IS) */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            {t("dashboard.title")}
          </h1>
          <p className="text-muted-foreground mt-1">Overview of your lab activity</p>
        </div>

        {/* Stats Grid (AS IS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-40"
          >
            <div>
              <p className="text-muted-foreground font-medium">{t("dashboard.assigned")}</p>
              <h2 className="text-5xl font-display font-bold text-primary mt-2">
                {pendingCount + testingCount}
              </h2>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => recallCount > 0 && navigate("/recalls")}
            className={`rounded-3xl p-6 shadow-sm border flex flex-col justify-between h-40 ${
              recallCount > 0
                ? "bg-red-50 border-red-100 cursor-pointer"
                : "bg-white border-slate-100"
            }`}
          >
            <div>
              <p className={`font-medium ${recallCount > 0 ? "text-red-700" : "text-muted-foreground"}`}>
                {t("dashboard.attention")}
              </p>
              <h2 className={`text-5xl font-display font-bold mt-2 ${
                recallCount > 0 ? "text-red-600" : "text-slate-800"
              }`}>
                {recallCount}
              </h2>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-40"
          >
            <div>
              <p className="text-muted-foreground font-medium">
                Lab Verification Status
              </p>
              <h2 className="text-5xl font-display font-bold text-slate-800 mt-2">
                Active
              </h2>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity (AS IS) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              {t("dashboard.activity")}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {recentSamples.map((sample) => (
              <SampleCard
                key={sample.id}
                sample={sample}
                onClick={() => handleSampleClick(sample)}
              />
            ))}
          </div>
        </div>
      </main>

      <EditSampleDialog
        sample={selectedSample}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}
