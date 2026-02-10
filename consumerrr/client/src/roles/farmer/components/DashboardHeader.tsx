import { Bell, WifiOff } from "lucide-react";
import { Button } from "@/roles/farmer/components/ui/button";
import { motion } from "framer-motion";
import LanguageSelector from "./LanguageSelector";
import ThemeToggle from "./ThemeToggle";
import { useTranslation } from "@/roles/farmer/hooks/useTranslation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/roles/farmer/components/ui/tooltip";

interface DashboardHeaderProps {
  farmerName: string;
  onNotificationsClick?: () => void;
  onLanguageClick?: () => void;
  notificationCount?: number;
  isOffline?: boolean;
}

export default function DashboardHeader({
  farmerName,
  onNotificationsClick,
  onLanguageClick,
  notificationCount = 0,
  isOffline = false,
}: DashboardHeaderProps) {
  const t = useTranslation();

  return (
    <motion.header
      className="flex items-center justify-between px-5 py-4 bg-background"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-0.5">
        <p className="text-sm text-muted-foreground">{t("goodMorning")}</p>
        <h1 className="text-xl font-semibold text-foreground">
          {t("hello")}, {farmerName}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {isOffline && (
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                className="p-2 rounded-lg text-muted-foreground hover-elevate"
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                data-testid="indicator-offline"
              >
                <WifiOff size={20} />
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("offlineMode")}</p>
              <p className="text-xs text-muted-foreground">{t("dataSyncAutomatically")}</p>
            </TooltipContent>
          </Tooltip>
        )}
        <ThemeToggle />
        <LanguageSelector variant="button" />
        <Button
          size="icon"
          variant="ghost"
          onClick={onNotificationsClick}
          className="relative"
          data-testid="button-notifications"
        >
          <Bell size={22} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-[16px] flex items-center justify-center text-[9px] font-bold text-white bg-destructive rounded-full px-0.5">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </Button>
      </div>
    </motion.header>
  );
}
