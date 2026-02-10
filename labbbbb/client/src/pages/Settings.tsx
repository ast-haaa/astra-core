import { useState, useEffect } from "react";
import { useLanguage, type Language } from "@/lib/i18n";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Bell, HelpCircle, Shield, ChevronRight } from "lucide-react";
import languageIcon from "@assets/image_1766466515459.png";

export default function Settings() {
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const isDark = localStorage.getItem("herbtrace-dark") === "true";
    setDarkMode(isDark);
  }, []);

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    localStorage.setItem("herbtrace-dark", String(checked));
    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const languages: { code: Language; label: string }[] = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिंदी" },
    { code: "mr", label: "मराठी" },
    { code: "gu", label: "ગુજરાતી" },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-20 md:pb-0 md:pl-64">
      <Navbar />
      
      <main className="p-4 md:p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-display font-bold mb-8">{t("settings.title")}</h1>

        <div className="space-y-4">
          {/* Dark Mode */}
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{t("settings.dark_mode")}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {darkMode 
                      ? t("settings.dark_mode_enabled")
                      : t("settings.dark_mode_disabled")
                    }
                  </p>
                </div>
              </div>
              <Switch 
                checked={darkMode}
                onCheckedChange={handleDarkModeToggle}
                data-testid="toggle-dark-mode"
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{t("settings.notifications")}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("settings.notifications_subtitle")}
                  </p>
                </div>
              </div>
              <Switch 
                checked={notifications}
                onCheckedChange={setNotifications}
                data-testid="toggle-notifications"
              />
            </div>
          </div>

          {/* Language */}
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={languageIcon} alt="language" className="w-5 h-5" />
                <div>
                  <p className="font-medium text-foreground">{t("settings.language")}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {languages.find(l => l.code === language)?.label}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    data-testid="button-language-settings"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={language === lang.code ? "bg-primary/10 font-bold text-primary" : ""}
                      data-testid={`settings-lang-${lang.code}`}
                    >
                      {lang.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Help & Support */}
          <div className="bg-white rounded-xl border border-slate-100 p-6 hover-elevate cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{t("settings.help_support")}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("settings.help_support_subtitle")}
                  </p>
                </div>
              </div>
              <span className="text-muted-foreground">→</span>
            </div>
          </div>

          {/* Privacy Policy */}
          <div className="bg-white rounded-xl border border-slate-100 p-6 hover-elevate cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{t("settings.privacy_policy")}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("settings.privacy_policy_subtitle")}
                  </p>
                </div>
              </div>
              <span className="text-muted-foreground">→</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            HerbTrace {t("settings.version")}
          </p>
        </div>
      </main>
    </div>
  );
}
