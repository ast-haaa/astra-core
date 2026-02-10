import { useLanguage } from "../LanguageContext";
import { type EnvironmentInfo } from "../mockData";
import { Thermometer, Droplets, Scale, Clock, Activity } from "lucide-react";

interface EnvironmentCardProps {
  environment: EnvironmentInfo;
}

export function EnvironmentCard({ environment }: EnvironmentCardProps) {
  const { t } = useLanguage();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const isTempHigh = environment.temperatureC > 28;
  const isHumidityHigh = environment.humidityPercent > 65;

  return (
    <div 
      className="bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-4 sm:p-5 md:p-6"
      data-testid="card-environment"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Activity className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50">
          {t("environmentTitle")}
        </h3>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div 
          className={`
            bg-white dark:bg-slate-950/50 rounded-xl border px-3 py-3 text-center
            ${isTempHigh ? "border-red-500/40" : "border-slate-200 dark:border-slate-800"}
          `}
          data-testid="metric-temperature"
        >
          <Thermometer className={`w-5 h-5 mx-auto mb-1 ${isTempHigh ? "text-red-500 dark:text-red-400" : "text-emerald-500 dark:text-emerald-400"}`} />
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
            {t("temperature")}
          </p>
          <p className={`text-lg font-semibold ${isTempHigh ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-slate-50"}`} data-testid="text-temperature-value">
            {environment.temperatureC}°C
          </p>
        </div>
        
        <div 
          className={`
            bg-white dark:bg-slate-950/50 rounded-xl border px-3 py-3 text-center
            ${isHumidityHigh ? "border-red-500/40" : "border-slate-200 dark:border-slate-800"}
          `}
          data-testid="metric-humidity"
        >
          <Droplets className={`w-5 h-5 mx-auto mb-1 ${isHumidityHigh ? "text-red-500 dark:text-red-400" : "text-emerald-500 dark:text-emerald-400"}`} />
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
            {t("humidity")}
          </p>
          <p className={`text-lg font-semibold ${isHumidityHigh ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-slate-50"}`} data-testid="text-humidity-value">
            {environment.humidityPercent}%
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-3 text-center" data-testid="metric-weight">
          <Scale className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mx-auto mb-1" />
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
            {t("weight")}
          </p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-50" data-testid="text-weight-value">
            {environment.weightKg} kg
          </p>
        </div>
      </div>
      
<div className="flex items-center gap-2 text-xs italic text-slate-500 dark:text-slate-400">
        <Clock className="w-3.5 h-3.5" />
        <span>{t("lastUpdated")}: {formatDate(environment.lastUpdated)}</span>
      </div>
    </div>
  );
}
