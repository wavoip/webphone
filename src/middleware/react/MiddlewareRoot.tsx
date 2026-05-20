import { type Wavoip, Wavoip as WavoipCtor } from "@wavoip/wavoip-api";
import { type ReactNode, useEffect, useState } from "react";
import Ringtone from "@/assets/sounds/ringtone-02.mp3";
import Vibration from "@/assets/sounds/vibration.mp3";
import { getSettings } from "@/lib/device-settings";
import { disablePiP, pictureInPicture } from "@/lib/picture-in-picture";
import { setPublicApiBase } from "@/lib/webphone-api/api";
import { bootstrapStore } from "@/middleware/bootstrap/bootstrapStore";
import { audioRingtonePlayer } from "@/middleware/effects/ringtone";
import { Middleware } from "@/middleware/Middleware";
import { buildPublicApi } from "@/middleware/public-api/buildPublicApi";
import { MiddlewareProvider } from "@/middleware/react/hooks";
import { useSettings } from "@/providers/settings/Provider";
import type { WebphoneSettings } from "@/providers/settings/settings";

type Props = { children: ReactNode; wavoip?: Wavoip; config?: WebphoneSettings };

/**
 * Owns the {@link Middleware} lifecycle and exposes it via
 * {@link MiddlewareProvider} to every descendant. Place this just under
 * `SettingsProvider` so React-side providers (Theme, Widget, Notifications,
 * etc.) can read from / write to the middleware store without re-implementing
 * state.
 */
export function MiddlewareRoot({ children, wavoip: injectedWavoip, config }: Props) {
  const settings = useSettings();

  const [middleware] = useState(() => {
    const storedTokens = [...getSettings().keys()];
    const wavoip = injectedWavoip ?? new WavoipCtor({ tokens: storedTokens, platform: settings.platform });
    // When the caller injects a Wavoip we still own device persistence — merge
    // stored tokens in so hydrate can restore them. `addDevices` dedupes.
    if (injectedWavoip && storedTokens.length) injectedWavoip.addDevices(storedTokens);
    const mw = new Middleware({
      wavoip,
      ringtone: audioRingtonePlayer(new Audio(Ringtone)),
      vibration: audioRingtonePlayer(new Audio(Vibration)),
    }).init();
    bootstrapStore({ store: mw.store, config: config ?? {} });
    setPublicApiBase(buildPublicApi(mw));
    return mw;
  });

  useEffect(() => {
    return () => {
      middleware.destroy();
      pictureInPicture.call = null;
      disablePiP();
    };
  }, [middleware]);

  return <MiddlewareProvider middleware={middleware}>{children}</MiddlewareProvider>;
}
