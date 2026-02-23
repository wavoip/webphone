import webphone from "@/index.tsx";

console.log("Rendering");
const api = await webphone.render({
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
});
console.log("API ready");

api.widget.open();
