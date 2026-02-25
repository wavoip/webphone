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
  callSettings: {
    displayName: "Nome padrão",
  },
  buttonPosition: "bottom-right",
  widget: {
    startOpen: true,
  },
});

console.log("API ready");
