import { useState } from "react";
import type { Wavoip } from "wavoip-api";
import TokenScreen from "@/screens/TokenScreen";
import { DraggableProvider } from "./providers/DraggableProvider";
import { PhoneProvider } from "./providers/ScreenProvider";
import { WavoipProvider } from "./providers/WavoipProvider";
import PhoneWidget from "./screens/PhoneWidget";

export function WebPhone() {
  const [wavoip, setWavoip] = useState<Wavoip | null>(null);

  return (
    <div className="w-screen h-screen bg-lime-500">
      <DraggableProvider>
        <PhoneProvider>
          {!wavoip ? (
            <TokenScreen setWavoip={setWavoip} />
          ) : (
            <WavoipProvider wavoipInstance={wavoip}>
              <PhoneWidget />
            </WavoipProvider>
          )}
        </PhoneProvider>
      </DraggableProvider>
    </div>
  );
}
