import { useState } from "react";
import { Wavoip } from "wavoip-api";
import { DraggableProvider } from "./providers/DraggableProvider";
import { PhoneProvider } from "./providers/ScreenProvider";
import { WavoipProvider } from "./providers/WavoipProvider";
import PhoneWidget from "./screens/PhoneWidget";

export function WebPhone() {
  const [wavoipInstance] = useState(() => new Wavoip({ tokens: ["d4a8d1c1-18f9-4ff5-8712-edfffa71a2a2"] }));

  return (
    <DraggableProvider>
      <PhoneProvider>
        <WavoipProvider wavoip={wavoipInstance}>
          <PhoneWidget />
        </WavoipProvider>
      </PhoneProvider>
    </DraggableProvider>
  );
}
