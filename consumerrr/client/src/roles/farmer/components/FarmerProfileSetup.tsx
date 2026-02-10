import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/roles/farmer/components/ui/button";
import { Input } from "@/roles/farmer/components/ui/input";
import { Label } from "@/roles/farmer/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/roles/farmer/components/ui/select";
import { ArrowLeft, User, MapPin, Building, Map } from "lucide-react";
import Logo from "./Logo";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "@/roles/farmer/hooks/useTranslation";

interface FarmerProfileSetupProps {
  authValue: string;
  authMethod: "mobile" | "email";
  onComplete: (profile: { fullName: string; state: string; city: string; areaVillage: string }) => void;
  onBack: () => void;
}

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function FarmerProfileSetup({ authValue, authMethod, onComplete, onBack }: FarmerProfileSetupProps) {
  const [fullName, setFullName] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [areaVillage, setAreaVillage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslation();

  const isValid = fullName.trim().length >= 2 && state && city.trim().length >= 2 && areaVillage.trim().length >= 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      setIsLoading(true);
      setTimeout(() => {
        onComplete({ fullName, state, city, areaVillage });
        setIsLoading(false);
      }, 600);
    }
  };

  const displayValue = authMethod === "mobile" ? `+91 ${authValue}` : authValue;

  return (
    <motion.div
      className="min-h-screen flex flex-col px-6 py-8 bg-background"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground"
          data-testid="button-back"
        >
          <ArrowLeft size={20} />
          <span>{t("back")}</span>
        </button>
        <LanguageSelector variant="button" />
      </div>

      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
        <div className="flex justify-center mb-6">
          <Logo size="md" />
        </div>

        <h1 className="text-2xl font-semibold text-foreground text-center mb-8">
          {t("profileSetup")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5 flex-1">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <User size={14} />
              {t("fullName")}
            </Label>
            <Input
              type="text"
              placeholder={t("enterFullName")}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-14 text-base rounded-2xl bg-card border-card-border px-4"
              data-testid="input-fullname"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <Map size={14} />
              {t("state")}
            </Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger 
                className="h-14 text-base rounded-2xl bg-card border-card-border"
                data-testid="select-state"
              >
                <SelectValue placeholder={t("selectState")} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {indianStates.map((s) => (
                  <SelectItem key={s} value={s} data-testid={`option-state-${s.toLowerCase().replace(/\s/g, "-")}`}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <Building size={14} />
              {t("city")}
            </Label>
            <Input
              type="text"
              placeholder={t("enterCity")}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-14 text-base rounded-2xl bg-card border-card-border px-4"
              data-testid="input-city"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <MapPin size={14} />
              {t("areaVillage")}
            </Label>
            <Input
              type="text"
              placeholder={t("enterArea")}
              value={areaVillage}
              onChange={(e) => setAreaVillage(e.target.value)}
              className="h-14 text-base rounded-2xl bg-card border-card-border px-4"
              data-testid="input-area"
            />
          </div>

          <div className="pt-2 space-y-3">
            <div className="flex justify-between items-center px-1 py-2 border-b border-card-border">
              <span className="text-sm text-muted-foreground">{t("role")}</span>
              <span className="text-sm font-medium text-foreground">{t("farmer")}</span>
            </div>
            <div className="flex justify-between items-center px-1 py-2 border-b border-card-border">
              <span className="text-sm text-muted-foreground">
                {authMethod === "mobile" ? t("mobileNumber") : t("emailAddress")}
              </span>
              <span className="text-sm font-medium text-foreground">{displayValue}</span>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold rounded-2xl"
              disabled={!isValid || isLoading}
              data-testid="button-complete-setup"
            >
              {isLoading ? (
                <motion.div
                  className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                t("completeSetup")
              )}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
