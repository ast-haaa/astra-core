import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/roles/farmer/components/ui/button";
import { Input } from "@/roles/farmer/components/ui/input";
import { Smartphone, Mail } from "lucide-react";
import Logo from "./Logo";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "@/roles/farmer/hooks/useTranslation";

type LoginMethod = "mobile" | "email";

interface LoginScreenProps {
  onSendOTP: (value: string, method: LoginMethod) => void;
}

export default function LoginScreen({ onSendOTP }: LoginScreenProps) {
  const [method, setMethod] = useState<LoginMethod>("mobile");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslation();

  const isValid = method === "mobile" ? mobile.length === 10 : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      setIsLoading(true);
      setTimeout(() => {
        onSendOTP(method === "mobile" ? mobile : email, method);
        setIsLoading(false);
      }, 800);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col px-6 py-8 bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-end">
        <LanguageSelector variant="button" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>

          <div className="flex bg-card rounded-2xl p-1 border border-card-border">
            <button
              type="button"
              onClick={() => setMethod("mobile")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
                method === "mobile"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
              data-testid="button-login-mobile"
            >
              <Smartphone size={18} />
              <span>{t("loginMobile")}</span>
            </button>
            <button
              type="button"
              onClick={() => setMethod("email")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
                method === "email"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
              data-testid="button-login-email"
            >
              <Mail size={18} />
              <span>{t("loginEmail")}</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {method === "mobile" ? (
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium select-none">
                  +91
                </div>
                <Input
                  type="tel"
                  placeholder={t("enterMobile")}
                  value={mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setMobile(value);
                  }}
                  className="pl-14 h-14 text-lg rounded-2xl bg-card border-card-border"
                  data-testid="input-mobile"
                />
              </div>
            ) : (
              <Input
                type="email"
                placeholder={t("enterEmail")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 text-lg rounded-2xl bg-card border-card-border px-4"
                data-testid="input-email"
              />
            )}

            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold rounded-2xl"
              disabled={!isValid || isLoading}
              data-testid="button-send-otp"
            >
              {isLoading ? (
                <motion.div
                  className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                t("sendOtp")
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t("byContining")}{" "}
            <button className="text-primary font-medium" data-testid="link-terms">
              {t("termsOfService")}
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export type { LoginMethod };
