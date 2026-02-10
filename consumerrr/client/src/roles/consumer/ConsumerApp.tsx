import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Chatbot } from "./components/Chatbot";
import { LandingPage } from "./pages/LandingPage";
import { TracePage } from "./pages/TracePage";
import { HERB_BOXES } from "./mockData";

type View = "landing" | "trace";

export default function ConsumerApp() {
  const [view, setView] = useState<View>("landing");
  const [currentBoxId, setCurrentBoxId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("herbtrace-theme");
    const root = document.documentElement;
    if (stored === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  const handleNavigate = (boxId: string) => {
    setCurrentBoxId(boxId);
    setView("trace");
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setCurrentBoxId(null);
    setView("landing");
    window.scrollTo(0, 0);
  };

  const currentBox = currentBoxId
    ? HERB_BOXES.find((b) => b.boxId === currentBoxId)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <Navbar />

      {view === "landing" ? (
        <LandingPage onNavigate={handleNavigate} />
      ) : (
        <TracePage boxId={currentBoxId!} onBack={handleBack} />
      )}

      <Chatbot currentBox={currentBox} />
    </div>
  );
}
