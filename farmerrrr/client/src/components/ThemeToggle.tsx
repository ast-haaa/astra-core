import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          onClick={toggleTheme}
          className={`p-2 rounded-lg text-muted-foreground hover-elevate ${className}`}
          whileTap={{ scale: 0.95 }}
          data-testid="button-theme-toggle"
        >
          {theme === "light" ? (
            <Moon size={20} />
          ) : (
            <Sun size={20} />
          )}
        </motion.button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{theme === "light" ? "Dark Mode" : "Light Mode"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
