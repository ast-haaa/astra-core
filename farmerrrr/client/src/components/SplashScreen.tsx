import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "@/hooks/useTranslation";

interface SplashScreenProps {
  onContinue: () => void;
}

export default function SplashScreen({ onContinue }: SplashScreenProps) {
  const t = useTranslation();

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-between bg-gradient-to-br from-primary/5 via-background to-primary/10 px-6 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      data-testid="splash-screen"
    >
      <div className="w-full flex justify-end">
        <LanguageSelector variant="button" />
      </div>

      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      >
        <Logo size="xl" showTagline animate />
      </motion.div>

      <motion.div
        className="w-full max-w-xs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <Button
          onClick={onContinue}
          className="w-full h-12 text-base font-semibold rounded-2xl"
          data-testid="button-continue"
        >
          {t("continueBtn")}
        </Button>
      </motion.div>
    </motion.div>
  );
}
