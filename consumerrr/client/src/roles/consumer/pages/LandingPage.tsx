import { useState } from "react";
import { useLanguage } from "../LanguageContext";
import { HERB_BOXES } from "../mockData";
import { BoxCard } from "../components/BoxCard";
import { QRScanner } from "../components/QRScanner";
import { Search, QrCode, Leaf, AlertCircle } from "lucide-react";

interface LandingPageProps {
  onNavigate: (boxId: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const { t } = useLanguage();
  const [boxIdInput, setBoxIdInput] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState("");

  const handleViewTrace = () => {
    setError("");
    const trimmedId = boxIdInput.trim().toUpperCase();
    const box = HERB_BOXES.find(b => b.boxId.toUpperCase() === trimmedId);
    
    if (box) {
      onNavigate(box.boxId);
    } else {
      setError(t("boxNotFound"));
    }
  };

  const handleScanResult = (boxId: string) => {
    const box = HERB_BOXES.find(b => b.boxId === boxId);
    if (box) {
      onNavigate(box.boxId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleViewTrace();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <div className="max-w-5xl mx-auto px-4 lg:px-6 pb-24 pt-6 space-y-8">
        <div 
          className="bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-6 sm:p-8 md:p-10"
          data-testid="card-hero"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/30">
              <Leaf className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-3 text-slate-900 dark:text-slate-50">
            {t("landingTitle")}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-200/90 text-center max-w-xl mx-auto mb-8">
            {t("landingSubtitle")}
          </p>

          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label 
                htmlFor="boxId" 
                className="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2"
              >
                {t("boxIdLabel")}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input
                  id="boxId"
                  type="text"
                  value={boxIdInput}
                  onChange={(e) => {
                    setBoxIdInput(e.target.value);
                    setError("");
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={t("boxIdPlaceholder")}
                  data-testid="input-box-id"
                  className="w-full bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
                />
              </div>
            </div>

            {error && (
              <div 
                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-600 dark:text-red-400"
                data-testid="error-box-not-found"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleViewTrace}
                data-testid="button-view-trace"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-400 transition"
              >
                <Search className="w-4 h-4" />
                {t("viewTrace")}
              </button>
              <button
                onClick={() => setShowScanner(true)}
                data-testid="button-scan-qr"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <QrCode className="w-4 h-4" />
                {t("scanQR")}
              </button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-4 px-1">
            {t("demoHint")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HERB_BOXES.map((box) => (
              <BoxCard 
                key={box.boxId} 
                box={box} 
                onClick={() => onNavigate(box.boxId)} 
              />
            ))}
          </div>
        </div>
      </div>

      {showScanner && (
        <QRScanner 
          onClose={() => setShowScanner(false)} 
          onScanned={handleScanResult}
        />
      )}
    </div>
  );
}
