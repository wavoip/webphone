import webphone from "@/index.tsx";

console.log("Rendering");
await webphone.render({
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
});

console.log("API ready");
