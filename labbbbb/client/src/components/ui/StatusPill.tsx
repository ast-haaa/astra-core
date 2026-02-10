import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

type Status = "pending" | "in_testing" | "completed" | "rejected" | "recalled" | "critical" | "warning" | "info" | "open" | "resolved" | "high";

interface StatusPillProps {
  status: Status;
  className?: string;
}

const statusStyles: Record<Status, string> = {
  // Sample statuses
  pending: "bg-slate-100 text-slate-700 border-slate-200",
  in_testing: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  recalled: "bg-red-50 text-red-700 border-red-200",
  
  // Recall severities/statuses
  high: "bg-red-50 text-red-700 border-red-200 animate-pulse",
  critical: "bg-red-50 text-red-700 border-red-200 animate-pulse",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  open: "bg-amber-50 text-amber-700 border-amber-200",
  resolved: "bg-green-50 text-green-700 border-green-200",
};

export function StatusPill({ status, className }: StatusPillProps) {
  const { t } = useLanguage();
  
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      statusStyles[status] || "bg-gray-100 text-gray-800",
      className
    )}>
      {t(`status.${status}`)}
    </span>
  );
}
