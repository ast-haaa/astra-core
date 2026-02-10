import { motion } from "framer-motion";
import { Thermometer, Droplets, Clock, ChevronRight } from "lucide-react";
import { Card } from "@/roles/farmer/components/ui/card";
import { Badge } from "@/roles/farmer/components/ui/badge";
import { useTranslation } from "@/roles/farmer/hooks/useTranslation";

type BoxStatus = "online" | "warning" | "critical" | "offline";

interface BoxCardProps {
  id: string;
  name: string;
  status: BoxStatus;
  temperature: number;
  humidity: number;
  lastUpdated: string;
  onClick?: () => void;
}

const statusStylesMap: Record<BoxStatus, { bg: string; text: string; labelKey: string }> = {
  online: { bg: "bg-status-online/10", text: "text-status-online", labelKey: "boxOnline" },
  warning: { bg: "bg-status-away/10", text: "text-status-away", labelKey: "boxWarning" },
  critical: { bg: "bg-status-busy/10", text: "text-status-busy", labelKey: "boxCritical" },
  offline: { bg: "bg-status-offline/10", text: "text-status-offline", labelKey: "boxOffline" },
};

export default function BoxCard({
  id,
  name,
  status,
  temperature,
  humidity,
  lastUpdated,
  onClick,
}: BoxCardProps) {
  const t = useTranslation();
  const statusStyle = statusStylesMap[status];

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <Card
        className="p-5 rounded-3xl hover-elevate active-elevate-2 cursor-pointer"
        onClick={onClick}
        data-testid={`card-box-${id}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{t("id")}: {id}</p>
          </div>
          <Badge
            variant="secondary"
            className={`${statusStyle.bg} ${statusStyle.text} border-0 font-medium`}
          >
            {t(statusStyle.labelKey)}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-chart-1/10">
                <Thermometer size={18} className="text-chart-1" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{temperature}°C</p>
                <p className="text-xs text-muted-foreground">{t("temp")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-chart-3/10">
                <Droplets size={18} className="text-chart-3" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{humidity}%</p>
                <p className="text-xs text-muted-foreground">{t("humidity")}</p>
              </div>
            </div>
          </div>
          <ChevronRight size={20} className="text-muted-foreground" />
        </div>

        <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-card-border">
          <Clock size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {t("lastUpdated")}: {lastUpdated}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}

export type { BoxStatus };
