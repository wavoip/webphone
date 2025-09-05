import PhoneWidget from "@/PhoneWidget";
import { DraggableProvider } from "@/providers/DraggableProvider";
import { ScreenProvider } from "@/providers/ScreenProvider";
import { WavoipProvider } from "@/providers/WavoipProvider";

export function WebPhone() {
  return (
    <DraggableProvider>
      <ScreenProvider>
        <WavoipProvider>
          <PhoneWidget />
        </WavoipProvider>
      </ScreenProvider>
    </DraggableProvider>
  );
}
