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
  widget: {
    startOpen: true,
  },
  position: { x: 1400, y: 200 },
});
console.log("API ready");
