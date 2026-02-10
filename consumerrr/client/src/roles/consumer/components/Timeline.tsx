import { useLanguage } from "../LanguageContext";
import { type TimelineEvent, type ActorRole } from "../mockData";
import { TimelineMap } from "./TimelineMap";
import {
  Clock,
  User,
  Truck,
  FlaskConical,
  Monitor,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";

interface TimelineProps {
  events: TimelineEvent[];
}

const getRoleIcon = (role: ActorRole) => {
  switch (role) {
    case "FARMER":
      return User;
    case "TRANSPORTER":
      return Truck;
    case "LAB":
      return FlaskConical;
    case "SYSTEM":
      return Monitor;
    default:
      return User;
  }
};

export function Timeline({ events }: TimelineProps) {
  const { t } = useLanguage();
  const [showTimeline, setShowTimeline] = useState(false);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-4 sm:p-5 md:p-6"
      data-testid="card-timeline"
    >
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Clock className="w-4 h-4 text-emerald-500" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50">
          {t("timelineTitle")}
        </h3>
      </div>

      {/* MAP — ALWAYS VISIBLE */}
      <TimelineMap events={events} />

      {/* TOGGLE BUTTON */}
      <div className="text-center mt-4">
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className="text-xs text-emerald-600 hover:underline"
        >
          {showTimeline ? "Hide detailed timeline" : "View verification trail"}
        </button>
      </div>

      {/* TIMELINE LIST — ONLY WHEN CLICKED */}
      {showTimeline && (
        <div className="relative mt-4">
          {events.map((event, index) => {
            const Icon = getRoleIcon(event.actorRole);
            const isLast = index === events.length - 1;

            return (
              <div
                key={event.id}
                className="grid grid-cols-[1.5rem,1fr] gap-5"
                data-testid={`timeline-event-${event.id}`}
              >
                <div className="flex flex-col items-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 z-10" />
                  {!isLast && (
                    <div className="w-0.5 flex-1 bg-gradient-to-b from-emerald-500/50 to-slate-300 dark:to-slate-700/50 my-1" />
                  )}
                </div>

                <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                      <Icon className="w-3 h-3" />
                      {getRoleLabel(event.actorRole)}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-50 mb-0.5">
                    {event.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {formatDate(event.time)}
                  </p>

                  {event.locationText && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 italic mb-2">
                      {event.locationText}
                    </p>
                  )}

                  {event.actions && event.actions.length > 0 && (
                    <div
                      className="mt-2 ml-0"
                      data-testid={`actions-${event.id}`}
                    >
                      <ul className="space-y-1 pl-0">
                        {event.actions.map((action, actionIndex) => (
                          <li
                            key={actionIndex}
                            className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"
                          >
                            <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span className="leading-snug">
                              {t(action) || action}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
