import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Mail, Globe } from "lucide-react";
import { motion } from "framer-motion";

const phoneSchema = z.object({
  phone: z.string().min(10, "Valid phone number required"),
});

const emailSchema = z.object({
  email: z.string().email("Valid email required"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export default function Login() {
  const { login, isLoggingIn } = useAuth();
  const { t, setLanguage, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"mobile" | "email">("mobile");
  const [step, setStep] = useState<"contact" | "otp">("contact");
  const [contact, setContact] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const phoneForm = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOTP = async (data: z.infer<typeof phoneSchema> | z.infer<typeof emailSchema>) => {
    setContact(activeTab === "mobile" ? (data as any).phone : (data as any).email);
    setStep("otp");
    setResendTimer(30);
    // In production, this would call the backend to send OTP
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join("");
    setOtpError("");
    
    if (!otpValue) {
      setOtpError(t("login.otp"));
      return;
    }
    
    if (otpValue.length < 6) {
      setOtpError("Enter 6-digit OTP");
      return;
    }
    
    // 6 digits = always valid
    login({
      username: contact,
      password: otpValue,
    });
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setOtpError("");
    
    // Auto-focus to next box
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOTP = () => {
    setResendTimer(30);
    // In production, this would call backend to resend OTP
  };

  const handleBackToContact = () => {
    setStep("contact");
    otpForm.reset();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAF9] p-4 relative overflow-hidden">
      {/* Decorative Background Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 rounded-full bg-green-100 opacity-50 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 rounded-full bg-amber-50 opacity-60 blur-3xl" />

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 flex gap-2">
        <Globe className="w-5 h-5 text-muted-foreground" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          className="bg-transparent text-sm font-medium text-muted-foreground border-none focus:ring-0 cursor-pointer"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="mr">मराठी</option>
          <option value="gu">ગુજરાતી</option>
        </select>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-green-900/20 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
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
          <h1 className="text-3xl font-display font-bold text-foreground">HerbTrace</h1>
          <p className="text-muted-foreground mt-2 font-medium">{t("login.subtitle")}</p>
        </div>

        <Card className="border-0 shadow-2xl shadow-black/5 rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
          <div className="p-8">
            <h2 className="text-xl font-semibold mb-2 text-center">{t("login.title")}</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">{t("login.helper_text")}</p>

            {step === "contact" ? (
              <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as "mobile" | "email")}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 rounded-xl h-12 bg-muted/50 p-1 mb-6">
                  <TabsTrigger value="mobile" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Phone className="w-4 h-4 mr-2" />
                    {t("login.mobile")}
                  </TabsTrigger>
                  <TabsTrigger value="email" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Mail className="w-4 h-4 mr-2" />
                    {t("login.email")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="mobile">
                  <form
                    onSubmit={phoneForm.handleSubmit((data) =>
                      handleSendOTP(data as any)
                    )}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-muted-foreground">
                        {t("login.phone")}
                      </Label>
                      <div className="flex items-center h-12 rounded-xl bg-slate-50 border border-slate-200 focus-within:bg-white transition-all px-3">
                        <span className="text-sm font-medium text-muted-foreground">+91</span>
                        <Input
                          id="phone"
                          className="border-0 bg-transparent h-full flex-1 focus:ring-0 placeholder:text-slate-400 ml-2"
                          placeholder="98765 43210"
                          maxLength={10}
                          {...phoneForm.register("phone")}
                        />
                      </div>
                      {phoneForm.formState.errors.phone && (
                        <p className="text-sm text-red-500">
                          {phoneForm.formState.errors.phone.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? "Sending..." : t("login.send_otp")}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="email">
                  <form
                    onSubmit={emailForm.handleSubmit((data) =>
                      handleSendOTP(data as any)
                    )}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-muted-foreground">
                        {t("login.email_address")}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all"
                        placeholder="analyst@example.com"
                        {...emailForm.register("email")}
                      />
                      {emailForm.formState.errors.email && (
                        <p className="text-sm text-red-500">
                          {emailForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? "Sending..." : t("login.send_otp")}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); handleVerifyOTP(); }}
                className="space-y-5"
              >
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground">
                    {activeTab === "mobile"
                      ? `OTP sent to ${contact}`
                      : `OTP sent to ${contact}`}
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-muted-foreground">{t("login.otp")}</Label>
                  <div className="flex gap-2 justify-center">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <Input
                        key={index}
                        ref={(el) => { otpRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otp[index]}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-10 h-10 text-center text-lg font-semibold rounded-lg bg-slate-50 border-slate-200 focus:bg-white transition-all"
                      />
                    ))}
                  </div>
                  {otpError && (
                    <p className="text-sm text-muted-foreground text-center">{otpError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? "Verifying..." : t("login.verify")}
                </Button>

                <div className="text-center text-sm text-muted-foreground space-y-2">
                  {resendTimer > 0 ? (
                    <p>{t("login.resend_in", { seconds: resendTimer })}</p>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-primary hover:text-primary/90 p-0 h-auto"
                      onClick={handleResendOTP}
                    >
                      {t("login.resend")}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground p-0 h-auto mt-2"
                    onClick={handleBackToContact}
                  >
                    Use different {activeTab === "mobile" ? "email" : "phone"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
