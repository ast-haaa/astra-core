import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import { Phone, MapPin, Globe, Edit2, Settings, LogOut } from "lucide-react";

export default function Profile() {
  const { user, logout, isLoggingOut } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-20 md:pb-0 md:pl-64">
      <Navbar />
      
      <main className="p-4 md:p-8 max-w-2xl mx-auto">
        {/* Avatar and ID Section */}
        <div className="flex flex-col items-center mb-8">
          <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
            <AvatarFallback className="bg-primary text-primary-foreground text-5xl font-display">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="mt-6 text-center">
            <p className="text-5xl font-display font-bold text-primary mb-2">
              {user.uniqueId || 'ID'}
            </p>
            <p className="text-lg font-medium text-foreground">{user.role}</p>
          </div>
        </div>

        {/* Profile Card - Read Only */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="space-y-4">
            {/* Mobile Number */}
            <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
              <div className="flex-shrink-0">
                <Phone className="w-5 h-5 text-primary mt-0.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("profile.mobile_number")}
                </p>
                <p className="text-base font-medium text-foreground mt-1">
                  {user.mobile || t("profile.not_provided")}
                </p>
              </div>
            </div>

            {/* Area / Village, State */}
            <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
              <div className="flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("profile.area_location")}
                </p>
                <p className="text-base font-medium text-foreground mt-1">
                  {user.area || user.city ? `${user.area || ''} ${user.city || ''}`.trim() : t("profile.not_provided")}
                  {user.state && `, ${user.state}`}
                </p>
              </div>
            </div>

            {/* Language */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Globe className="w-5 h-5 text-primary mt-0.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("profile.language")}
                </p>
                <p className="text-base font-medium text-foreground mt-1">
                  {t(`profile.lang_${user.language || 'en'}`)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action List */}
        <div className="space-y-3">
          <Link href="/profile/edit" className="block">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover-elevate cursor-pointer transition-all">
              <div className="flex items-center gap-3">
                <Edit2 className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">{t("profile.edit_profile")}</span>
              </div>
              <span className="text-muted-foreground">→</span>
            </div>
          </Link>

          <Link href="/settings" className="block">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover-elevate cursor-pointer transition-all">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">{t("profile.settings")}</span>
              </div>
              <span className="text-muted-foreground">→</span>
            </div>
          </Link>

          <Button
            onClick={() => logout()}
            disabled={isLoggingOut}
            variant="destructive"
            className="w-full justify-start gap-3 h-auto p-4"
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{t("common.logout")}</span>
          </Button>
        </div>
      </main>
    </div>
  );
}
