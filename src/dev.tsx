import { Wavoip, webRuntime } from "@wavoip/wavoip-api/web";
import webphone from "@/index.tsx";

console.log("Rendering");

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
    offerNotification: {
      autoRequest: true,
    },
  },
  new Wavoip({ tokens: [], platform: "dev", runtime: webRuntime() }),
);

console.log("API ready");
