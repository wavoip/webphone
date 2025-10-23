import { Wavoip } from "@wavoip/wavoip-api";
import { useState } from "react";
import { Widget } from "@/components/Widget";
import { DraggableProvider } from "@/providers/DraggableProvider";
import { ScreenProvider } from "@/providers/ScreenProvider";
import { WavoipProvider } from "@/providers/WavoipProvider";
import { Toaster } from "@/components/ui/sonner";
import { getSettings } from "@/lib/device-settings";

type Props = {
  root: Element;
};

export function WebPhone({ root }: Props) {
  const [wavoip] = useState(() => new Wavoip({ tokens: [...getSettings().keys()] }));

  console.log("wavoip", wavoip)
  return (
    <DraggableProvider root={root}>
      <ScreenProvider>
        <WavoipProvider wavoip={wavoip} >
          <Widget />
        </WavoipProvider>
      </ScreenProvider>
    </DraggableProvider>
  );
}
