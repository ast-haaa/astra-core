import { motion } from "framer-motion";
import {
  Thermometer,
  Droplets,
  Clock,
  ChevronRight,
  AlertTriangle,
  ShieldCheck
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

export type BoxStatus =
  | "online"
  | "warning"
  | "critical"
  | "offline"
  | "safe"
  | "recalled";

interface BoxCardProps {
  id: string;
  name: string;
  status: BoxStatus;
  temperature: number;
  humidity: number;
  lastUpdated: string;
  onClick?: () => void;
  recalled?: boolean;
}

const statusStylesMap: Record<
  BoxStatus,
  { bg: string; text: string; labelKey: string }
> = {
  safe: {
    bg: "bg-green-500/10",
    text: "text-green-600",
    labelKey: "Safe"
  },
  online: {
    bg: "bg-status-online/10",
    text: "text-status-online",
    labelKey: "boxOnline"
  },
  warning: {
    bg: "bg-status-away/10",
    text: "text-status-away",
    labelKey: "boxWarning"
  },
  critical: {
    bg: "bg-red-500/10",
    text: "text-red-600",
    labelKey: "Critical"
  },
  offline: {
    bg: "bg-status-offline/10",
    text: "text-status-offline",
    labelKey: "boxOffline"
  },
  recalled: {
    bg: "bg-red-600/20",
    text: "text-red-700",
    labelKey: "RECALLED"
  }
};

export default function BoxCard({
  id,
  name,
  status,
  temperature,
  humidity,
  lastUpdated,
  onClick,
  recalled = false
}: BoxCardProps) {
  const t = useTranslation();
  const [showQR, setShowQR] = useState(false);

  const traceUrl = `${window.location.origin}/trace/${id}`;
  const statusStyle = statusStylesMap[status];

  const isDanger =
    status === "warning" ||
    status === "critical" ||
    status === "recalled";

  const downloadQR = () => {
    const svg = document.getElementById(`qr-${id}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = 1000;
    canvas.height = 1000;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const png = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = png;
      a.download = `${id}-qr.png`;
      a.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <>
      <motion.div whileTap={{ scale: 0.98 }}>
        <Card
          onClick={onClick}
          className={`p-5 rounded-3xl cursor-pointer transition-all
            ${
              recalled
                ? "border-2 border-red-700 ring-2 ring-red-500 bg-red-50"
                : status === "safe"
                ? "border border-green-400 ring-1 ring-green-200"
                : status === "critical" || status === "warning"
                ? "border border-red-400 ring-1 ring-red-200"
                : "border border-card-border"
            }`}
        >
          {/* HEADER */}
          <div className="flex items-start justify-between mb-4">
            {/* LEFT */}
            <div>
              <h3 className="text-lg font-semibold text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground">
                {t("id")}: {id}
              </p>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col items-end">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQR(true);
                }}
                className="p-1 rounded-lg bg-muted mb-1"
              >
                <QRCodeSVG id={`qr-${id}`} value={traceUrl} size={28} />
              </div>

              <div className="flex flex-col items-end">
  <Badge
    variant="secondary"
    className={`${
      recalled
        ? "bg-red-600 text-white"
        : `${statusStyle.bg} ${statusStyle.text}`
    } border-0 flex items-center gap-1`}
  >
    {recalled && "RECALLED"}
    {!recalled && status === "safe" && <ShieldCheck size={14} />}
    {!recalled &&
      (status === "warning" || status === "critical") && (
        <AlertTriangle size={14} />
      )}
    {!recalled && t(statusStyle.labelKey)}
  </Badge>

  {/* FORCE LINE BREAK + GAP */}
  <div className="mt-2 max-w-[140px] text-right">
    <p className="text-[11px] italic text-muted-foreground leading-snug">
      This condition can affect crop quality
    </p>
  </div>
</div>

            </div>
          </div>

          {/* VALUES */}
          <div className="flex items-center justify-between">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-xl ${
                    isDanger ? "bg-red-500/10" : "bg-green-500/10"
                  }`}
                >
                  <Thermometer size={18} />
                </div>
                <div>
                 <p
  className={
    temperature === 0
      ? "text-xs italic text-muted-foreground"
      : "text-lg font-bold text-foreground"
  }
>
  {temperature === 0 ? "Updating…" : `${temperature}°C`}
</p>

                  <p className="text-xs text-muted-foreground">
                    {t("temp")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-xl ${
                    isDanger ? "bg-red-500/10" : "bg-green-500/10"
                  }`}
                >
                  <Droplets size={18} />
                </div>
                <div>
                  <p
  className={
    humidity === 0
      ? "text-xs italic text-muted-foreground"
      : "text-lg font-bold text-foreground"
  }
>
  {humidity === 0 ? "Updating…" : `${humidity}%`}
</p>

                  <p className="text-xs text-muted-foreground">
                    {t("humidity")}
                  </p>
                </div>
              </div>
            </div>

            <ChevronRight size={20} className="text-muted-foreground" />
          </div>

          {/* FOOTER */}
          <div className="flex items-center gap-1.5 mt-4 pt-4 border-t">
            <Clock size={14} />
            <span className="text-xs text-muted-foreground">
              {t("lastUpdated")}: {lastUpdated}
            </span>
          </div>
        </Card>
      </motion.div>

      {/* FULLSCREEN QR */}
      {showQR && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-white p-6 rounded-3xl flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <QRCodeSVG value={traceUrl} size={260} />
            <button
              onClick={downloadQR}
              className="px-5 py-2 rounded-xl bg-black text-white text-sm"
            >
              Download
            </button>
          </div>
        </div>
      )}
    </>
  );
}
