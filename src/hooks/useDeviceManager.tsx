import type { Device, Wavoip } from "@wavoip/wavoip-api";
import { useCallback, useEffect, useState } from "react";
import { getSettings, saveSettings } from "@/lib/device-settings";

export type DeviceState = Device & { enable: boolean; persist: boolean };

type Props = {
  wavoip: Wavoip;
};

const deviceSettings = getSettings();

export function useDeviceManager({ wavoip }: Props) {
  const bindDeviceEvents = useCallback((device: Device) => {
    device.on("qrCodeChanged", (qrcode) => {
      setDevices((prev) => prev.map((d) => (d.token === device.token ? { ...d, qrcode } : d)));
    });

    device.on("statusChanged", (status) => {
      setDevices((prev) =>
        prev.map((d) => (d.token === device.token ? { ...d, status, enable: status === "open" } : d)),
      );
    });

    device.on("contactChanged", (contact) => {
      setDevices((prev) => prev.map((d) => (d.token === device.token ? { ...d, contact: contact } : d)));
    });
  }, []);

  const [devices, setDevices] = useState<DeviceState[]>(() =>
    wavoip.getDevices().map((device) => {
      const settings = deviceSettings.get(device.token);
      bindDeviceEvents(device);
      return {
        ...device,
        enable: !!settings?.enable,
        persist: !!settings?.persist,
      };
    }),
  );

  const add = useCallback(
    (token: string, persist?: boolean) => {
      const [device] = wavoip.addDevices([token]);
      if (!device) return;
      bindDeviceEvents(device);
      setDevices((prev) => [...prev, { ...device, enable: device.status === "open", persist: persist || false }]);
    },
    [wavoip.addDevices, bindDeviceEvents],
  );

  const remove = useCallback(
    (token: string) => {
      wavoip.removeDevices([token]);
      setDevices((prev) => prev.filter((device) => device.token !== token));
    },
    [wavoip.removeDevices],
  );

  const enable = useCallback((token: string) => {
    setDevices((prev) => prev.map((device) => (device.token === token ? { ...device, enable: true } : device)));
  }, []);

  const disable = useCallback((token: string) => {
    setDevices((prev) => prev.map((device) => (device.token === token ? { ...device, enable: false } : device)));
  }, []);

  useEffect(() => {
    saveSettings(devices);
  }, [devices]);

  return { devices, add, remove, enable, disable };
}
