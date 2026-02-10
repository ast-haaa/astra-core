import { motion, AnimatePresence } from "framer-motion";
import { Languages, Check } from "lucide-react";
import { useState } from "react";
import { useAuth, type Language } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";

const languages: { code: Language; name: string; native: string }[] = [
  { code: "EN", name: "English", native: "English" },
  { code: "HI", name: "Hindi", native: "हिन्दी" },
  { code: "MR", name: "Marathi", native: "मराठी" },
  { code: "GU", name: "Gujarati", native: "ગુજરાતી" },
];

interface LanguageSelectorProps {
  variant?: "icon" | "button";
  className?: string;
}

export default function LanguageSelector({ variant = "icon", className = "" }: LanguageSelectorProps) {
  const { language, setLanguage } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find((l) => l.code === language);

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 ${
          variant === "button"
            ? "px-3 py-2 rounded-xl bg-card border border-card-border text-sm font-medium text-foreground"
            : "p-2 rounded-xl text-muted-foreground"
        }`}
        whileTap={{ scale: 0.95 }}
        data-testid="button-language-selector"
      >
        <Languages size={20} />
        <span className="font-medium">{language}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="absolute right-0 top-full mt-2 w-48 bg-card border border-card-border rounded-2xl shadow-lg z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left hover-elevate ${
                    language === lang.code
                      ? "bg-primary/10 text-primary"
                      : "text-foreground"
                  }`}
                  data-testid={`button-lang-${lang.code}`}
                >
                  <div>
                    <span className="font-medium">{lang.native}</span>
                    <span className="text-sm text-muted-foreground ml-2">({lang.code})</span>
                  </div>
                  {language === lang.code && <Check size={18} className="text-primary" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
