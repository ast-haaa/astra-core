import { Link, useLocation } from "wouter";
import { Home, ClipboardList, AlertTriangle, Leaf, User, Moon, Sun, WifiOff, Bell } from "lucide-react";
import { useLanguage, type Language } from "@/lib/i18n";
import languageIcon from "@assets/image_1766466515459.png";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRecalls } from "@/hooks/use-recalls";
import { useState, useEffect } from "react";

export function Navbar() {
  const [location] = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { data: recalls } = useRecalls();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("herbtrace-dark") === "true";
    setDarkMode(isDark);
  }, []);

  const handleDarkModeToggle = () => {
    const newState = !darkMode;
    setDarkMode(newState);
    localStorage.setItem("herbtrace-dark", String(newState));
    if (newState) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const activeRecallCount = recalls?.filter(r => r.status === "open").length || 0;

  const navItems = [
    { href: "/", label: "nav.dashboard", icon: Home },
    { href: "/samples", label: "nav.samples", icon: ClipboardList },
    { href: "/herbs", label: "nav.herbs", icon: Leaf },
    { href: "/recalls", label: "nav.recalls", icon: AlertTriangle },
    { href: "/profile", label: "nav.profile", icon: User },
  ];

  const languages: { code: Language; label: string; abbr: string }[] = [
    { code: "en", label: "English", abbr: "EN" },
    { code: "hi", label: "हिंदी", abbr: "HI" },
    { code: "mr", label: "मराठी", abbr: "MR" },
    { code: "gu", label: "ગુજરાતી", abbr: "GU" },
  ];

  const currentLangAbbr = languages.find(l => l.code === language)?.abbr || "EN";

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white dark:bg-slate-950 px-4 shadow-sm md:px-8">
        <div className="flex items-center gap-2">
          {/* Logo - Leaf Icon */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-primary">HerbTrace</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Offline Indicator */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground" data-testid="button-offline-indicator">
                <WifiOff className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {t("common.offline_mode") || "Offline mode – data will sync automatically"}
            </TooltipContent>
          </Tooltip>

          {/* Dark Mode Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground" 
            onClick={handleDarkModeToggle}
            data-testid="button-dark-mode"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-1 px-2 h-auto" data-testid="button-language-selector">
                <img src={languageIcon} alt="language" className="h-4 w-4" />
                <span className="text-xs font-semibold">{currentLangAbbr}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-max">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={language === lang.code ? "bg-primary/10 font-bold text-primary" : ""}
                  data-testid={`dropdown-lang-${lang.code}`}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notification Bell */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="text-muted-foreground" data-testid="button-notifications">
              <Bell className="h-5 w-5" />
            </Button>
            {activeRecallCount > 0 && (
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {activeRecallCount}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 block border-t bg-white pb-safe md:hidden">
        <div className="flex justify-around p-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`
              flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors relative
              ${location === href 
                ? "text-primary bg-primary/5" 
                : "text-muted-foreground hover:text-foreground"
              }
            `}>
              <Icon className="h-6 w-6" />
              {href === "/recalls" && activeRecallCount > 0 && (
                <div className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
              )}
              <span>{t(label)}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Sidebar for Desktop */}
      <nav className="hidden fixed left-0 top-16 bottom-0 z-30 w-64 border-r bg-white p-6 md:block">
        <div className="space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`
              flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all relative
              ${location === href 
                ? "text-primary bg-primary/10 shadow-sm" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }
            `}>
              <Icon className="h-5 w-5" />
              <span>{t(label)}</span>
              {href === "/recalls" && activeRecallCount > 0 && (
                <div className="absolute right-4 h-2.5 w-2.5 bg-red-500 rounded-full" />
              )}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
