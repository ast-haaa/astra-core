import { motion } from "framer-motion";
import { ArrowLeft, Moon, Sun, Globe, Bell, HelpCircle, ChevronRight, Shield } from "lucide-react";
import { Card } from "@/roles/farmer/components/ui/card";
import { Switch } from "@/roles/farmer/components/ui/switch";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "@/roles/farmer/hooks/useTranslation";

interface SettingsScreenProps {
  darkMode: boolean;
  notificationsEnabled: boolean;
  language: string;
  onBack: () => void;
  onToggleDarkMode: () => void;
  onToggleNotifications: () => void;
  onChangeLanguage: () => void;
  onHelpSupport: () => void;
  onPrivacy: () => void;
}

export default function SettingsScreen({
  darkMode,
  notificationsEnabled,
  language,
  onBack,
  onToggleDarkMode,
  onToggleNotifications,
  onChangeLanguage,
  onHelpSupport,
  onPrivacy,
}: SettingsScreenProps) {
  const t = useTranslation();

  return (
    <motion.div
      className="min-h-screen bg-background pb-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-background/80 backdrop-blur-lg border-b border-card-border">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-foreground"
            data-testid="button-back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold text-foreground">{t("settings")}</h1>
        </div>
        <LanguageSelector variant="button" />
      </header>

      <div className="px-5 py-6 space-y-4">
        <Card className="rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10">
                {darkMode ? (
                  <Moon size={20} className="text-primary" />
                ) : (
                  <Sun size={20} className="text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{t("darkMode")}</p>
                <p className="text-sm text-muted-foreground">
                  {darkMode ? t("currentlyEnabled") : t("currentlyDisabled")}
                </p>
              </div>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={onToggleDarkMode}
              data-testid="switch-dark-mode"
            />
          </div>

          <div className="border-t border-card-border" />

          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-chart-2/10">
                <Bell size={20} className="text-chart-2" />
              </div>
              <div>
                <p className="font-medium text-foreground">{t("notifications")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("receiveAlertNotifications")}
                </p>
              </div>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={onToggleNotifications}
              data-testid="switch-notifications"
            />
          </div>
        </Card>

        <Card className="rounded-3xl overflow-hidden">
          <button
            onClick={onChangeLanguage}
            className="w-full flex items-center justify-between p-5 hover-elevate active-elevate-2"
            data-testid="button-language"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-chart-3/10">
                <Globe size={20} className="text-chart-3" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">{t("language")}</p>
                <p className="text-sm text-muted-foreground">{language}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>
        </Card>

        <Card className="rounded-3xl overflow-hidden">
          <button
            onClick={onHelpSupport}
            className="w-full flex items-center justify-between p-5 hover-elevate active-elevate-2"
            data-testid="button-help"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-muted">
                <HelpCircle size={20} className="text-foreground" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">{t("helpSupport")}</p>
                <p className="text-sm text-muted-foreground">{t("getAssistance")}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>

          <div className="border-t border-card-border" />

          <button
            onClick={onPrivacy}
            className="w-full flex items-center justify-between p-5 hover-elevate active-elevate-2"
            data-testid="button-privacy"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-muted">
                <Shield size={20} className="text-foreground" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">{t("privacyPolicy")}</p>
                <p className="text-sm text-muted-foreground">{t("readOurPolicies")}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>
        </Card>

        <p className="text-center text-sm text-muted-foreground pt-4">
          {t("appName")} {t("version")} 1.0.0
        </p>
      </div>
    </motion.div>
  );
}
