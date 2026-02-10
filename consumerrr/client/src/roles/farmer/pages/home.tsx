import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/roles/farmer/context/AuthContext";
import DashboardHeader from "@/roles/farmer/components/DashboardHeader";
import SummaryCard from "@/roles/farmer/components/SummaryCard";
import BoxCard from "@/roles/farmer/components/BoxCard";
import BoxDetails from "@/roles/farmer/components/BoxDetails";
import BottomNavigation, { type TabId } from "@/roles/farmer/components/BottomNavigation";
import AlertCard from "@/roles/farmer/components/AlertCard";
import AlertDetails from "@/roles/farmer/components/AlertDetails";
import ProfileScreen from "@/roles/farmer/components/ProfileScreen";
import SettingsScreen from "@/roles/farmer/components/SettingsScreen";
import LanguageModal from "@/roles/farmer/components/LanguageModal";
import AddStorageBoxModal from "@/roles/farmer/components/AddStorageBoxModal";
import { Card } from "@/roles/farmer/components/ui/card";
import { Button } from "@/roles/farmer/components/ui/button";
import { useTheme } from "@/roles/farmer/context/ThemeContext";
import { useToast } from "@/roles/farmer/hooks/use-toast";
import { useTranslation } from "@/roles/farmer/hooks/useTranslation";
import { Shield, Leaf, Info, Plus } from "lucide-react";
import type { BoxStatus } from "@/roles/farmer/components/BoxCard";
import type { AlertSeverity } from "@/roles/farmer/components/AlertCard";

interface Herb {
  id: string;
  name: string;
  category: "leaf" | "root" | "powder" | "mix";
  scientificName?: string;
  notes?: string;
}

export type AlertType = "high_temp" | "low_humidity" | "sensor_disconnected" | "box_movement";

export interface BoxData {
  id: string;
  nameKey: string;
  status: BoxStatus;
  temperature: number;
  humidity: number;
  lastUpdatedKey: string;
  peltierOn: boolean;
  fixAttempts: number;
}

export interface AlertData {
  id: string;
  alertType: AlertType;
  boxId: string;
  boxNameKey: string;
  severity: AlertSeverity;
  timestampKey: string;
  resolved: boolean;
  fixAttempts: number;
}

const initialBoxes: BoxData[] = [
  { 
    id: "BOX123", 
    nameKey: "storageBox1", 
    status: "warning", 
    temperature: 29, 
    humidity: 52, 
    lastUpdatedKey: "twoMinsAgo", 
    peltierOn: false,
    fixAttempts: 0
  },
  { 
    id: "BOX124", 
    nameKey: "storageBox2", 
    status: "online", 
    temperature: 24, 
    humidity: 65, 
    lastUpdatedKey: "oneMinsAgo", 
    peltierOn: true,
    fixAttempts: 0
  },
];

const initialAlerts: AlertData[] = [
  { 
    id: "ALT-001", 
    alertType: "high_temp",
    boxId: "BOX123", 
    boxNameKey: "storageBox1", 
    severity: "critical", 
    timestampKey: "fiveMinsAgo", 
    resolved: false,
    fixAttempts: 0
  },
  { 
    id: "ALT-002", 
    alertType: "low_humidity",
    boxId: "BOX123", 
    boxNameKey: "storageBox1", 
    severity: "warning", 
    timestampKey: "tenMinsAgo", 
    resolved: false,
    fixAttempts: 0
  },
  { 
    id: "ALT-003", 
    alertType: "sensor_disconnected",
    boxId: "BOX124", 
    boxNameKey: "storageBox2", 
    severity: "critical", 
    timestampKey: "fifteenMinsAgo", 
    resolved: false,
    fixAttempts: 0
  },
  { 
    id: "ALT-004", 
    alertType: "box_movement",
    boxId: "BOX124", 
    boxNameKey: "storageBox2", 
    severity: "warning", 
    timestampKey: "twentyMinsAgo", 
    resolved: false,
    fixAttempts: 0
  },
];

const initialHerbs: Herb[] = [
  { id: "HERB-001", name: "Tulsi", category: "leaf", scientificName: "Ocimum sanctum" },
  { id: "HERB-002", name: "Ashwagandha", category: "root", scientificName: "Withania somnifera" },
  { id: "HERB-003", name: "Turmeric Powder", category: "powder", scientificName: "Curcuma longa" },
];

