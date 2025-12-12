
import { useState } from "react";
import TabButton from "./TabsButton";

export default function Tabs({ tabs }) {
  const [active, setActive] = useState(0);

  return (
    <div className="w-full">
      {/* Tab Buttons */}
      <div className="flex gap-6  pb-2 mb-4">
        {tabs.map((tab, index) => (
          <TabButton
            key={index}
            label={tab.label}
            isActive={active === index}
            onClick={() => setActive(index)}
          />
        ))}
      </div>

      {/* Active Content */}
      <div>{tabs[active].content}</div>
    </div>
  );
}
