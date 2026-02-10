import { motion } from "framer-motion";
import { Box, AlertTriangle, Thermometer, Droplets, Clock } from "lucide-react";
import { Card } from "@/roles/farmer/components/ui/card";
import { useTranslation } from "@/roles/farmer/hooks/useTranslation";

interface SummaryCardProps {
  type: "boxes" | "alerts" | "summary";
  value: number | string;
  secondaryValue?: string;
  label: string;
  onClick?: () => void;
}

const iconMap = {
  boxes: Box,
  alerts: AlertTriangle,
  summary: Thermometer,
};

const colorMap = {
  boxes: "bg-primary/10 text-primary",
  alerts: "bg-destructive/10 text-destructive",
  summary: "bg-chart-2/10 text-chart-2",
};

export default function SummaryCard({
  type,
  value,
  secondaryValue,
  label,
  onClick,
}: SummaryCardProps) {
  const t = useTranslation();
  const Icon = iconMap[type];

  return (
    <motion.div whileTap={{ scale: 0.98 }} transition={{ duration: 0.15 }}>
      <Card
        className={`p-5 rounded-3xl hover-elevate active-elevate-2 cursor-pointer`}
        onClick={onClick}
        data-testid={`card-${type}`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{value}</span>
              {secondaryValue && (
                <span className="text-sm text-muted-foreground">
                  {secondaryValue}
                </span>
              )}
            </div>
            {type === "summary" && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Thermometer size={14} className="text-chart-1" />
                  <span>24°C</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Droplets size={14} className="text-chart-3" />
                  <span>65%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>{t("now")}</span>
                </div>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-2xl ${colorMap[type]}`}>
            <Icon size={24} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
