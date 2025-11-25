import type { Device, Wavoip } from "@wavoip/wavoip-api";
import { useCallback, useEffect, useState } from "react";
import { getSettings, saveSettings } from "@/lib/device-settings";

export type DeviceState = Device & { enable: boolean };

type Props = {
  wavoip: Wavoip;
};

const deviceSettings = getSettings();

export function useDeviceManager({ wavoip }: Props) {
  const [_devices, setDevices] = useState<DeviceState[]>(() =>
    wavoip.getDevices().map((device) => ({
      ...device,
      enable: !!deviceSettings.get(device.token)?.enable && ["open", "CONNECTED"].includes(device.status as string),
    })),
  );


  console.log(_devices, "devices")

  const addDevice = useCallback(
    (token: string) => {
      const [device] = wavoip.addDevices([token]);

      if (!device) {
        return;
      }

      setDevices((prev) => [
        ...prev,
        {
          ...device,
          enable: ["open", "CONNECTOED"].includes(device.status as string),
        },
      ]);
    },
    [wavoip.addDevices],
  );

  const removeDevice = useCallback(
    (token: string) => {
      wavoip.removeDevices([token]);
      setDevices((prev) => prev.filter((device) => device.token !== token));
    },
    [wavoip.removeDevices],
  );

  const enableDevice = useCallback((token: string) => {
    setDevices((prev) => prev.map((device) => (device.token === token ? { ...device, enable: true } : device)));
  }, []);

  const disableDevice = useCallback((token: string) => {
    setDevices((prev) => prev.map((device) => (device.token === token ? { ...device, enable: false } : device)));
  }, []);

  useEffect(() => {
    for (const device of _devices) {
      device.onContact((contact) => {
        console.log("contact", contact)
      });

      device.onQRCode((qrcode) => {
        setDevices((prev) => prev.map((d) => (d.token === device.token ? { ...device, qrcode } : d)));
      });
      device.onStatus((status) => {
        setDevices((prev) =>
          prev.map((d) =>
            d.token === device.token
              ? { ...device, status, enable: ["open", "CONNECTED"].includes(status as string) }
              : d,
          ),
        );
      });
    }

    saveSettings(_devices);
  }, [_devices]);

  return { devices: _devices, addDevice, removeDevice, enableDevice, disableDevice };
}
