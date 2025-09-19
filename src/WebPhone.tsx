import { Wavoip } from "@wavoip/wavoip-api";
import { useState } from "react";
import { Widget } from "@/components/Widget";
import { DraggableProvider } from "@/providers/DraggableProvider";
import { ScreenProvider } from "@/providers/ScreenProvider";
import { localStorageKey, WavoipProvider } from "@/providers/WavoipProvider";

const deviceSettings = new Map<string, { token: string; enable: boolean }>(
  localStorage
    .getItem(localStorageKey)
    ?.split(";")
    .map((device) => {
      const [token, enable] = device.split(":");

      return [token, { token, enable: enable === "true" }];
    }) || [],
);

type Props = {
  root: Element;
};

export function WebPhone({ root }: Props) {
  const [wavoip] = useState(() => new Wavoip({ tokens: [...deviceSettings.keys()] }));

  return (
    <DraggableProvider root={root}>
      <ScreenProvider>
        <WavoipProvider wavoipInstance={wavoip} deviceSettings={deviceSettings}>
          <Widget />
        </WavoipProvider>
      </ScreenProvider>
    </DraggableProvider>
  );
}
