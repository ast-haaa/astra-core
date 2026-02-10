import { useState } from "react";
import SettingsScreen from "../SettingsScreen";

export default function SettingsScreenExample() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <SettingsScreen
      darkMode={darkMode}
      notificationsEnabled={notifications}
      language="Hindi"
      onBack={() => console.log("Back pressed")}
      onToggleDarkMode={() => setDarkMode(!darkMode)}
      onToggleNotifications={() => setNotifications(!notifications)}
      onChangeLanguage={() => console.log("Change language")}
      onHelpSupport={() => console.log("Help & Support")}
      onPrivacy={() => console.log("Privacy Policy")}
    />
  );
}
