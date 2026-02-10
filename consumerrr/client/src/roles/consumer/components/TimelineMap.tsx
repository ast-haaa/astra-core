import { useLanguage } from "../LanguageContext";
import { type TimelineEvent } from "../mockData";
import { MapPin } from "lucide-react";

interface TimelineMapProps {
  events: TimelineEvent[];
}

export function TimelineMap({ events }: TimelineMapProps) {
  const { t } = useLanguage();

  const eventsWithCoords = events.filter(
    (e) => e.lat !== undefined && e.lng !== undefined
  );

  if (eventsWithCoords.length === 0) return null;

  const minLat = Math.min(...eventsWithCoords.map((e) => e.lat!));
  const maxLat = Math.max(...eventsWithCoords.map((e) => e.lat!));
  const minLng = Math.min(...eventsWithCoords.map((e) => e.lng!));
  const maxLng = Math.max(...eventsWithCoords.map((e) => e.lng!));

  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;
  const padding = 0.18;

  const getPosition = (lat: number, lng: number) => {
    const x = ((lng - minLng) / lngRange) * (1 - 2 * padding) + padding;
    const y = 1 - (((lat - minLat) / latRange) * (1 - 2 * padding) + padding);
    return { x: x * 100, y: y * 100 };
  };

  return (
    <div
      className="bg-slate-100 dark:bg-slate-900/70 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-4"
      data-testid="timeline-map"
    >
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-emerald-500" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t("journeyMap")}
        </span>
      </div>

      {/* MAP */}
      <div className="relative w-full h-44 rounded-xl overflow-hidden
        bg-gradient-to-br from-emerald-50 via-white to-slate-100
        dark:from-slate-900 dark:via-slate-900 dark:to-slate-800
        shadow-inner">

        {/* GRID OVERLAY */}
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* PATH */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {eventsWithCoords.map((event, index) => {
            if (index === 0) return null;
            const prev = eventsWithCoords[index - 1];
            const start = getPosition(prev.lat!, prev.lng!);
            const end = getPosition(event.lat!, event.lng!);

            const midX = (start.x + end.x) / 2;
            const midY = Math.min(start.y, end.y) - 6;

            return (
              <path
                key={`path-${event.id}`}
                d={`M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="0.6"
                strokeDasharray="3 2"
                className="text-emerald-400 dark:text-emerald-500"
              />
            );
          })}
        </svg>

        {/* MARKERS */}
        {eventsWithCoords.map((event, index) => {
          const pos = getPosition(event.lat!, event.lng!);
          const isFirst = index === 0;
          const isLast = index === eventsWithCoords.length - 1;

          return (
            <div
              key={event.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <div
                className={`
                  w-3.5 h-3.5 rounded-full relative
                  ${isFirst
                    ? "bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.15)]"
                    : isLast
                    ? "bg-red-500 shadow-[0_0_0_6px_rgba(239,68,68,0.15)]"
                    : "bg-slate-400 dark:bg-slate-500"
                  }
                `}
              />

              {/* TOOLTIP */}
              <div className="absolute left-1/2 -translate-x-1/2 top-5
                opacity-0 group-hover:opacity-100 transition
                pointer-events-none z-10">
                <div className="backdrop-blur bg-white/90 dark:bg-slate-800/90
                  border border-slate-200 dark:border-slate-700
                  text-xs px-2 py-1 rounded shadow whitespace-nowrap">
                  {event.locationText || t("unknownLocation")}
                </div>
              </div>
            </div>
          );
        })}

        {/* LEGEND */}
        <div className="absolute bottom-2 left-2 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {t("mapStart")}
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            {t("mapEnd")}
          </div>
        </div>
      </div>
    </div>
  );
}
