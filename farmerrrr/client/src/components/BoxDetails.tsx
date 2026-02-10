import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Thermometer, Droplets, Zap, Power, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "@/hooks/useTranslation";
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

const generateTulsiChart = (currentTemp: number, currentHumidity: number) => {
  const data = [];
  for (let i = 23; i >= 0; i--) {
    data.push({
      time: `${(24 - i).toString().padStart(2, "0")}:00`,
      temperature: currentTemp + (Math.random() - 0.5) * 2,
      humidity: currentHumidity + (Math.random() - 0.5) * 5
    });
  }
  return data;
};

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
  const [chartData] = useState(() =>
    id === "BOX_TULSI_001"
      ? generateTulsiChart(temperature, humidity)
      : generateChartData()
  ); const [showTemp, setShowTemp] = useState(true);
  const t = useTranslation();

  const statusStyles: Record<BoxStatus, { bg: string; text: string; labelKey: string }> = {
    safe: { bg: "bg-green-500/10", text: "text-green-600", labelKey: "Safe" },
    online: { bg: "bg-green-500/10", text: "text-green-600", labelKey: "Safe" },
    warning: { bg: "bg-yellow-500/10", text: "text-yellow-600", labelKey: "Warning" },
    critical: { bg: "bg-red-500/10", text: "text-red-600", labelKey: "Critical" },
    offline: { bg: "bg-gray-500/10", text: "text-gray-600", labelKey: "Offline" },
    recalled: {
      bg: "bg-red-600/20",
      text: "text-red-700",
      labelKey: "RECALLED"
    }


  };



  const statusStyle = statusStyles[status] ?? statusStyles.warning;


  const avgTemp = chartData.reduce((sum, d) => sum + d.temperature, 0) / chartData.length;
  const tempTrend = chartData[chartData.length - 1].temperature > avgTemp;

  const isSafe =
    status !== "recalled" &&
    temperature <= 26 &&
    humidity >= 55 &&
    humidity <= 75;
  const actions = [
    { id: 1, action: "Cooling activated", result: "Recorded", time: "2 min ago" },
    { id: 2, action: "Cooling stopped", result: "Recorded", time: "7 min ago" },
    { id: 3, action: "Cooling activated", result: "Recorded", time: "18 min ago" }
  ];


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
              <div className="p-3 rounded-2xl bg-muted">
                <Zap size={24} className="text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Cooling & Compliance Control
                </h2>
                <p className="text-sm text-muted-foreground">
                  {peltierOn
                    ? "Cooling is active — system regulating temperature"
                    : "Cooling is off — conditions are being monitored"}
                </p>
              </div>
            </div>

            {/* Neutral indicator — no color change */}
            <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
          </div>

          {/* System Status */}
          <div className="mb-4 p-3 rounded-xl bg-muted/50 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">
              System Status:
            </p>

            {peltierOn ? (
              <p>
                Cooling action recorded to maintain safe storage
              </p>
            ) : (
              <p>
                Conditions within acceptable range — monitoring continues
              </p>
            )}

            {!isSafe && (
              <p className="mt-1 font-medium">
                Storage limits crossed — this event is logged for review
              </p>
            )}
          </div>

          {/* ON / OFF buttons — ONLY COLORS THAT CHANGE */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              onClick={() => onTogglePeltier(true)}
              className={`h-14 text-lg font-bold rounded-2xl ${peltierOn
                  ? "bg-green-600 text-white hover:bg-green-600"
                  : "bg-muted text-foreground"
                }`}
            >
              ON
            </Button>

            <Button
              size="lg"
              onClick={() => onTogglePeltier(false)}
              className={`h-14 text-lg font-bold rounded-2xl ${!peltierOn
                  ? "bg-red-600 text-white hover:bg-red-600"
                  : "bg-muted text-foreground"
                }`}
            >
              OFF
            </Button>
          </div>
        </Card>


        <Card className="p-5 rounded-3xl">
          <h2 className="text-lg font-semibold mb-4">Recorded Actions </h2>
          <p className="text-xs text-muted-foreground mb-3">
            All actions here help maintain safe storage and are recorded automatically.
          </p>

          <div className="space-y-3">
            {actions.map(a => (
              <div
                key={a.id}
                className="flex justify-between items-center p-3 rounded-xl bg-muted/50 text-sm"
              >
                <span className="font-medium">{a.action}</span>
                <span className="text-muted-foreground">{a.time}</span>
                <span className="text-green-600 font-semibold">{a.result}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
