import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/roles/farmer/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Logo from "./Logo";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "@/roles/farmer/hooks/useTranslation";

interface OTPScreenProps {
  value: string;
  method: "mobile" | "email";
  onVerify: (otp: string) => void;
  onBack: () => void;
  onResend: () => void;
}

export default function OTPScreen({ value, method, onVerify, onBack, onResend }: OTPScreenProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const t = useTranslation();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, inputValue: string) => {
    let val = inputValue;
    if (val.length > 1) {
      val = val.slice(-1);
    }
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== "")) {
      setIsLoading(true);
      setTimeout(() => {
        onVerify(newOtp.join(""));
        setIsLoading(false);
      }, 800);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setTimer(30);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
    onResend();
  };

  const displayValue = method === "mobile" ? `+91 ${value}` : value;

  return (
    <motion.div
      className="min-h-screen flex flex-col px-6 py-8 bg-background"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
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

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        <div className="mb-8">
          <Logo size="md" />
        </div>

        <div className="space-y-2 text-center mb-10">
          <h1 className="text-2xl font-semibold text-foreground">
            {t("verifyOtp")}
          </h1>
          <p className="text-muted-foreground">
            {t("otpSentTo")}
            <br />
            <span className="text-foreground font-medium">{displayValue}</span>
          </p>
        </div>

        <div className="flex gap-3 mb-8">
          {otp.map((digit, index) => (
            <motion.input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 text-center text-2xl font-semibold rounded-xl bg-card border-2 
                ${digit ? "border-primary" : "border-card-border"} 
                focus:border-primary focus:outline-none transition-colors`}
              whileFocus={{ scale: 1.05 }}
              data-testid={`input-otp-${index}`}
            />
          ))}
        </div>

        {isLoading && (
          <motion.div
            className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}

        <div className="text-center">
          {timer > 0 ? (
            <p className="text-muted-foreground">
              {t("resendIn")}{" "}
              <span className="text-foreground font-semibold">{timer}s</span>
            </p>
          ) : (
            <Button
              variant="ghost"
              onClick={handleResend}
              className="text-primary font-semibold"
              data-testid="button-resend"
            >
              {t("resendOtp")}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
