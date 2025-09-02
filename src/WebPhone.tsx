import { DraggableProvider } from "./providers/DraggableProvider";
import { PhoneProvider } from "./providers/ScreenProvider";
import { WavoipProvider } from "./providers/WavoipProvider";
import PhoneWidget from "./screens/PhoneWidget";

export function WebPhone() {
  return (
    <div className="w-screen h-screen bg-lime-500">
      <DraggableProvider>
        <PhoneProvider>
          <WavoipProvider>
            <PhoneWidget />
          </WavoipProvider>
        </PhoneProvider>
      </DraggableProvider>
    </div>
  );
}
