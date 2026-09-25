
import { useState } from "react";
import TabButton from "./TabsButton";

export default function Tabs({ tabs }) {
  const [active, setActive] = useState(0);

  return (
    <div className="w-full">
      {/* Tab Buttons */}
      {/* One row that scrolls sideways on phones instead of wrapping labels. */}
      <div role="tablist" className="mb-5 flex gap-6 overflow-x-auto border-b border-primary-light [scrollbar-width:none] sm:gap-7">
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
      <div key={active} className="sv-fade">{tabs[active].content}</div>
    </div>
  );
}
