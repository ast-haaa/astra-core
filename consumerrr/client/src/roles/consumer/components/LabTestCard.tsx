import { useState } from "react";
import { useLanguage } from "../LanguageContext";
import { type LabTestInfo } from "../mockData";
import { FlaskConical, CheckCircle, XCircle, Clock, FileText, X } from "lucide-react";

interface LabTestCardProps {
  labTest: LabTestInfo;
}

export function LabTestCard({ labTest }: LabTestCardProps) {
  const { t } = useLanguage();
  const [showReport, setShowReport] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getResultDisplay = () => {
    switch (labTest.result) {
      case "PASS":
        return {
          icon: CheckCircle,
          text: t("labPass"),
          colorClass: "text-emerald-600 dark:text-emerald-400",
          bgClass: "bg-emerald-500/10 border-emerald-500/40",
        };
      case "FAIL":
        return {
          icon: XCircle,
          text: t("labFail"),
          colorClass: "text-red-600 dark:text-red-400",
          bgClass: "bg-red-500/10 border-red-500/40",
        };
      case "PENDING":
        return {
          icon: Clock,
          text: t("labPending"),
          colorClass: "text-amber-600 dark:text-amber-400",
          bgClass: "bg-amber-500/10 border-amber-500/40",
        };
    }
  };

  const result = getResultDisplay();
  const ResultIcon = result.icon;

  return (
    <>
      <div 
        className="bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-4 sm:p-5 md:p-6"
        data-testid="card-lab-test"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50">
            {t("labTestTitle")}
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-500 dark:text-slate-400">{t("labResult")}</span>
            <span 
              className={`
                inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium border
                ${result.bgClass}
              `}
              data-testid="badge-lab-result"
            >
              <ResultIcon className={`w-4 h-4 ${result.colorClass}`} />
              <span className={result.colorClass} data-testid="text-lab-result-value">{result.text}</span>
            </span>
          </div>
          
          {labTest.testedAt && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-500 dark:text-slate-400">{t("testedAt")}</span>
              <span className="text-sm text-slate-700 dark:text-slate-200" data-testid="text-tested-at">{formatDate(labTest.testedAt)}</span>
            </div>
          )}
          
          {labTest.result === "PENDING" && (
            <p className="text-sm text-amber-600 dark:text-amber-400/80 italic">
              {t("pendingTest")}
            </p>
          )}
          
          {labTest.note && (
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 block mb-1">
                {t("labNotes")}
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-200/90">{labTest.note}</p>
            </div>
          )}
          
          {labTest.result !== "PENDING" && (
            <button
              onClick={() => setShowReport(true)}
              data-testid="button-view-report"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition w-full sm:w-auto"
            >
              <FileText className="w-4 h-4" />
              {t("viewReport")}
            </button>
          )}
        </div>
      </div>

      {showReport && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowReport(false)}
          data-testid="modal-lab-report"
        >
          <div 
            className="bg-white dark:bg-slate-900/95 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {t("labReportTitle")}
              </h3>
              <button
                onClick={() => setShowReport(false)}
                data-testid="button-close-report"
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200/90">
              <div className="p-4 bg-slate-100 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mb-2">{t("certificateNumber")}LR-2024-{Math.random().toString(36).substring(7).toUpperCase()}</p>
                <p className="mb-3">{t("labReportContent")}</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{t("heavyMetals")}:</span>
                    <span className={labTest.result === "PASS" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                      {labTest.result === "PASS" ? t("withinLimits") : t("aboveLimits")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{t("pesticideResidue")}:</span>
                    <span className={labTest.result === "PASS" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                      {labTest.result === "PASS" ? t("notDetected") : t("detected")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{t("microbialLoad")}:</span>
                    <span className={labTest.result === "PASS" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                      {labTest.result === "PASS" ? t("safeResult") : t("unsafeResult")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{t("aflatoxin")}:</span>
                    <span className={labTest.result === "PASS" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                      {labTest.result === "PASS" ? t("negative") : t("positive")}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                {t("labReportNote")}
              </p>
            </div>
            
            <button
              onClick={() => setShowReport(false)}
              data-testid="button-close-report-footer"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-400 transition w-full"
            >
              {t("close")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
