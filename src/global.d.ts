import type { WebphoneAPI } from "./lib/webphone-api/WebphoneAPI";

declare global {
  interface Window {
    wavoip?: WebphoneAPI;
  }
}
