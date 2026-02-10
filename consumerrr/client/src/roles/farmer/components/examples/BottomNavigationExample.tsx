import { useState } from "react";
import BottomNavigation, { type TabId } from "../BottomNavigation";

export default function BottomNavigationExample() {
  const [activeTab, setActiveTab] = useState<TabId>("home");

  return (
    <div className="h-20">
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        alertCount={3}
      />
    </div>
  );
}
