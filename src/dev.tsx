import webphone from "@/index.tsx";
import { getSettings } from "@/lib/device-settings";
import { Wavoip } from "@/lib/webphone-api/sdk-types";

console.log("Rendering");

const wavoip = new Wavoip({ tokens: [...getSettings().keys()], platform: "dev" });

await webphone.render(
  {
    statusBar: {
      showNotificationsIcon: true,
      showSettingsIcon: true,
    },
    settingsMenu: {
      deviceMenu: {
        showAddDevices: true,
        showEnableDevicesButton: true,
        showRemoveDevicesButton: true,
      },
    },
    buttonPosition: "bottom-right",
    widget: {
      startOpen: true,
    },
  },
  wavoip,
);

console.log("API ready");
