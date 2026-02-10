import AlertDetails from "../AlertDetails";

export default function AlertDetailsExample() {
  return (
    <AlertDetails
      id="ALT-001"
      title="Temperature exceeded threshold"
      message="The temperature in Storage Box 1 has exceeded the safe threshold of 26°C. Current reading is 28.5°C. Please check the cooling system and ensure proper ventilation. If the issue persists, consider relocating sensitive items."
      boxId="BOX-001"
      boxName="Storage Box 1"
      severity="critical"
      timestamp="Dec 2, 2025 at 10:45 AM"
      onBack={() => console.log("Back pressed")}
      onResolve={() => console.log("Alert resolved")}
    />
  );
}
