import { DraggableProvider } from "./providers/DraggableProvider";
import { PhoneProvider } from "./providers/ScreenProvider";
import { WavoipProvider } from "./providers/WavoipProvider";
import PhoneWidget from "./screens/PhoneWidget";

export function WebPhone() {
  return (
    <div className="w-screen h-screen bg-lime-500">
      <DraggableProvider>
        <PhoneProvider>
          <WavoipProvider tokens={["d4a8d1c1-18f9-4ff5-8712-edfffa71a2a2"]}>
            <PhoneWidget />
          </WavoipProvider>
        </PhoneProvider>
      </DraggableProvider>
    </div>
  );
}
