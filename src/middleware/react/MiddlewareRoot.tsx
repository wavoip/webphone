import { type Wavoip, Wavoip as WavoipCtor } from "@wavoip/wavoip-api";
import { type ReactNode, useEffect, useState } from "react";
import Ringtone from "@/assets/sounds/ringtone-02.mp3";
import Vibration from "@/assets/sounds/vibration.mp3";
import { getSettings } from "@/lib/device-settings";
import { disablePiP, pictureInPicture } from "@/lib/picture-in-picture";
import { setPublicApiBase } from "@/lib/webphone-api/api";
import { audioRingtonePlayer } from "@/middleware/effects/ringtone";
import { Middleware } from "@/middleware/Middleware";
import { buildPublicApi } from "@/middleware/public-api/buildPublicApi";
import { MiddlewareProvider } from "@/middleware/react/hooks";
import { useSettings } from "@/providers/settings/Provider";

type Props = { children: ReactNode; wavoip?: Wavoip };

/**
 * Owns the {@link Middleware} lifecycle and exposes it via
 * {@link MiddlewareProvider} to every descendant. Place this just under
 * `SettingsProvider` so React-side providers (Theme, Widget, Notifications,
 * etc.) can read from / write to the middleware store without re-implementing
 * state.
 */
export function MiddlewareRoot({ children, wavoip: injectedWavoip }: Props) {
  const settings = useSettings();

  const [middleware] = useState(() => {
    const wavoip =
      injectedWavoip ?? new WavoipCtor({ tokens: [...getSettings().keys()], platform: settings.platform });
    const mw = new Middleware({
      wavoip,
      ringtone: audioRingtonePlayer(new Audio(Ringtone)),
      vibration: audioRingtonePlayer(new Audio(Vibration)),
    }).init();
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
