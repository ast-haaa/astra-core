import SummaryCard from "../SummaryCard";

export default function SummaryCardExample() {
  return (
    <div className="space-y-4 p-4">
      <SummaryCard
        type="boxes"
        value={5}
        label="My Boxes"
        onClick={() => console.log("Boxes clicked")}
      />
      <SummaryCard
        type="alerts"
        value={3}
        secondaryValue="active"
        label="Active Alerts"
        onClick={() => console.log("Alerts clicked")}
      />
      <SummaryCard
        type="summary"
        value="Good"
        label="Today's Summary"
        onClick={() => console.log("Summary clicked")}
      />
    </div>
  );
}
