import DashboardHeader from "../DashboardHeader";

export default function DashboardHeaderExample() {
  return (
    <DashboardHeader
      farmerName="Ramesh"
      notificationCount={3}
      onNotificationsClick={() => console.log("Notifications clicked")}
      onLanguageClick={() => console.log("Language clicked")}
    />
  );
}
