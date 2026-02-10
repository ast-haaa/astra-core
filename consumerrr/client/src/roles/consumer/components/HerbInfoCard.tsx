import { useLanguage } from "../LanguageContext";
import { type HerbName } from "../mockData";
import { Info, CheckCircle } from "lucide-react";

interface HerbInfoCardProps {
  herbName: HerbName;
}

export function HerbInfoCard({ herbName }: HerbInfoCardProps) {
  const { t } = useLanguage();

  const getHerbBenefits = (): string[] => {
    switch (herbName) {
      case "Tulsi":
        return [
          t("tulsiInfo1"),
          t("tulsiInfo2"),
          t("tulsiInfo3"),
          t("tulsiInfo4"),
          t("tulsiInfo5"),
        ];
      case "Ashwagandha":
        return [
          t("ashwaInfo1"),
          t("ashwaInfo2"),
          t("ashwaInfo3"),
          t("ashwaInfo4"),
        ];
      case "Brahmi":
        return [
          t("brahmiInfo1"),
          t("brahmiInfo2"),
          t("brahmiInfo3"),
        ];
      default:
        return [];
    }
  };

  const benefits = getHerbBenefits();

  return (
    <div 
      className="bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-4 sm:p-5 md:p-6"
      data-testid="card-herb-info"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Info className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50">
          {t("herbInfoTitle")}
        </h3>
      </div>
      <ul className="space-y-3">
        {benefits.map((benefit, index) => (
          <li 
            key={index}
            className="flex items-start gap-3 text-sm sm:text-base text-slate-700 dark:text-slate-200/90"
          >
            <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
