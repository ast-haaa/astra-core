import { useLanguage } from "../LanguageContext";
import { type TimelineEvent, type ActorRole } from "../mockData";
import { Route, Clock, MapPin, Users } from "lucide-react";

interface JourneySummaryCardProps {
  events: TimelineEvent[];
}

export function JourneySummaryCard({ events }: JourneySummaryCardProps) {
  const { t } = useLanguage();

  const totalEvents = events.length;

  const startLocation = events.length > 0 ? events[0].locationText : undefined;
  const endLocation = events.length > 0 ? events[events.length - 1].locationText : undefined;

  const calculateTravelTime = () => {
    if (events.length < 2) return null;
    const startTime = new Date(events[0].time);
    const endTime = new Date(events[events.length - 1].time);
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;

    if (diffDays > 0) {
      return `${diffDays} ${t("days")} ${remainingHours} ${t("hours")}`;
    }
    return `${diffHours} ${t("hours")}`;
  };

  const getUniqueActors = () => {
    const actors = new Set<ActorRole>();
    events.forEach(e => actors.add(e.actorRole));
    return Array.from(actors);
  };

  const getRoleLabel = (role: ActorRole) => {
    switch (role) {
      case "FARMER":
        return t("roleFarmer");
      case "TRANSPORTER":
        return t("roleTransporter");
      case "LAB":
        return t("roleLab");
      case "SYSTEM":
        return t("roleSystem");
      default:
        return role;
    }
  };

  const travelTime = calculateTravelTime();
  const actors = getUniqueActors();
  const roleStyle: Record<ActorRole, string> = {
    FARMER: "bg-emerald-100 text-emerald-700 border-emerald-200",
    TRANSPORTER: "bg-blue-100 text-blue-700 border-blue-200",
    LAB: "bg-purple-100 text-purple-700 border-purple-200",
    SYSTEM: "bg-slate-200 text-slate-700 border-slate-300",
  };

  return (
    <div
      className="bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-5 sm:p-6"
      data-testid="card-journey-summary"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Route className="w-4 h-4 text-emerald-500" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50">
          {t("journeySummaryTitle")}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <MapPin className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">{t("totalStops")}</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50" data-testid="text-total-events">
            {totalEvents}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">{t("totalTime")}</span>
          </div>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-50" data-testid="text-travel-time">
            {travelTime || "-"}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
          <Route className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wide">{t("route")}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-900 dark:text-slate-50 font-medium" data-testid="text-start-location">
            {startLocation || t("unknownLocation")}
          </span>
          <span className="text-slate-400">→</span>
          <span className="text-slate-900 dark:text-slate-50 font-medium" data-testid="text-end-location">
            {endLocation || t("unknownLocation")}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
          <Users className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wide">{t("actorsInvolved")}</span>
        </div>
        <div className="flex flex-wrap gap-2" data-testid="actors-list">
          {actors.map((actor) => (
            <span
              key={actor}
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${roleStyle[actor]}`}
              data-testid={`badge-actor-${actor.toLowerCase()}`}
            >
              {getRoleLabel(actor)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
