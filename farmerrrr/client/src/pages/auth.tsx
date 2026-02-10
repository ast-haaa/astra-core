import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import SplashScreen from "@/components/SplashScreen";
import LoginScreen, { type LoginMethod } from "@/components/LoginScreen";
import OTPScreen from "@/components/OTPScreen";
import FarmerProfileSetup from "@/components/FarmerProfileSetup";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

type AuthState = "splash" | "login" | "otp" | "profile";

export default function AuthPage() {
  const [authState, setAuthState] = useState<AuthState>("splash");
  const [authValue, setAuthValue] = useState("");
  const [authMethod, setAuthMethod] = useState<LoginMethod>("mobile");
  const { completeProfile, setPendingAuth } = useAuth();
  const { toast } = useToast();
  const t = useTranslation();

  const handleContinue = () => {
    setAuthState("login");
  };

  const handleSendOTP = (value: string, method: LoginMethod) => {
    setAuthValue(value);
    setAuthMethod(method);
    setPendingAuth({ type: method, value: method === "mobile" ? `+91 ${value}` : value });
    setAuthState("otp");
    
    const displayValue = method === "mobile" ? `+91 ${value}` : value;
    toast({
      title: t("otpSent"),
      description: `${t("verificationCodeSentTo")} ${displayValue}`,
    });
  };

  const handleVerifyOTP = (otp: string) => {
    console.log("Verifying OTP:", otp);
    setAuthState("profile");
    toast({
      title: t("otpVerified"),
      description: t("pleaseCompleteProfile"),
    });
  };

  const handleResendOTP = () => {
    const displayValue = authMethod === "mobile" ? `+91 ${authValue}` : authValue;
    toast({
      title: t("otpResent"),
      description: `${t("newVerificationCodeSent")} ${displayValue}`,
    });
  };

  const handleProfileComplete = (profile: { fullName: string; state: string; city: string; areaVillage: string }) => {
    completeProfile(profile);
    toast({
      title: `${t("welcomeTo")} ${t("appName")}!`,
      description: `${t("hello")}, ${profile.fullName}!`,
    });
  };

  const handleBackFromOTP = () => {
    setAuthState("login");
    setPendingAuth(null);
  };

  const handleBackFromProfile = () => {
    setAuthState("otp");
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {authState === "splash" && (
          <SplashScreen key="splash" onContinue={handleContinue} />
        )}
        {authState === "login" && (
          <LoginScreen key="login" onSendOTP={handleSendOTP} />
        )}
        {authState === "otp" && (
          <OTPScreen
            key="otp"
            value={authValue}
            method={authMethod}
            onVerify={handleVerifyOTP}
            onBack={handleBackFromOTP}
            onResend={handleResendOTP}
          />
        )}
        {authState === "profile" && (
          <FarmerProfileSetup
            key="profile"
            authValue={authValue}
            authMethod={authMethod}
            onComplete={handleProfileComplete}
            onBack={handleBackFromProfile}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
