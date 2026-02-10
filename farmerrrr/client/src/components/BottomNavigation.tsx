import { motion } from "framer-motion";
import { Home, Box, Bell, User } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

type TabId = "home" | "boxes" | "alerts" | "profile";

interface BottomNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  alertCount?: number;
}

export default function BottomNavigation({
  activeTab,
  onTabChange,
  alertCount = 0,
}: BottomNavigationProps) {
  const t = useTranslation();
  
  const tabs: { id: TabId; labelKey: string; icon: typeof Home }[] = [
    { id: "home", labelKey: "home", icon: Home },
    { id: "boxes", labelKey: "boxes", icon: Box },
    { id: "alerts", labelKey: "alerts", icon: Bell },
    { id: "profile", labelKey: "profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-card-border safe-area-pb z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full relative ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.15 }}
              data-testid={`nav-${tab.id}`}
            >
              <div className="relative">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {tab.id === "alerts" && alertCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-destructive rounded-full px-1">
                    {alertCount > 9 ? "9+" : alertCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1 ${
                  isActive ? "font-semibold" : "font-medium"
                }`}
              >
                {t(tab.labelKey)}
              </span>
              {isActive && (
                <motion.div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

export type { TabId };
