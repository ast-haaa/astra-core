import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../LanguageContext";
import { Camera, X, QrCode } from "lucide-react";
import { HERB_BOXES } from "../mockData";

interface QRScannerProps {
  onClose: () => void;
  onScanned: (boxId: string) => void;
}

export function QRScanner({ onClose, onScanned }: QRScannerProps) {
  const { t } = useLanguage();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const validBoxIds = HERB_BOXES.map(box => box.boxId);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
      setScanning(true);
    } catch {
      setHasPermission(false);
    }
  };

  const simulateScan = (boxId: string) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    onScanned(boxId);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      data-testid="modal-qr-scanner"
    >
      <div 
        className="bg-white dark:bg-slate-900/95 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {t("qrScannerTitle")}
            </h3>
          </div>
          <button
            onClick={onClose}
            data-testid="button-close-scanner"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="aspect-square bg-slate-100 dark:bg-slate-950/50 rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden mb-4 relative">
          {scanning ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-emerald-500 dark:border-emerald-400 rounded-lg opacity-70">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500 dark:border-emerald-400" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500 dark:border-emerald-400" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500 dark:border-emerald-400" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500 dark:border-emerald-400" />
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <Camera className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm text-center px-4">{t("qrScannerHint")}</p>
            </div>
          )}
        </div>

        {hasPermission === false && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-4 text-center">
            {t("cameraPermissionDenied")}
          </p>
        )}

        {!scanning ? (
          <button
            onClick={startCamera}
            data-testid="button-start-camera"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-400 transition w-full"
          >
            <Camera className="w-4 h-4" />
            {t("startCamera")}
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-3">
              {t("scanSimulateHint")}
            </p>
            <div className="grid gap-2">
              {validBoxIds.map(boxId => (
                <button
                  key={boxId}
                  onClick={() => simulateScan(boxId)}
                  data-testid={`button-simulate-scan-${boxId}`}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-mono text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-emerald-500/50 transition"
                >
                  {boxId}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