type ViewState =
  | { type: "dashboard" }
  | { type: "boxDetails"; boxId: string }
  | { type: "alertDetails"; alertId: string }
  | { type: "settings" };

export default function HomePage() {
  const { farmer, logout, updateFarmer, setLanguage } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const t = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [viewState, setViewState] = useState<ViewState>({ type: "dashboard" });
  const [boxes, setBoxes] = useState(initialBoxes);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [herbs, setHerbs] = useState(initialHerbs);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [addBoxModalOpen, setAddBoxModalOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isOffline] = useState(true);

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const firstName = farmer?.fullName?.split(" ")[0] || t("farmer");

  const getAlertTitle = (alertType: AlertType): string => {
    const titles: Record<AlertType, string> = {
      high_temp: t("alertHighTemp"),
      low_humidity: t("alertLowHumidity"),
      sensor_disconnected: t("alertSensorDisconnected"),
      box_movement: t("alertBoxMovement"),
    };
    return titles[alertType];
  };

  const getAlertMessage = (alertType: AlertType, boxId: string): string => {
    const messages: Record<AlertType, string> = {
      high_temp: t("alertHighTempMsg").replace("{boxId}", boxId),
      low_humidity: t("alertLowHumidityMsg").replace("{boxId}", boxId),
      sensor_disconnected: t("alertSensorDisconnectedMsg").replace("{boxId}", boxId),
      box_movement: t("alertBoxMovementMsg").replace("{boxId}", boxId),
    };
    return messages[alertType];
  };

  useEffect(() => {
    boxes.forEach((box) => {
      const isSafe = box.temperature <= 26 && box.humidity >= 55 && box.humidity <= 75;
      
      if (box.peltierOn && box.status !== "online" && isSafe) {
        setBoxes((prev) =>
          prev.map((b) => (b.id === box.id ? { ...b, status: "online" } : b))
        );
      }
    });
  }, [boxes]);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setViewState({ type: "dashboard" });
  };

  const handleBoxClick = (boxId: string) => {
    setViewState({ type: "boxDetails", boxId });
  };

  const handleAlertClick = (alertId: string) => {
    setViewState({ type: "alertDetails", alertId });
  };

  const handleBack = () => {
    setViewState({ type: "dashboard" });
  };

  const handleTogglePeltier = (boxId: string, on: boolean) => {
    setBoxes((prev) =>
      prev.map((b) => {
        if (b.id !== boxId) return b;
        
        let newTemp = b.temperature;
        let newHumidity = b.humidity;
        let newStatus: BoxStatus = b.status;
        
        if (on) {
          newTemp = Math.max(22, b.temperature - 4);
          newHumidity = Math.min(70, b.humidity + 10);
          
          if (newTemp <= 26 && newHumidity >= 55 && newHumidity <= 75) {
            newStatus = "online";
          }
        } else {
          newTemp = Math.min(32, b.temperature + 3);
          newHumidity = Math.max(45, b.humidity - 8);
          
          if (newTemp > 26 || newHumidity < 55 || newHumidity > 75) {
            newStatus = "warning";
          }
        }
        
        return { 
          ...b, 
          peltierOn: on, 
          temperature: newTemp, 
          humidity: newHumidity,
          status: newStatus
        };
      })
    );
    
    toast({
      title: on ? t("peltierActivated") : t("peltierDeactivated"),
      description: on ? t("coolingSysOn") : t("coolingSysOff"),
    });
  };

  const handleResolveAlert = (alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (!alert) return;

    const box = boxes.find((b) => b.id === alert.boxId);
    if (!box) return;

    const isSafe = box.temperature <= 26 && box.humidity >= 55 && box.humidity <= 75;

    if (isSafe && alert.fixAttempts === 0) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, resolved: true, fixAttempts: 1 } : a))
      );
      toast({
        title: t("alertResolved") + " ✓",
        description: t("alertMarkedResolved"),
      });
    } else if (!isSafe && alert.fixAttempts === 0) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, fixAttempts: 1 } : a))
      );
      toast({
        title: t("takeAction"),
        description: t("conditionsNotSafe"),
        variant: "destructive",
      });
    } else if (!isSafe && alert.fixAttempts === 1) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, fixAttempts: 2 } : a))
      );
      toast({
        title: t("boxRecall"),
        description: t("multipleFixAttemptsFailed"),
        variant: "destructive",
      });
    } else if (isSafe) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
      );
      toast({
        title: t("alertResolved") + " ✓",
        description: t("alertMarkedResolved"),
      });
    }

    setViewState({ type: "dashboard" });
  };

  const handleLanguageChange = (language: string) => {
    const langCode = language === "English" ? "EN" : 
                     language === "Hindi" ? "HI" : 
                     language === "Marathi" ? "MR" : 
                     language === "Gujarati" ? "GU" : "EN";
    setLanguage(langCode as any);
    updateFarmer({ language: langCode as any });
    setLanguageModalOpen(false);
    toast({
      title: t("languageUpdated"),
      description: `${t("languageChangedTo")} ${language}`,
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: t("loggedOut"),
      description: t("loggedOutSuccess"),
    });
  };

  const getLanguageName = () => {
    switch(farmer?.language) {
      case "HI": return "Hindi";
      case "MR": return "Marathi";
      case "GU": return "Gujarati";
      default: return "English";
    }
  };

  const handleAddNewBox = (boxData: {
    id: string;
    nameKey: string;
    location: string;
    tempMin: number;
    tempMax: number;
    humidityMin: number;
    humidityMax: number;
    herb: Herb;
    notes?: string;
  }) => {
    const newBox: BoxData = {
      id: boxData.id,
      nameKey: boxData.nameKey,
      status: "warning",
      temperature: (boxData.tempMin + boxData.tempMax) / 2,
      humidity: (boxData.humidityMin + boxData.humidityMax) / 2,
      lastUpdatedKey: "now",
      peltierOn: false,
      fixAttempts: 0,
    };
    setBoxes((prev) => [...prev, newBox]);
  };

  const handleAddNewHerb = (herb: Herb) => {
    setHerbs((prev) => [...prev, herb]);
  };

  const renderContent = () => {
    if (viewState.type === "boxDetails") {
      const box = boxes.find((b) => b.id === viewState.boxId);
      if (!box) return null;
      return (
        <BoxDetails
          id={box.id}
          name={t(box.nameKey)}
          status={box.status}
          temperature={box.temperature}
          humidity={box.humidity}
          peltierOn={box.peltierOn}
          onBack={handleBack}
          onTogglePeltier={(on) => handleTogglePeltier(box.id, on)}
        />
      );
    }

    if (viewState.type === "alertDetails") {
      const alert = alerts.find((a) => a.id === viewState.alertId);
      if (!alert) return null;
      return (
        <AlertDetails
          id={alert.id}
          title={getAlertTitle(alert.alertType)}
          message={getAlertMessage(alert.alertType, alert.boxId)}
          boxId={alert.boxId}
          boxName={t(alert.boxNameKey)}
          severity={alert.severity}
          timestamp={t(alert.timestampKey)}
          resolved={alert.resolved}
          fixAttempts={alert.fixAttempts}
          onBack={handleBack}
          onResolve={() => handleResolveAlert(alert.id)}
        />
      );
    }

    if (viewState.type === "settings") {
      return (
        <SettingsScreen
          darkMode={theme === "dark"}
          notificationsEnabled={notificationsEnabled}
          language={getLanguageName()}
          onBack={handleBack}
          onToggleDarkMode={toggleTheme}
          onToggleNotifications={() => setNotificationsEnabled(!notificationsEnabled)}
          onChangeLanguage={() => setLanguageModalOpen(true)}
          onHelpSupport={() => toast({ title: t("helpSupport"), description: t("openingHelpCenter") })}
          onPrivacy={() => toast({ title: t("privacyPolicy"), description: t("openingPrivacyPolicy") })}
        />
      );
    }

    switch (activeTab) {
      case "home":
        return (
          <motion.div
            className="pb-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <DashboardHeader
              farmerName={firstName}
              notificationCount={activeAlerts.length}
              onNotificationsClick={() => setActiveTab("alerts")}
              onLanguageClick={() => setLanguageModalOpen(true)}
              isOffline={isOffline}
            />
            <div className="px-5 space-y-4">
              <SummaryCard
                type="boxes"
                value={boxes.length}
                label={t("myBoxes")}
                onClick={() => setActiveTab("boxes")}
              />
              <SummaryCard
                type="alerts"
                value={activeAlerts.length}
                secondaryValue={t("alertsActive").toLowerCase()}
                label={t("activeAlerts")}
                onClick={() => setActiveTab("alerts")}
              />
              <SummaryCard
                type="summary"
                value={activeAlerts.length === 0 ? t("allSystemsNormal") : t("checkRequired")}
                label={t("todaysSummary")}
              />

              <Card className="p-5 rounded-3xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-primary/10">
                    <div className="relative">
                      <Shield size={28} className="text-primary" />
                      <Leaf size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      {t("herbtraceInfo")}
                      <Info size={14} className="text-muted-foreground" />
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {t("iotMonitoring")}
                    </p>
                  </div>
                </div>
              </Card>

              <div className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">{t("myBoxes")}</h2>
                  <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Button
                      onClick={() => setAddBoxModalOpen(true)}
                      className="gap-2 px-4 py-2 font-semibold shadow-md"
                      data-testid="button-add-storage-box"
                    >
                      <Plus size={18} />
                      {t("addNewStorageBox")}
                    </Button>
                  </motion.div>
                </div>
                <div className="space-y-3">
                  {boxes.map((box) => (
                    <BoxCard
                      key={box.id}
                      id={box.id}
                      name={t(box.nameKey)}
                      status={box.status}
                      temperature={box.temperature}
                      humidity={box.humidity}
                      lastUpdated={t(box.lastUpdatedKey)}
                      onClick={() => handleBoxClick(box.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "boxes":
        return (
          <motion.div
            className="pb-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <header className="px-5 py-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{t("myBoxes")}</h1>
                  <p className="text-muted-foreground">{boxes.length} {t("boxesRegistered")}</p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Button
                    onClick={() => setAddBoxModalOpen(true)}
                    className="gap-2 px-4 py-2 font-semibold shadow-md"
                    data-testid="button-add-storage-box"
                  >
                    <Plus size={18} />
                    {t("addNewStorageBox")}
                  </Button>
                </motion.div>
              </div>
            </header>
            <div className="px-5 space-y-3">
              {boxes.map((box) => (
                <BoxCard
                  key={box.id}
                  id={box.id}
                  name={t(box.nameKey)}
                  status={box.status}
                  temperature={box.temperature}
                  humidity={box.humidity}
                  lastUpdated={t(box.lastUpdatedKey)}
                  onClick={() => handleBoxClick(box.id)}
                />
              ))}
            </div>
          </motion.div>
        );

      case "alerts":
        return (
          <motion.div
            className="pb-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <header className="px-5 py-4">
              <h1 className="text-2xl font-bold text-foreground">{t("alerts")}</h1>
              <p className="text-muted-foreground">{activeAlerts.length} {t("alertsActive")}</p>
            </header>
            <div className="px-5 space-y-3">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  id={alert.id}
                  title={getAlertTitle(alert.alertType)}
                  boxId={alert.boxId}
                  boxName={t(alert.boxNameKey)}
                  severity={alert.severity}
                  timestamp={t(alert.timestampKey)}
                  resolved={alert.resolved}
                  onClick={() => handleAlertClick(alert.id)}
                />
              ))}
            </div>
          </motion.div>
        );

      case "profile":
        return (
          <ProfileScreen
            name={farmer?.fullName || ""}
            mobile={farmer?.mobile || ""}
            email={farmer?.email || ""}
            state={farmer?.state || ""}
            city={farmer?.city || ""}
            areaVillage={farmer?.areaVillage || ""}
            language={getLanguageName()}
            onEditProfile={() => toast({ title: t("editProfile"), description: t("openingProfileEditor") })}
            onSettings={() => setViewState({ type: "settings" })}
            onLogout={handleLogout}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>

      {viewState.type === "dashboard" && (
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          alertCount={activeAlerts.length}
        />
      )}

      <LanguageModal
        isOpen={languageModalOpen}
        currentLanguage={getLanguageName()}
        onClose={() => setLanguageModalOpen(false)}
        onSelect={handleLanguageChange}
      />

      <AddStorageBoxModal
        isOpen={addBoxModalOpen}
        onClose={() => setAddBoxModalOpen(false)}
        onAddBox={handleAddNewBox}
        herbs={herbs}
        onAddHerb={handleAddNewHerb}
      />
    </div>
  );
}
