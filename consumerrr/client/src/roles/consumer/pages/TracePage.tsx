import { useLanguage } from "../LanguageContext";
import { HERB_BOXES } from "../mockData";

import { ArrowLeft, Leaf, AlertTriangle, Package, Hash } from "lucide-react";

import VerificationStatusCard from "../components/VerificationStatusCard";
import PotencySafetyScoreCard from "../components/PotencySafetyScoreCard";
import KeyVerdictCard from "../components/KeyVerdictCard";
import ResponsibilityCard from "../components/ResponsibilityCard";
import WhySection from "../components/WhySection";
import { RecallBanner } from "../components/RecallBanner";

import { JourneySummaryCard } from "../components/JourneySummaryCard";
import { FarmerCard } from "../components/FarmerCard";
import { EnvironmentCard } from "../components/EnvironmentCard";
import { Timeline } from "../components/Timeline";
import { LabTestCard } from "../components/LabTestCard";
import { useState } from "react";

interface TracePageProps {
  boxId: string;
  onBack: () => void;
}

export function TracePage({ boxId, onBack }: TracePageProps) {
  const { t } = useLanguage();
  const box = HERB_BOXES.find(b => b.boxId === boxId);

  if (!box) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 pb-24 pt-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("back")}
          </button>

          <div className="mt-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t("boxNotFound")}</p>
          </div>
        </div>
      </div>
    );
  }
  const [open, setOpen] = useState(false);

  const isRecalled = box.status === "RECALLED";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <div className="max-w-5xl mx-auto px-4 lg:px-6 pb-24 pt-6 space-y-6">

        {/* BACK */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </button>

        {/* ================== PRIMARY IDENTITY ================== */}

       <div className="bg-emerald-50 dark:bg-slate-900 rounded-3xl border-2 border-emerald-200 dark:border-emerald-800 shadow-[0_18px_40px_rgba(0,0,0,0.08)] p-7 sm:p-8">
  <div className="flex items-start gap-5">
    
    <div
      className={`w-18 h-18 rounded-3xl flex items-center justify-center flex-shrink-0
        ${
          isRecalled
            ? "bg-red-500/20 border border-red-500/40"
            : "bg-emerald-500/20 border border-emerald-500/40"
        }`}
    >
      {isRecalled ? (
        <AlertTriangle className="w-8 h-8 text-red-500" />
      ) : (
        <Leaf className="w-8 h-8 text-emerald-600" />
      )}
    </div>

    <div className="flex-1">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
        {box.herbName}
      </h1>

      <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          <span className="font-mono">{box.boxId}</span>
        </div>
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4" />
          <span className="font-mono">{box.batchCode}</span>
        </div>
      </div>
    </div>

  </div>
</div>


        {/* ================== DECISION GRID ================== */}

        <div className="grid gap-7 lg:grid-cols-2">
          <VerificationStatusCard />
          <PotencySafetyScoreCard />
        </div>

        <div className="grid gap-7 lg:grid-cols-2">
          <KeyVerdictCard />
          <ResponsibilityCard />
        </div>

        {box.recall && <RecallBanner recall={box.recall} />}

        {/* ================== WHY THIS SCORE ================== */}

        <WhySection>
          <JourneySummaryCard events={box.timeline} />

          <div className="grid gap-6 lg:grid-cols-2">
            <FarmerCard farmer={box.farmer} />
            <EnvironmentCard environment={box.environment} />
          </div>

          <Timeline events={box.timeline} />

          <LabTestCard labTest={box.labTest} />
        </WhySection>

      </div>
    </div>
  );
}
