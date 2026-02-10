import AlertCard from "../AlertCard";

export default function AlertCardExample() {
  return (
    <div className="space-y-3 p-4">
      <AlertCard
        id="ALT-001"
        title="Temperature exceeded threshold"
        boxId="BOX-001"
        boxName="Storage Box 1"
        severity="critical"
        timestamp="2 mins ago"
        onClick={() => console.log("Alert clicked")}
      />
      <AlertCard
        id="ALT-002"
        title="Humidity levels rising"
        boxId="BOX-002"
        boxName="Storage Box 2"
        severity="warning"
        timestamp="15 mins ago"
        onClick={() => console.log("Alert clicked")}
      />
      <AlertCard
        id="ALT-003"
        title="System maintenance scheduled"
        boxId="BOX-001"
        boxName="Storage Box 1"
        severity="info"
        timestamp="1 hour ago"
        resolved
        onClick={() => console.log("Alert clicked")}
      />
    </div>
  );
}
