import { useLanguage } from "../LanguageContext";
import { type FarmerInfo } from "../mockData";
import { User, MapPin, BadgeCheck } from "lucide-react";

interface FarmerCardProps {
  farmer: FarmerInfo;
}

export function FarmerCard({ farmer }: FarmerCardProps) {
  const { t } = useLanguage();

  return (
    <div 
      className="bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-4 sm:p-5 md:p-6"
      data-testid="card-farmer"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <User className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50">
          {t("farmerTitle")}
        </h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/30">
            <User className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-50">
              {farmer.name}
            </p>
            <span className="inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40">
              <BadgeCheck className="w-3 h-3" />
              {t("certifiedFarmer")}
            </span>
          </div>
        </div>
        
        <div className="flex items-start gap-2 text-sm sm:text-base text-slate-700 dark:text-slate-200/90">
          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <p>{farmer.village}</p>
            <p className="text-slate-500 dark:text-slate-400">{farmer.district}, {farmer.state}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
