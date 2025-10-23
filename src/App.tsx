import { Wavoip } from "@wavoip/wavoip-api";
import { useState } from "react";
import { WebPhone } from "@/components/WebPhone";
import { getSettings } from "@/lib/device-settings";
import { NotificationsProvider } from "@/providers/NotificationsProvider";
import { ScreenProvider } from "@/providers/ScreenProvider";
import { WavoipProvider } from "@/providers/WavoipProvider";
import { WidgetProvider } from "@/providers/WidgetProvider";

type Props = {
  root: Element;
};

export function App({ root }: Props) {
  const [wavoip] = useState(() => new Wavoip({ tokens: [...getSettings().keys()] }));

  return (
    <WidgetProvider root={root}>
      <ScreenProvider>
        <WavoipProvider wavoip={wavoip}>
          <NotificationsProvider>
            <WebPhone />
          </NotificationsProvider>
        </WavoipProvider>
      </ScreenProvider>
    </WidgetProvider>
  );
}
