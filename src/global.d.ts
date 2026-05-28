import type { Wavoip } from "@wavoip/wavoip-api";
import type { WebphoneAPI } from "./lib/webphone-api/WebphoneAPI";
import type { WebphoneSettings } from "./providers/settings/settings";

interface WavoipWebphoneGlobal {
  render(config?: WebphoneSettings, wavoip?: Wavoip): Promise<WebphoneAPI | undefined>;
  destroy(): void;
}

declare global {
  interface Window {
    wavoip?: WebphoneAPI;
    wavoipWebphone?: WavoipWebphoneGlobal;
  }
  const __WEBPHONE_VERSION__: string;
}
