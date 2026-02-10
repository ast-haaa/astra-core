import { useState } from "react";
import { Button } from "@/components/ui/button";
import LanguageModal from "../LanguageModal";

export default function LanguageModalExample() {
  const [isOpen, setIsOpen] = useState(true);
  const [language, setLanguage] = useState("Hindi");

  return (
    <div className="p-4">
      <Button onClick={() => setIsOpen(true)}>Open Language Modal</Button>
      <LanguageModal
        isOpen={isOpen}
        currentLanguage={language}
        onClose={() => setIsOpen(false)}
        onSelect={(lang) => {
          setLanguage(lang);
          setIsOpen(false);
        }}
      />
    </div>
  );
}
