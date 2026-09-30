import { type Wavoip, Wavoip as WavoipCtor, webRuntime } from "@wavoip/wavoip-api/web";
import { type JSX, onCleanup } from "solid-js";
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
import { MiddlewareProvider } from "@/middleware/solid/context";
import { useSettings } from "@/providers/settings/Provider";
import type { WebphoneSettings } from "@/providers/settings/settings";

type Props = {
  children: JSX.Element;
  wavoip?: Wavoip;
  config?: WebphoneSettings;
  notifier?: BrowserNotifier;
  focus?: FocusTracker;
};

/** Abaixo do `SettingsProvider`, que ele lê, e acima dos providers que leem o store dele. */
export function MiddlewareRoot(props: Props) {
  const settings = useSettings();
  const { wavoip: injectedWavoip, config, notifier, focus } = props;

  const middleware = (() => {
    const storedTokens = [...getSettings().keys()];
    const language = config?.language;
    if (language) setWebphoneLanguage(language);
    // A v3 não tem idioma: ela só devolve `code`, e quem traduz é o `i18n` daqui.
    const wavoip =
      injectedWavoip ?? new WavoipCtor({ tokens: storedTokens, platform: settings.platform, runtime: webRuntime() });
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
  })();

  if (config?.offerNotification?.autoRequest) {
    middleware.browserNotifier.requestPermission().catch(() => {});
  }

  applyDisplayName(middleware, config?.callSettings?.displayName);

  onCleanup(() => middleware.destroy());

  return <MiddlewareProvider middleware={middleware}>{props.children}</MiddlewareProvider>;
}

/** O nome que o integrador escolheu substitui o do peer, na oferta e na saída. */
function applyDisplayName(middleware: Middleware, displayName?: string): void {
  if (!displayName) return;

  middleware.registry.use("offer", (offer, next) => {
    offer.peer.displayName = displayName;
    offer.peer.phone = displayName;
    next();
  });

  onCleanup(
    middleware.store.subscribe(
      (s) => s.outgoing,
      (outgoing) => {
        if (!outgoing) return;
        outgoing.peer.displayName = displayName;
        outgoing.peer.phone = displayName;
      },
    ),
  );
}
