import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, AlertCircle, Info, Clock, Box, Check, RefreshCw, AlertOctagon } from "lucide-react";
import { Button } from "@/roles/farmer/components/ui/button";
import { Card } from "@/roles/farmer/components/ui/card";
import { Badge } from "@/roles/farmer/components/ui/badge";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "@/roles/farmer/hooks/useTranslation";
import type { AlertSeverity } from "./AlertCard";

interface AlertDetailsProps {
  id: string;
  title: string;
  message: string;
  boxId: string;
  boxName: string;
  severity: AlertSeverity;
  timestamp: string;
  resolved?: boolean;
  fixAttempts?: number;
  onBack: () => void;
  onResolve: () => void;
}

export default function AlertDetails({
  id,
  title,
  message,
  boxId,
  boxName,
  severity,
  timestamp,
  resolved = false,
  fixAttempts = 0,
  onBack,
  onResolve,
}: AlertDetailsProps) {
  const t = useTranslation();

  const severityStyles: Record<
    AlertSeverity,
    { bg: string; icon: typeof AlertTriangle; iconColor: string; labelKey: string }
  > = {
    critical: {
      bg: "bg-status-busy",
      icon: AlertTriangle,
      iconColor: "text-white",
      labelKey: "criticalAlert",
    },
    warning: {
      bg: "bg-status-away",
      icon: AlertCircle,
      iconColor: "text-white",
      labelKey: "warning",
    },
    info: {
      bg: "bg-chart-3",
      icon: Info,
      iconColor: "text-white",
      labelKey: "info",
    },
  };

  const style = severityStyles[severity];
  const Icon = style.icon;

  const getButtonText = () => {
    if (resolved) return t("resolved");
    if (fixAttempts === 0) return t("resolve");
    if (fixAttempts === 1) return t("takeAction");
    return t("boxRecall");
  };

  const getButtonVariant = (): "default" | "secondary" | "destructive" => {
    if (resolved) return "secondary";
    if (fixAttempts >= 2) return "destructive";
    return "default";
  };

  const getButtonIcon = () => {
    if (resolved) return <Check size={20} className="mr-2" />;
    if (fixAttempts === 1) return <RefreshCw size={20} className="mr-2" />;
    if (fixAttempts >= 2) return <AlertOctagon size={20} className="mr-2" />;
    return <Check size={20} className="mr-2" />;
  };

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
      className="min-h-screen bg-background"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`${style.bg} pt-4 pb-8`}>
        <header className="flex items-center justify-between px-5 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white"
            data-testid="button-back"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">{t("back")}</span>
          </button>
          <LanguageSelector variant="button" />
        </header>

        <div className="px-5 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/20">
            <Icon size={32} className={style.iconColor} />
          </div>
          <div>
            <Badge variant="secondary" className="bg-white/20 text-white border-0 uppercase text-xs mb-1">
              {getSeverityLabel()}
            </Badge>
            <h1 className="text-xl font-bold text-white">{title}</h1>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-4 pb-8 space-y-4">
        <Card className="p-5 rounded-3xl">
          <h2 className="text-lg font-semibold text-foreground mb-3">{t("alertDetails")}</h2>
          <p className="text-muted-foreground leading-relaxed">{message}</p>
          <p className="text-xs text-muted-foreground mt-2 italic">
  This alert is saved for record and review
</p>

        </Card>

        <Card className="p-5 rounded-3xl">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t("boxInformation")}</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Box size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("affectedBox")}</p>
                <p className="font-medium text-foreground">{boxName} ({boxId})</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-muted">
                <Clock size={18} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("triggered")}</p>
                <p className="font-medium text-foreground">{timestamp}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-muted">
                <Info size={18} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("alertId")}</p>
                <p className="font-medium text-foreground">{id}</p>
              </div>
            </div>

            {fixAttempts > 0 && !resolved && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-destructive/10">
                  <RefreshCw size={18} className="text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("fixAttempts")}</p>
                  <p className="font-medium text-destructive">{fixAttempts}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {fixAttempts >= 2 && !resolved && (
          <Card className="p-5 rounded-3xl border-destructive bg-destructive/5">
            <div className="flex items-start gap-3">
              <AlertOctagon size={24} className="text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive">{t("boxRecallSuggested")}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("multipleAttemptsFailedRecall")}
                </p>
              </div>
            </div>
          </Card>
        )}

        {!resolved && (
          <Button
            size="lg"
            variant={getButtonVariant()}
            className="w-full h-14 text-lg font-semibold rounded-2xl"
            onClick={onResolve}
            data-testid="button-resolve"
          >
            {getButtonIcon()}
            {getButtonText()}
          </Button>
        )}

        {resolved && (
          <div className="text-center py-4 flex items-center justify-center gap-2">
            <Check size={20} className="text-status-online" />
            <p className="text-status-online font-medium">{t("resolved")}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
