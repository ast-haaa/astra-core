import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import DashboardHeader from "@/components/DashboardHeader";
import SummaryCard from "@/components/SummaryCard";
import BoxCard from "@/components/BoxCard";
import BoxDetails from "@/components/BoxDetails";
import BottomNavigation, { type TabId } from "@/components/BottomNavigation";
import AlertCard from "@/components/AlertCard";
import AlertDetails from "@/components/AlertDetails";
import ProfileScreen from "@/components/ProfileScreen";
import SettingsScreen from "@/components/SettingsScreen";
import LanguageModal from "@/components/LanguageModal";
import AddStorageBoxModal from "@/components/AddStorageBoxModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Shield, Leaf, Info, Plus } from "lucide-react";
import type { BoxStatus } from "@/components/BoxCard";
import type { AlertSeverity } from "@/components/AlertCard";

interface Herb {
  id: string;
  name: string;
  category: "leaf" | "root" | "powder" | "mix";
  scientificName?: string;
  notes?: string;
}

export type AlertType = "high_temp" | "low_humidity" | "sensor_disconnected" | "box_movement" | "low_temp" | "high_humidity";

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
  stateKey: string;
}



const initialBoxes: BoxData[] = [
  {
    id: "BOX_TULSI_001",
    nameKey: "Tulsi",
    status: "safe",
    temperature: 0,
    humidity: 0,
    lastUpdatedKey: "twoMinsAgo",
    peltierOn: false,
    fixAttempts: 0
  },
  {
    id: "BOX_BRAHMI_001",
    nameKey: "Brahmi",
    status: "safe",
    temperature: 24,
    humidity: 45,
    lastUpdatedKey: "oneMinsAgo",
    peltierOn: false,
    fixAttempts: 0
  },

  {
    id: "BOX_NEEM_002",
    nameKey: "Neem",
    status: "critical",
    temperature: 38,
    humidity: 60,
    lastUpdatedKey: "oneMinsAgo",
    peltierOn: false,
    fixAttempts: 0
  }

];

