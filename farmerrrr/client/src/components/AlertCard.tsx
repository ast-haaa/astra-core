import { motion } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, ChevronRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";

type AlertSeverity = "critical" | "warning" | "info";

interface AlertCardProps {
  id: string;
  title: string;
  boxId: string;
  boxName: string;
  severity: AlertSeverity;
  timestamp: string;
  resolved?: boolean;
  onClick?: () => void;
}

const severityStyles: Record<
  AlertSeverity,
  { border: string; icon: typeof AlertTriangle; iconColor: string; badge: string; badgeText: string }
> = {
  critical: {
    border: "border-l-4 border-l-status-busy",
    icon: AlertTriangle,
    iconColor: "text-status-busy",
    badge: "bg-status-busy/10",
    badgeText: "text-status-busy",
  },
  warning: {
    border: "border-l-4 border-l-status-away",
    icon: AlertCircle,
    iconColor: "text-status-away",
    badge: "bg-status-away/10",
    badgeText: "text-status-away",
  },
  info: {
    border: "border-l-4 border-l-chart-3",
    icon: Info,
    iconColor: "text-chart-3",
    badge: "bg-chart-3/10",
    badgeText: "text-chart-3",
  },
};

export default function AlertCard({
  id,
  title,
  boxId,
  boxName,
  severity,
  timestamp,
  resolved = false,
  onClick,
}: AlertCardProps) {
  const t = useTranslation();
  const style = severityStyles[severity];
  const Icon = style.icon;

  const getSeverityLabel = () => {
    switch (severity) {
      case "critical": return t("severityCritical");
      case "warning": return t("severityWarning");
      case "info": return t("severityInfo");
      default: return severity;
    }
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <Card
        className={`p-4 rounded-2xl ${style.border} hover-elevate active-elevate-2 cursor-pointer ${
          resolved ? "opacity-60" : ""
        }`}
        onClick={onClick}
        data-testid={`card-alert-${id}`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl ${style.badge}`}>
            <Icon size={20} className={style.iconColor} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">{title}</h3>
              <Badge
                variant="secondary"
                className={`${style.badge} ${style.badgeText} border-0 text-[10px] uppercase shrink-0`}
              >
                {getSeverityLabel()}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {boxName} ({boxId})
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock size={12} />
                <span>{timestamp}</span>
              </div>
              {resolved && (
                <Badge variant="secondary" className="text-[10px] bg-status-online/10 text-status-online border-0">
                  {t("resolved")}
                </Badge>
              )}
            </div>
          </div>

          <ChevronRight size={18} className="text-muted-foreground mt-1 shrink-0" />
        </div>
      </Card>
      
    </motion.div>
  );
}

export type { AlertSeverity };
