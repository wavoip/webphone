import type { WebphoneAPI } from "@/lib/webphone-api";

declare global {
  interface Window {
    wavoip?: WebphoneAPI;
  }
}