const initialAlerts: AlertData[] = [


  {
    id: "ALT-003",
    alertType: "sensor_disconnected",
    boxId: "BOX_NEEM_002",
    boxNameKey: "Neem",
    severity: "critical",
    timestampKey: "fifteenMinsAgo",
    resolved: false,
    fixAttempts: 0,
    stateKey: "sensor_disconnected"
  },
  {
    id: "ALT-004",
    alertType: "box_movement",
    boxId: "BOX_NEEM_002",
    boxNameKey: "Neem",
    severity: "warning",
    timestampKey: "twentyMinsAgo",
    resolved: false,
    fixAttempts: 0,
    stateKey: "manual_action"
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
  const [tulsiState, setTulsiState] =
    useState<"safe" | "warning" | "critical">("safe");

  const hasOpenAlert = (boxId: string, stateKey: string) => {
    return alerts.some(
      a =>
        a.boxId === boxId &&
        a.stateKey === stateKey &&
        !a.resolved
    );
  };




  // TULSI REAL BACKEND ALERTS ONLY

  useEffect(() => {
    const fetchTulsiLive = async () => {
      try {
        const res = await fetch("http://172.20.10.11:8080/api/tulsi/live");
        const data = await res.json();

        const temp = data.temperature;
        const hum = data.humidity;

        // 🔹 STEP 1: STATE DECIDE KARO
        let currentState: "safe" | "warning" | "critical" = "safe";

        if (temp > 32) currentState = "critical";
        else if (temp > 25) currentState = "warning";
        else currentState = "safe";

        // 🔹 STEP 2: BOX UPDATE (ALWAYS)
        setBoxes(prev =>
          prev.map(b =>
            b.id === "BOX_TULSI_001"
              ? {
                ...b,
                temperature: temp,
                humidity: hum,
                status: currentState
              }
              : b
          )
        );

        // 🔹 STEP 3: SAME STATE = KUCH NAHI (NO SPAM)
        if (currentState === tulsiState) return;

        // 🔹 STEP 4: STATE CHANGE → ACTION
        setTulsiState(currentState);

        // 🟢 SAFE
        if (currentState === "safe") {
          toast({
            title: "Temperature Normal",
            description: "Cooling resolved. You can turn OFF Peltier.",
          });

          setAlerts(prev =>
            prev.map(a =>
              a.boxId === "BOX_TULSI_001"
                ? { ...a, resolved: true }
                : a
            )
          );
        }

        // 🟡 WARNING
        if (currentState === "warning" && !hasOpenAlert("BOX_TULSI_001", "warning")) {
          toast({
            title: "Temperature High",
            description: "Preventive action advised",
          });

          setAlerts(prev => [
            ...prev,
            {
              id: `TULSI_WARNING_${Date.now()}`,
              alertType: "high_temp",
              boxId: "BOX_TULSI_001",
              boxNameKey: "Tulsi",
              severity: "warning",
              timestampKey: "now",
              resolved: false,
              fixAttempts: 0,
              stateKey: "warning"
            }
          ]);
        }

        // 🔴 CRITICAL
        if (currentState === "critical") {
          toast({
            title: "Temperature CRITICAL",
            description: "Turn ON Peltier immediately",
            variant: "destructive",
          });

          setAlerts(prev => [
            ...prev,
            {
              id: `TULSI_CRITICAL_${Date.now()}`,
              alertType: "high_temp",
              boxId: "BOX_TULSI_001",
              boxNameKey: "Tulsi",
              severity: "critical",
              timestampKey: "now",
              resolved: false,
              fixAttempts: 0,
              stateKey: "critical"
            }
          ]);
        }

      } catch {
        setIsOffline(true);
      }
    };

    fetchTulsiLive();
    const i = setInterval(fetchTulsiLive, 3000);
    return () => clearInterval(i);
  }, [tulsiState]);



  const [herbs, setHerbs] = useState(initialHerbs);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [addBoxModalOpen, setAddBoxModalOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isOffline, setIsOffline] = useState(false);



  const activeAlerts = alerts.filter(a => !a.resolved && (a.severity === "warning" || a.severity === "critical"));
  const bannerAlert = activeAlerts.find(a => a.severity === "critical") ||
    activeAlerts.find(a => a.severity === "warning") ||
    null;

  const firstName = farmer?.fullName?.split(" ")[0] || t("farmer");

  const getAlertTitle = (alertType: AlertType): string => {
    const titles: Record<AlertType, string> = {
      high_temp: t("alertHighTemp"),
      low_humidity: t("alertLowHumidity"),
      sensor_disconnected: t("alertSensorDisconnected"),
      box_movement: "Manual Cooling Action", // 👈 FIX
      low_temp: t("alertLowTemp"),
      high_humidity: t("alertHighHumidity"),
    };
    return titles[alertType];
  };


  const getAlertMessage = (alertType: AlertType, boxId: string): string => {
    const messages: Record<AlertType, string> = {
      high_temp: t("alertHighTempMsg").replace("{boxId}", boxId),
      low_humidity: t("alertLowHumidityMsg").replace("{boxId}", boxId),
      sensor_disconnected: t("alertSensorDisconnectedMsg").replace("{boxId}", boxId),
      box_movement: `Cooling system manually toggled for ${boxId}`, // 👈 FIX
      low_temp: t("alertLowTempMsg").replace("{boxId}", boxId),
      high_humidity: t("alertHighHumidityMsg").replace("{boxId}", boxId),
    };
    return messages[alertType];
  };

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
  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? { ...alert, resolved: true, fixAttempts: alert.fixAttempts + 1 }
          : alert
      )
    );

    toast({
      title: t("alertResolved"),
      description: t("issueMarkedResolved")
    });

    setViewState({ type: "dashboard" });
  };


  const handleTogglePeltier = async (boxId: string, on: boolean) => {

    // 🔥 1. UI FIRST — INSTANT COLOR CHANGE
    setBoxes(prev =>
      prev.map(b =>
        b.id === boxId ? { ...b, peltierOn: on } : b
      )
    );

    // 🔔 2. MANUAL ACTION ALERT
    setAlerts(prev => [
      ...prev,
      {
        id: `MANUAL_${boxId}_${Date.now()}`,
        alertType: "box_movement",
        boxId,
        boxNameKey: boxes.find(b => b.id === boxId)?.nameKey || "Box",
        severity: on ? "info" : "warning",
        timestampKey: "now",
        resolved: false,
        fixAttempts: 0,
        stateKey: on ? "peltier_on" : "peltier_off"
      }
    ]);

    toast({
      title: on ? "Peltier ON" : "Peltier OFF",
      description: `${boxes.find(b => b.id === boxId)?.nameKey || boxId} cooling ${on ? "started" : "stopped"}`
    });

    // 🌐 3. BACKEND CALL — NO WAIT
    try {
      fetch(`http://172.20.10.11:8080/api/peltier/${boxId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ power: on ? "ON" : "OFF" })
      });
    } catch { }
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
    switch (farmer?.language) {
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

            {bannerAlert && (
              <div
                className={`mx-5 mt-3 rounded-xl px-4 py-3 text-sm font-semibold ${bannerAlert.severity === "critical"
                  ? "bg-red-100 text-red-700 border border-red-300"
                  : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                  }`}
              >
                {bannerAlert.severity === "critical"
                  ? "Temperature CRITICAL. Turn ON cooling immediately."
                  : "Temperature rising. Keep the box in a cooler place and monitor closely."}
              </div>
            )}
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
