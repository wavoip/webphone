import { type Wavoip, Wavoip as WavoipCtor } from "@wavoip/wavoip-api";
import { type ReactNode, useEffect, useState } from "react";
import Ringtone from "@/assets/sounds/ringtone-02.mp3";
import Vibration from "@/assets/sounds/vibration.mp3";
import { getSettings } from "@/lib/device-settings";
import { setLanguage as setWebphoneLanguage } from "@/lib/i18n";
import { setPublicApiBase } from "@/lib/webphone-api/api";
import { bootstrapStore } from "@/middleware/bootstrap/bootstrapStore";
import type { FocusTracker } from "@/middleware/browser/focusTracker";
import type { BrowserNotifier } from "@/middleware/browser/notifier";
import { audioRingtonePlayer } from "@/middleware/effects/ringtone";
import { Middleware } from "@/middleware/Middleware";
import { buildPublicApi } from "@/middleware/public-api/buildPublicApi";
import { MiddlewareProvider } from "@/middleware/react/hooks";
import { useSettings } from "@/providers/settings/Provider";
import type { WebphoneSettings } from "@/providers/settings/settings";

type Props = {
  children: ReactNode;
  wavoip?: Wavoip;
  config?: WebphoneSettings;
  notifier?: BrowserNotifier;
  focus?: FocusTracker;
};

/** Abaixo do `SettingsProvider`, que ele lê, e acima dos providers que leem o store dele. */
export function MiddlewareRoot({ children, wavoip: injectedWavoip, config, notifier, focus }: Props) {
  const settings = useSettings();

  const [middleware] = useState(() => {
    const storedTokens = [...getSettings().keys()];
    const language = config?.language;
    if (language) setWebphoneLanguage(language);
    const wavoip = injectedWavoip ?? new WavoipCtor({ tokens: storedTokens, platform: settings.platform, language });
    if (injectedWavoip && language) injectedWavoip.setLanguage(language);
    // Mesmo com Wavoip injetado, a persistência de devices é nossa: os tokens guardados
    // entram para o hydrate restaurá-los. O `addDevices` tira duplicados.
    if (injectedWavoip && storedTokens.length) injectedWavoip.addDevices(storedTokens);
    const mw = new Middleware({
      wavoip,
      ringtone: audioRingtonePlayer(new Audio(Ringtone)),
      vibration: audioRingtonePlayer(new Audio(Vibration)),
      notifier,
      focus,
      offerNotification: {
        enabled: config?.offerNotification?.enabled,
        icon: config?.offerNotification?.icon,
      },
    }).init();
    bootstrapStore({ store: mw.store, config: config ?? {} });
    setPublicApiBase(buildPublicApi(mw));
    return mw;
  });

  useEffect(() => {
    if (config?.offerNotification?.autoRequest) {
      middleware.browserNotifier.requestPermission().catch(() => {});
    }
  }, [middleware, config?.offerNotification?.autoRequest]);

  useEffect(() => {
    return () => {
      middleware.destroy();
    };
  }, [middleware]);

  return <MiddlewareProvider middleware={middleware}>{children}</MiddlewareProvider>;
}
