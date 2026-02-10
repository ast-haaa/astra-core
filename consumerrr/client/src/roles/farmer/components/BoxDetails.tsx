import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Thermometer, Droplets, Zap, Power, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/roles/farmer/components/ui/card";
import { Button } from "@/roles/farmer/components/ui/button";
import { Badge } from "@/roles/farmer/components/ui/badge";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "@/roles/farmer/hooks/useTranslation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { BoxStatus } from "./BoxCard";

interface BoxDetailsProps {
  id: string;
  name: string;
  status: BoxStatus;
  temperature: number;
  humidity: number;
  peltierOn: boolean;
  onBack: () => void;
  onTogglePeltier: (on: boolean) => void;
}

const generateChartData = () => {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      time: hour.getHours().toString().padStart(2, "0") + ":00",
      temperature: 22 + Math.random() * 6,
      humidity: 60 + Math.random() * 20,
    });
  }
  return data;
};

export default function BoxDetails({
  id,
  name,
  status,
  temperature,
  humidity,
  peltierOn,
  onBack,
  onTogglePeltier,
}: BoxDetailsProps) {
  const [chartData] = useState(generateChartData);
  const [showTemp, setShowTemp] = useState(true);
  const t = useTranslation();

  const statusStyles: Record<BoxStatus, { bg: string; text: string; labelKey: string }> = {
    online: { bg: "bg-status-online/10", text: "text-status-online", labelKey: "boxOnline" },
    warning: { bg: "bg-status-away/10", text: "text-status-away", labelKey: "boxWarning" },
    critical: { bg: "bg-status-busy/10", text: "text-status-busy", labelKey: "boxCritical" },
    offline: { bg: "bg-status-offline/10", text: "text-status-offline", labelKey: "boxOffline" },
  };

  const statusStyle = statusStyles[status];

  const avgTemp = chartData.reduce((sum, d) => sum + d.temperature, 0) / chartData.length;
  const tempTrend = chartData[chartData.length - 1].temperature > avgTemp;

  const isSafe = temperature <= 26 && humidity >= 55 && humidity <= 75;

  return (
    <motion.div
      className="min-h-screen bg-background pb-24"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-background/80 backdrop-blur-lg border-b border-card-border">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground"
          data-testid="button-back"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">{t("back")}</span>
        </button>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={`${statusStyle.bg} ${statusStyle.text} border-0`}
          >
            {t(statusStyle.labelKey)}
          </Badge>
          <LanguageSelector variant="button" />
        </div>
      </header>

      <div className="px-5 py-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">{name}</h1>
          <p className="text-muted-foreground">{t("id")}: {id}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5 rounded-3xl text-center">
            <div className="inline-flex p-3 rounded-2xl bg-chart-1/10 mb-3">
              <Thermometer size={28} className="text-chart-1" />
            </div>
            <p className="text-4xl font-bold text-foreground">{temperature}°C</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {tempTrend ? (
                <TrendingUp size={14} className="text-destructive" />
              ) : (
                <TrendingDown size={14} className="text-primary" />
              )}
              <span className="text-sm text-muted-foreground">{t("temperature")}</span>
            </div>
          </Card>

          <Card className="p-5 rounded-3xl text-center">
            <div className="inline-flex p-3 rounded-2xl bg-chart-3/10 mb-3">
              <Droplets size={28} className="text-chart-3" />
            </div>
            <p className="text-4xl font-bold text-foreground">{humidity}%</p>
            <p className="text-sm text-muted-foreground mt-2">{t("humidity")}</p>
          </Card>
        </div>

        <Card className="p-5 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">{t("trend24h")}</h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={showTemp ? "default" : "secondary"}
                onClick={() => setShowTemp(true)}
                className="rounded-xl"
                data-testid="button-show-temp"
              >
                {t("temp")}
              </Button>
              <Button
                size="sm"
                variant={!showTemp ? "default" : "secondary"}
                onClick={() => setShowTemp(false)}
                className="rounded-xl"
                data-testid="button-show-humidity"
              >
                {t("humidity")}
              </Button>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="time"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={showTemp ? [18, 32] : [40, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Area
                  type="monotone"
                  dataKey={showTemp ? "temperature" : "humidity"}
                  stroke={showTemp ? "hsl(var(--chart-1))" : "hsl(var(--chart-3))"}
                  fill={showTemp ? "url(#colorTemp)" : "url(#colorHumidity)"}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${peltierOn ? "bg-primary/10" : "bg-muted"}`}>
                <Zap size={24} className={peltierOn ? "text-primary" : "text-muted-foreground"} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t("peltierControl")}</h2>
                <p className="text-sm text-muted-foreground">
                  {peltierOn ? t("coolingActive") : t("coolingInactive")}
                </p>
              </div>
            </div>
            <div
              className={`w-3 h-3 rounded-full ${
                peltierOn ? "bg-status-online animate-pulse" : "bg-status-offline"
              }`}
            />
          </div>

          <div className="mb-4 p-3 rounded-xl bg-muted/50 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">{t("automationStatus")}:</p>
            {peltierOn ? (
              <p>{t("peltierOnDescription")}</p>
            ) : (
              <p>{t("peltierOffDescription")}</p>
            )}
            {!isSafe && (
              <p className="text-destructive mt-1 font-medium">
                {t("conditionsUnsafe")}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              variant={peltierOn ? "default" : "secondary"}
              onClick={() => onTogglePeltier(true)}
              className="h-14 text-lg font-semibold rounded-2xl"
              data-testid="button-peltier-on"
            >
              <Power size={20} className="mr-2" />
              {t("on")}
            </Button>
            <Button
              size="lg"
              variant={!peltierOn ? "destructive" : "secondary"}
              onClick={() => onTogglePeltier(false)}
              className="h-14 text-lg font-semibold rounded-2xl"
              data-testid="button-peltier-off"
            >
              <Power size={20} className="mr-2" />
              {t("off")}
            </Button>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
