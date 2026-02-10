import { Shield, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/roles/farmer/hooks/useTranslation";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  animate?: boolean;
}

const sizeMap = {
  sm: { icon: 24, text: "text-lg", gap: "gap-1.5" },
  md: { icon: 32, text: "text-xl", gap: "gap-2" },
  lg: { icon: 48, text: "text-2xl", gap: "gap-2.5" },
  xl: { icon: 80, text: "text-4xl", gap: "gap-3" },
};

export default function Logo({ size = "md", showTagline = false, animate = false }: LogoProps) {
  const t = useTranslation();
  const { icon, text, gap } = sizeMap[size];

  const Wrapper = animate ? motion.div : "div";
  const wrapperProps = animate
    ? {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.6, ease: "easeOut" },
      }
    : {};

  return (
    <Wrapper
      className={`flex flex-col items-center ${gap}`}
      {...wrapperProps}
    >
      <div className="relative">
        <Shield
          size={icon}
          className="text-primary fill-primary/10"
          strokeWidth={1.5}
        />
        <Leaf
          size={icon * 0.45}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary"
          strokeWidth={2}
        />
      </div>
      <span className={`${text} font-bold text-foreground tracking-tight`}>
        {t("appName")}
      </span>
      {showTagline && (
        <motion.span
          className="text-sm text-muted-foreground font-medium tracking-wide"
          initial={animate ? { opacity: 0, y: 10 } : undefined}
          animate={animate ? { opacity: 1, y: 0 } : undefined}
          transition={animate ? { delay: 0.5, duration: 0.4 } : undefined}
        >
          {t("tagline")}
        </motion.span>
      )}
    </Wrapper>
  );
}
