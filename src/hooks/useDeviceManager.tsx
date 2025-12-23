import type { Device, Wavoip } from "@wavoip/wavoip-api";
import { useCallback, useEffect, useState } from "react";
import { getSettings, saveSettings } from "@/lib/device-settings";

export type DeviceState = Device & { enable: boolean; persist: boolean };

type Props = {
  wavoip: Wavoip;
};

const deviceSettings = getSettings();

export function useDeviceManager({ wavoip }: Props) {
  const [_devices, setDevices] = useState<DeviceState[]>(() =>
    wavoip.getDevices().map((device) => {
      const settings = deviceSettings.get(device.token);

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
      setDevices((prev) => [...prev, { ...device, enable: device.status === "open", persist: persist || false }]);
    },
    [wavoip.addDevices],
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

  const bindDeviceEvents = useCallback((device: DeviceState) => {
    device.onQRCode((qrcode) => {
      setDevices((prev) => prev.map((d) => (d.token === device.token ? { ...device, qrcode } : d)));
    });

    device.onStatus((status) => {
      if (!status) return;
      setDevices((prev) =>
        prev.map((d) => (d.token === device.token ? { ...device, status, enable: status === "open" } : d)),
      );
    });
  }, []);

  useEffect(() => {
    for (const device of _devices) {
      bindDeviceEvents(device);
    }

    saveSettings(_devices);
  }, [bindDeviceEvents, _devices]);

  return { devices: _devices, add, remove, enable, disable };
}
