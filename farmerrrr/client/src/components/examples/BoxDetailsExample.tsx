import { useState } from "react";
import BoxDetails from "../BoxDetails";

export default function BoxDetailsExample() {
  const [peltierOn, setPeltierOn] = useState(true);

  return (
    <BoxDetails
      id="BOX-001"
      name="Storage Box 1"
      status="online"
      temperature={24}
      humidity={65}
      peltierOn={peltierOn}
      onBack={() => console.log("Back pressed")}
      onTogglePeltier={setPeltierOn}
    />
  );
}
