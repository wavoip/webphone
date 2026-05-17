import { useState } from "react";
import { WebPhone } from "@/components/WebPhone";
import { getSettings } from "@/lib/device-settings";
import { bootACL } from "@/lib/webphone-api/acl/boot";
import { Wavoip } from "@/lib/webphone-api/sdk-types";
import { NotificationsProvider } from "@/providers/NotificationsProvider";
import { ScreenProvider } from "@/providers/ScreenProvider";
import { ShadowProvider } from "@/providers/ShadowRootProvider";
import { SettingsProvider } from "@/providers/settings/Provider";
import type { WebphoneSettings } from "@/providers/settings/settings";
import { WavoipProvider } from "@/providers/WavoipProvider";
import { WidgetProvider } from "@/providers/WidgetProvider";

type Props = {
  shadowRoot: ShadowRoot;
  root: HTMLDivElement;
  config: WebphoneSettings;
};

export function App({ shadowRoot, root, config }: Props) {
  const [wavoip] = useState(() => {
    const w = new Wavoip({ tokens: [...getSettings().keys()], platform: config.platform });
    bootACL({
      wavoip: w,
      root,
      config,
      themeStorageKey: "webphone-ui-theme",
    });
    return w;
  });

  return (
    <ShadowProvider shadowRoot={shadowRoot} root={root}>
      <SettingsProvider config={config}>
        <WidgetProvider>
          <NotificationsProvider>
            <ScreenProvider>
              <WavoipProvider wavoip={wavoip}>
                <WebPhone />
              </WavoipProvider>
            </ScreenProvider>
          </NotificationsProvider>
        </WidgetProvider>
      </SettingsProvider>
    </ShadowProvider>
  );
}
