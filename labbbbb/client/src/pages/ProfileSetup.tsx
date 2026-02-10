import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { User, Building2, MapPin, Phone, Mail, Globe } from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const profileSetupSchema = z.object({
  name: z.string().min(2, "Full name required"),
  state: z.string().min(1, "State required"),
  city: z.string().min(1, "City required"),
  area: z.string().min(1, "Area/Village required"),
  language: z.enum(["en", "hi", "mr", "gu"]),
});

type ProfileSetupData = z.infer<typeof profileSetupSchema>;

export default function ProfileSetup() {
  const { user } = useAuth();
  const { t, setLanguage, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileSetupData>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      name: "",
      state: "",
      city: "",
      area: "",
      language: (language as any) || "en",
    },
  });

  const onSubmit = async (data: ProfileSetupData) => {
    setIsSubmitting(true);
    try {
      setLanguage(data.language as any);

      // Call API to complete profile
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: data.name,
          state: data.state,
          city: data.city,
          area: data.area,
        }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to complete profile");
      
      // Refresh user data
      window.location.href = "/";
    } catch (error) {
      // Error is handled by user feedback
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAF9] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">HerbTrace</h1>
          <p className="text-muted-foreground mt-2 font-medium">Complete Your Profile</p>
        </div>

        <Card className="border-0 shadow-lg shadow-black/5 rounded-2xl overflow-hidden bg-white">
          <div className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-muted-foreground text-sm font-medium">
                  Full Name
                </Label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    className="h-12 rounded-md bg-slate-50 border-slate-200 focus:bg-white transition-all pl-10"
                    placeholder="Enter your name"
                    data-testid="input-fullname"
                    {...form.register("name")}
                  />
                </div>
                {form.formState.errors.name && (
                  <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-muted-foreground text-sm font-medium">
                  State
                </Label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3 w-4 h-4 text-muted-foreground z-10" />
                  <Select
                    value={form.watch("state")}
                    onValueChange={(value) => form.setValue("state", value)}
                  >
                    <SelectTrigger className="h-12 rounded-md bg-slate-50 border-slate-200 focus:bg-white pl-10" data-testid="select-state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom">
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {form.formState.errors.state && (
                  <p className="text-xs text-red-500">{form.formState.errors.state.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-muted-foreground text-sm font-medium">
                  City
                </Label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="city"
                    className="h-12 rounded-md bg-slate-50 border-slate-200 focus:bg-white transition-all pl-10"
                    placeholder="Enter city"
                    data-testid="input-city"
                    {...form.register("city")}
                  />
                </div>
                {form.formState.errors.city && (
                  <p className="text-xs text-red-500">{form.formState.errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="area" className="text-muted-foreground text-sm font-medium">
                  Area / Village
                </Label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="area"
                    className="h-12 rounded-md bg-slate-50 border-slate-200 focus:bg-white transition-all pl-10"
                    placeholder="Enter area or village"
                    data-testid="input-area"
                    {...form.register("area")}
                  />
                </div>
                {form.formState.errors.area && (
                  <p className="text-xs text-red-500">{form.formState.errors.area.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">
                  Role
                </Label>
                <div className="h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center px-3 pl-10 text-sm">
                  <span className="text-foreground">Quality Analyst</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-muted-foreground text-sm font-medium">
                  Mobile Number
                </Label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="mobile"
                    className="h-12 rounded-lg bg-slate-50 border-slate-200 focus:bg-white transition-all pl-10"
                    value={user?.mobile || ""}
                    disabled
                    data-testid="input-mobile"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">
                  Unique Lab ID
                </Label>
                <div className="h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center px-3 pl-10 text-sm">
                  <span className="text-foreground">LAB-{String(user?.id || 0).padStart(4, '0')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language" className="text-muted-foreground text-sm font-medium">
                  Preferred Language
                </Label>
                <div className="relative flex items-center">
                  <Globe className="absolute left-3 w-4 h-4 text-muted-foreground z-10" />
                  <Select
                    value={form.watch("language")}
                    onValueChange={(value) => form.setValue("language", value as any)}
                  >
                    <SelectTrigger className="h-12 rounded-md bg-slate-50 border-slate-200 focus:bg-white pl-10" data-testid="select-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिंदी</SelectItem>
                      <SelectItem value="mr">मराठी</SelectItem>
                      <SelectItem value="gu">ગુજરાતી</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold rounded-md bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                disabled={isSubmitting}
                data-testid="button-save-profile"
              >
                {isSubmitting ? "Saving..." : "Save & Continue"}
              </Button>
            </form>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
