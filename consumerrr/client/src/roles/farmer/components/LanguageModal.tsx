import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { Button } from "@/roles/farmer/components/ui/button";
import { useTranslation } from "@/roles/farmer/hooks/useTranslation";

interface LanguageModalProps {
  isOpen: boolean;
  currentLanguage: string;
  onClose: () => void;
  onSelect: (language: string) => void;
}

const languages = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "mr", name: "Marathi", native: "मराठी" },
];

export default function LanguageModal({
  isOpen,
  currentLanguage,
  onClose,
  onSelect,
}: LanguageModalProps) {
  const t = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl z-50 max-h-[70vh] overflow-hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between p-5 border-b border-card-border">
              <h2 className="text-xl font-semibold text-foreground">{t("language")}</h2>
              <Button size="icon" variant="ghost" onClick={onClose} data-testid="button-close-language">
                <X size={20} />
              </Button>
            </div>

            <div className="overflow-y-auto max-h-[calc(70vh-80px)] pb-safe">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onSelect(lang.name)}
                  className="w-full flex items-center justify-between p-5 hover-elevate active-elevate-2"
                  data-testid={`button-language-${lang.code}`}
                >
                  <div className="text-left">
                    <p className="font-medium text-foreground">{lang.name}</p>
                    <p className="text-sm text-muted-foreground">{lang.native}</p>
                  </div>
                  {currentLanguage === lang.name && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check size={14} className="text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
