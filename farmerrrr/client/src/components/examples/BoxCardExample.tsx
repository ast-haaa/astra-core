import BoxCard from "../BoxCard";

export default function BoxCardExample() {
  return (
    <div className="space-y-4 p-4">
      <BoxCard
        id="BOX-001"
        name="Storage Box 1"
        status="online"
        temperature={24}
        humidity={65}
        lastUpdated="2 mins ago"
        onClick={() => console.log("Box clicked")}
      />
      <BoxCard
        id="BOX-002"
        name="Storage Box 2"
        status="warning"
        temperature={28}
        humidity={78}
        lastUpdated="5 mins ago"
        onClick={() => console.log("Box clicked")}
      />
    </div>
  );
}
