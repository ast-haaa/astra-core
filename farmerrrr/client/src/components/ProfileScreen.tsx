import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Globe, Edit2, LogOut, ChevronRight, Settings, Building, Map } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "@/hooks/useTranslation";

interface ProfileScreenProps {
  name: string;
  mobile?: string;
  email?: string;
  state: string;
  city: string;
  areaVillage: string;
  language: string;
  avatar?: string;
  onEditProfile: () => void;
  onSettings: () => void;
  onLogout: () => void;
}

export default function ProfileScreen({
  name,
  mobile,
  email,
  state,
  city,
  areaVillage,
  language,
  avatar,
  onEditProfile,
  onSettings,
  onLogout,
}: ProfileScreenProps) {
  const t = useTranslation();
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const location = [areaVillage, city, state].filter(Boolean).join(", ");

  return (
    <motion.div
      className="min-h-screen bg-background pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-end px-5 py-4">
        <LanguageSelector variant="button" />
      </div>

      <div className="bg-gradient-to-br from-primary/10 via-background to-primary/5 pt-6 pb-16 px-5">
        <div className="flex flex-col items-center">
          <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold text-foreground mt-4">{name}</h1>
          <p className="text-muted-foreground">{t("farmer")}</p>
        </div>
      </div>

      <div className="px-5 -mt-8 space-y-4">
        <Card className="p-5 rounded-3xl">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">{t("profile")}</h2>
          
          <div className="space-y-4">
            {mobile && (
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10">
                  <Phone size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("mobileNumber")}</p>
                  <p className="font-medium text-foreground">{mobile}</p>
                </div>
              </div>
            )}

            {email && (
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10">
                  <Mail size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("emailAddress")}</p>
                  <p className="font-medium text-foreground">{email}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-chart-2/10">
                <MapPin size={20} className="text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("areaVillage")}</p>
                <p className="font-medium text-foreground">{location || "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-chart-3/10">
                <Globe size={20} className="text-chart-3" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("language")}</p>
                <p className="font-medium text-foreground">{language}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl overflow-hidden">
          <button
            onClick={onEditProfile}
            className="w-full flex items-center justify-between p-5 hover-elevate active-elevate-2"
            data-testid="button-edit-profile"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-muted">
                <Edit2 size={20} className="text-foreground" />
              </div>
              <span className="font-medium text-foreground">{t("editProfile")}</span>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>

          <div className="border-t border-card-border" />

          <button
            onClick={onSettings}
            className="w-full flex items-center justify-between p-5 hover-elevate active-elevate-2"
            data-testid="button-settings"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-muted">
                <Settings size={20} className="text-foreground" />
              </div>
              <span className="font-medium text-foreground">{t("settings")}</span>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>
        </Card>

        <Button
          variant="secondary"
          size="lg"
          className="w-full h-14 text-lg font-medium rounded-2xl text-destructive"
          onClick={onLogout}
          data-testid="button-logout"
        >
          <LogOut size={20} className="mr-2" />
          {t("logout")}
        </Button>
      </div>
    </motion.div>
  );
}
